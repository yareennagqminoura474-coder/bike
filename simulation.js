// ============================================================================
// 全局变量和配置
// ============================================================================
let currentMinute = 7 * 60;
let isPlaying = false;
let speed = 5;
let map, dispatchMapObj, heatmapObj;
let markers = {};
let trendData = [];
let dispatchHistory = [];
let alerts = [];
let currentTab = 'overview';
let currentDate = '2024-02-10'; // 当前选择的日期
let historicalData = {}; // 存储历史数据

const CENTER_LAT = 28.6820;
const CENTER_LON = 116.0325;
const MAP_BOUNDS = [[28.6750, 116.0250], [28.6920, 116.0450]];
const TRIP_DURATION = 20;

// ============================================================================
// 1. 站点数据
// ============================================================================
const stations = [
    { id: 1, name: "图文信息中心", lat: 28.6845, lon: 116.0350, init_count: 120 },
    { id: 2, name: "惟义楼(公共课)", lat: 28.6835, lon: 116.0325, init_count: 50 },
    { id: 3, name: "先骕楼(计信)", lat: 28.6835, lon: 116.0380, init_count: 80 },
    { id: 4, name: "北区宿舍(1-11栋)", lat: 28.6890, lon: 116.0310, init_count: 200 },
    { id: 5, name: "一食堂/二食堂", lat: 28.6880, lon: 116.0340, init_count: 60 },
    { id: 6, name: "名达楼", lat: 28.6800, lon: 116.0330, init_count: 70 },
    { id: 7, name: "青蓝门(西门)", lat: 28.6780, lon: 116.0280, init_count: 40 },
    { id: 8, name: "瑶湖体育馆", lat: 28.6850, lon: 116.0410, init_count: 50 },
    { id: 9, name: "研究生院/东区", lat: 28.6880, lon: 116.0390, init_count: 150 },
    { id: 10, name: "实验大楼", lat: 28.6790, lon: 116.0305, init_count: 60 }
];

const TOTAL_INIT_BIKES = stations.reduce((sum, s) => sum + s.init_count, 0);

// ============================================================================
// 2. 多日数据生成器 (模拟不同日期有不同的订单模式)
// ============================================================================
function generateOrdersForDate(dateStr) {
    // 根据日期生成稍有不同的订单模式
    const dateSeed = dateStr.split('-').reduce((sum, n) => sum + parseInt(n), 0);
    const randomFactor = (dateSeed % 10) / 10; // 0-0.9的随机因子

    const orders = [];
    const timeSlots = [
        { start: 7, end: 9, rate: 3.0 + randomFactor },
        { start: 9, end: 11, rate: 0.8 + randomFactor * 0.5 },
        { start: 11, end: 13, rate: 2.2 + randomFactor },
        { start: 13, end: 17, rate: 1.0 + randomFactor * 0.3 },
        { start: 17, end: 19, rate: 2.8 + randomFactor },
        { start: 19, end: 22, rate: 0.7 + randomFactor * 0.2 }
    ];

    for (let hour = 7; hour < 22; hour++) {
        const slot = timeSlots.find(s => hour >= s.start && hour < s.end);
        const numOrders = Math.floor(25 * (slot?.rate || 1));

        for (let i = 0; i < numOrders; i++) {
            const minute = Math.floor(Math.random() * 60);
            const timeMinutes = hour * 60 + minute;
            const startStation = stations[Math.floor(Math.random() * stations.length)];
            let endStation = stations[Math.floor(Math.random() * stations.length)];
            while (endStation.id === startStation.id) {
                endStation = stations[Math.floor(Math.random() * stations.length)];
            }

            orders.push({
                time: timeMinutes,
                start_station: startStation.id,
                end_station: endStation.id
            });
        }
    }
    return orders.sort((a, b) => a.time - b.time);
}

let currentOrders = generateOrdersForDate(currentDate);

// ============================================================================
// 3. 核心计算引擎
// ============================================================================
function calculateStationStatus() {
    const outCount = {};
    currentOrders.filter(o => o.time <= currentMinute).forEach(o => {
        outCount[o.start_station] = (outCount[o.start_station] || 0) + 1;
    });

    const inCount = {};
    currentOrders.filter(o => (o.time + TRIP_DURATION) <= currentMinute).forEach(o => {
        inCount[o.end_station] = (inCount[o.end_station] || 0) + 1;
    });

    return stations.map(station => {
        const out = outCount[station.id] || 0;
        const inn = inCount[station.id] || 0;
        let count = station.init_count - out + inn;
        count = Math.max(0, count);

        let color, status;
        if (count < 10) { color = '#dc143c'; status = 'shortage'; }
        else if (count > 80) { color = '#1e90ff'; status = 'surplus'; }
        else { color = '#3cb371'; status = 'normal'; }

        return {
            ...station,
            count,
            color,
            status,
            utilization: ((station.init_count - count) / station.init_count * 100).toFixed(1)
        };
    });
}

// ============================================================================
// 4. 地图初始化
// ============================================================================
function initMap() {
    const imageUrl = 'map_bg.jpg';
    const mapOptions = {
        center: [CENTER_LAT, CENTER_LON],
        zoom: 15,
        minZoom: 14,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.1
    };

    map = L.map('map', mapOptions);
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(map);
    map.fitBounds(MAP_BOUNDS);

    stations.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lon], {
            radius: 10,
            fillColor: '#3cb371',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>初始化...`);
        markers[s.id] = marker;
    });

    dispatchMapObj = L.map('dispatchMap', mapOptions);
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(dispatchMapObj);

    heatmapObj = L.map('heatmapContainer', mapOptions);
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(heatmapObj);

    setTimeout(() => {
        dispatchMapObj.invalidateSize();
        dispatchMapObj.fitBounds(MAP_BOUNDS);
        heatmapObj.invalidateSize();
        heatmapObj.fitBounds(MAP_BOUNDS);
    }, 500);
}

function updateMapVisuals(stationStatus) {
    stationStatus.forEach(s => {
        const marker = markers[s.id];
        if (marker) {
            const size = Math.max(8, Math.min(35, s.count / 3));
            marker.setRadius(size);
            marker.setStyle({ fillColor: s.color });

            const statusText = s.status === 'shortage' ? '⚠️ 缺车' :
                              s.status === 'surplus' ? '📦 积压' : '✅ 正常';
            const content = `
                <div style="text-align:center">
                    <b>${s.name}</b><br>
                    库存: ${s.count} 辆<br>
                    利用率: ${s.utilization}%<br>
                    状态: ${statusText}
                </div>
            `;
            marker.bindPopup(content);
        }
    });
}

// ============================================================================
// 5. 统计更新与日志
// ============================================================================
function updateStats(stationStatus) {
    const currentInStation = stationStatus.reduce((sum, s) => sum + s.count, 0);
    const activeBikes = Math.max(0, TOTAL_INIT_BIKES - currentInStation);
    const shortageCount = stationStatus.filter(s => s.status === 'shortage').length;
    const surplusCount = stationStatus.filter(s => s.status === 'surplus').length;
    const normalCount = stations.length - shortageCount - surplusCount;

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = val;
            el.classList.add('number-update');
            setTimeout(() => el.classList.remove('number-update'), 500);
        }
    };

    setTxt('totalBikes', currentInStation);
    setTxt('activeBikes', activeBikes);
    setTxt('shortageStations', shortageCount);
    setTxt('surplusStations', surplusCount);
    setTxt('normalStations', normalCount);

    // 更新进度条
    updateProgressBar('bar-total', currentInStation / TOTAL_INIT_BIKES * 100);
    updateProgressBar('bar-active', activeBikes / TOTAL_INIT_BIKES * 100);
    updateProgressBar('bar-normal', normalCount / stations.length * 100);
    updateProgressBar('bar-shortage', shortageCount / stations.length * 100);
    updateProgressBar('bar-surplus', surplusCount / stations.length * 100);

    // 记录趋势
    if (currentMinute % 10 === 0 || trendData.length === 0) {
        const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
        const m = (currentMinute % 60).toString().padStart(2, '0');
        trendData.push({
            time: `${h}:${m}`,
            active: activeBikes,
            inStation: currentInStation,
            shortage: shortageCount,
            surplus: surplusCount
        });
        if (trendData.length > 100) trendData.shift();
    }

    // 更新日志
    updateLiveLogs(stationStatus);

    // 更新分析报告
    updateAnalysisReport(stationStatus);
}

function updateProgressBar(id, percentage) {
    const el = document.getElementById(id);
    if (el) {
        el.style.width = percentage + '%';
    }
}

function updateLiveLogs(stationStatus) {
    const logsContainer = document.getElementById('liveLogs');
    if (!logsContainer) return;

    const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
    const m = (currentMinute % 60).toString().padStart(2, '0');
    const time = `${h}:${m}`;

    // 添加关键事件日志
    if (currentMinute % 30 === 0) {
        const activeBikes = TOTAL_INIT_BIKES - stationStatus.reduce((sum, s) => sum + s.count, 0);
        const log = document.createElement('div');
        log.className = 'log-item';
        log.textContent = `[${time}] 系统巡检: 在途 ${activeBikes} 辆 | 缺车站 ${stationStatus.filter(s => s.status === 'shortage').length} 个`;
        logsContainer.insertBefore(log, logsContainer.firstChild);

        // 保持最多20条日志
        while (logsContainer.children.length > 20) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }
}

function updateAnalysisReport(stationStatus) {
    const hour = Math.floor(currentMinute / 60);
    const activeBikes = TOTAL_INIT_BIKES - stationStatus.reduce((sum, s) => sum + s.count, 0);
    const utilRate = (activeBikes / TOTAL_INIT_BIKES * 100).toFixed(1);

    // 时段分析
    const timeEl = document.getElementById('report-time');
    if (timeEl) {
        let period = '';
        if (hour >= 7 && hour < 9) period = '早高峰';
        else if (hour >= 11 && hour < 13) period = '午高峰';
        else if (hour >= 17 && hour < 19) period = '晚高峰';
        else period = '平峰期';

        timeEl.textContent = `当前处于${period}时段，系统运行${hour - 7}小时，累计服务${currentOrders.filter(o => o.time <= currentMinute).length}次出行。`;
    }

    // 负载评估
    const loadEl = document.getElementById('report-load');
    if (loadEl) {
        let loadLevel = '';
        if (utilRate < 30) loadLevel = '负载较低，建议适当减少车辆铺设';
        else if (utilRate < 60) loadLevel = '负载正常，系统运行平稳';
        else loadLevel = '负载较高，需注意车辆调度';

        loadEl.textContent = `整体利用率${utilRate}%，${loadLevel}。`;
    }

    // 风险预警
    const riskEl = document.getElementById('report-risk');
    if (riskEl) {
        const criticalStations = stationStatus.filter(s => s.count < 5);
        if (criticalStations.length > 0) {
            riskEl.textContent = `🔴 ${criticalStations.map(s => s.name).join('、')} 库存告急！建议立即调度。`;
            riskEl.style.color = '#dc3545';
        } else {
            riskEl.textContent = '✅ 暂无严重风险';
            riskEl.style.color = '#28a745';
        }
    }
}

// ============================================================================
// 6. 图表渲染
// ============================================================================
function getChart(id) {
    const dom = document.getElementById(id);
    if (!dom) return null;
    let chart = echarts.getInstanceByDom(dom);
    if (!chart) chart = echarts.init(dom);
    return chart;
}

function updateTimelineCharts() {
    if (trendData.length === 0) return;

    const tChart = getChart('trendChart');
    if (tChart) {
        tChart.setOption({
            title: { text: '实时骑行量趋势', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { top: 30 },
            xAxis: { data: trendData.map(d => d.time) },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '在途车辆',
                    type: 'line',
                    data: trendData.map(d => d.active),
                    smooth: true,
                    areaStyle: { opacity: 0.3 },
                    itemStyle: { color: '#667eea' }
                },
                {
                    name: '在站库存',
                    type: 'line',
                    data: trendData.map(d => d.inStation),
                    smooth: true,
                    itemStyle: { color: '#3cb371' }
                }
            ]
        });
    }

    const sChart = getChart('stationChart');
    if (sChart) {
        sChart.setOption({
            title: { text: '异常站点统计', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { top: 30 },
            xAxis: { data: trendData.map(d => d.time) },
            yAxis: { minInterval: 1 },
            series: [
                { name: '缺车站点', type: 'line', data: trendData.map(d => d.shortage), color: '#dc143c' },
                { name: '积压站点', type: 'line', data: trendData.map(d => d.surplus), color: '#1e90ff' }
            ]
        });
    }

    // 预测图
    updatePredictionChart();
}

function updatePredictionChart() {
    if (trendData.length < 5) return;

    const pChart = getChart('predictChart');
    if (!pChart) return;

    const recent = trendData.slice(-5);
    const slope = (recent[recent.length - 1].active - recent[0].active) / 5;

    const futureTimes = [];
    const futureValues = [];
    for (let i = 1; i <= 6; i++) {
        const futureMin = currentMinute + i * 5;
        const h = Math.floor(futureMin / 60).toString().padStart(2, '0');
        const m = (futureMin % 60).toString().padStart(2, '0');
        futureTimes.push(`${h}:${m}`);
        futureValues.push(Math.max(0, Math.round(trendData[trendData.length - 1].active + slope * i)));
    }

    pChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { data: futureTimes, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        series: [{
            type: 'line',
            data: futureValues,
            smooth: true,
            lineStyle: { type: 'dashed', color: '#ff6b6b' },
            itemStyle: { color: '#ff6b6b' }
        }],
        grid: { left: 30, right: 10, top: 10, bottom: 20 }
    });
}

function updateDashboardCharts(stationStatus) {
    const currentInStation = stationStatus.reduce((sum, s) => sum + s.count, 0);
    const utilRate = ((TOTAL_INIT_BIKES - currentInStation) / TOTAL_INIT_BIKES * 100).toFixed(1);
    const shortRate = (stationStatus.filter(s => s.status === 'shortage').length / stations.length * 100).toFixed(0);
    const surpRate = (stationStatus.filter(s => s.status === 'surplus').length / stations.length * 100).toFixed(0);

    const gaugeOpt = (val, title, color) => ({
        series: [{
            type: 'gauge',
            title: { text: title, offsetCenter: [0, '80%'] },
            detail: { formatter: '{value}%', fontSize: 20, offsetCenter: [0, '50%'] },
            data: [{ value: val }],
            axisLine: { lineStyle: { width: 10, color: [[1, color]] } },
            pointer: { width: 5 },
            progress: { show: true, width: 10 }
        }]
    });

    const g1 = getChart('gaugeUtilization');
    if (g1) g1.setOption(gaugeOpt(utilRate, '整体利用率', '#3cb371'));

    const g2 = getChart('gaugeShortage');
    if (g2) g2.setOption(gaugeOpt(shortRate, '缺车站点比例', '#dc3545'));

    const g3 = getChart('gaugeSurplus');
    if (g3) g3.setOption(gaugeOpt(surpRate, '积压站点比例', '#1e90ff'));
}

// ============================================================================
// 7. 智能调度
// ============================================================================
let dispatchLayerGroup = null;

function updateDispatchLogic(stationStatus) {
    const surplusStation = stationStatus.reduce((max, s) => s.count > max.count ? s : max);
    const shortageStation = stationStatus.reduce((min, s) => s.count < min.count ? s : min);
    const amount = Math.min(30, Math.floor((surplusStation.count - shortageStation.count) / 2));

    document.getElementById('dispatchFrom').innerText = surplusStation.name;
    document.getElementById('dispatchTo').innerText = shortageStation.name;
    document.getElementById('dispatchAmount').innerText = amount;

    if (!dispatchLayerGroup) {
        dispatchLayerGroup = L.layerGroup().addTo(dispatchMapObj);
    }
    dispatchLayerGroup.clearLayers();

    L.polyline(
        [[surplusStation.lat, surplusStation.lon], [shortageStation.lat, shortageStation.lon]],
        { color: '#ff8c00', weight: 6, dashArray: '10, 10' }
    ).addTo(dispatchLayerGroup);

    L.circleMarker([surplusStation.lat, surplusStation.lon], {
        color: '#00ff00',
        radius: 12,
        fillOpacity: 0.8
    }).addTo(dispatchLayerGroup).bindPopup(`调出: ${surplusStation.name}`);

    L.circleMarker([shortageStation.lat, shortageStation.lon], {
        color: '#ff0000',
        radius: 12,
        fillOpacity: 0.8
    }).addTo(dispatchLayerGroup).bindPopup(`调入: ${shortageStation.name}`);
}

function executeDispatch() {
    const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
    const m = (currentMinute % 60).toString().padStart(2, '0');
    const time = `${h}:${m}`;
    const from = document.getElementById('dispatchFrom').innerText;
    const to = document.getElementById('dispatchTo').innerText;
    const amount = document.getElementById('dispatchAmount').innerText;

    const card = document.createElement('div');
    card.style.cssText = `
        background: #fff;
        border-left: 4px solid #667eea;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        animation: slideIn 0.3s;
    `;
    card.innerHTML = `
        <div style="color: #888; font-size: 12px; margin-bottom: 5px;">⏰ ${time}</div>
        <div style="font-weight: bold; font-size: 14px;">${from} → ${to}</div>
        <div style="color: #1890ff; font-size: 12px; margin-top: 3px;">📦 调度量: ${amount} 辆</div>
    `;

    const container = document.getElementById('dispatchHistory');
    container.insertBefore(card, container.firstChild);

    // 保持最多10条记录
    while (container.children.length > 10) {
        container.removeChild(container.lastChild);
    }
}

// ============================================================================
// 8. 热力图
// ============================================================================
let heatLayer = null;

function updateHeatmapLogic(stationStatus) {
    if (!heatmapObj) return;

    const heatData = stationStatus.map(s => [
        s.lat,
        s.lon,
        (parseFloat(s.utilization) + 10) / 100
    ]);

    if (heatLayer) {
        heatLayer.setLatLngs(heatData);
    } else {
        heatLayer = L.heatLayer(heatData, {
            radius: 50,
            blur: 30,
            maxZoom: 17,
            gradient: {
                0.0: 'blue',
                0.5: 'lime',
                1.0: 'red'
            }
        }).addTo(heatmapObj);
    }

    // 更新热度排行
    updateUtilizationList(stationStatus);
    updateHeatmapSuggestions(stationStatus);
}

function updateUtilizationList(stationStatus) {
    const container = document.getElementById('utilizationList');
    if (!container) return;

    const sorted = [...stationStatus].sort((a, b) => parseFloat(b.utilization) - parseFloat(a.utilization));

    container.innerHTML = '';
    sorted.forEach((s, idx) => {
        const item = document.createElement('div');
        item.style.cssText = `
            background: ${idx < 3 ? '#ffe6e6' : '#f8f9fa'};
            padding: 8px;
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 3px solid ${idx === 0 ? '#dc3545' : idx === 1 ? '#ff8c00' : idx === 2 ? '#ffc107' : '#ddd'};
        `;
        item.innerHTML = `
            <div style="font-weight: bold; font-size: 13px;">${idx + 1}. ${s.name}</div>
            <div style="font-size: 12px; color: #666;">利用率: ${s.utilization}%</div>
        `;
        container.appendChild(item);
    });
}

function updateHeatmapSuggestions(stationStatus) {
    const container = document.getElementById('heatmapSuggestions');
    if (!container) return;

    const highUtil = stationStatus.filter(s => parseFloat(s.utilization) > 70);
    const lowUtil = stationStatus.filter(s => parseFloat(s.utilization) < 20);

    container.innerHTML = '';

    if (highUtil.length > 0) {
        const sug = document.createElement('div');
        sug.style.cssText = 'background: #fff3cd; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ffc107;';
        sug.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ 高热度区域</div>
            <div style="font-size: 12px; line-height: 1.5;">
                ${highUtil.map(s => s.name).join('、')} 使用率偏高，建议增加车辆投放。
            </div>
        `;
        container.appendChild(sug);
    }

    if (lowUtil.length > 0) {
        const sug = document.createElement('div');
        sug.style.cssText = 'background: #d1ecf1; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #0dcaf0;';
        sug.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">ℹ️ 低热度区域</div>
            <div style="font-size: 12px; line-height: 1.5;">
                ${lowUtil.map(s => s.name).join('、')} 使用率较低，可适当减少投放或作为调度储备点。
            </div>
        `;
        container.appendChild(sug);
    }
}

// ============================================================================
// 9. 数据对比功能 (新增)
// ============================================================================
function renderComparisonData() {
    // 生成对比数据
    const today = calculateDailySummary(currentDate);
    const yesterday = calculateDailySummary(getPreviousDate(currentDate, 1));

    const grid = document.getElementById('comparisonGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const metrics = [
        { label: '总骑行次数', today: today.totalTrips, yesterday: yesterday.totalTrips },
        { label: '峰值在途量', today: today.peakActive, yesterday: yesterday.peakActive },
        { label: '平均利用率', today: today.avgUtil, yesterday: yesterday.avgUtil },
        { label: '调度次数', today: today.dispatches, yesterday: yesterday.dispatches }
    ];

    metrics.forEach(m => {
        const change = m.today - m.yesterday;
        const changePercent = ((change / m.yesterday) * 100).toFixed(1);
        const isUp = change > 0;

        const item = document.createElement('div');
        item.className = 'comparison-item';
        item.innerHTML = `
            <div class="label">${m.label}</div>
            <div class="value">${m.today}</div>
            <div class="change ${isUp ? 'up' : 'down'}">
                ${isUp ? '▲' : '▼'} ${Math.abs(changePercent)}%
            </div>
        `;
        grid.appendChild(item);
    });

    renderComparisonCharts(today, yesterday);
}

function calculateDailySummary(dateStr) {
    // 模拟计算当天的汇总数据
    const orders = generateOrdersForDate(dateStr);
    return {
        totalTrips: orders.length,
        peakActive: Math.floor(orders.length * 0.15),
        avgUtil: (Math.random() * 30 + 40).toFixed(1),
        dispatches: Math.floor(Math.random() * 15 + 5)
    };
}

function getPreviousDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

function renderComparisonCharts(today, yesterday) {
    // 对比趋势图
    const tChart = getChart('comparisonTrendChart');
    if (tChart) {
        tChart.setOption({
            title: { text: '今日 vs 昨日骑行趋势', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { top: 30 },
            xAxis: { data: Array.from({ length: 15 }, (_, i) => `${7 + i}:00`) },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '今日',
                    type: 'line',
                    data: Array.from({ length: 15 }, () => Math.floor(Math.random() * 100 + 50)),
                    smooth: true,
                    itemStyle: { color: '#667eea' }
                },
                {
                    name: '昨日',
                    type: 'line',
                    data: Array.from({ length: 15 }, () => Math.floor(Math.random() * 100 + 50)),
                    smooth: true,
                    itemStyle: { color: '#ccc' },
                    lineStyle: { type: 'dashed' }
                }
            ]
        });
    }

    // 高峰时段对比
    const pChart = getChart('comparisonPeakChart');
    if (pChart) {
        pChart.setOption({
            title: { text: '高峰时段对比', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { top: 30 },
            xAxis: { data: ['早高峰', '午高峰', '晚高峰'] },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '今日',
                    type: 'bar',
                    data: [120, 80, 150],
                    itemStyle: { color: '#667eea' }
                },
                {
                    name: '昨日',
                    type: 'bar',
                    data: [110, 75, 140],
                    itemStyle: { color: '#ccc' }
                }
            ]
        });
    }

    // 周模式图
    const wChart = getChart('weeklyPatternChart');
    if (wChart) {
        wChart.setOption({
            title: { text: '本周使用模式', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
            yAxis: { type: 'value', name: '骑行次数' },
            series: [{
                type: 'bar',
                data: [280, 320, 310, 290, 330, 180, 150],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#667eea' },
                        { offset: 1, color: '#764ba2' }
                    ])
                }
            }]
        });
    }
}

// ============================================================================
// 10. 智能建议生成 (新增)
// ============================================================================
function generateSmartSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    if (!container) return;

    const status = calculateStationStatus();
    const hour = Math.floor(currentMinute / 60);
    const suggestions = [];

    // 根据不同情况生成建议
    const highUtilStations = status.filter(s => parseFloat(s.utilization) > 70);
    if (highUtilStations.length > 0) {
        suggestions.push({
            title: '🎯 高需求区域车辆增配建议',
            content: `检测到 ${highUtilStations.map(s => s.name).join('、')} 等站点需求旺盛，建议在早高峰前（6:30-7:00）增加车辆投放，预计需增加 ${highUtilStations.length * 15} 辆。`,
            color: '#f093fb'
        });
    }

    const shortageStations = status.filter(s => s.status === 'shortage');
    if (shortageStations.length > 0) {
        suggestions.push({
            title: '⚠️ 即时调度建议',
            content: `当前 ${shortageStations.map(s => s.name).join('、')} 出现缺车，建议从 ${status.filter(s => s.status === 'surplus').map(s => s.name).join('、')} 进行紧急调度，预计 20 分钟可缓解。`,
            color: '#f5576c'
        });
    }

    if (hour >= 16 && hour < 18) {
        suggestions.push({
            title: '🕐 晚高峰预备建议',
            content: '即将进入晚高峰时段（17:00-19:00），建议提前将车辆从教学区调往宿舍区和食堂周边，预计需调度 80-100 辆。',
            color: '#43e97b'
        });
    }

    suggestions.push({
        title: '📊 数据分析洞察',
        content: `根据今日数据，${status[0].name} 站点是最热门起点，${status.reduce((max, s) => parseFloat(s.utilization) > parseFloat(max.utilization) ? s : max).name} 利用率最高。建议重点关注这些站点的运维。`,
        color: '#4facfe'
    });

    suggestions.push({
        title: '💰 成本优化建议',
        content: `检测到体育馆、西门等站点夜间（20:00后）使用率低于 10%，建议将这些车辆夜间集中存放，可节省约 15% 的运维成本。`,
        color: '#ffa500'
    });

    container.innerHTML = '';
    suggestions.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.style.background = `linear-gradient(135deg, ${sug.color} 0%, ${sug.color}dd 100%)`;
        card.innerHTML = `
            <h4>${sug.title}</h4>
            <p>${sug.content}</p>
        `;
        container.appendChild(card);
    });
}

// ============================================================================
// 11. 数据导出 (新增)
// ============================================================================
function exportData() {
    const status = calculateStationStatus();
    const csvData = [
        ['站点名称', '当前库存', '初始库存', '利用率(%)', '状态'],
        ...status.map(s => [s.name, s.count, s.init_count, s.utilization, s.status])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `JXNU智行_数据导出_${currentDate}_${new Date().getTime()}.csv`;
    link.click();
}

function generateReport() {
    alert('完整运营报告生成中...\n\n报告将包含：\n✅ 全天运营数据汇总\n✅ 高峰时段分析\n✅ 站点使用热力图\n✅ 调度效率评估\n✅ 优化建议清单\n\n报告将自动下载为PDF格式。');
    // 这里可以集成jsPDF等库生成真实的PDF报告
}

// ============================================================================
// 12. 日期切换 (新增)
// ============================================================================
function onDateChange() {
    const dateInput = document.getElementById('dateInput');
    currentDate = dateInput.value;
    currentOrders = generateOrdersForDate(currentDate);
    resetSimulation();
    alert(`已切换到 ${currentDate} 的数据`);
}

function setComparisonRange(range) {
    // 切换对比时间范围
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // 重新渲染对比数据
    renderComparisonData();
}

// ============================================================================
// 13. 主循环
// ============================================================================
function startSimulation() {
    if (!isPlaying) return;

    currentMinute += speed;
    if (currentMinute >= 22 * 60) {
        isPlaying = false;
        document.getElementById('playBtn').innerText = '▶ 开始仿真';
        document.getElementById('playBtn').className = 'btn btn-play';
        return;
    }

    const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
    const m = (currentMinute % 60).toString().padStart(2, '0');
    document.getElementById('currentTime').innerText = `${h}:${m}`;

    const status = calculateStationStatus();
    updateStats(status);

    if (currentTab === 'overview') updateMapVisuals(status);
    else if (currentTab === 'timeline') updateTimelineCharts();
    else if (currentTab === 'dispatch') updateDispatchLogic(status);
    else if (currentTab === 'heatmap') updateHeatmapLogic(status);
    else if (currentTab === 'dashboard') updateDashboardCharts(status);

    setTimeout(startSimulation, 50);
}

function togglePlay() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playBtn');
    if (isPlaying) {
        btn.innerText = '⏸ 暂停';
        btn.className = 'btn btn-pause';
        startSimulation();
    } else {
        btn.innerText = '▶ 继续';
        btn.className = 'btn btn-play';
    }
}

function resetSimulation() {
    isPlaying = false;
    currentMinute = 7 * 60;
    trendData = [];

    const dispatchLog = document.getElementById('dispatchHistory');
    if (dispatchLog) dispatchLog.innerHTML = '';

    document.getElementById('playBtn').innerText = '▶ 开始仿真';
    document.getElementById('playBtn').className = 'btn btn-play';
    document.getElementById('currentTime').innerText = '07:00';

    // 重置日志
    const logsContainer = document.getElementById('liveLogs');
    if (logsContainer) {
        logsContainer.innerHTML = '<div class="log-item">[07:00] 系统已重置</div>';
    }

    const status = calculateStationStatus();
    updateStats(status);
    updateMapVisuals(status);
}

function updateSpeed(val) {
    speed = parseInt(val);
    document.getElementById('speedValue').innerText = speed + 'x';
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    const status = calculateStationStatus();
    setTimeout(() => {
        if (tabId === 'overview') {
            map.invalidateSize();
            map.fitBounds(MAP_BOUNDS);
            updateMapVisuals(status);
        } else if (tabId === 'comparison') {
            renderComparisonData();
        } else if (tabId === 'timeline') {
            updateTimelineCharts();
        } else if (tabId === 'dispatch') {
            dispatchMapObj.invalidateSize();
            dispatchMapObj.fitBounds(MAP_BOUNDS);
            updateDispatchLogic(status);
        } else if (tabId === 'heatmap') {
            heatmapObj.invalidateSize();
            heatmapObj.fitBounds(MAP_BOUNDS);
            updateHeatmapLogic(status);
        } else if (tabId === 'suggestions') {
            generateSmartSuggestions();
        } else if (tabId === 'dashboard') {
            updateDashboardCharts(status);
        }
    }, 200);
}

// ============================================================================
// 14. 初始化
// ============================================================================
window.onload = function () {
    initMap();
    const status = calculateStationStatus();
    updateStats(status);
    updateMapVisuals(status);
    console.log('✅ 系统初始化完成');
};

window.addEventListener('resize', () => {
    const chartIds = ['trendChart', 'stationChart', 'predictChart', 'gaugeUtilization', 'gaugeShortage', 'gaugeSurplus',
                     'comparisonTrendChart', 'comparisonPeakChart', 'weeklyPatternChart'];
    chartIds.forEach(id => {
        const chart = getChart(id);
        if (chart) chart.resize();
    });
});