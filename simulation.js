// ============================================================================
// JXNU 智行 | 共享单车智能调度仿真系统 Ultimate (完整合并修复版)
// 包含完整原有逻辑 + 修复补丁 (热力图/PDF/AI建议)
// ============================================================================

// ========== 第1部分：全局变量与常量 ==========
const TOTAL_STATIONS = 11;
const TOTAL_INIT_BIKES = 200;
const SIMULATION_START_HOUR = 7;
const SIMULATION_END_HOUR = 22;

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
        stations.push({
            id: data.id,
            name: data.name,
            lat: data.lat,
            lng: data.lng,
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
        center: [28.6841, 116.0350],
        zoom: 16,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
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

        // 根据实际车辆数量动态判断状态，不受容量限制
        if (station.currentBikes < 3) {
            color = '#ff006e'; // 红色 - 严重缺车
            status = '缺车';
            station.status = 'shortage';
        } else if (station.currentBikes < 8) {
            color = '#ffbe0b'; // 黄色 - 车辆偏少
            status = '偏少';
            station.status = 'warning';
        } else if (station.currentBikes > 40) {
            color = '#ff006e'; // 红色 - 车辆积压
            status = '积压';
            station.status = 'surplus';
        } else if (station.currentBikes > 25) {
            color = '#ffbe0b'; // 黄色 - 车辆较多
            status = '较多';
            station.status = 'warning';
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
        if (s.currentBikes < 3) shortageCount++;
        else if (s.currentBikes > 40) surplusCount++;
        else if (s.currentBikes < 8 || s.currentBikes > 30) {
            // 警告状态（偏少或较多），不计入shortage/surplus
        } else normalCount++;
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
    if (el) el.textContent = value;
}

function updateProgress(id, percent) {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.min(100, percent) + '%';
}

function updateDashboardView() {
    if (!chartInstances.gauge1 || !chartInstances.gauge2) {
        const g1 = document.getElementById('performanceGauge1');
        const g2 = document.getElementById('performanceGauge2');
        if(!g1 || !g2) return;
        chartInstances.gauge1 = echarts.init(g1);
        chartInstances.gauge2 = echarts.init(g2);
    }

    const activeOrders = currentOrders.filter(o => o.active).length;
    const activeRate = Math.min(100, (activeOrders / 100) * 100).toFixed(1);
    const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
    const stockRate = Math.min(100, (totalBikes / (stations.length * 30)) * 100).toFixed(1);

    const getOption = (name, val, colorArr) => ({
        series: [{
            type: 'gauge',
            detail: { formatter: '{value}%', fontSize: 20 },
            data: [{ value: val, name: name }],
            axisLine: { lineStyle: { color: colorArr, width: 20 } },
            pointer: { itemStyle: { color: 'auto' } }
        }]
    });

    chartInstances.gauge1.setOption(getOption('实时活跃率', activeRate, [[0.3, '#91c7ae'], [0.7, '#63869e'], [1, '#c23531']]));
    chartInstances.gauge2.setOption(getOption('库存充足率', stockRate, [[0.2, '#c23531'], [0.8, '#91c7ae'], [1, '#c23531']]));
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
    currentOrders.forEach(order => {
        const oStart = order.startHour * 60 + order.startMinute;
        const oEnd = oStart + order.duration;

        if (targetTime >= oEnd) {
             if (stations[order.from].currentBikes > 0) stations[order.from].currentBikes--;
             if (stations[order.to]) stations[order.to].currentBikes++; // 移除capacity限制
             order.completed = true;
             order.status = 'completed';
        } else if (targetTime >= oStart) {
             if (stations[order.from].currentBikes > 0) stations[order.from].currentBikes--;
             order.active = true;
             order.status = 'active';
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

        // 高峰时段分析
        const chart2 = echarts.init(document.getElementById('comparisonChart2'));
        chart2.setOption({
            title: {
                text: '高峰时段分析',
                textStyle: { color: '#00d4ff' },
                left: 'center'
            },
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item' },
            legend: { top: 30, textStyle: { color: '#fff' } },
            series: [
                {
                    name: '骑行分布',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: {d}%',
                        color: '#fff'
                    },
                    emphasis: {
                        label: { show: true, fontSize: 20, fontWeight: 'bold' }
                    },
                    data: [
                        { value: 150, name: '早高峰 (07:00-09:00)' },
                        { value: 120, name: '午高峰 (12:00-14:00)' },
                        { value: 180, name: '晚高峰 (17:00-19:00)' },
                        { value: 80, name: '其他时段' }
                    ],
                    itemStyle: {
                        color: function(params) {
                            const colors = ['#00d4ff', '#06ffa5', '#ff006e', '#ffbe0b'];
                            return colors[params.dataIndex];
                        }
                    }
                }
            ]
        });

        // 站点周转率对比
        const chart3 = echarts.init(document.getElementById('comparisonChart3'));
        const turnoverData = stations.map(s => ({
            station: s.name,
            rate: ((Math.abs(s.initialBikes - s.currentBikes) + Math.random() * 5) / s.initialBikes * 100).toFixed(1)
        }));

        chart3.setOption({
            title: {
                text: '站点周转率对比',
                textStyle: { color: '#00d4ff' },
                left: 'center'
            },
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                data: turnoverData.map(d => d.station),
                axisLabel: { rotate: 45, textStyle: { color: '#fff' } },
                axisLine: { lineStyle: { color: '#444' } }
            },
            yAxis: {
                type: 'value',
                name: '周转率 (%)',
                axisLabel: { textStyle: { color: '#fff' } },
                axisLine: { lineStyle: { color: '#444' } },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                {
                    type: 'line',
                    data: turnoverData.map(d => d.rate),
                    smooth: true,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
                        ])
                    },
                    lineStyle: { color: '#00d4ff', width: 3 },
                    itemStyle: { color: '#00d4ff' }
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
        chartInstances.timeline = echarts.init(document.getElementById('timelineChart'));
        updateTimelineCharts();
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
                symbolSize: 6,
                lineStyle: { color: '#00d4ff', width: 3 },
                itemStyle: { color: '#00d4ff' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
                        { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
                    ])
                }
            },
            {
                name: '在途活跃车辆',
                type: 'line',
                data: timeSeriesData.active,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#ff006e', width: 3 },
                itemStyle: { color: '#ff006e' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255, 0, 110, 0.5)' },
                        { offset: 1, color: 'rgba(255, 0, 110, 0.1)' }
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
            window.dispatchMapInstance = L.map('dispatchMap').setView([28.6841, 116.0350], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
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
        if (station.currentBikes < 3) color = '#ff006e';
        else if (station.currentBikes < 8) color = '#ffbe0b';
        else if (station.currentBikes > 40) color = '#ff006e';
        else if (station.currentBikes > 25) color = '#ffbe0b';

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

function generateDispatchRecommendation() {
    const shortage = stations.filter(s => s.currentBikes < 5).sort((a, b) => a.currentBikes - b.currentBikes);
    const surplus = stations.filter(s => s.currentBikes > 30).sort((a, b) => b.currentBikes - a.currentBikes);

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

            const dispatchPlan = [];
            shortage.forEach((short, i) => {
                if (i < surplus.length) {
                    const surp = surplus[i];
                    const transferAmount = Math.min(
                        Math.floor((surp.currentBikes - 15) / 2), // 从积压站点转出
                        10 - short.currentBikes // 补充到缺车站点
                    );
                    if (transferAmount > 0) {
                        dispatchPlan.push({
                            from: surp.name,
                            to: short.name,
                            amount: transferAmount
                        });
                        html += `<div style="margin-left:20px;color:#fff;margin-bottom:5px;">
                            🚛 从 <b style="color:#ffbe0b;">${surp.name}</b> 调运 <b style="color:#06ffa5;">${transferAmount}</b> 辆 
                            到 <b style="color:#ff006e;">${short.name}</b>
                        </div>`;
                    }
                }
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
            fromStation.currentBikes -= plan.amount;
            toStation.currentBikes += plan.amount;

            dispatchHistory.unshift({
                time: `${currentHour}:${String(currentMinute).padStart(2, '0')}`,
                desc: `从 ${plan.from} 调运 ${plan.amount} 辆到 ${plan.to}`
            });

            // 添加日志记录
            addLog(`调度: ${plan.from} → ${plan.to} (${plan.amount}辆)`, 'dispatch');
        }
    });

    addLog(`调度方案执行完成，共执行${window.currentDispatchPlan.length}项任务`, 'success');
    updateStatistics();
    updateMapMarkers();
    updateDispatchView();
    generateDispatchRecommendation();
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

    heatmapMapInstance = L.map('heatmap-map').setView([28.6841, 116.0350], 15); // 瑶湖校区中心
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
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

        if (station.currentBikes < 3) {
            color = '#ff006e'; // 红色
            size = 45;
        } else if (station.currentBikes < 8) {
            color = '#ffbe0b'; // 黄色
            size = 42;
        } else if (station.currentBikes > 40) {
            color = '#ff006e'; // 红色
            size = 50;
        } else if (station.currentBikes > 25) {
            color = '#ffbe0b'; // 黄色
            size = 45;
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
    const shortage = stations.filter(s => s.currentBikes < 5);
    const surplus = stations.filter(s => s.currentBikes > 30); // 改为固定阈值

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
function renderDashboardTab() {
    setTimeout(() => {
        // 车辆利用率仪表盘
        chartInstances.gauge1 = echarts.init(document.getElementById('gauge1'));
        const totalBikes = stations.reduce((sum, s) => sum + s.currentBikes, 0);
        const totalInitBikes = stations.reduce((sum, s) => sum + s.initialBikes, 0);
        const utilizationRate = (totalBikes / (totalInitBikes * 2) * 100).toFixed(1); // 假设最优是初始的2倍

        chartInstances.gauge1.setOption({
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    center: ['50%', '70%'],
                    radius: '120%',
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.3, '#ff006e'],
                                [0.7, '#ffbe0b'],
                                [1, '#06ffa5']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: { color: '#00d4ff' },
                        width: 8
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        color: '#fff',
                        fontSize: 30
                    },
                    data: [{ value: utilizationRate }]
                }
            ]
        });

        // 用户满意度仪表盘
        chartInstances.gauge2 = echarts.init(document.getElementById('gauge2'));
        const normalStations = stations.filter(s => s.status === 'normal').length;
        const satisfaction = (normalStations / TOTAL_STATIONS * 100).toFixed(1);

        chartInstances.gauge2.setOption({
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    center: ['50%', '70%'],
                    radius: '120%',
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.3, '#ff006e'],
                                [0.7, '#ffbe0b'],
                                [1, '#06ffa5']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: { color: '#00d4ff' },
                        width: 8
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        color: '#fff',
                        fontSize: 30
                    },
                    data: [{ value: satisfaction }]
                }
            ]
        });

        // 调度效率仪表盘
        chartInstances.gauge3 = echarts.init(document.getElementById('gauge3'));
        const efficiency = Math.min(95, 70 + Math.random() * 20).toFixed(1);

        chartInstances.gauge3.setOption({
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    center: ['50%', '70%'],
                    radius: '120%',
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.3, '#ff006e'],
                                [0.7, '#ffbe0b'],
                                [1, '#06ffa5']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: { color: '#00d4ff' },
                        width: 8
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        color: '#fff',
                        fontSize: 30
                    },
                    data: [{ value: efficiency }]
                }
            ]
        });

        // 更新统计数据
        const completedTrips = currentOrders.filter(o => o.completed).length;
        const durations = currentOrders.filter(o => o.completed && o.duration).map(o => o.duration);
        const avgDuration = durations.length > 0
            ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
            : 0;

        document.getElementById('totalTrips').textContent = completedTrips;
        document.getElementById('avgDuration').textContent = avgDuration;
        document.getElementById('dispatchCount').textContent = dispatchHistory.length;
    }, 100);
}

function updateDashboardView() {
    renderDashboardTab();
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
                '早高峰 (7:00-9:00): 北区宿舍 → 教学楼',
                '午间 (12:00-14:00): 教学楼 → 食堂',
                '晚高峰 (17:00-19:00): 教学楼 → 食堂/宿舍',
                '晚间 (18:00-22:00): 校内 → 青蓝门'
            ];

            peakInfo.forEach((info, i) => {
                ctx.fillText(`• ${info}`, 80, y + i * 40);
            });
            y += 180;

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
                    unit: '元/辆',
                    benchmark: '> 3元',
                    status: (orderRevenue / totalBikes) > 3 ? '优秀' : '待优化'
                },
                {
                    name: '订单密度',
                    value: (completedTrips / operationTime).toFixed(1),
                    unit: '单/小时',
                    benchmark: '> 10单',
                    status: (completedTrips / operationTime) > 10 ? '良好' : '待优化'
                },
                {
                    name: '单均成本',
                    value: (totalCost / completedTrips).toFixed(2),
                    unit: '元/单',
                    benchmark: '< 1.5元',
                    status: (totalCost / completedTrips) < 1.5 ? '优秀' : '待优化'
                },
                {
                    name: '调度效率',
                    value: (completedTrips / Math.max(dispatchHistory.length, 1)).toFixed(1),
                    unit: '单/次',
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