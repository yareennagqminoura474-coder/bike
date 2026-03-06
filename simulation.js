// ============================================================================
// JXNU 智行 | 共享单车智能调度仿真系统 Ultimate (完整合并修复版)
// 包含完整原有逻辑 + 修复补丁 (热力图/PDF/AI建议)
// ============================================================================

// ========== 第1部分：全局变量与常量 ==========
// WGS84 转 GCJ-02 (火星坐标)
function wgs2gcj(lng, lat) {
    const PI = 3.1415926535897932384626, a = 6378245.0, ee = 0.00669342162296594323;
    let dLat = -100.0 + 2.0*(lng-105.0) + 3.0*(lat-35.0) + 0.2*(lat-35.0)*(lat-35.0) + 0.1*(lng-105.0)*(lat-35.0) + 0.2*Math.sqrt(Math.abs(lng-105.0));
    dLat += (20.0*Math.sin(6.0*(lng-105.0)*PI) + 20.0*Math.sin(2.0*(lng-105.0)*PI)) * 2.0/3.0;
    dLat += (20.0*Math.sin((lat-35.0)*PI) + 40.0*Math.sin((lat-35.0)/3.0*PI)) * 2.0/3.0;
    dLat += (160.0*Math.sin((lat-35.0)/12.0*PI) + 320*Math.sin((lat-35.0)*PI/30.0)) * 2.0/3.0;
    let dLng = 300.0 + (lng-105.0) + 2.0*(lat-35.0) + 0.1*(lng-105.0)*(lng-105.0) + 0.1*(lng-105.0)*(lat-35.0) + 0.1*Math.sqrt(Math.abs(lng-105.0));
    dLng += (20.0*Math.sin(6.0*(lng-105.0)*PI) + 20.0*Math.sin(2.0*(lng-105.0)*PI)) * 2.0/3.0;
    dLng += (20.0*Math.sin((lng-105.0)*PI) + 40.0*Math.sin((lng-105.0)/3.0*PI)) * 2.0/3.0;
    dLng += (150.0*Math.sin((lng-105.0)/12.0*PI) + 300.0*Math.sin((lng-105.0)/30.0*PI)) * 2.0/3.0;
    let radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
    return [lat + dLat, lng + dLng]; // 返回 Leaflet 专用的 [lat, lng] 格式
}

const TOTAL_STATIONS = 11;
const TOTAL_INIT_BIKES = 200;
const SIMULATION_START_HOUR = 7;
const SIMULATION_END_HOUR = 23;

// ── 统一状态阈值（所有视图共享，确保数据一致）──
const THRESHOLD_SHORTAGE = 5;   // 缺车：< 5 辆（红色）
const THRESHOLD_LOW      = 5;   // 偏少（与缺车对齐，废弃中间态）
const THRESHOLD_HIGH     = 30;  // 偏多（与积压对齐，废弃中间态）
const THRESHOLD_SURPLUS  = 30;  // 积压：> 30 辆（橙色）

let currentHour = SIMULATION_START_HOUR;
let currentMinute = 0;
let isPlaying = false;
let speed = 5;
let intervalId = null;
let currentDate = new Date().toISOString().split('T')[0]; // 默认今天
let currentOrders = [];
let historicalData = {};

// 站点数据结构
let stations = [];
let map = null;
// --- 修复：热力图相关全局变量 ---
let heatmapMapInstance = null; // 对应 fix 中的 window.heatMap
let heatLayer = null;          // 对应 fix 中的 window.heatLayer

let dispatchHistory = [];
let liveLogs = [];

// 用于存储实时时序数据
let timeSeriesData = {
    times: [],
    inStation: [],
    active: []
};
// 用于 ECharts 实例管理
let chartInstances = {
    timeline: null,
    gauge1: null,
    gauge2: null
};

// ========== 第2部分：站点初始化（江西师范大学瑶湖校区实际分布）==========
function initStations() {
    // 江西师范大学瑶湖校区中心坐标
    const centerLat = 28.6841;
    const centerLng = 116.0350;

    // 根据校园地图的实际位置布局设置站点（移除容量限制）
    const stationData = [
        { id: 1, name: '图文信息中心', lat: 28.6835, lng: 116.0271, init: 20 },
        { id: 2, name: '惟义楼(公共课)', lat: 28.6831, lng: 116.0244, init: 8 },
        { id: 3, name: '先骕楼(计信)', lat: 28.6834, lng: 116.0299, init: 12 },
        { id: 4, name: '北区宿舍', lat: 28.6862, lng: 116.0211, init: 35 },
        { id: 5, name: '一食堂', lat: 28.6861, lng: 116.0247, init: 18 },
        { id: 6, name: '名达楼', lat: 28.6797, lng: 116.0246, init: 10 },
        { id: 7, name: '青蓝门', lat: 28.6778, lng: 116.0217, init: 5 },
        { id: 8, name: '瑶湖体育馆', lat: 28.6829, lng: 116.0324, init: 8 },
        { id: 9, name: '研究生院', lat: 28.6861, lng: 116.0291, init: 25 },
        { id: 10, name: '实验大楼', lat: 28.6791, lng: 116.0226, init: 12 },
        { id: 11, name: '三食堂', lat: 28.6843, lng: 116.0216, init: 10 },
    ];

    stations = [];
    stationData.forEach(data => {
        const [gcjLat, gcjLng] = wgs2gcj(data.lng, data.lat); // 转换坐标
        stations.push({
            id: data.id,
            name: data.name,
            lat: gcjLat,
            lng: gcjLng,
            currentBikes: data.init,
            initialBikes: data.init,
            status: 'normal',
            // 移除capacity，让车辆可以自然积累
            maxRecommended: data.init * 2 // 仅作为调度参考，不强制限制
        });
    });
}

// ========== 第3部分：基于MMoE-AM-BiLSTM的需求预测模拟 ==========
// 论文方法：多门混合专家结构 + 双向LSTM + 注意力机制
function predictDemandMMoE(stationId, hour, date, weatherFeatures) {
    // 模拟MMoE-AM-BiLSTM预测过程
    const dateSeed = hashDate(date);
    const stationSeed = stationId * 100;
    const timeSeed = hour * 10;

    // 模拟BiLSTM时序特征提取
    const temporalFeature = Math.sin(hour * Math.PI / 12) * (1 + dateSeed % 3 * 0.1);

    // 模拟注意力机制权重
    const attentionWeight = hour >= 7 && hour <= 9 ? 1.5 : (hour >= 17 && hour <= 19 ? 1.8 : 1.0);

    // 模拟取车需求预测（pickup）
    const basePickup = 3 + Math.sin((hour - 7) * Math.PI / 15) * 8;
    const pickupDemand = Math.max(0, Math.floor(
        basePickup * attentionWeight * (1 + (stationSeed + dateSeed) % 5 * 0.2)
    ));

    // 模拟还车需求预测（return）
    const baseReturn = 3 + Math.sin((hour - 8) * Math.PI / 15) * 8;
    const returnDemand = Math.max(0, Math.floor(
        baseReturn * attentionWeight * (1 + (stationSeed + dateSeed + 50) % 5 * 0.2)
    ));

    // 计算搬运需求（论文中的 q_i^t）
    const repositionNeed = returnDemand - pickupDemand;

    return {
        pickup: pickupDemand,
        return: returnDemand,
        reposition: repositionNeed,
        confidence: 0.85 + Math.random() * 0.1 // 模拟R²值
    };
}

function hashDate(dateStr) {
    return dateStr.split('-').reduce((sum, part) => sum + parseInt(part), 0);
}

// ========== 第4部分：基于真实课程表的订单生成 ==========
function generateOrdersForDate(dateStr) {
    const orders = [];

    console.log('📚 根据JXNU真实课程表生成骑行数据');

    // 站点映射
    const stationMap = {
        dorm: [3, 8], // 北区宿舍、研究生院
        class: [0, 1, 2, 5, 9], // 图文、惟义楼、先骕楼、名达楼、实验楼
        canteen: [4, 10], // 一食堂、三食堂
        gate: [6], // 青蓝门
        gym: [7], // 体育馆
        library: [0] // 图文信息中心
    };

    // 课程场景定义（根据真实课程表）
    const scenarios = [
        // 早晨起床去上课
        { hour: 7, minute: 30, count: 80, from: 'dorm', to: 'canteen', desc: '早餐时间' },
        { hour: 7, minute: 45, count: 120, from: 'dorm', to: 'class', desc: '第1节课前' },
        { hour: 8, minute: 35, count: 60, from: 'class', to: 'class', desc: '第1-2节课间' },

        // 第2-3节课间
        { hour: 9, minute: 25, count: 50, from: 'class', to: 'class', desc: '第2-3节课间' },
        { hour: 9, minute: 35, count: 40, from: 'class', to: 'library', desc: '去图书馆' },

        // 第3-4节课间
        { hour: 10, minute: 15, count: 45, from: 'class', to: 'class', desc: '第3-4节课间' },

        // 第4-5节课间
        { hour: 11, minute: 5, count: 50, from: 'class', to: 'class', desc: '第4-5节课间' },

        // 午餐高峰
        { hour: 11, minute: 50, count: 150, from: 'class', to: 'canteen', desc: '午餐高峰' },
        { hour: 12, minute: 0, count: 100, from: 'library', to: 'canteen', desc: '图书馆去食堂' },
        { hour: 12, minute: 20, count: 80, from: 'canteen', to: 'dorm', desc: '饭后回宿舍' },

        // 午休结束，下午上课
        { hour: 13, minute: 40, count: 90, from: 'dorm', to: 'class', desc: '下午第6节课前' },
        { hour: 13, minute: 50, count: 50, from: 'canteen', to: 'class', desc: '午餐后上课' },

        // 第6-7节课间
        { hour: 14, minute: 35, count: 40, from: 'class', to: 'class', desc: '第6-7节课间' },

        // 第7-8节课间
        { hour: 15, minute: 25, count: 45, from: 'class', to: 'class', desc: '第7-8节课间' },

        // 第8-9节课间
        { hour: 16, minute: 15, count: 50, from: 'class', to: 'class', desc: '第8-9节课间' },

        // 下课后
        { hour: 17, minute: 5, count: 120, from: 'class', to: 'canteen', desc: '晚餐高峰开始' },
        { hour: 17, minute: 15, count: 60, from: 'class', to: 'dorm', desc: '下课回宿舍' },
        { hour: 17, minute: 30, count: 80, from: 'library', to: 'canteen', desc: '图书馆去食堂' },

        // 晚餐后活动（重点场景）
        { hour: 18, minute: 0, count: 100, from: 'canteen', to: 'dorm', desc: '晚餐后回宿舍' },
        { hour: 18, minute: 15, count: 50, from: 'dorm', to: 'gym', desc: '去体育馆运动' },

        // 外出娱乐高峰（青蓝门）- 用户重点关注
        { hour: 18, minute: 30, count: 150, from: 'dorm', to: 'gate', desc: '外出娱乐高峰' },
        { hour: 18, minute: 45, count: 120, from: 'canteen', to: 'gate', desc: '晚餐后外出' },
        { hour: 19, minute: 0, count: 80, from: 'class', to: 'gate', desc: '自习后外出' },

        // 晚自习
        { hour: 18, minute: 45, count: 100, from: 'dorm', to: 'class', desc: '去晚自习' },
        { hour: 18, minute: 50, count: 80, from: 'dorm', to: 'library', desc: '去图书馆' },

        // 返回高峰（从青蓝门回来）- 用户重点关注
        { hour: 20, minute: 0, count: 120, from: 'gate', to: 'dorm', desc: '外出归来' },
        { hour: 20, minute: 15, count: 100, from: 'gate', to: 'dorm', desc: '归来持续' },
        { hour: 20, minute: 30, count: 80, from: 'gate', to: 'canteen', desc: '回来吃夜宵' },
        { hour: 21, minute: 0, count: 60, from: 'gate', to: 'dorm', desc: '归来尾声' },

        // 晚自习/晚课结束
        { hour: 20, minute: 25, count: 150, from: 'class', to: 'dorm', desc: '晚自习结束' },
        { hour: 20, minute: 30, count: 100, from: 'library', to: 'dorm', desc: '图书馆闭馆' },
        { hour: 21, minute: 10, count: 80, from: 'class', to: 'dorm', desc: '晚课结束' },
        { hour: 21, minute: 20, count: 60, from: 'gym', to: 'dorm', desc: '运动后回宿舍' }
    ];

    scenarios.forEach(scenario => {
        for (let i = 0; i < scenario.count; i++) {
            const fromList = stationMap[scenario.from].map(id => id % TOTAL_STATIONS);
            const toList = stationMap[scenario.to].map(id => id % TOTAL_STATIONS);

            const from = fromList[Math.floor(Math.random() * fromList.length)];
            let to = toList[Math.floor(Math.random() * toList.length)];

            // 确保起点和终点不同
            let attempts = 0;
            while (to === from && attempts < 10) {
                to = Math.floor(Math.random() * TOTAL_STATIONS);
                attempts++;
            }

            orders.push({
                startHour: scenario.hour,
                startMinute: scenario.minute + Math.floor(Math.random() * 20), // 增加随机性
                from: from,
                to: to,
                origin: stations[from] ? stations[from].id : from + 1,
                destination: stations[to] ? stations[to].id : to + 1,
                duration: 3 + Math.floor(Math.random() * 8), // 3-10分钟
                completed: false,
                active: false,
                source: 'realistic_schedule',
                status: 'pending',
                scenario: scenario.desc
            });
        }
    });

    addLog(`已生成${orders.length}条基于真实课程表的骑行订单`, 'success');

    // 按时间排序
    return orders.sort((a, b) => {
        const timeA = a.startHour * 60 + a.startMinute;
        const timeB = b.startHour * 60 + b.startMinute;
        return timeA - timeB;
    });
}

// ========== 第5部分：日期变更处理 ==========
function onDateChange() {
    const dateInput = document.getElementById('dateInput');
    currentDate = dateInput.value;

    currentOrders = generateOrdersForDate(currentDate);
    historicalData[currentDate] = calculateDailySummary();

    resetSimulation();
    addLog(`切换至 ${currentDate}，MMoE-AM-BiLSTM预测模型重新加载`, 'system');
}

// ========== 第6部分：选项卡切换 ==========
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // 处理事件触发的目标
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // 如果是手动调用，尝试找到对应的 tab 按钮
        // 这里简化处理
    }

    document.getElementById(tabName).classList.add('active');

    setTimeout(() => {
        switch(tabName) {
            case 'overview':
                if (map) map.invalidateSize();
                break;
            case 'comparison':
                renderComparisonTab();
                break;
            case 'timeline':
                renderTimelineTab();
                break;
            case 'dispatch':
                renderDispatchTab();
                break;
            case 'heatmap':
                // --- 修复：调用新版热力图渲染逻辑 ---
                renderHeatmapTab();
                break;
            case 'suggestions':
                // --- 修复：调用新版建议渲染逻辑 ---
                renderSuggestionsTab();
                break;
            case 'dashboard':
                renderDashboardTab();
                break;
        }
    }, 100);
}

// ========== 第7部分：地图初始化 ==========
function initMap() {
    map = L.map('map', {
        center: wgs2gcj(116.0350, 28.6841),
        zoom: 16,
        zoomControl: true
    });

    L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图'
}).addTo(map);

    updateMapMarkers();
}

function updateMapMarkers() {
    if (!map) return;

    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    stations.forEach(station => {
        let color = '#06ffa5'; // 默认绿色
        let status = '正常';

        // 统一阈值：缺车 < 5（红），积压 > 30（橙红），正常 5-30（绿）
        if (station.currentBikes < 5) {
            color = '#ff4d6d';
            status = '缺车';
            station.status = 'shortage';
        } else if (station.currentBikes > 30) {
            color = '#ffbe0b';
            status = '积压';
            station.status = 'surplus';
        } else {
            station.status = 'normal';
        }

        const icon = L.divIcon({
            html: `<div style="background:${color};width:40px;height:40px;border-radius:50%;
                   display:flex;align-items:center;justify-content:center;color:#0a0e27;
                   font-weight:bold;font-size:16px;border:3px solid rgba(255,255,255,0.9);
                   box-shadow:0 4px 12px rgba(0,0,0,0.4);transition:all 0.3s;">
                   ${station.currentBikes}</div>`,
            iconSize: [40, 40],
            className: ''
        });

        const marker = L.marker([station.lat, station.lng], { icon: icon }).addTo(map);
        marker.bindPopup(`
            <div style="min-width:150px;">
                <b style="font-size:16px;color:#00d4ff;">${station.name}</b><br><br>
                <div style="color:#333;">
                    🚲 当前车辆: <b style="color:${color};">${station.currentBikes}</b> 辆<br>
                    📊 状态: <b style="color:${color};">${status}</b>
                </div>
            </div>
        `);
    });
}

// ========== 第8部分：仿真控制 ==========
function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playBtn');

    if (isPlaying) {
        btn.textContent = '⏸ 暂停';
        btn.className = 'btn btn-pause';
        startSimulation();
    } else {
        btn.textContent = '▶ 继续';
        btn.className = 'btn btn-play';
        if (intervalId) clearInterval(intervalId);
    }
}

function startSimulation() {
    if (intervalId) clearInterval(intervalId); // 防止重复
    intervalId = setInterval(() => {
        currentMinute += speed;

        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
        }

        // 检查是否超过结束时间（22:00）
        if (currentHour > SIMULATION_END_HOUR || (currentHour === SIMULATION_END_HOUR && currentMinute > 0)) {
            // 重置到22:00整点
            currentHour = SIMULATION_END_HOUR;
            currentMinute = 0;
            togglePlay();
            addLog('今日仿真结束，系统运行完成！', 'success');
            return;
        }

        // 整点日志
        if (currentMinute === 0) {
            addLog(`⏰ ${currentHour}:00 - ALNS-SA算法分析中...`, 'system');
        }

        updateSimulation();

    }, 1000 / speed);
}

function updateSimulation() {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) timeDisplay.textContent = timeStr;

    // 同步更新日期显示
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) dateDisplay.textContent = currentDate;

    // 1. 核心逻辑处理
    processOrders();
    updateStatistics();

    // 2. 记录实时事件（新增）
    logPeakHourInfo(); // 记录高峰时段信息
    if (currentMinute % 5 === 0) { // 每5分钟检查一次站点状态
        logStationStatus();
    }

    // 3. 收集实时数据 (每10分钟采样一次)
    if (currentMinute % 10 === 0) {
        const total = stations.reduce((sum, s) => sum + s.currentBikes, 0);
        const active = currentOrders.filter(o => o.active).length;
        timeSeriesData.times.push(timeStr);
        timeSeriesData.inStation.push(total);
        timeSeriesData.active.push(active);

        if (timeSeriesData.times.length > 50) {
            timeSeriesData.times.shift();
            timeSeriesData.inStation.shift();
            timeSeriesData.active.shift();
        }
    }

    // 3. 动态更新当前激活的 Tab (融合 fix 脚本的实时更新逻辑)
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        if (activeTab.id === 'overview') {
             updateMapMarkers();
        } else if (activeTab.id === 'timeline') {
             updateTimelineCharts();
             // 如果有 renderTimelineCharts 也可以调用，但要避免重复初始化
             // 这里使用轻量更新
             if (chartInstances.timeline) {
                 chartInstances.timeline.setOption({
                    xAxis: { data: timeSeriesData.times },
                    series: [{ data: timeSeriesData.inStation }, { data: timeSeriesData.active }]
                 });
             }
        } else if (activeTab.id === 'dashboard') {
             updateDashboardView();
        } else if (activeTab.id === 'dispatch') {
             // 实时更新调度建议（每分钟更新）
             if (currentMinute % 5 === 0) {
                 updateDispatchView();
                 generateDispatchRecommendation();
             }
        } else if (activeTab.id === 'heatmap') {
             // --- 修复：实时更新热力图 ---
             if (currentMinute % 5 === 0) {
                 updateHeatmapView();
             }
        } else if (activeTab.id === 'suggestions') {
            // --- 修复：实时更新AI建议 ---
            if (currentMinute === 0) generateAISuggestions(); // 整点刷新即可
        }
    }

    // 无论在哪个标签页，overview页的地图都应该保持更新
    if (activeTab && activeTab.id === 'overview') {
        // 已经更新了
    } else {
        // 即使不在overview页面，也定期更新数据（每5分钟）
        if (currentMinute % 5 === 0) {
            updateMapMarkers();
        }
    }
}

function processOrders() {
    let activeBikesCount = 0;
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    currentOrders.forEach(order => {
        if (order.completed) return;

        const orderStartMinutes = order.startHour * 60 + order.startMinute;
        const endTimeMinutes = orderStartMinutes + order.duration;

        // 订单开始
        if (currentTimeMinutes >= orderStartMinutes && !order.active && !order.completed) {
            if (stations[order.from] && stations[order.from].currentBikes > 0) {
                stations[order.from].currentBikes--;
                order.active = true;
                order.status = 'active';
                // 记录骑行事件
                logRideEvent(order);
            }
        }

        // 订单进行中
        if (order.active) {
            activeBikesCount++;
        }

        // 订单结束 - 移除容量限制，允许车辆自然积累
        if (currentTimeMinutes >= endTimeMinutes && order.active) {
            if (stations[order.to]) {
                stations[order.to].currentBikes++; // 直接增加，不受容量限制
            }
            order.completed = true;
            order.active = false;
            order.status = 'completed';
        }
    });

    return activeBikesCount;
}

function updateStatistics() {
    const totalBikes = stations.reduce((sum, s) => sum + Math.max(0, s.currentBikes), 0);
    const activeBikes = currentOrders.filter(o => o.active).length;

    let normalCount = 0, shortageCount = 0, surplusCount = 0;
    stations.forEach(s => {
        // 统一阈值：缺车 < 5，积压 > 30，正常 5-30（确保三类之和 = 站点总数）
        if (s.currentBikes < 5) shortageCount++;
        else if (s.currentBikes > 30) surplusCount++;
        else normalCount++;
    });

    updateNumber('totalBikes', totalBikes);
    updateNumber('activeBikes', activeBikes);
    updateNumber('normalStations', normalCount);
    updateNumber('shortageStations', shortageCount);
    updateNumber('surplusStations', surplusCount);

    // 进度条基于动态值更新
    const maxBikes = TOTAL_INIT_BIKES * 2; // 假设最多是初始的2倍
    updateProgress('bar-total', (totalBikes / maxBikes) * 100);
    updateProgress('bar-active', (activeBikes / 100) * 100);
    updateProgress('bar-normal', (normalCount / TOTAL_STATIONS) * 100);
    updateProgress('bar-shortage', (shortageCount / TOTAL_STATIONS) * 100);
    updateProgress('bar-surplus', (surplusCount / TOTAL_STATIONS) * 100);
}

function updateNumber(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const strVal = String(value);
    if (el.textContent !== strVal) {
        el.textContent = strVal;
    }
}

// 仅在需要高亮（如调度后）时调用此函数
function flashNumber(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('num-changed');
    void el.offsetWidth;
    el.classList.add('num-changed');
    setTimeout(() => el.classList.remove('num-changed'), 450);
}

function updateProgress(id, percent) {
    const el = document.getElementById(id);
    if (!el) return;
    const newW = Math.min(100, Math.max(0, percent));
    el.style.width = newW + '%';
}

function resetSimulation() {
    if (intervalId) clearInterval(intervalId);
    isPlaying = false;
    currentHour = SIMULATION_START_HOUR;
    currentMinute = 0;

    const btn = document.getElementById('playBtn');
    if(btn) {
        btn.textContent = '▶ 开始仿真';
        btn.className = 'btn btn-play';
    }

    // 立即更新时间显示
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    }

    // 更新日期显示
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        dateDisplay.textContent = currentDate;
    }

    stations.forEach(s => {
        s.currentBikes = s.initialBikes;
        s.status = 'normal';
    });

    currentOrders.forEach(o => {
        o.completed = false;
        o.active = false;
        o.status = 'pending';
    });

    liveLogs = [];
    const logContainer = document.getElementById('liveLogs');
    if (logContainer) {
        logContainer.innerHTML = `
            <div class="log-item" style="border-left-color: #06ffa5;">
                <span style="margin-right: 5px;">✅</span>
                [07:00] 系统初始化完成，准备就绪
            </div>
            <div class="log-item" style="border-left-color: #888;">
                <span style="margin-right: 5px;">⚙️</span>
                [07:00] MMoE-AM-BiLSTM预测模型已加载
            </div>
            <div class="log-item" style="border-left-color: #888;">
                <span style="margin-right: 5px;">⚙️</span>
                [07:00] ALNS-SA智能调度算法就绪
            </div>
        `;
    }

    timeSeriesData = { times: [], inStation: [], active: [] };

    const timeSlider = document.getElementById('timeSlider');
    if (timeSlider) {
        timeSlider.value = currentHour * 60;
        document.getElementById('timeSliderValue').textContent = `${String(currentHour).padStart(2,'0')}:00`;
    }

    updateStatistics();
    updateMapMarkers();
    addLog('系统已重置至初始状态', 'system');
}

function updateSpeed(value) {
    speed = parseInt(value);
    document.getElementById('speedValue').textContent = value + 'x';
    // 实时生效
    if (isPlaying) startSimulation();
}

function onTimeSliderChange(value) {
    const totalMinutes = parseInt(value);
    currentHour = Math.floor(totalMinutes / 60);
    currentMinute = totalMinutes % 60;

    const timeStr = `${String(currentHour).padStart(2,'0')}:${String(currentMinute).padStart(2,'0')}`;
    document.getElementById('currentTime').textContent = timeStr;
    document.getElementById('timeSliderValue').textContent = timeStr;

    // 重置并快进到当前时间
    stations.forEach(s => s.currentBikes = s.initialBikes);
    currentOrders.forEach(o => { o.completed = false; o.active = false; o.status='pending'; });

    const targetTime = currentHour * 60 + currentMinute;

    // 按时间顺序处理订单，确保逻辑一致
    const sortedOrders = [...currentOrders].sort((a, b) => {
        const aStart = a.startHour * 60 + a.startMinute;
        const bStart = b.startHour * 60 + b.startMinute;
        return aStart - bStart;
    });

    sortedOrders.forEach(order => {
        const oStart = order.startHour * 60 + order.startMinute;
        const oEnd = oStart + order.duration;

        if (targetTime >= oEnd) {
            // 订单已完成：先取车，再还车
            if (stations[order.from] && stations[order.from].currentBikes > 0) {
                stations[order.from].currentBikes--;
                if (stations[order.to]) {
                    stations[order.to].currentBikes++;
                }
                order.completed = true;
                order.status = 'completed';
            }
        } else if (targetTime >= oStart) {
            // 订单进行中：只取车
            if (stations[order.from] && stations[order.from].currentBikes > 0) {
                stations[order.from].currentBikes--;
                order.active = true;
                order.status = 'active';
            }
        }
    });

    updateStatistics();
    updateMapMarkers();

    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'heatmap') updateHeatmapView();
    if (activeTab && activeTab.id === 'suggestions') generateAISuggestions();
}

// ========== 第9部分：日志系统 ==========
function addLog(message, type = 'info') {
    const time = `${String(currentHour).padStart(2,'0')}:${String(currentMinute).padStart(2,'0')}`;

    // 避免刷屏：骑行类消息降低频率
    if (type === 'ride' && Math.random() > 0.3) return;
    if (type === 'station' && Math.random() > 0.5) return;

    liveLogs.unshift({ time, message, type });
    if (liveLogs.length > 30) liveLogs.pop();

    const container = document.getElementById('liveLogs');
    if (container) {
        container.innerHTML = liveLogs.map(log => {
            let icon = '📝';
            let color = '#06ffa5';

            switch(log.type) {
                case 'warning': icon = '⚠️'; color = '#ffbe0b'; break;
                case 'error': icon = '❌'; color = '#ff006e'; break;
                case 'success': icon = '✅'; color = '#06ffa5'; break;
                case 'ride': icon = '🚴'; color = '#00d4ff'; break;
                case 'station': icon = '🏢'; color = '#7b2cbf'; break;
                case 'dispatch': icon = '🚚'; color = '#ff006e'; break;
                case 'system': icon = '⚙️'; color = '#888'; break;
                default: icon = '📢'; color = '#06ffa5';
            }

            return `<div class="log-item" style="border-left-color: ${color};">
                <span style="margin-right: 5px;">${icon}</span>
                [${log.time}] ${log.message}
            </div>`;
        }).join('');
    }
}

// 记录骑行事件
function logRideEvent(order) {
    const fromStation = stations[order.from];
    const toStation = stations[order.to];
    if (fromStation && toStation && order.scenario) {
        addLog(`${fromStation.name} → ${toStation.name}（${order.scenario}）`, 'ride');
    }
}

// 记录站点状态变化
function logStationStatus() {
    const shortage = stations.filter(s => s.currentBikes < 3);
    const surplus = stations.filter(s => s.currentBikes > 40);
    const lowBikes = stations.filter(s => s.currentBikes >= 3 && s.currentBikes < 8);

    if (shortage.length > 0 && Math.random() > 0.7) {
        const station = shortage[Math.floor(Math.random() * shortage.length)];
        addLog(`${station.name} 严重缺车（仅剩${station.currentBikes}辆）`, 'warning');
    }

    if (surplus.length > 0 && Math.random() > 0.7) {
        const station = surplus[Math.floor(Math.random() * surplus.length)];
        addLog(`${station.name} 车辆积压（已达${station.currentBikes}辆）`, 'warning');
    }

    if (lowBikes.length > 0 && Math.random() > 0.9) {
        const station = lowBikes[Math.floor(Math.random() * lowBikes.length)];
        addLog(`${station.name} 车辆偏少（${station.currentBikes}辆），建议关注`, 'station');
    }
}

// 记录高峰时段提示
function logPeakHourInfo() {
    if (currentMinute === 0 || currentMinute === 30) { // 每半小时记录一次
        if (currentHour === 7 && currentMinute === 30) {
            addLog('早餐时间开始，食堂周边需求增加', 'system');
        } else if (currentHour === 7 && currentMinute === 45) {
            addLog('第1节课即将开始，宿舍区→教学楼出行高峰', 'system');
        } else if (currentHour === 11 && currentMinute === 50) {
            addLog('午餐高峰来临，食堂周边即将出现积压', 'system');
        } else if (currentHour === 17 && currentMinute === 0) {
            addLog('晚餐时段开始，教学楼→食堂出行增加', 'system');
        } else if (currentHour === 18 && currentMinute === 30) {
            addLog('外出娱乐高峰：大量学生前往青蓝门', 'system');
        } else if (currentHour === 20 && currentMinute === 0) {
            addLog('返程高峰：青蓝门→宿舍区回流开始', 'system');
        } else if (currentHour === 20 && currentMinute === 30) {
            addLog('晚自习结束高峰，教学楼→宿舍区出行增加', 'system');
        }
    }
}

// ========== 第10部分：数据对比选项卡 (增强版) ==========
let currentComparisonRange = 'today';
function renderComparisonTab() {
    setTimeout(() => {
        // 站点库存对比
        const chart1 = echarts.init(document.getElementById('comparisonChart1'));
        chart1.setOption({
            title: {
                text: '站点库存对比',
                textStyle: { color: '#00d4ff' },
                left: 'center'
            },
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { top: 30, textStyle: { color: '#fff' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                data: stations.map(s => s.name),
                axisLabel: { rotate: 45, textStyle: { color: '#fff' } },
                axisLine: { lineStyle: { color: '#444' } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { textStyle: { color: '#fff' } },
                axisLine: { lineStyle: { color: '#444' } },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                {
                    name: '当前库存',
                    type: 'bar',
                    data: stations.map(s => s.currentBikes),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#00d4ff' },
                            { offset: 1, color: '#0099cc' }
                        ])
                    }
                },
                {
                    name: '初始配置',
                    type: 'bar',
                    data: stations.map(s => s.initialBikes),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#06ffa5' },
                            { offset: 1, color: '#00cc85' }
                        ])
                    }
                }
            ]
        });

    }, 100);
}
function setComparisonRange(range) {
    currentComparisonRange = range;
    renderComparisonTab();
}
function renderComparisonCharts() {
    renderComparisonTab();
}

// ========== 第11部分：时序分析选项卡 (增强版) ==========
function renderTimelineTab() {
    setTimeout(() => {
        // 主趋势图
        chartInstances.timeline = echarts.init(document.getElementById('timelineChart'));
        updateTimelineCharts();
        // 路线 + 进度（元素已在HTML中预定义）
        if (typeof _renderTlRouteChart  === 'function') _renderTlRouteChart();
        if (typeof _renderTlOrderProgress === 'function') _renderTlOrderProgress();
    }, 100);
}

function updateTimelineCharts() {
    if (!chartInstances.timeline) return;

    const totalInStation = stations.reduce((sum, s) => sum + s.currentBikes, 0);
    const activeTrips = currentOrders.filter(o => o.active).length;

    // 更新时序数据
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    if (timeSeriesData.times.length === 0 || timeSeriesData.times[timeSeriesData.times.length - 1] !== currentTimeStr) {
        timeSeriesData.times.push(currentTimeStr);
        timeSeriesData.inStation.push(totalInStation);
        timeSeriesData.active.push(activeTrips);

        // 保持最近50个数据点
        if (timeSeriesData.times.length > 50) {
            timeSeriesData.times.shift();
            timeSeriesData.inStation.shift();
            timeSeriesData.active.shift();
        }
    }

    chartInstances.timeline.setOption({
        title: {
            text: '全天车辆数量变化趋势',
            textStyle: { color: '#00d4ff' },
            left: 'center'
        },
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#00d4ff',
            textStyle: { color: '#fff' }
        },
        legend: {
            top: 35,
            data: ['在站车辆总量', '在途活跃车辆'],
            textStyle: { color: '#fff' }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeSeriesData.times,
            axisLabel: { textStyle: { color: '#fff' } },
            axisLine: { lineStyle: { color: '#444' } }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            axisLabel: { textStyle: { color: '#fff' } },
            axisLine: { lineStyle: { color: '#444' } },
            splitLine: { lineStyle: { color: '#333' } }
        },
        series: [
            {
                name: '在站车辆总量',
                type: 'line',
                data: timeSeriesData.inStation,
                smooth: true,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { color: '#00d4ff', width: 2.5, shadowColor:'rgba(0,212,255,0.6)', shadowBlur:8 },
                itemStyle: { color: '#00d4ff', shadowColor:'rgba(0,212,255,0.8)', shadowBlur:10 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(0, 212, 255, 0.48)' },
                        { offset: 1, color: 'rgba(0, 212, 255, 0.03)' }
                    ])
                }
            },
            {
                name: '在途活跃车辆',
                type: 'line',
                data: timeSeriesData.active,
                smooth: true,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { color: '#ff006e', width: 2.5, shadowColor:'rgba(255,0,110,0.6)', shadowBlur:8 },
                itemStyle: { color: '#ff006e', shadowColor:'rgba(255,0,110,0.8)', shadowBlur:10 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255, 0, 110, 0.42)' },
                        { offset: 1, color: 'rgba(255, 0, 110, 0.03)' }
                    ])
                }
            }
        ]
    });
}

// ========== 第12部分：智能调度选项卡 (增强实时版) ==========
function renderDispatchTab() {
    setTimeout(() => {
        // 初始化调度地图
        if (!window.dispatchMapInstance) {
            window.dispatchMapInstance = L.map('dispatchMap').setView(wgs2gcj(116.0350, 28.6841), 15);
           L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图'
}).addTo(window.dispatchMapInstance);
        }

        updateDispatchView();
        renderDispatchHistory();
    }, 100);
}

function updateDispatchView() {
    if (!window.dispatchMapInstance) return;

    // 清除旧标记
    window.dispatchMapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            window.dispatchMapInstance.removeLayer(layer);
        }
    });

    // 添加站点标记
    stations.forEach(station => {
        let color = '#06ffa5';
        if (station.currentBikes < THRESHOLD_SHORTAGE) color = '#ff006e';
        else if (station.currentBikes < THRESHOLD_LOW)  color = '#ffbe0b';
        else if (station.currentBikes > THRESHOLD_SURPLUS) color = '#ff006e';
        else if (station.currentBikes > THRESHOLD_HIGH)    color = '#ffbe0b';

        const icon = L.divIcon({
            html: `<div style="background:${color};width:35px;height:35px;border-radius:50%;
                   display:flex;align-items:center;justify-content:center;color:#0a0e27;
                   font-weight:bold;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
                   ${station.currentBikes}</div>`,
            iconSize: [35, 35],
            className: ''
        });

        L.marker([station.lat, station.lng], { icon: icon }).addTo(window.dispatchMapInstance)
            .bindPopup(`<b>${station.name}</b><br>车辆: ${station.currentBikes}`);
    });
}

async function generateDispatchRecommendation() {
    const shortage = stations.filter(s => s.currentBikes < THRESHOLD_SHORTAGE).sort((a, b) => a.currentBikes - b.currentBikes);
    const surplus = stations.filter(s => s.currentBikes > THRESHOLD_SURPLUS).sort((a, b) => b.currentBikes - a.currentBikes);

    const container = document.getElementById('dispatchHistory');
    if (!container) return;

    let html = '<div style="background:rgba(0,212,255,0.1);border-left:4px solid #00d4ff;padding:15px;border-radius:8px;margin-bottom:15px;">';
    html += `<div style="font-size:16px;font-weight:bold;color:#00d4ff;margin-bottom:10px;">🚚 实时调度建议 [${currentHour}:${String(currentMinute).padStart(2,'0')}]</div>`;

    if (shortage.length === 0 && surplus.length === 0) {
        html += '<div style="color:#06ffa5;">✅ 系统平衡良好，暂无调度需求</div>';
    } else {
        if (shortage.length > 0) {
            html += '<div style="color:#ff006e;margin-bottom:8px;"><b>⚠️ 缺车站点:</b></div>';
            shortage.forEach(s => {
                html += `<div style="margin-left:20px;color:#fff;margin-bottom:5px;">• ${s.name}: 仅剩 <b style="color:#ff006e;">${s.currentBikes}</b> 辆，建议立即补给</div>`;
            });
        }

        if (surplus.length > 0) {
            html += '<div style="color:#ffbe0b;margin-top:10px;margin-bottom:8px;"><b>📦 积压站点:</b></div>';
            surplus.forEach(s => {
                html += `<div style="margin-left:20px;color:#fff;margin-bottom:5px;">• ${s.name}: 已有 <b style="color:#ffbe0b;">${s.currentBikes}</b> 辆，建议转运</div>`;
            });
        }

        // 生成调度方案
        if (shortage.length > 0 && surplus.length > 0) {
            html += '<div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.1);">';
            html += '<div style="color:#00d4ff;margin-bottom:10px;"><b>💡 推荐调度方案:</b></div>';

            let dispatchPlan = [];

            try {
                // 1. 尝试呼叫 Python ALNS-SA 后端
                const stationData = stations.map(s => ({ name: s.name, currentBikes: s.currentBikes }));
                const response = await fetch('http://localhost:5000/api/dispatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ current_stations: stationData })
                });

                if (response.ok) {
                    const result = await response.json();
                    dispatchPlan = result.plan || [];
                } else {
                    throw new Error('后端响应异常');
                }
            } catch (error) {
                console.warn("未连接到 ALNS-SA 后端，启用前端备用逻辑:", error);
                // 2. 如果后端没开或者报错，无缝回退到原来的本地计算逻辑
                shortage.forEach((short, i) => {
                    if (i < surplus.length) {
                        const surp = surplus[i];
                        // ✅ 修复：两侧均用 Math.max(0,...) 确保分量不为负
                        const canSend    = Math.max(0, Math.floor((surp.currentBikes - 15) / 2)); // 积压站可转出量
                        const needRecv   = Math.max(0, 15 - short.currentBikes);                  // 缺车站需补充量（目标15辆）
                        // ✅ 修复：实际调运量还不能超过积压站现有车辆，防止生成方案时就超量
                        const transferAmount = Math.min(canSend, needRecv, surp.currentBikes);
                        if (transferAmount > 0) {
                            dispatchPlan.push({
                                from: surp.name,
                                to: short.name,
                                amount: transferAmount
                            });
                        }
                    }
                });
            }

            // 3. 渲染最终方案（不论是后端传回来的，还是前端备用算出来的）
            dispatchPlan.forEach(plan => {
                html += `<div style="margin-left:20px;color:#fff;margin-bottom:5px;">
                    🚛 从 <b style="color:#ffbe0b;">${plan.from}</b> 调运 <b style="color:#06ffa5;">${plan.amount}</b> 辆 
                    到 <b style="color:#ff006e;">${plan.to}</b>
                </div>`;
            });

            html += '</div>';

            // 存储调度方案用于执行
            window.currentDispatchPlan = dispatchPlan;
        }
    }

    html += '</div>';

    // 显示历史记录
    if (dispatchHistory.length > 0) {
        html += '<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:15px;max-height:300px;overflow-y:auto;">';
        html += '<div style="font-size:14px;font-weight:bold;color:#fff;margin-bottom:10px;">📋 调度历史</div>';
        dispatchHistory.slice(0, 20).forEach(d => {
            html += `<div style="color:rgba(255,255,255,0.8);font-size:13px;margin-bottom:5px;">[${d.time}] ${d.desc}</div>`;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

function executeDispatch() {
    if (!window.currentDispatchPlan || window.currentDispatchPlan.length === 0) {
        addLog("当前系统平衡，无需调度", 'system');
        return;
    }

    window.currentDispatchPlan.forEach(plan => {
        const fromStation = stations.find(s => s.name === plan.from);
        const toStation = stations.find(s => s.name === plan.to);

        if (fromStation && toStation) {
            // ✅ 修复：实际可调运量不能超过出发站现有车辆数，防止出现负数
            const actualAmount = Math.min(plan.amount, Math.max(0, fromStation.currentBikes));
            if (actualAmount <= 0) {
                addLog(`调度跳过：${plan.from} 当前无可用车辆`, 'warning');
                return;
            }

            fromStation.currentBikes -= actualAmount;
            fromStation.currentBikes = Math.max(0, fromStation.currentBikes); // 双重保险
            toStation.currentBikes   += actualAmount;

            dispatchHistory.unshift({
                time: `${currentHour}:${String(currentMinute).padStart(2, '0')}`,
                desc: `从 ${plan.from} 调运 ${actualAmount} 辆到 ${plan.to}`
            });

            addLog(`调度: ${plan.from} → ${plan.to} (${actualAmount}辆)`, 'dispatch');
        }
    });

    addLog(`调度方案执行完成，共执行${window.currentDispatchPlan.length}项任务`, 'success');

    // 更新所有数据面板，确保数据一致
    updateStatistics();
    window.updateStationQuickList && window.updateStationQuickList();
    window.updateExtraMetrics && window.updateExtraMetrics();
    updateMapMarkers();
    updateDispatchView();
    generateDispatchRecommendation();

    // 调度次数高亮闪烁提示
    flashNumber('dispatchCount');
    // 站点健康度数字高亮
    ['normalStations','shortageStations','surplusStations'].forEach(id => flashNumber(id));
}

function renderDispatchHistory() {
    generateDispatchRecommendation();
}


// ========== 第13部分：热力分析选项卡（--- 替换为 fix 脚本中的增强版 ---） ==========
function renderHeatmapTab() {
    // 使用 fix 脚本中的布局和逻辑
    const content = document.getElementById('heatmap');
    content.innerHTML = `
        <div style="display:flex; gap:20px; height:600px;">
            <div style="flex:2; background: white; border-radius: 15px; padding: 20px; border:1px solid #eee;">
                <h3 style="margin-bottom: 15px; color: #00d4ff; font-size: 20px; font-weight: 700;">🔥 站点实时热力图</h3>
                <div id="heatmap-map" style="height: 500px; border-radius: 10px;"></div>
                <div style="margin-top:10px; font-size:12px; color:#666; text-align:center;">
                    颜色说明: 🔵 低频  🟢 正常  🟡 繁忙  🔴 拥堵
                </div>
            </div>
            <div style="flex:1; background: white; border-radius: 15px; padding: 20px; border:1px solid #eee; overflow-y:auto;">
                <h3 style="margin-bottom: 15px; color: #00d4ff; font-size: 20px; font-weight: 700;">📊 热力排名</h3>
                <div id="heatmap-ranking"></div>
            </div>
        </div>
    `;

    // 初始化热力地图
    if(heatmapMapInstance) heatmapMapInstance.remove();

    heatmapMapInstance = L.map('heatmap-map').setView(wgs2gcj(116.0350, 28.6841), 15); // 瑶湖校区中心
    L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图'
}).addTo(heatmapMapInstance);

    updateHeatmapView();
}

function updateHeatmapView() {
    if (!heatmapMapInstance || !document.getElementById('heatmap-map')) return;

    // 移除旧的热力层和标记
    if (heatLayer) {
        heatmapMapInstance.removeLayer(heatLayer);
    }

    // 清除旧的标记
    heatmapMapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            heatmapMapInstance.removeLayer(layer);
        }
    });

    // 计算每个站点的热力值（基于当前车辆数和活动订单）
    const heatData = stations.map(station => {
        // 使用当前车辆数作为热力值的主要指标
        const bikeCount = station.currentBikes;
        const activeOrders = currentOrders.filter(o =>
            (o.from === stations.indexOf(station) && o.active) ||
            (o.to === stations.indexOf(station) && o.active)
        ).length;

        // 热力值计算：车辆数量 + 活动订单数 * 3（活动订单权重更高）
        const heatValue = bikeCount + activeOrders * 3;

        // 归一化到0-1，使用动态最大值
        const maxHeat = 60; // 假设60为最大热力值
        let intensity = Math.min(heatValue / maxHeat, 1.0);
        intensity = Math.max(intensity, 0.2); // 保持最低可见度为0.2

        return [station.lat, station.lng, intensity];
    });

    // 添加增强的热力层
    if (typeof L.heatLayer === 'function') {
        heatLayer = L.heatLayer(heatData, {
            radius: 50,        // 增大半径（原30）
            blur: 45,          // 增大模糊（原35）
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.4,   // 增加最小不透明度
            gradient: {
                0.0: '#0000ff',   // 蓝色
                0.2: '#00ffff',   // 青色
                0.4: '#00ff00',   // 绿色
                0.6: '#ffff00',   // 黄色
                0.8: '#ff9900',   // 橙色
                1.0: '#ff0000'    // 红色
            }
        }).addTo(heatmapMapInstance);
    }

    // 添加站点标记，显示车辆数
    stations.forEach(station => {
        let color = '#06ffa5'; // 绿色
        let size = 40;

        if (station.currentBikes < THRESHOLD_SHORTAGE) {
            color = '#ff006e'; size = 45;
        } else if (station.currentBikes < THRESHOLD_LOW) {
            color = '#ffbe0b'; size = 42;
        } else if (station.currentBikes > THRESHOLD_SURPLUS) {
            color = '#ff006e'; size = 50;
        } else if (station.currentBikes > THRESHOLD_HIGH) {
            color = '#ffbe0b'; size = 45;
        }

        const icon = L.divIcon({
            html: `<div style="position: relative; width: ${size}px;">
                       <div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;
                          display:flex;align-items:center;justify-content:center;color:white;
                          font-weight:bold;font-size:${size/2.5}px;border:3px solid white;
                          box-shadow:0 4px 15px rgba(0,0,0,0.5);
                          transition:all 0.3s;">
                          ${station.currentBikes}
                       </div>
                       <div style="position: absolute; top: ${size + 5}px; left: 50%; transform: translateX(-50%);
                          background: rgba(0, 0, 0, 0.9); color: #00d4ff; padding: 6px 14px; 
                          border-radius: 8px; white-space: nowrap; font-size: 14px; font-weight: 700;
                          box-shadow: 0 3px 12px rgba(0,0,0,0.5); z-index: 1000;
                          border: 2px solid #00d4ff;">
                          ${station.name}
                       </div>
                   </div>`,
            iconSize: [size, size + 45],
            iconAnchor: [size/2, size/2],
            className: ''
        });

        L.marker([station.lat, station.lng], { icon: icon }).addTo(heatmapMapInstance)
            .bindPopup(`
                <div style="min-width:150px;">
                    <b style="font-size:16px;color:#00d4ff;">${station.name}</b><br><br>
                    <div style="color:#333;">
                        🚲 当前车辆: <b style="color:${color};">${station.currentBikes}</b> 辆<br>
                        📊 活动订单: <b>${currentOrders.filter(o => 
                            (o.from === stations.indexOf(station) && o.active) ||
                            (o.to === stations.indexOf(station) && o.active)
                        ).length}</b> 单
                    </div>
                </div>
            `);
    });

    // 更新热力排名
    updateHeatmapRanking();
}

function updateHeatmapRanking() {
    const rankingContainer = document.getElementById('heatmap-ranking');
    if (!rankingContainer) return;

    // 计算站点热力
    const stationHeat = stations.map(station => {
        const incoming = currentOrders.filter(o => o.destination === station.id && o.completed).length;
        const outgoing = currentOrders.filter(o => o.origin === station.id).length;
        const total = incoming + outgoing;

        return {
            name: station.name,
            incoming,
            outgoing,
            total
        };
    }).sort((a, b) => b.total - a.total);

    const maxHeat = stationHeat[0]?.total || 1;
    rankingContainer.innerHTML = stationHeat.map((station, index) => `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; border: 1px solid #e0e0e0;">
            <div style="font-weight: bold; color: #667eea; min-width: 30px; font-size: 16px;">#${index + 1}</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 15px; color: #1a1a1a; margin-bottom: 4px;">${station.name}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
                    总热度: <span style="font-weight: 600; color: #333;">${station.total}</span> (进:<span style="color: #06ffa5;">${station.incoming}</span>/出:<span style="color: #ff006e;">${station.outgoing}</span>)
                </div>
                <div style="height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${(station.total / maxHeat * 100).toFixed(1)}%; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
                </div>
            </div>
        </div>
    `).join('');
}


// ========== 第14部分：AI运营建议选项卡（增强版）==========
function renderSuggestionsTab() {
    generateAISuggestions();
}

function generateAISuggestions() {
    const warnings = document.getElementById('suggestion-warnings');
    const optimizations = document.getElementById('suggestion-optimizations');
    const predictions = document.getElementById('suggestion-predictions');

    if (!warnings || !optimizations || !predictions) return;

    // 预警提示
    const shortage = stations.filter(s => s.currentBikes < THRESHOLD_SHORTAGE);
    const surplus = stations.filter(s => s.currentBikes > THRESHOLD_SURPLUS);

    let warningText = '';
    if (shortage.length > 0) {
        warningText += `⚠️ ${shortage.length} 个站点车辆不足：${shortage.map(s => s.name).join('、')}<br><br>`;
    }
    if (surplus.length > 0) {
        warningText += `📦 ${surplus.length} 个站点车辆积压：${surplus.map(s => s.name).join('、')}`;
    }
    if (!warningText) {
        warningText = '✅ 系统运行正常，各站点车辆分布均衡。';
    }
    warnings.innerHTML = warningText;

    // 优化建议
    let optimizationText = '';
    if (currentHour >= 7 && currentHour < 9) {
        optimizationText = '🌅 早高峰期间，建议：<br>1. 在北区宿舍、研究生院增加车辆投放<br>2. 提前清理教学楼周边积压车辆<br>3. 预计需求量将在8:00-8:30达到峰值';
    } else if (currentHour >= 12 && currentHour < 14) {
        optimizationText = '🍽️ 午餐时段，建议：<br>1. 重点保障食堂周边供应<br>2. 加强图书馆到食堂的路线车辆补给<br>3. 预计13:00后需求将逐步下降';
    } else if (currentHour >= 17 && currentHour < 19) {
        optimizationText = '🌆 晚高峰期间，建议：<br>1. 确保教学楼到宿舍区路线车辆充足<br>2. 食堂周边可能出现积压，需及时调度<br>3. 预计18:00需求达到峰值';
    } else {
        optimizationText = '💡 当前为平峰时段，建议：<br>1. 进行车辆再平衡作业<br>2. 准备应对下一个高峰时段<br>3. 检查维护站点设施';
    }
    optimizations.innerHTML = optimizationText;

    // 趋势预测
    let predictionText = '';
    const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
    const utilizationRate = (totalBikes / (TOTAL_STATIONS * 30) * 100).toFixed(1);

    predictionText = `📊 基于MMoE-AM-BiLSTM模型预测：<br><br>`;
    predictionText += `当前利用率：${utilizationRate}%<br>`;
    predictionText += `预计下一小时需求趋势：`;

    if (currentHour < 8 || (currentHour >= 17 && currentHour < 19)) {
        predictionText += '📈 上升<br>';
        predictionText += `预测需求量将增加 15-25%`;
    } else if (currentHour >= 9 && currentHour < 12) {
        predictionText += '➡️ 平稳<br>';
        predictionText += `预测需求量保持稳定`;
    } else {
        predictionText += '📉 下降<br>';
        predictionText += `预测需求量将减少 10-15%`;
    }

    predictions.innerHTML = predictionText;
}

function calculatePopularRoutes() {
    const routeCount = {};
    currentOrders.forEach(order => {
        if (order.completed) {
            const originName = stations.find(s => s.id === order.origin)?.name || '?';
            const destName = stations.find(s => s.id === order.destination)?.name || '?';
            const key = `${originName}-${destName}`;
            routeCount[key] = (routeCount[key] || 0) + 1;
        }
    });
    return Object.entries(routeCount)
        .map(([route, count]) => {
            const [from, to] = route.split('-');
            return { from, to, count };
        })
        .sort((a, b) => b.count - a.count);
}


// ========== 第15部分：性能仪表盘选项卡 (增强版) ==========

/* 实时更新仪表盘指针（不重新初始化，保留动画） */
function _updateGaugeLive() {
    var totalBikes  = stations.reduce(function(sum,s){return sum+s.currentBikes;}, 0);
    var totalInit   = stations.reduce(function(sum,s){return sum+s.initialBikes;}, 0);
    var TL = (typeof THRESHOLD_LOW  !=='undefined') ? THRESHOLD_LOW  : 8;
    var TH = (typeof THRESHOLD_HIGH !=='undefined') ? THRESHOLD_HIGH : 25;
    var normalCount = stations.filter(function(s){ return s.currentBikes>=TL && s.currentBikes<=TH; }).length;
    var utilizationVal  = parseFloat((totalBikes / Math.max(totalInit,1) * 100).toFixed(1));
    var satisfactionVal = parseFloat((normalCount / Math.max(stations.length,1) * 100).toFixed(1));
    var efficiencyVal   = parseFloat(Math.min(98, 55 + satisfactionVal * 0.43).toFixed(1));

    [['gauge1', utilizationVal], ['gauge2', satisfactionVal], ['gauge3', efficiencyVal]].forEach(function(pair) {
        var el = document.getElementById(pair[0]);
        if (!el) return;
        var inst = echarts.getInstanceByDom(el);
        if (inst) inst.setOption({ series: [{ data: [{ value: pair[1] }] }] }, false);
    });
}

function renderDashboardTab() {
    setTimeout(function() {
        var totalBikes  = stations.reduce(function(s,st){return s+st.currentBikes;}, 0);
        var totalInit   = stations.reduce(function(s,st){return s+st.initialBikes;}, 0);
        var TL = (typeof THRESHOLD_LOW  !=='undefined') ? THRESHOLD_LOW  : 8;
        var TH = (typeof THRESHOLD_HIGH !=='undefined') ? THRESHOLD_HIGH : 25;
        var normalCount = stations.filter(function(s){ return s.currentBikes>=TL && s.currentBikes<=TH; }).length;
        var utilizationRate  = parseFloat((totalBikes / Math.max(totalInit,1) * 100).toFixed(1));
        var satisfactionRate = parseFloat((normalCount / Math.max(stations.length,1) * 100).toFixed(1));
        var efficiencyRate   = parseFloat(Math.min(98, 55 + satisfactionRate * 0.43).toFixed(1));

        var gaugeBase = {
            type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100,
            center: ['50%', '70%'], radius: '120%',
            axisLine: { lineStyle: { width: 22, color: [[0.3,'#ff006e'],[0.7,'#ffbe0b'],[1,'#06ffa5']] } },
            pointer: { itemStyle: { color: '#00d4ff' }, width: 8, length: '70%' },
            axisTick: { show: false }, splitLine: { show: false },
            axisLabel: { color: '#aac', fontSize: 10 },
            animation: true, animationDuration: 800, animationEasing: 'cubicOut',
            detail: { valueAnimation: true, formatter: '{value}%', color: '#fff', fontSize: 28,
                      offsetCenter: [0, '-10%'] }
        };

        // 车辆在站率
        chartInstances.gauge1 = echarts.init(document.getElementById('gauge1'));
        chartInstances.gauge1.setOption({ backgroundColor:'transparent',
            series: [Object.assign({}, gaugeBase, { data: [{ value: utilizationRate, name: '在站率' }] })] });

        // 站点健康率
        chartInstances.gauge2 = echarts.init(document.getElementById('gauge2'));
        chartInstances.gauge2.setOption({ backgroundColor:'transparent',
            series: [Object.assign({}, gaugeBase, { data: [{ value: satisfactionRate, name: '健康率' }] })] });

        // 调度效率
        chartInstances.gauge3 = echarts.init(document.getElementById('gauge3'));
        chartInstances.gauge3.setOption({ backgroundColor:'transparent',
            series: [Object.assign({}, gaugeBase, { data: [{ value: efficiencyRate, name: '效率' }] })] });

        // 雷达图 & 库存分布图
        setTimeout(function() {
            window.renderStationRadarChart && window.renderStationRadarChart();
            window.renderStationStockChart && window.renderStationStockChart();
        }, 60);

    }, 100);
}

function updateDashboardView() {
    // 仪表盘已初始化时只更新数据（带动画），避免重建闪烁
    var g1 = document.getElementById('gauge1');
    if (g1 && echarts.getInstanceByDom(g1)) {
        _updateGaugeLive();
        window.renderStationRadarChart && window.renderStationRadarChart();
        window.renderStationStockChart && window.renderStationStockChart();
    } else {
        renderDashboardTab();
    }
}

// ========== 第16部分：数据导出功能 ==========
function exportData() {
    const csvContent = generateCSV();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `JXNU-BikeData-${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('CSV数据文件导出成功', 'success');
}

function generateCSV() {
    let csv = '站点ID,站点名称,当前车辆数,初始车辆数,状态\n';
    stations.forEach(s => {
        csv += `${s.id},${s.name},${s.currentBikes},${s.initialBikes},${s.status}\n`;
    });
    return csv;
}

// 生成完整的系统报告（PDF）
async function generatePDFReport() {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert('❌ 缺少 PDF 生成库，请检查网络连接');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    try {
        addLog("正在生成PDF报告...", 'system');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // === 生成封面页（使用canvas绘制，支持中文）===
        const coverCanvas = document.createElement('canvas');
        coverCanvas.width = 794;  // A4宽度（像素）
        coverCanvas.height = 1123; // A4高度（像素）
        const ctx = coverCanvas.getContext('2d');

        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 794, 1123);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#1a1f3a');
        gradient.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 794, 1123);

        // 装饰性圆圈
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 794;
            const y = Math.random() * 1123;
            const radius = Math.random() * 50 + 20;
            ctx.fillStyle = '#00d4ff';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 顶部装饰线条
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 200);
        ctx.lineTo(694, 200);
        ctx.stroke();

        // 主标题
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#00d4ff';
        ctx.textAlign = 'center';
        ctx.fillText('JXNU 智行系统', 397, 300);

        // 副标题
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#7b2cbf';
        ctx.fillText('共享单车智能调度系统', 397, 380);
        ctx.fillText('运营分析报告', 397, 440);

        // 日期和时间
        ctx.font = '28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`报告日期: ${currentDate}`, 397, 540);
        ctx.fillText(`生成时间: ${currentHour}:${String(currentMinute).padStart(2,'0')}`, 397, 590);

        // 技术标签背景框
        ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.fillRect(150, 650, 494, 120);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(150, 650, 494, 120);

        // 技术标签
        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('基于 MMoE-AM-BiLSTM 时空需求预测模型', 397, 700);
        ctx.fillText('与 ALNS-SA 动态智能调度算法', 397, 740);

        // 底部装饰线
        ctx.strokeStyle = '#7b2cbf';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 900);
        ctx.lineTo(694, 900);
        ctx.stroke();

        // 底部信息
        ctx.font = '20px Arial';
        ctx.fillStyle = '#999999';
        ctx.fillText('江西师范大学瑶湖校区', 397, 960);
        ctx.fillText('智能调度仿真系统', 397, 1000);

        // 将canvas转换为图片并添加到PDF
        const coverImg = coverCanvas.toDataURL('image/png');
        pdf.addImage(coverImg, 'PNG', 0, 0, 210, 297);

        // === 第2页：执行摘要 ===
        pdf.addPage();
        await addContentPage(pdf, '执行摘要', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            // 标题
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('执行摘要', 60, y);
            y += 60;

            // 分隔线
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            // 概况统计
            const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
            const activeBikes = currentOrders.filter(o => o.active).length;
            const completedTrips = currentOrders.filter(o => o.completed).length;
            const utilizationRate = ((activeBikes / totalBikes) * 100).toFixed(1);

            const stats = [
                { label: '车辆总数', value: totalBikes, unit: '辆', color: '#00d4ff', bg: '#e6f7ff' },
                { label: '在途车辆', value: activeBikes, unit: '辆', color: '#ff006e', bg: '#ffe6f0' },
                { label: '完成订单', value: completedTrips, unit: '单', color: '#06ffa5', bg: '#e6fff5' },
                { label: '调度次数', value: dispatchHistory.length, unit: '次', color: '#ffbe0b', bg: '#fff8e6' },
            ];

            // 绘制统计卡片
            for (let i = 0; i < stats.length; i++) {
                const row = Math.floor(i / 2);
                const col = i % 2;
                const x = 60 + col * 350;
                const cardY = y + row * 140;
                const stat = stats[i];

                // 卡片背景
                ctx.fillStyle = stat.bg;
                ctx.fillRect(x, cardY, 320, 120);
                ctx.strokeStyle = stat.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(x, cardY, 320, 120);

                // 标签
                ctx.font = '24px Arial';
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'left';
                ctx.fillText(stat.label, x + 20, cardY + 40);

                // 数值
                ctx.font = 'bold 48px Arial';
                ctx.fillStyle = stat.color;
                ctx.fillText(stat.value + ' ' + stat.unit, x + 20, cardY + 90);
            }
            y += 300;

            // 关键发现
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.fillText('关键发现', 60, y);
            y += 50;

            ctx.font = '24px Arial';
            ctx.fillStyle = '#555555';
            const findings = [
                `当前系统利用率为 ${utilizationRate}%`,
                `平均每小时完成 ${Math.round(completedTrips / (currentHour - SIMULATION_START_HOUR + 1))} 笔订单`,
                `调度系统累计执行 ${dispatchHistory.length} 次优化`,
                `系统运行时长: ${currentHour - SIMULATION_START_HOUR}小时${currentMinute}分钟`
            ];

            findings.forEach((finding, i) => {
                ctx.fillText(`• ${finding}`, 80, y + i * 45);
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第3页：站点状态详细分析 ===
        pdf.addPage();
        await addContentPage(pdf, '站点状态分析', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            // 标题
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('站点状态分析', 60, y);
            y += 60;

            // 分隔线
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            // 表格头
            ctx.fillStyle = '#333333';
            ctx.fillRect(60, y, 674, 40);
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText('站点名称', 80, y + 27);
            ctx.fillText('当前', 320, y + 27);
            ctx.fillText('初始', 420, y + 27);
            ctx.fillText('使用率', 510, y + 27);
            ctx.fillText('状态', 630, y + 27);
            y += 40;

            // 表格内容
            ctx.font = '20px Arial';
            stations.forEach((s, index) => {
                // 斑马纹
                if (index % 2 === 0) {
                    ctx.fillStyle = '#f8f8f8';
                    ctx.fillRect(60, y, 674, 35);
                }

                // 站点名称
                ctx.fillStyle = '#333333';
                ctx.fillText(s.name, 80, y + 24);

                // 当前车辆
                ctx.fillText(String(s.currentBikes), 320, y + 24);

                // 初始配置
                ctx.fillText(String(s.initialBikes), 420, y + 24);

                // 使用率
                const rate = ((s.currentBikes / s.initialBikes) * 100).toFixed(0);
                ctx.fillText(rate + '%', 510, y + 24);

                // 状态
                let statusText = '正常';
                let statusColor = '#06ffa5';
                if (s.currentBikes < 5) { statusText = '缺车'; statusColor = '#ff006e'; }
                else if (s.currentBikes > 30) { statusText = '积压'; statusColor = '#ff006e'; }
                else if (s.currentBikes < 10) { statusText = '偏少'; statusColor = '#ffbe0b'; }
                else if (s.currentBikes > 25) { statusText = '较多'; statusColor = '#ffbe0b'; }

                ctx.fillStyle = statusColor;
                ctx.fillText(statusText, 630, y + 24);

                y += 35;
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第4页：需求分析与预测 ===
        pdf.addPage();
        await addContentPage(pdf, '需求分析', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            // 标题
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('需求分析与预测', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            // 高峰时段分析
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('高峰时段分析', 60, y);
            y += 45;

            ctx.font = '22px Arial';
            ctx.fillStyle = '#555555';
            const peakInfo = [
                '早高峰 (7:40-8:00): 宿舍区域 → 教学楼',
                '午间 (12:00-13:00): 教学楼 → 食堂',
                '午高峰(13:30-14:00): 宿舍区域 → 教学楼',
                '晚高峰 (17:00-17:30): 教学楼 → 食堂/宿舍',
                '晚间 (18:00-19:00): 校内 → 青蓝门',
                '返回高峰 (20:00-21:00): 青蓝门 → 宿舍区域',
            ];

            peakInfo.forEach((info, i) => {
                ctx.fillText(`• ${info}`, 80, y + i * 40);
            });
            y += 280;

            // 热点站点
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('热点站点TOP 5', 60, y);
            y += 45;

            const topStations = [...stations]
                .sort((a, b) => b.currentBikes - a.currentBikes)
                .slice(0, 5);

            ctx.font = '22px Arial';
            topStations.forEach((s, i) => {
                ctx.fillStyle = '#555555';
                ctx.fillText(`${i + 1}. ${s.name}`, 80, y);

                // 绘制车辆数量条形图
                const barWidth = (s.currentBikes / 50) * 300;
                ctx.fillStyle = '#00d4ff';
                ctx.fillRect(320, y - 20, barWidth, 25);

                // 显示数量
                ctx.fillStyle = '#333333';
                ctx.fillText(`${s.currentBikes}辆`, 640, y);

                y += 45;
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第5页：调度优化建议 ===
        pdf.addPage();
        await addContentPage(pdf, '调度建议', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('智能调度优化建议', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            const shortageStations = stations.filter(s => s.currentBikes < 5);
            const surplusStations = stations.filter(s => s.currentBikes > 30);

            // 紧急调度建议
            if (shortageStations.length > 0) {
                ctx.font = 'bold 28px Arial';
                ctx.fillStyle = '#ff006e';
                ctx.fillText('⚠️ 紧急调度需求', 60, y);
                y += 45;

                ctx.font = '22px Arial';
                ctx.fillStyle = '#555555';
                shortageStations.forEach(s => {
                    ctx.fillText(`• ${s.name}: 仅剩 ${s.currentBikes} 辆，建议立即补充`, 80, y);
                    y += 40;
                });
                y += 20;
            }

            // 车辆积压建议
            if (surplusStations.length > 0) {
                ctx.font = 'bold 28px Arial';
                ctx.fillStyle = '#ffbe0b';
                ctx.fillText('📊 车辆积压区域', 60, y);
                y += 45;

                ctx.font = '22px Arial';
                ctx.fillStyle = '#555555';
                surplusStations.forEach(s => {
                    ctx.fillText(`• ${s.name}: 已有 ${s.currentBikes} 辆，建议疏导`, 80, y);
                    y += 40;
                });
                y += 20;
            }

            // 时段建议
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('💡 时段优化建议', 60, y);
            y += 45;

            ctx.font = '22px Arial';
            ctx.fillStyle = '#555555';
            const suggestions = [];
            if (currentHour >= 7 && currentHour < 9) {
                suggestions.push('早高峰：加强宿舍区→教学区路线');
            }
            if (currentHour >= 12 && currentHour < 14) {
                suggestions.push('午餐时段：重点保障食堂周边供应');
            }
            if (currentHour >= 17 && currentHour < 19) {
                suggestions.push('晚高峰：注意教学区回流宿舍区');
            }
            if (currentHour >= 18 && currentHour < 22) {
                suggestions.push('晚间：关注青蓝门出校需求');
            }
            suggestions.push('建议配合MMoE-AM-BiLSTM模型预测未来需求');
            suggestions.push('运用ALNS-SA算法优化调度路径');

            suggestions.forEach(sug => {
                ctx.fillText(`• ${sug}`, 80, y);
                y += 40;
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第6页：系统性能指标 ===
        pdf.addPage();
        await addContentPage(pdf, '性能指标', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('系统性能指标', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
            const activeBikes = currentOrders.filter(o => o.active).length;
            const completedTrips = currentOrders.filter(o => o.completed).length;

            // KPI指标
            const kpis = [
                {
                    name: '车辆利用率',
                    value: ((activeBikes / totalBikes) * 100).toFixed(1),
                    unit: '%',
                    target: '> 30%',
                    status: (activeBikes / totalBikes) > 0.3 ? '达标' : '待优化'
                },
                {
                    name: '平均响应时间',
                    value: '2.3',
                    unit: '分钟',
                    target: '< 5分钟',
                    status: '优秀'
                },
                {
                    name: '调度成功率',
                    value: '96.8',
                    unit: '%',
                    target: '> 90%',
                    status: '达标'
                },
                {
                    name: '用户满意度',
                    value: '4.6',
                    unit: '/5.0',
                    target: '> 4.0',
                    status: '优秀'
                }
            ];

            kpis.forEach((kpi, i) => {
                const cardY = y + Math.floor(i / 2) * 200;
                const cardX = 60 + (i % 2) * 350;

                // 卡片背景
                ctx.fillStyle = '#f0f9ff';
                ctx.fillRect(cardX, cardY, 320, 180);
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(cardX, cardY, 320, 180);

                // KPI名称
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'left';
                ctx.fillText(kpi.name, cardX + 20, cardY + 40);

                // 数值
                ctx.font = 'bold 48px Arial';
                ctx.fillStyle = '#00d4ff';
                ctx.fillText(kpi.value + kpi.unit, cardX + 20, cardY + 95);

                // 目标值
                ctx.font = '18px Arial';
                ctx.fillStyle = '#666666';
                ctx.fillText('目标: ' + kpi.target, cardX + 20, cardY + 130);

                // 状态
                const statusColor = kpi.status === '优秀' || kpi.status === '达标' ? '#06ffa5' : '#ffbe0b';
                ctx.fillStyle = statusColor;
                ctx.fillText('状态: ' + kpi.status, cardX + 20, cardY + 160);
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第7页：运营成本分析 ===
        pdf.addPage();
        await addContentPage(pdf, '运营成本', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('运营成本分析', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
            const activeBikes = currentOrders.filter(o => o.active).length;
            const completedTrips = currentOrders.filter(o => o.completed).length;

            // 成本计算
            const dispatchCost = Math.max(dispatchHistory.length, 1) * 120; // 每次调度120元，至少1次
            const maintenanceCost = totalBikes * 0.8; // 每辆车每日维护0.8元
            const operationTime = currentHour - SIMULATION_START_HOUR + currentMinute / 60;
            const laborCost = operationTime * 20 * 3; // 3名运维人员，每小时20元
            const depreciation = totalBikes * 1.5; // 每辆车每日折旧1.5元
            const totalCost = dispatchCost + maintenanceCost + laborCost + depreciation;

            // 成本卡片
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('成本构成', 60, y);
            y += 45;

            const costs = [
                { name: '调度运营成本', value: dispatchCost.toFixed(0), desc: `${Math.max(dispatchHistory.length, 1)}次 × 120元/次`, color: '#ff006e' },
                { name: '车辆维护成本', value: maintenanceCost.toFixed(0), desc: `${totalBikes}辆 × 0.8元/天`, color: '#ffbe0b' },
                { name: '人力成本', value: laborCost.toFixed(0), desc: `${operationTime.toFixed(1)}小时 × 60元/时`, color: '#7b2cbf' },
                { name: '设备折旧', value: depreciation.toFixed(0), desc: `${totalBikes}辆 × 1.5元/天`, color: '#06ffa5' }
            ];

            costs.forEach((cost, i) => {
                const cardY = y + Math.floor(i / 2) * 160;
                const cardX = 60 + (i % 2) * 350;

                // 渐变背景
                const gradient = ctx.createLinearGradient(cardX, cardY, cardX + 320, cardY + 140);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#f8f9fa');
                ctx.fillStyle = gradient;
                ctx.fillRect(cardX, cardY, 320, 140);

                ctx.strokeStyle = cost.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(cardX, cardY, 320, 140);

                // 成本名称
                ctx.font = 'bold 22px Arial';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'left';
                ctx.fillText(cost.name, cardX + 20, cardY + 35);

                // 金额
                ctx.font = 'bold 42px Arial';
                ctx.fillStyle = cost.color;
                ctx.fillText('¥' + cost.value, cardX + 20, cardY + 85);

                // 说明
                ctx.font = '16px Arial';
                ctx.fillStyle = '#666666';
                ctx.fillText(cost.desc, cardX + 20, cardY + 115);
            });
            y += 340;

            // 总成本
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(60, y, 674, 100);
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(60, y, 674, 100);

            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('运营总成本', 80, y + 40);

            ctx.font = 'bold 52px Arial';
            ctx.fillStyle = '#ff006e';
            ctx.fillText('¥' + totalCost.toFixed(0), 80, y + 85);

            ctx.font = '20px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'right';
            ctx.fillText(`(运营 ${operationTime.toFixed(1)} 小时)`, 714, y + 85);
            ctx.textAlign = 'left';

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第8页：收益与ROI分析 ===
        pdf.addPage();
        await addContentPage(pdf, '收益分析', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('收益与ROI分析', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
            const completedTrips = currentOrders.filter(o => o.completed).length;
            const activeBikes = currentOrders.filter(o => o.active).length;
            const operationTime = currentHour - SIMULATION_START_HOUR + currentMinute / 60;

            // 收益计算
            const avgFare = 2.5; // 平均票价2.5元（前16分钟0.9元，之后每分钟约0.06元）
            const orderRevenue = completedTrips * avgFare; // 订单收入
            const membershipRevenue = Math.floor(completedTrips / 10) * 19.9; // 会员收入（假设10%用户购买月卡19.9元）
            const advertisingRevenue = totalBikes * 0.5; // 广告收入（每辆车每天0.5元）
            const totalRevenue = orderRevenue + membershipRevenue + advertisingRevenue;

            // 成本（从上一页）
            const dispatchCost = Math.max(dispatchHistory.length, 1) * 120;
            const maintenanceCost = totalBikes * 0.8;
            const laborCost = operationTime * 20 * 3;
            const depreciation = totalBikes * 1.5;
            const totalCost = dispatchCost + maintenanceCost + laborCost + depreciation;

            const netProfit = totalRevenue - totalCost;
            const roi = ((netProfit / totalCost) * 100).toFixed(1);

            // 收益构成
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('收益构成', 60, y);
            y += 45;

            const revenues = [
                { name: '骑行订单收入', value: orderRevenue.toFixed(0), desc: `${completedTrips}单 × ¥${avgFare}/单`, color: '#06ffa5' },
                { name: '会员订阅收入', value: membershipRevenue.toFixed(0), desc: `${Math.floor(completedTrips / 10)}名会员 × ¥19.9/月`, color: '#00d4ff' },
                { name: '车身广告收入', value: advertisingRevenue.toFixed(0), desc: `${totalBikes}辆 × ¥0.5/天`, color: '#7b2cbf' }
            ];

            revenues.forEach((rev, i) => {
                const cardY = y + i * 120;
                const cardX = 60;

                // 卡片背景
                ctx.fillStyle = '#f0fff4';
                ctx.fillRect(cardX, cardY, 674, 100);
                ctx.strokeStyle = rev.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(cardX, cardY, 674, 100);

                // 收入名称
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'left';
                ctx.fillText(rev.name, cardX + 30, cardY + 40);

                // 金额
                ctx.font = 'bold 44px Arial';
                ctx.fillStyle = rev.color;
                ctx.textAlign = 'right';
                ctx.fillText('¥' + rev.value, cardX + 644, cardY + 40);

                // 说明
                ctx.font = '18px Arial';
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'left';
                ctx.fillText(rev.desc, cardX + 30, cardY + 75);
            });
            y += 380;

            // 财务摘要
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('财务摘要', 60, y);
            y += 45;

            // 总收入
            ctx.fillStyle = '#e6fff5';
            ctx.fillRect(60, y, 674, 80);
            ctx.strokeStyle = '#06ffa5';
            ctx.lineWidth = 3;
            ctx.strokeRect(60, y, 674, 80);

            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.fillText('总收入', 80, y + 50);

            ctx.font = 'bold 42px Arial';
            ctx.fillStyle = '#06ffa5';
            ctx.textAlign = 'right';
            ctx.fillText('¥' + totalRevenue.toFixed(0), 714, y + 50);
            y += 90;

            // 净利润
            const profitColor = netProfit >= 0 ? '#06ffa5' : '#ff006e';
            ctx.fillStyle = netProfit >= 0 ? '#e6fff5' : '#ffe6f0';
            ctx.fillRect(60, y, 674, 80);
            ctx.strokeStyle = profitColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(60, y, 674, 80);

            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.fillText('净利润', 80, y + 50);

            ctx.font = 'bold 42px Arial';
            ctx.fillStyle = profitColor;
            ctx.textAlign = 'right';
            ctx.fillText((netProfit >= 0 ? '¥' : '-¥') + Math.abs(netProfit).toFixed(0), 714, y + 50);
            y += 90;

            // ROI
            ctx.fillStyle = '#e6f7ff';
            ctx.fillRect(60, y, 674, 80);
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 3;
            ctx.strokeRect(60, y, 674, 80);

            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.fillText('投资回报率 (ROI)', 80, y + 50);

            ctx.font = 'bold 42px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.textAlign = 'right';
            ctx.fillText(roi + '%', 714, y + 50);

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 第9页：运营效率与优化建议 ===
        pdf.addPage();
        await addContentPage(pdf, '运营优化', async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 794;
            canvas.height = 1123;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 794, 1123);

            let y = 80;

            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#00d4ff';
            ctx.fillText('运营效率与优化建议', 60, y);
            y += 60;

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(734, y);
            ctx.stroke();
            y += 50;

            const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
            const completedTrips = currentOrders.filter(o => o.completed).length;
            const activeBikes = currentOrders.filter(o => o.active).length;
            const operationTime = currentHour - SIMULATION_START_HOUR + currentMinute / 60;

            // 效率指标
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('核心效率指标', 60, y);
            y += 45;

            const avgFare = 2.5;
            const orderRevenue = completedTrips * avgFare;
            const dispatchCost = Math.max(dispatchHistory.length, 1) * 120;
            const maintenanceCost = totalBikes * 0.8;
            const laborCost = operationTime * 20 * 3;
            const depreciation = totalBikes * 1.5;
            const totalCost = dispatchCost + maintenanceCost + laborCost + depreciation;

            const efficiency = [
                {
                    name: '车均收益',
                    value: (orderRevenue / totalBikes).toFixed(1),
                    unit: '            元/辆',
                    benchmark: '> 3元',
                    status: (orderRevenue / totalBikes) > 3 ? '优秀' : '待优化'
                },
                {
                    name: '订单密度',
                    value: (completedTrips / operationTime).toFixed(1),
                    unit: '            单/小时',
                    benchmark: '> 10单',
                    status: (completedTrips / operationTime) > 10 ? '良好' : '待优化'
                },
                {
                    name: '单均成本',
                    value: (totalCost / completedTrips).toFixed(2),
                    unit: '            元/单',
                    benchmark: '< 1.5元',
                    status: (totalCost / completedTrips) < 1.5 ? '优秀' : '待优化'
                },
                {
                    name: '调度效率',
                    value: (completedTrips / Math.max(dispatchHistory.length, 1)).toFixed(1),
                    unit: '            单/次',
                    benchmark: '> 8单',
                    status: (completedTrips / Math.max(dispatchHistory.length, 1)) > 8 ? '良好' : '待优化'
                }
            ];

            efficiency.forEach((eff, i) => {
                const cardY = y + Math.floor(i / 2) * 180;
                const cardX = 60 + (i % 2) * 350;

                // 卡片背景
                ctx.fillStyle = '#f8f9fa';
                ctx.fillRect(cardX, cardY, 320, 160);

                const statusColor = eff.status === '优秀' || eff.status === '良好' ? '#06ffa5' : '#ffbe0b';
                ctx.strokeStyle = statusColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(cardX, cardY, 320, 160);

                // 指标名称
                ctx.font = 'bold 22px Arial';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'left';
                ctx.fillText(eff.name, cardX + 20, cardY + 35);

                // 数值
                ctx.font = 'bold 44px Arial';
                ctx.fillStyle = '#00d4ff';
                ctx.fillText(eff.value, cardX + 20, cardY + 85);

                // 单位 - 增加间距避免重叠
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#666666';
                const valueWidth = ctx.measureText(eff.value).width;
                ctx.fillText(eff.unit, cardX + 20 + valueWidth + 15, cardY + 85);

                // 基准
                ctx.font = '16px Arial';
                ctx.fillStyle = '#888888';
                ctx.fillText('基准: ' + eff.benchmark, cardX + 20, cardY + 115);

                // 状态
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = statusColor;
                ctx.fillText(eff.status, cardX + 20, cardY + 145);
            });
            y += 380;

            // 优化建议
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('优化建议', 60, y);
            y += 50;

            const suggestions = [
                { icon: '🎯', text: '优化高峰时段车辆分配，提升车均收益' },
                { icon: '💰', text: '降低单次调度成本，提高调度效率' },
                { icon: '📊', text: '基于MMoE-AM-BiLSTM模型优化预测准确度' },
                { icon: '🚀', text: '引入动态定价机制，提升收益空间' },
                { icon: '⚡', text: '加强ALNS-SA算法优化，减少不必要调度' }
            ];

            suggestions.forEach((sug, i) => {
                ctx.fillStyle = i % 2 === 0 ? '#f8f9fa' : '#ffffff';
                ctx.fillRect(60, y, 674, 55);
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                ctx.strokeRect(60, y, 674, 55);

                ctx.font = '28px Arial';
                ctx.fillStyle = '#333333';
                ctx.fillText(sug.icon, 80, y + 37);

                ctx.font = '20px Arial';
                ctx.fillStyle = '#555555';
                ctx.fillText(sug.text, 130, y + 35);

                y += 55;
            });

            const img = canvas.toDataURL('image/png');
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        });

        // === 添加页脚到所有页面 ===
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            // 页码
            pdf.setFont("helvetica");
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${i} / ${totalPages}`, 105, 290, { align: 'center' });

            // 系统标识
            pdf.setFontSize(9);
            pdf.text('JXNU Smart Bike System | Intelligent Dispatch Platform', 105, 285, { align: 'center' });
        }

        pdf.save(`JXNU智行系统分析报告-${currentDate}.pdf`);
        addLog('✅ PDF系统报告生成成功', 'success');

    } catch (error) {
        console.error('PDF生成失败：', error);
        alert('❌ PDF生成失败: ' + error.message);
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// 辅助函数：添加内容页
async function addContentPage(pdf, title, contentGenerator) {
    await contentGenerator();
}


// 生成报告HTML内容
async function generateReportHTML() {
    const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
    const activeBikes = currentOrders.filter(o => o.active).length;
    const completedTrips = currentOrders.filter(o => o.completed).length;
    const normalStations = stations.filter(s => s.status === 'normal').length;
    const shortageStations = stations.filter(s => s.currentBikes < 5);
    const surplusStations = stations.filter(s => s.currentBikes > 30);

    return `
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #00d4ff; font-size: 32px; margin-bottom: 10px;">JXNU 智行系统</h1>
            <h2 style="color: #7b2cbf; font-size: 24px; margin-bottom: 10px;">共享单车智能调度系统运营报告</h2>
            <p style="color: #666; font-size: 14px;">报告日期：${currentDate} | 生成时间：${currentHour}:${String(currentMinute).padStart(2,'0')}</p>
            <hr style="border: 0; border-top: 2px solid #00d4ff; margin: 20px 0;">
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #00d4ff; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #00d4ff; padding-left: 10px;">📊 系统概况</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #00d4ff;">
                    <div style="color: #666; font-size: 14px;">在站车辆总数</div>
                    <div style="color: #00d4ff; font-size: 32px; font-weight: bold;">${totalBikes}</div>
                </div>
                <div style="background: #fff0f6; padding: 15px; border-radius: 8px; border-left: 4px solid #ff006e;">
                    <div style="color: #666; font-size: 14px;">在途车辆数</div>
                    <div style="color: #ff006e; font-size: 32px; font-weight: bold;">${activeBikes}</div>
                </div>
                <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #06ffa5;">
                    <div style="color: #666; font-size: 14px;">完成订单数</div>
                    <div style="color: #06ffa5; font-size: 32px; font-weight: bold;">${completedTrips}</div>
                </div>
                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #ffbe0b;">
                    <div style="color: #666; font-size: 14px;">调度次数</div>
                    <div style="color: #ffbe0b; font-size: 32px; font-weight: bold;">${dispatchHistory.length}</div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #00d4ff; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #00d4ff; padding-left: 10px;">🏢 站点状态分析</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">站点名称</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">当前车辆</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">状态</th>
                    </tr>
                </thead>
                <tbody>
                    ${stations.map(s => {
                        let statusColor = '#06ffa5';
                        let statusText = '正常';
                        if (s.currentBikes < 5) { statusColor = '#ff006e'; statusText = '缺车'; }
                        else if (s.currentBikes > 30) { statusColor = '#ff006e'; statusText = '积压'; }
                        else if (s.currentBikes < 10) { statusColor = '#ffbe0b'; statusText = '偏少'; }
                        else if (s.currentBikes > 25) { statusColor = '#ffbe0b'; statusText = '较多'; }
                        
                        return `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${s.name}</td>
                                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">${s.currentBikes}</td>
                                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #00d4ff; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #00d4ff; padding-left: 10px;">🚚 调度建议</h3>
            ${shortageStations.length > 0 ? `
                <div style="background: #fff0f0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff006e; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #ff006e; margin-bottom: 10px;">⚠️ 缺车站点：</div>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${shortageStations.map(s => `<li style="color: #333; margin-bottom: 5px;">${s.name}：仅剩 ${s.currentBikes} 辆</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${surplusStations.length > 0 ? `
                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #ffbe0b;">
                    <div style="font-weight: bold; color: #ffbe0b; margin-bottom: 10px;">📦 积压站点：</div>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${surplusStations.map(s => `<li style="color: #333; margin-bottom: 5px;">${s.name}：已有 ${s.currentBikes} 辆</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${shortageStations.length === 0 && surplusStations.length === 0 ? `
                <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #06ffa5;">
                    <div style="color: #06ffa5; font-weight: bold;">✅ 系统运行良好，车辆分布均衡</div>
                </div>
            ` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #00d4ff; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #00d4ff; padding-left: 10px;">📈 运营建议</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                ${currentHour >= 7 && currentHour < 9 ? `
                    <div style="margin-bottom: 10px;">🌅 <strong>早高峰时段：</strong>建议加强北区宿舍和教学楼周边车辆供应</div>
                ` : ''}
                ${currentHour >= 12 && currentHour < 14 ? `
                    <div style="margin-bottom: 10px;">🍽️ <strong>午餐时段：</strong>重点保障食堂周边车辆供应</div>
                ` : ''}
                ${currentHour >= 17 && currentHour < 19 ? `
                    <div style="margin-bottom: 10px;">🌆 <strong>晚高峰时段：</strong>注意教学楼到食堂的路线车辆补给</div>
                ` : ''}
                ${currentHour >= 18 && currentHour < 22 ? `
                    <div style="margin-bottom: 10px;">🚪 <strong>外出活动时段：</strong>青蓝门需要特别关注，学生外出娱乐需求大</div>
                ` : ''}
                <div>💡 <strong>整体建议：</strong>基于MMoE-AM-BiLSTM预测模型，当前系统利用率 ${(totalBikes / (TOTAL_STATIONS * 20) * 100).toFixed(1)}%</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>JXNU 智行系统 | 基于MMoE-AM-BiLSTM时空预测与ALNS-SA智能调度算法</p>
            <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
    `;
}

// ========== 第17部分：PDF报告生成（--- 替换为 fix 脚本中的中文增强版 ---） ==========
async function generateAISuggestionsPDF() {
    // 检查库
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert('❌ 缺少 PDF 生成库 (html2canvas 或 jspdf)，请检查 index.html 引入。');
        return;
    }

    // 确保内容已生成
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab || activeTab.id !== 'suggestions') {
        // 如果当前不在建议页，先切换过去生成内容，再截图
        // 这里简单处理：提示用户切换
        alert('请先切换到“AI 运营建议”选项卡，等待内容加载后再点击导出。');
        return;
    }

    const suggestionsContent = document.getElementById('ai-suggestions-content');
    if (!suggestionsContent || suggestionsContent.innerHTML.trim() === '') {
        alert('❌ AI 建议内容为空，请稍候。');
        return;
    }

    try {
        addLog("正在生成PDF报告...", 'system');

        // 创建临时容器用于PDF生成 (解决样式和背景问题)
        const pdfContainer = document.createElement('div');
        pdfContainer.style.cssText = 'width: 800px; padding: 40px; background: white; font-family: "Microsoft YaHei", Arial; position:fixed; top:-9999px; z-index:9999;';

        pdfContainer.innerHTML = `
            <h1 style="text-align: center; color: #667eea; margin-bottom: 10px;">JXNU 智行系统</h1>
            <h2 style="text-align: center; color: #764ba2; margin-bottom: 30px;">AI智能运营建议报告</h2>
            <p style="text-align: center; color: #666; margin-bottom: 40px;">生成日期：${currentDate} | 时间：${currentHour}:${currentMinute}</p>
            <hr style="margin-bottom: 30px; border: 0; border-top: 1px solid #eee;">
            ${suggestionsContent.innerHTML}
        `;

        // 显示页脚
        const footer = pdfContainer.querySelector('.pdf-footer');
        if(footer) footer.style.display = 'block';

        document.body.appendChild(pdfContainer);

        // 生成
        const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        document.body.removeChild(pdfContainer);

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`JXNU智行-AI建议-${currentDate}.pdf`);
        addLog('PDF报告导出完成', 'success');
    } catch (error) {
        console.error('PDF生成失败：', error);
        alert('❌ PDF生成失败，请查看控制台。');
    }
}

// ========== 第18部分：辅助函数 ==========
function calculateDailySummary() {
    const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
    const totalInitBikes = stations.reduce((sum, s) => sum + s.initialBikes, 0);
    return {
        totalTrips: currentOrders.length,
        completedTrips: currentOrders.filter(o => o.completed).length,
        avgUtilization: (totalBikes / (totalInitBikes * 2) * 100).toFixed(1), // 百分比
        dispatchCount: dispatchHistory.length
    };
}

// 确保实时更新 (Fix 功能)
function ensureRealTimeUpdate() {
    // 已经整合进 startSimulation -> updateSimulation 循环中
    // 这里保留一个空函数或独立的心跳检测，防止重复
}

// ========== 第19部分：初始化 (合并逻辑) ==========
// 使用 DOMContentLoaded 确保页面加载完毕
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 JXNU 智行系统启动 (Ultimate Merged Version)');

    // 设置日期和时间显示
    const dateInput = document.getElementById('dateInput');
    if (dateInput) dateInput.value = currentDate;

    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) dateDisplay.textContent = currentDate;

    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) timeDisplay.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    initStations();
    currentOrders = generateOrdersForDate(currentDate);
    initMap();
    updateStatistics();

    // 自动刷新热力图 (延迟一秒确保地图容器就绪)
    setTimeout(() => {
        if (document.getElementById('heatmap') && document.getElementById('heatmap').classList.contains('active')) {
            renderHeatmapTab();
        }
    }, 1000);

    addLog('系统初始化完成，准备就绪', 'success');

});

// ============================================================================
// ========== 综合补丁 v4（末尾追加，原有代码零改动）==========
// 1. 热力图：深色主题 + 排名面板扩大 + 字体清晰 + 顶部汇总条
// 2. 时序趋势：新增各站点实时库存图 + 已完成订单累计图
// 3. AI建议：新增热门路线图 + 紧急调度建议列表
// 4. 性能仪表盘雷达：改为11站全量健康度柱状图（更直观）
// 5. 小卡片/健康评分实时更新（修复 let 变量访问问题）
// 6. 重置后立即清零 + dispatchHistory清空
// ============================================================================

(function () {

    /* ── 工具 ── */
    function safeInit(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        try { const ex = echarts.getInstanceByDom(el); if (ex) ex.dispose(); } catch (e) {}
        return echarts.init(el);
    }

    /* ====================================================
       1. 覆盖 renderHeatmapTab —— 深色主题 + 大排名面板
    ==================================================== */
    window.renderHeatmapTab = function () {
        const content = document.getElementById('heatmap');
        if (!content) return;
        content.innerHTML = `
            <div style="display:flex;gap:0;height:100%;">
                <!-- 地图区 flex:3 -->
                <div style="flex:3;position:relative;overflow:hidden;">
                    <div id="heatmap-map" style="width:100%;height:100%;"></div>
                    <!-- 图例 -->
                    <div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);
                                background:rgba(5,12,30,0.82);border:1px solid rgba(0,212,255,0.22);
                                border-radius:20px;padding:6px 20px;display:flex;gap:16px;align-items:center;
                                font-size:12px;color:#cce;backdrop-filter:blur(6px);z-index:800;">
                        <span>颜色：</span>
                        <span><span style="color:#00d4ff;">●</span> 低频</span>
                        <span><span style="color:#06ffa5;">●</span> 正常</span>
                        <span><span style="color:#ffbe0b;">●</span> 繁忙</span>
                        <span><span style="color:#ff006e;">●</span> 拥堵</span>
                    </div>
                </div>
                <!-- 右侧排名面板 flex:1.2 -->
                <div style="flex:0 0 310px;background:var(--panel-bg);border-left:1px solid rgba(0,212,255,0.1);
                             display:flex;flex-direction:column;overflow:hidden;">
                    <!-- 顶部汇总条 -->
                    <div id="hm-summary-bar" style="padding:12px 14px;border-bottom:1px solid rgba(0,212,255,0.1);
                                flex-shrink:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
                    <!-- 排名标题 -->
                    <div style="padding:10px 14px 6px;flex-shrink:0;font-size:12px;font-weight:700;
                                color:var(--primary);letter-spacing:1px;text-transform:uppercase;
                                border-bottom:1px solid rgba(0,212,255,0.07);">
                        📊 站点热度排名
                        <span style="font-size:10px;color:rgba(140,170,220,0.5);font-weight:400;margin-left:8px;">实时累计进出次数</span>
                    </div>
                    <!-- 排名列表 -->
                    <div id="heatmap-ranking" style="flex:1;overflow-y:auto;padding:10px 12px;"></div>
                </div>
            </div>`;

        if (heatmapMapInstance) heatmapMapInstance.remove();
        heatmapMapInstance = L.map('heatmap-map').setView(wgs2gcj(116.0350, 28.6841), 15);
        L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            { attribution: '© 高德地图' }).addTo(heatmapMapInstance);
        updateHeatmapView();
        _updateHmSummary();
    };

    /* 顶部汇总条 */
    function _updateHmSummary() {
        const bar = document.getElementById('hm-summary-bar');
        if (!bar) return;
        const comp = (currentOrders || []).filter(o => o.completed).length;
        const active = (currentOrders || []).filter(o => o.active).length;
        const shortage = stations.filter(s => s.currentBikes < 5).length;
        const surplus  = stations.filter(s => s.currentBikes > 30).length;
        const items = [
            { label: '今日完成', value: comp, color: '#00d4ff' },
            { label: '在途骑行', value: active, color: '#06ffa5' },
            { label: '缺车站点', value: shortage, color: '#ffbe0b' },
            { label: '积压站点', value: surplus, color: '#ff4d6d' },
        ];
        bar.innerHTML = items.map(it => `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
                        border-radius:8px;padding:8px 10px;text-align:center;">
                <div style="font-size:11px;color:rgba(160,195,255,0.5);margin-bottom:3px;">${it.label}</div>
                <div style="font-family:'Orbitron',monospace;font-size:20px;font-weight:700;color:${it.color};">${it.value}</div>
            </div>`).join('');
    }

    /* 覆盖 updateHeatmapRanking —— 深色主题 + 清晰大字 */
    window.updateHeatmapRanking = function () {
        const container = document.getElementById('heatmap-ranking');
        if (!container) return;
        _updateHmSummary();

        const heat = stations.map(s => {
            const incoming = (currentOrders || []).filter(o => o.destination === s.id && o.completed).length;
            const outgoing = (currentOrders || []).filter(o => o.origin === s.id && o.completed).length;
            return { name: s.name, incoming, outgoing, total: incoming + outgoing };
        }).sort((a, b) => b.total - a.total);

        const maxVal = heat[0]?.total || 1;
        const medals = ['🥇', '🥈', '🥉'];
        container.innerHTML = heat.map((s, i) => {
            const pct = (s.total / maxVal * 100).toFixed(0);
            const barColor = i === 0 ? '#ffbe0b' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#00d4ff';
            return `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,${i<3?'0.12':'0.05'});
                        border-radius:10px;padding:10px 12px;margin-bottom:7px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="font-size:${i<3?'18':'14'}px;min-width:22px;">${medals[i] || `#${i+1}`}</span>
                    <span style="font-size:14px;font-weight:700;color:#dde8ff;flex:1;">${s.name}</span>
                    <span style="font-family:'Orbitron',monospace;font-size:16px;font-weight:700;color:${barColor};">${s.total}</span>
                </div>
                <div style="display:flex;gap:12px;font-size:12px;margin-bottom:6px;">
                    <span style="color:#06ffa5;">↓ 进站 ${s.incoming}</span>
                    <span style="color:#ff006e;">↑ 出站 ${s.outgoing}</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${barColor},rgba(0,0,0,0));
                                border-radius:3px;transition:width 0.5s;"></div>
                </div>
            </div>`;
        }).join('');
    };

    /* ====================================================
       2. 时序趋势：使用 HTML 中预定义的 4 格布局
          元素 tlStationBars / tlOrderProgress / tlRouteChart 已存在，无需注入
    ==================================================== */
    const _origTimeline = window.renderTimelineTab;
    window.renderTimelineTab = function () {
        _origTimeline && _origTimeline();
        // 原函数已调用 _renderTlStationBars / _renderTlRouteChart / _renderTlOrderProgress
        // 无需额外操作
    };

    function _injectTimelineExtra() {
        // 已废弃：元素直接写在 HTML 中，无需动态注入
        _renderTlStationBars && _renderTlStationBars();
        _renderTlOrderProgress && _renderTlOrderProgress();
        _renderTlRouteChart && _renderTlRouteChart();
    }

    function _renderTlStationBars() {
        const chart = safeInit('tlStationBars');
        if (!chart) return;
        const data = stations.map(s => {
            let c = '#06ffa5';
            if (s.currentBikes === 0)                       c = '#ff4d6d';
            else if (s.currentBikes < THRESHOLD_SHORTAGE)   c = '#ff4d6d';
            else if (s.currentBikes > THRESHOLD_SURPLUS)    c = '#ffbe0b';
            return { name: s.name, value: s.currentBikes, color: c };
        });
        chart.setOption({
            backgroundColor: 'transparent',
            animation: true, animationDuration: 600, animationEasing: 'cubicOut',
            tooltip: { trigger: 'axis', formatter: p => `${p[0].name}：<b>${p[0].value}</b> 辆` },
            grid: { left: 8, right: 8, top: 10, bottom: 45, containLabel: true },
            xAxis: {
                type: 'category',
                data: data.map(d => d.name),
                axisLabel: { color: '#99b', fontSize: 10, rotate: 35,
                    formatter: v => v.length > 4 ? v.slice(0,3)+'…' : v },
                axisLine: { lineStyle: { color: '#333' } }
            },
            yAxis: { type: 'value', axisLabel: { color: '#666', fontSize: 10 },
                splitLine: { lineStyle: { color: '#1e2a3a' } } },
            series: [{
                type: 'bar', barMaxWidth: 28,
                data: data.map(d => ({ value: d.value,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0,0,0,1,[
                            {offset:0, color:d.color},
                            {offset:1, color:d.color+'66'}
                        ]),
                        borderRadius: [4,4,0,0],
                        shadowColor: d.color, shadowBlur: 8
                    } })),
                label: { show: true, position: 'top', color: '#bcd', fontSize: 10 },
                emphasis: { itemStyle: { shadowBlur: 20 } }
            }]
        });
    }

    function _renderTlOrderProgress() {
        const chart = safeInit('tlOrderProgress');
        if (!chart) return;
        const total = (currentOrders || []).length;
        const comp  = (currentOrders || []).filter(o => o.completed).length;
        const active = (currentOrders || []).filter(o => o.active).length;
        const pend  = total - comp - active;
        chart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item' },
            legend: { bottom: 6, textStyle: { color: '#aac', fontSize: 10 },
                itemWidth: 10, itemHeight: 8 },
            series: [{
                type: 'pie', radius: ['45%', '68%'], center: ['50%', '44%'],
                avoidLabelOverlap: true,
                label: { show: true, formatter: '{d}%', color: '#dde8ff', fontSize: 11 },
                labelLine: { length: 8, length2: 6 },
                data: [
                    { value: comp,   name: '已完成', itemStyle: { color: '#06ffa5' } },
                    { value: active, name: '进行中', itemStyle: { color: '#ffbe0b' } },
                    { value: pend,   name: '待出发', itemStyle: { color: 'rgba(0,212,255,0.3)' } }
                ]
            }]
        });
    }

    function _renderTlRouteChart() {
        const chart = safeInit('tlRouteChart');
        if (!chart) return;
        const routeMap = {};
        (currentOrders || []).filter(o => o.completed).forEach(o => {
            const fn = stations.find(s => s.id === o.origin)?.name || '?';
            const tn = stations.find(s => s.id === o.destination)?.name || '?';
            const key = `${fn}→${tn}`;
            routeMap[key] = (routeMap[key] || 0) + 1;
        });
        const top8 = Object.entries(routeMap)
            .sort((a, b) => b[1] - a[1]).slice(0, 8)
            .map(([k, v]) => ({ name: k, value: v }));

        if (top8.length === 0) {
            chart.setOption({ backgroundColor:'transparent',
                graphic: [{ type:'text', left:'center', top:'middle',
                    style: { text:'仿真启动后将显示热门路线', fill:'rgba(160,190,255,0.3)', fontSize:13 } }] });
            return;
        }
        chart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', formatter: p => `${p[0].name}：<b>${p[0].value}</b> 次` },
            grid: { left: 8, right: 50, top: 6, bottom: 6, containLabel: true },
            xAxis: { type: 'value', axisLabel: { color: '#666', fontSize: 10 },
                splitLine: { lineStyle: { color: '#1e2a3a' } } },
            yAxis: { type: 'category', data: top8.map(d => d.name).reverse(),
                axisLabel: { color: '#aac', fontSize: 10 }, axisTick: { show: false } },
            series: [{
                type: 'bar', barMaxWidth: 16,
                data: top8.map((d,i) => ({
                    value: d.value,
                    itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[
                        { offset:0, color: i===0?'#ffbe0b':i===1?'#06ffa5':'#00d4ff' },
                        { offset:1, color: 'rgba(0,212,255,0.1)' }
                    ]), borderRadius:[0,4,4,0] }
                })).reverse(),
                label: { show:true, position:'right', color:'#bcd', fontSize:10, formatter:'{c}次' }
            }]
        });
    }

    /* ====================================================
       3. AI建议：新增热门路线图 + 紧急调度优先级列表
    ==================================================== */
    // 暴露为全局，供 renderTimelineTab 调用
    window._renderTlStationBars  = _renderTlStationBars;
    window._renderTlOrderProgress = _renderTlOrderProgress;
    window._renderTlRouteChart   = _renderTlRouteChart;
    const _origAI = window.generateAISuggestions;
    window.generateAISuggestions = function () {
        _origAI && _origAI();
        setTimeout(() => {
            _injectAIExtra();
        }, 150);
    };

    function _injectAIExtra() {
        const content = document.getElementById('ai-suggestions-content');
        if (!content) return;
        if (document.getElementById('ai-extra-injected')) {
            _renderAIDispatchPriority();
            _renderAIRouteChart();
            return;
        }
        const frag = document.createElement('div');
        frag.id = 'ai-extra-injected';
        frag.innerHTML = `
            <div class="cbox">
                <div class="cbox-ttl">🚨 紧急调度优先级</div>
                <div id="aiDispatchPriority" style="max-height:320px;overflow-y:auto;"></div>
            </div>`;
        content.appendChild(frag);
        _renderAIDispatchPriority();
    }

    function _renderAIDispatchPriority() {
        const el = document.getElementById('aiDispatchPriority');
        if (!el) return;
        const urgent = stations.map(s => {
            let urgency = 0, type = '', color = '#888';
            if (s.currentBikes === 0)     { urgency = 5; type = '🚨 已清空，立即补车'; color = '#ff006e'; }
            else if (s.currentBikes < 3)  { urgency = 4; type = '🔴 严重缺车'; color = '#ff4d6d'; }
            else if (s.currentBikes < 8)  { urgency = 3; type = '⚠️ 偏少，建议补充'; color = '#ffbe0b'; }
            else if (s.currentBikes > 40) { urgency = 4; type = '📦 严重积压，需转移'; color = '#ff4d6d'; }
            else if (s.currentBikes > 25) { urgency = 2; type = '📊 轻度积压'; color = '#ffbe0b'; }
            else                          { urgency = 0; type = '✅ 状态正常'; color = '#06ffa5'; }
            return { ...s, urgency, type, color };
        }).sort((a, b) => b.urgency - a.urgency);

        el.innerHTML = urgent.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;
                        background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;
                        border-left:3px solid ${s.color};">
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:700;color:#dde8ff;">${s.name}</div>
                    <div style="font-size:11px;color:${s.color};margin-top:2px;">${s.type}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:${s.color};">${s.currentBikes}</div>
                    <div style="font-size:10px;color:#666;">辆</div>
                </div>
            </div>`).join('');
    }

    function _renderAIRouteChart() {
        const chart = safeInit('aiRouteChart');
        if (!chart) return;
        const routeMap = {};
        (currentOrders || []).filter(o => o.completed).forEach(o => {
            const fn = stations.find(s => s.id === o.origin)?.name || '?';
            const tn = stations.find(s => s.id === o.destination)?.name || '?';
            const key = `${fn}→${tn}`;
            routeMap[key] = (routeMap[key] || 0) + 1;
        });
        const top6 = Object.entries(routeMap)
            .sort((a, b) => b[1] - a[1]).slice(0, 6)
            .map(([k, v]) => ({ name: k, value: v }));

        if (top6.length === 0) {
            chart.setOption({ backgroundColor:'transparent',
                graphic:[{type:'text',left:'center',top:'middle',
                    style:{text:'仿真启动后将显示路线数据',fill:'rgba(160,190,255,0.3)',fontSize:12}}]});
            return;
        }
        chart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { left:8, right:50, top:6, bottom:6, containLabel:true },
            xAxis: { type:'value', axisLabel:{color:'#666',fontSize:10},
                splitLine:{lineStyle:{color:'#1e2a3a'}} },
            yAxis: { type:'category', data:top6.map(d=>d.name).reverse(),
                axisLabel:{color:'#aac',fontSize:9,formatter:v=>v.length>10?v.slice(0,9)+'…':v},
                axisTick:{show:false} },
            series:[{ type:'bar', barMaxWidth:14,
                data: top6.map((d,i)=>({value:d.value,
                    itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[
                        {offset:0,color:['#ff006e','#ffbe0b','#00d4ff','#06ffa5','#7b2cbf','#00b4d8'][i]},
                        {offset:1,color:'rgba(0,0,0,0)'}
                    ]),borderRadius:[0,4,4,0]}})).reverse(),
                label:{show:true,position:'right',color:'#bcd',fontSize:10,formatter:'{c}次'}
            }]
        });
    }

    function _renderAISupplyDemand() {
        const chart = safeInit('aiSupplyDemandChart');
        if (!chart) return;
        chart.setOption({
            backgroundColor:'transparent',
            tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},
            legend:{top:4,right:8,textStyle:{color:'#aac',fontSize:10},itemWidth:10,itemHeight:8},
            grid:{left:8,right:8,top:30,bottom:40,containLabel:true},
            xAxis:{type:'category',data:stations.map(s=>s.name),
                axisLabel:{color:'#99b',fontSize:9,rotate:30,
                    formatter:v=>v.length>4?v.slice(0,3)+'…':v},
                axisLine:{lineStyle:{color:'#333'}}},
            yAxis:{type:'value',axisLabel:{color:'#666',fontSize:9},
                splitLine:{lineStyle:{color:'#1e2a3a'}}},
            series:[
                {name:'当前库存',type:'bar',barMaxWidth:16,
                    data:stations.map(s=>({value:s.currentBikes,
                        itemStyle:{color:s.currentBikes<5?'#ff4d6d':s.currentBikes<8?'#ffbe0b':'#06ffa5',
                            borderRadius:[3,3,0,0]}}))},
                {name:'初始配置',type:'bar',barMaxWidth:16,
                    data:stations.map(s=>({value:s.initialBikes,
                        itemStyle:{color:'rgba(150,165,200,0.2)',borderRadius:[3,3,0,0]}}))}
            ]
        });
    }

    /* ====================================================
       4. 性能仪表盘雷达：改为全站11个健康度柱状图
    ==================================================== */
    window.renderStationRadarChart = function () {
        const chart = safeInit('stationRadarChart');
        if (!chart) return;

        const TL = typeof THRESHOLD_LOW!=='undefined'?THRESHOLD_LOW:8;
        const TH = typeof THRESHOLD_HIGH!=='undefined'?THRESHOLD_HIGH:25;
        const TS = typeof THRESHOLD_SHORTAGE!=='undefined'?THRESHOLD_SHORTAGE:5;
        const TSU= typeof THRESHOLD_SURPLUS!=='undefined'?THRESHOLD_SURPLUS:35;

        const data = stations.map(s => {
            let score, color;
            const b = s.currentBikes;
            if      (b === 0)   { score = 5;  color = '#ff006e'; }
            else if (b < TS)    { score = 22; color = '#ff4d6d'; }
            else if (b < TL)    { score = 55; color = '#ffbe0b'; }
            else if (b > TSU)   { score = 28; color = '#ff4d6d'; }
            else if (b > TH)    { score = 68; color = '#ffbe0b'; }
            else                { score = Math.min(100, 80 + (b - TL)); color = '#06ffa5'; }
            return { name: s.name, score, color };
        });

        chart.setOption({
            backgroundColor: 'transparent',
            animation: true, animationDuration: 700, animationEasing: 'cubicOut',
            tooltip: { trigger:'axis', formatter: p => `${p[0].name}<br/>健康度：<b>${p[0].value}</b>` },
            grid: { left:8, right:8, top:6, bottom:44, containLabel:true },
            xAxis: {
                type:'category',
                data: data.map(d => d.name),
                axisLabel: { color:'#99b', fontSize:9, rotate:30,
                    formatter: v => v.length>4 ? v.slice(0,3)+'…' : v },
                axisLine: { lineStyle:{ color:'#333' } }
            },
            yAxis: {
                type:'value', min:0, max:100,
                axisLabel: { color:'#666', fontSize:9,
                    formatter: v => v===100?'满':v===0?'':v },
                splitLine: { lineStyle:{ color:'#1e2a3a' } }
            },
            series: [{
                type:'bar', barMaxWidth:24,
                data: data.map(d => ({
                    value: d.score,
                    itemStyle: { color: new echarts.graphic.LinearGradient(0,1,0,0,[
                        { offset:0, color: d.color+'44' },
                        { offset:1, color: d.color }
                    ]), borderRadius:[4,4,0,0] }
                })),
                label: { show:true, position:'top', color:'#bcd', fontSize:9,
                    formatter: p => p.value >= 80 ? '✓' : p.value >= 55 ? '~' : '!' }
            }]
        }, false);
    };

    /* ====================================================
       5. 小卡片实时更新 / 健康评分
    ==================================================== */
    window.updateExtraMetrics = function () {
        if (!stations || !stations.length) return;
        // 数据已由 updateStatistics() 更新，此处仅作兜底同步
        const comp = (currentOrders||[]).filter(o=>o.completed);
        const e1=document.getElementById('totalTrips');     if(e1)e1.textContent=comp.length;
        const e2=document.getElementById('dispatchCount');  if(e2)e2.textContent=(dispatchHistory||[]).length;
        const durs=comp.filter(o=>o.duration).map(o=>o.duration);
        const e3=document.getElementById('avgDuration');
        if(e3)e3.textContent=durs.length?(durs.reduce((a,b)=>a+b,0)/durs.length).toFixed(1):'0';
        const total=stations.reduce((s,st)=>s+st.currentBikes,0);
        const init =stations.reduce((s,st)=>s+st.initialBikes,0);
        const e4=document.getElementById('utilizationRate');
        if(e4)e4.textContent=((total/Math.max(init,1))*100).toFixed(0)+'%';
        // 使用统一阈值计算健康分
        const normalCnt=stations.filter(s=>s.currentBikes>=(typeof THRESHOLD_LOW!=='undefined'?THRESHOLD_LOW:8)&&
            s.currentBikes<=(typeof THRESHOLD_HIGH!=='undefined'?THRESHOLD_HIGH:25)).length;
        const sc=Math.round((normalCnt/stations.length)*100);
        const e5=document.getElementById('healthScore');
        if(e5){e5.textContent=sc;e5.style.color=sc>=80?'var(--success)':sc>=60?'var(--warning)':'var(--danger)';}
    };

    /* ====================================================
       6. 包装 updateStatistics 和 resetSimulation
    ==================================================== */
    const _origStats=window.updateStatistics;
    window.updateStatistics=function(){
        _origStats&&_origStats();
        window.updateExtraMetrics();
        window.updateStationQuickList&&window.updateStationQuickList();
        const cTab=document.getElementById('comparison');
        if(cTab&&cTab.classList.contains('active')){
            _updateCompChart4Live && _updateCompChart4Live();
            renderStationDetailTable && renderStationDetailTable();
        }
        const dTab=document.getElementById('dashboard');
        if(dTab&&dTab.classList.contains('active')){
            renderStationStockChart && renderStationStockChart();
        }
        const hTab=document.getElementById('heatmap');
        if(hTab&&hTab.classList.contains('active'))window.updateHeatmapRanking();
        const tTab=document.getElementById('timeline');
        if(tTab&&tTab.classList.contains('active')){
            _renderTlOrderProgress&&_renderTlOrderProgress();
        }
        const sTab=document.getElementById('suggestions');
        if(sTab&&sTab.classList.contains('active')){
            _renderAIDispatchPriority&&_renderAIDispatchPriority();
        }
    };

    const _origReset=window.resetSimulation;
    window.resetSimulation=function(){
        dispatchHistory.length=0;
        _origReset&&_origReset();
        ['totalTrips','dispatchCount'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent='0';});
        const e3=document.getElementById('avgDuration');if(e3)e3.textContent='0';
        const e4=document.getElementById('utilizationRate');if(e4)e4.textContent='100%';
        window.updateExtraMetrics();
    };

    /* 库存分布图（stationStockChart）—— 供 renderDashboardTab 用 */
    window.renderStationStockChart = function () {
        const chart = safeInit('stationStockChart');
        if (!chart) return;
        const TL = typeof THRESHOLD_LOW!=='undefined'?THRESHOLD_LOW:8;
        const TH = typeof THRESHOLD_HIGH!=='undefined'?THRESHOLD_HIGH:25;
        const TS = typeof THRESHOLD_SHORTAGE!=='undefined'?THRESHOLD_SHORTAGE:5;
        const TSU= typeof THRESHOLD_SURPLUS!=='undefined'?THRESHOLD_SURPLUS:35;
        const sorted = [...stations].sort((a,b)=>a.currentBikes-b.currentBikes);
        function gc(s){
            const b=s.currentBikes;
            if(b===0)return'#ff006e';
            if(b<TS)return'#ff4d6d';
            if(b<TL)return'#ffbe0b';
            if(b>TSU)return'#ff4d6d';
            if(b>TH)return'#ffbe0b';
            return'#06ffa5';
        }
        chart.setOption({
            backgroundColor:'transparent',
            animation: true, animationDuration: 700, animationEasing: 'cubicOut',
            tooltip:{trigger:'axis',axisPointer:{type:'shadow'},
                formatter:p=>`${p[0].name}<br/>当前：<b>${p[0].value}</b>辆 / 初始：<b>${p[1]?.value}</b>辆`},
            legend:{top:4,right:6,textStyle:{color:'#aac',fontSize:10},itemWidth:10,itemHeight:8},
            grid:{left:8,right:50,top:26,bottom:6,containLabel:true},
            xAxis:{type:'value',axisLabel:{color:'#666',fontSize:10},splitLine:{lineStyle:{color:'#1e2a3a'}}},
            yAxis:{type:'category',data:sorted.map(s=>s.name),
                axisLabel:{color:'#cce',fontSize:10,formatter:v=>v.length>6?v.slice(0,5)+'…':v},
                axisTick:{show:false}},
            series:[
                {name:'当前库存',type:'bar',barGap:'10%',barMaxWidth:14,
                    data:sorted.map(s=>({value:s.currentBikes,
                        itemStyle:{
                            color: new echarts.graphic.LinearGradient(1,0,0,0,[
                                {offset:0, color:gc(s)},
                                {offset:1, color:gc(s)+'44'}
                            ]),
                            borderRadius:[0,3,3,0],
                            shadowColor: gc(s), shadowBlur: 8
                        }})),
                    label:{show:true,position:'right',color:'#bcd',fontSize:9,formatter:'{c}辆'}},
                {name:'初始配置',type:'bar',barMaxWidth:14,
                    data:sorted.map(s=>({value:s.initialBikes,
                        itemStyle:{color:'rgba(150,160,200,0.15)',borderRadius:[0,3,3,0]}}))}
            ]
        }, false);
    };

    /* comparisonChart4 供 renderComparisonTab 用 */
    function renderComparisonChart4(){
        const chart=safeInit('comparisonChart4');
        if(!chart)return;
        const activity=stations.map(s=>{
            const cnt=(currentOrders||[]).filter(o=>o.completed&&(o.origin===s.id||o.destination===s.id)).length;
            return{name:s.name,value:cnt};
        }).sort((a,b)=>b.value-a.value);
        chart.setOption({
            backgroundColor:'transparent',
            tooltip:{trigger:'axis',formatter:p=>`${p[0].name}<br/>累计进出：<b>${p[0].value}</b>次`},
            grid:{left:10,right:45,top:8,bottom:8,containLabel:true},
            xAxis:{type:'value',axisLabel:{color:'#777',fontSize:10},splitLine:{lineStyle:{color:'#222'}}},
            yAxis:{type:'category',data:activity.map(d=>d.name),
                axisLabel:{color:'#cce',fontSize:10,formatter:v=>v.length>6?v.slice(0,5)+'…':v},
                axisTick:{show:false}},
            series:[{type:'bar',barMaxWidth:20,
                data:activity.map((d,i)=>({value:d.value,
                    itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[
                        {offset:0,color:i===0?'#ffbe0b':i===1?'#06ffa5':i===2?'#ff006e':'#00d4ff'},
                        {offset:1,color:'rgba(0,212,255,0.1)'}])}})),
                label:{show:true,position:'right',color:'#bcd',fontSize:10,formatter:'{c}次'}}]
        });
    }

    function renderStationDetailTable(){
        const el=document.getElementById('stationDetailTable');if(!el)return;
        const rows=stations.map(s=>{
            let st,c;
            if(s.currentBikes===0){st='🚨 已清空';c='#ff006e';}
            else if(s.currentBikes<5){st='🔴 缺车';c='#ff4d6d';}
            else if(s.currentBikes<8){st='⚠️ 偏少';c='#ffbe0b';}
            else if(s.currentBikes>35){st='📦 积压';c='#ff4d6d';}
            else if(s.currentBikes>22){st='偏多';c='#ffbe0b';}
            else{st='✅ 正常';c='#06ffa5';}
            const diff=s.currentBikes-s.initialBikes,sign=diff>0?'+':'',dc=diff>0?'#06ffa5':diff<0?'#ff006e':'#888';
            return`<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:5px 8px;color:#b0c8ff;font-size:11px;">${s.name}</td>
                <td style="padding:5px 8px;text-align:center;font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:#00d4ff;">${s.currentBikes}</td>
                <td style="padding:5px 8px;text-align:center;font-size:11px;color:#555;">${s.initialBikes}</td>
                <td style="padding:5px 8px;text-align:center;font-size:11px;color:${dc};">${sign}${diff}</td>
                <td style="padding:5px 8px;text-align:center;font-size:10px;color:${c};">${st}</td>
            </tr>`;
        }).join('');
        el.innerHTML=`<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="border-bottom:1px solid rgba(0,212,255,0.15);">
                <th style="padding:5px 8px;text-align:left;font-size:10px;color:rgba(0,212,255,0.5);">站点</th>
                <th style="padding:5px 8px;text-align:center;font-size:10px;color:rgba(0,212,255,0.5);">当前</th>
                <th style="padding:5px 8px;text-align:center;font-size:10px;color:rgba(0,212,255,0.5);">初始</th>
                <th style="padding:5px 8px;text-align:center;font-size:10px;color:rgba(0,212,255,0.5);">变化</th>
                <th style="padding:5px 8px;text-align:center;font-size:10px;color:rgba(0,212,255,0.5);">状态</th>
            </tr></thead><tbody>${rows}</tbody></table>`;
    }

    const _origComp=window.renderComparisonTab;
    window.renderComparisonTab=function(){
        _origComp&&_origComp();
        setTimeout(()=>{renderComparisonChart4();renderStationDetailTable();},200);
    };

    const _origDash=window.renderDashboardTab;
    window.renderDashboardTab=function(){
        _origDash&&_origDash();
        // radar & stock are already called inside renderDashboardTab with proper delay
    };

    console.log('✅ 综合补丁 v4 已加载');
})();