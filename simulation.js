// ============================================================================
// 全局变量和配置
// ============================================================================
let currentMinute = 7 * 60; // 从07:00开始
let isPlaying = false;
let speed = 5;
let map, dispatchMapObj, heatmapObj;
let markers = {};
let trendData = [];
let dispatchHistory = [];
let alerts = [];

// 图表实例缓存
const chartInstances = {};

// 当前激活的Tab
let currentTab = 'overview';

// 地图图片边界
const MAP_BOUNDS = [
    [28.6750, 116.0250], // 西南角
    [28.6920, 116.0450]  // 东北角
];

// ============================================================================
// 1. 数据准备
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

// 生成订单
function generateOrders() {
    const orders = [];
    const timeSlots = [
        { start: 7, end: 8, rate: 3.0, type: 'toClass' },
        { start: 8, end: 11, rate: 0.8, type: 'random' },
        { start: 11, end: 13, rate: 2.5, type: 'toFood' },
        { start: 13, end: 17, rate: 1.0, type: 'random' },
        { start: 17, end: 19, rate: 2.0, type: 'toDorm' },
        { start: 19, end: 22, rate: 1.2, type: 'toDorm' }
    ];

    const dorms = [4, 9];
    const classes = [1, 2, 3, 6, 10];
    const food = [5];
    const spots = [7, 8];

    for (let hour = 7; hour < 22; hour++) {
        const slot = timeSlots.find(s => hour >= s.start && hour < s.end);
        const numOrders = Math.floor(30 * (slot?.rate || 1));

        for (let i = 0; i < numOrders; i++) {
            const minute = Math.floor(Math.random() * 60);
            const timeMinutes = hour * 60 + minute;

            let sPool = stations.map(s => s.id);
            let ePool = stations.map(s => s.id);

            if (slot.type === 'toClass') { sPool = dorms; ePool = classes; }
            else if (slot.type === 'toFood') { sPool = classes; ePool = food; }
            else if (slot.type === 'toDorm') { sPool = classes.concat(spots); ePool = dorms; }

            const startId = sPool[Math.floor(Math.random() * sPool.length)];
            let endId = ePool[Math.floor(Math.random() * ePool.length)];
            if (startId === endId) endId = (startId % 10) + 1;

            orders.push({
                time: timeMinutes,
                start_station: startId,
                end_station: endId
            });
        }
    }
    return orders.sort((a, b) => a.time - b.time);
}

const orders = generateOrders();

// ============================================================================
// 2. 核心计算引擎
// ============================================================================
function calculateStationStatus() {
    const activeOrders = orders.filter(o => o.time <= currentMinute);
    const outCount = {};
    const inCount = {};

    activeOrders.forEach(order => {
        outCount[order.start_station] = (outCount[order.start_station] || 0) + 1;
        inCount[order.end_station] = (inCount[order.end_station] || 0) + 1;
    });

    return stations.map(station => {
        let count = station.init_count - (outCount[station.id] || 0) + (inCount[station.id] || 0);
        count = Math.max(0, count);

        let color, status;
        if (count < 10) { color = '#dc143c'; status = 'shortage'; }
        else if (count > 100) { color = '#1e90ff'; status = 'surplus'; }
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
// 3. 地图与可视化
// ============================================================================
function initMap() {
    // 1. 初始化主地图
    map = L.map('map', { center: [28.6840, 116.0350], zoom: 15, minZoom: 14, maxZoom: 17 });
    const imageUrl = 'https://i.postimg.cc/7LQ079K9/map-bg.jpg';
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(map);
    map.fitBounds(MAP_BOUNDS);

    stations.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lon], {
            radius: 12, fillColor: '#3cb371', color: '#fff', weight: 2, fillOpacity: 0.9
        }).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>初始化...`);
        markers[s.id] = marker;
    });

    // 2. 初始化调度地图 (dispatchMap)
    dispatchMapObj = L.map('dispatchMap', { center: [28.6840, 116.0350], zoom: 15 });
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(dispatchMapObj);

    // 3. 初始化热力地图 (heatmapContainer)
    heatmapObj = L.map('heatmapContainer', { center: [28.6840, 116.0350], zoom: 15 });
    L.imageOverlay(imageUrl, MAP_BOUNDS).addTo(heatmapObj);
}

function updateMapVisuals(stationStatus) {
    stationStatus.forEach(s => {
        const marker = markers[s.id];
        if (marker) {
            const size = Math.max(8, Math.min(35, s.count / 4));
            marker.setRadius(size);
            marker.setStyle({ fillColor: s.color });
            const content = `<div style="text-align:center"><h3 style="margin:0;color:#333">${s.name}</h3><p style="margin:5px 0">当前库存: <b style="font-size:16px;color:${s.color}">${s.count}</b> 辆</p><small>状态: ${s.status}</small></div>`;
            if (marker.isPopupOpen()) marker.setPopupContent(content);
            else marker.bindPopup(content);
        }
    });
}

function updateStats(stationStatus) {
    const totalBikes = stationStatus.reduce((sum, s) => sum + s.count, 0);
    const shortage = stationStatus.filter(s => s.count < 10).length;
    const surplus = stationStatus.filter(s => s.count > 100).length;
    const normal = stationStatus.length - shortage - surplus;
    const initTotal = stations.reduce((sum, s) => sum + s.init_count, 0);
    const active = initTotal - totalBikes;

    document.getElementById('totalBikes').innerText = totalBikes;
    document.getElementById('activeBikes').innerText = active;
    document.getElementById('shortageStations').innerText = shortage;
    document.getElementById('surplusStations').innerText = surplus;
    document.getElementById('normalStations').innerText = normal;

    // 告警检测
    const newAlerts = stationStatus.filter(s => s.status !== 'normal');
    if (newAlerts.length > 0) {
        newAlerts.forEach(s => {
            const msg = s.status === 'shortage' ? `${s.name} 缺车` : `${s.name} 积压`;
            if (!alerts.some(a => a.msg === msg && a.time === document.getElementById('currentTime').innerText)) {
                alerts.unshift({ time: document.getElementById('currentTime').innerText, msg: msg, type: s.status });
                if (alerts.length > 20) alerts.pop();
            }
        });
    }

    if (currentMinute % 10 === 0 || trendData.length === 0) {
        const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
        const m = (currentMinute % 60).toString().padStart(2, '0');
        trendData.push({ time: `${h}:${m}`, total: totalBikes, shortage: shortage, surplus: surplus });
        if (trendData.length > 50) trendData.shift();
    }
}

// ============================================================================
// 4. 图表与功能模块
// ============================================================================
function getChart(id) {
    const dom = document.getElementById(id);
    if (!dom) return null;
    let chart = echarts.getInstanceByDom(dom);
    if (!chart) chart = echarts.init(dom);
    return chart;
}

// --- 智能调度模块 ---
let dispatchLayerGroup = null;
function updateDispatchLogic(stationStatus) {
    // 找到最积压和最缺车的站点
    const surplusStation = stationStatus.reduce((max, s) => s.count > max.count ? s : max, stationStatus[0]);
    const shortageStation = stationStatus.reduce((min, s) => s.count < min.count ? s : min, stationStatus[0]);

    // 更新 DOM
    document.getElementById('dispatchFrom').innerText = surplusStation.name;
    document.getElementById('dispatchTo').innerText = shortageStation.name;
    document.getElementById('dispatchAmount').innerText = Math.min(30, Math.floor((surplusStation.count - shortageStation.count)/2));

    // 更新地图路径
    if (!dispatchLayerGroup) {
        dispatchLayerGroup = L.layerGroup().addTo(dispatchMapObj);
    }
    dispatchLayerGroup.clearLayers();

    // 画线
    const latlngs = [[surplusStation.lat, surplusStation.lon], [shortageStation.lat, shortageStation.lon]];
    L.polyline(latlngs, {color: 'orange', weight: 5, dashArray: '10, 10'}).addTo(dispatchLayerGroup);
    // 画点
    L.circleMarker([surplusStation.lat, surplusStation.lon], {color: 'blue', radius: 8}).addTo(dispatchLayerGroup).bindPopup("调出");
    L.circleMarker([shortageStation.lat, shortageStation.lon], {color: 'red', radius: 8}).addTo(dispatchLayerGroup).bindPopup("调入");

    dispatchMapObj.fitBounds(latlngs, {padding: [50, 50]});
}

function executeDispatch() {
    const from = document.getElementById('dispatchFrom').innerText;
    const to = document.getElementById('dispatchTo').innerText;
    const amount = document.getElementById('dispatchAmount').innerText;
    const time = document.getElementById('currentTime').innerText;

    const div = document.createElement('div');
    div.className = 'alert alert-warning';
    div.innerHTML = `<b>${time}</b>: 从 [${from}] 调度 <b>${amount}</b> 辆至 [${to}]`;
    document.getElementById('dispatchHistory').prepend(div);
}

// --- 热力分析模块 ---
let heatLayer = null;
function updateHeatmapLogic(stationStatus) {
    const heatData = stationStatus.map(s => [s.lat, s.lon, s.count / 150]); // 归一化强度

    if (heatLayer) {
        heatLayer.setLatLngs(heatData);
    } else {
        heatLayer = L.heatLayer(heatData, {radius: 40, blur: 25, maxZoom: 17}).addTo(heatmapObj);
    }

    // 利用率图表
    const chart = getChart('utilizationChart');
    if (chart) {
        chart.setOption({
            title: { text: '各站点库存利用率排行', left: 'center' },
            xAxis: { type: 'category', data: stationStatus.map(s => s.name), axisLabel: {rotate: 45} },
            yAxis: { type: 'value' },
            series: [{
                type: 'bar',
                data: stationStatus.map(s => ({
                    value: s.utilization,
                    itemStyle: { color: s.utilization > 80 ? '#dc143c' : '#3cb371' }
                }))
            }]
        });
    }
}

// --- 仪表盘模块 ---
function updateDashboardCharts(stationStatus) {
    const totalInit = stations.reduce((s, i) => s + i.init_count, 0);
    const currentTotal = stationStatus.reduce((s, i) => s + i.count, 0);

    const utilRate = ((totalInit - currentTotal) / totalInit * 100).toFixed(1);
    const shortRate = (stationStatus.filter(s => s.status === 'shortage').length / stations.length * 100).toFixed(0);
    const surpRate = (stationStatus.filter(s => s.status === 'surplus').length / stations.length * 100).toFixed(0);

    const gaugeOpt = (name, val, color) => ({
        series: [{
            type: 'gauge',
            detail: { formatter: '{value}%', fontSize: 14 },
            data: [{ value: val, name: name }],
            axisLine: { lineStyle: { width: 8, color: [[1, color]] } },
            pointer: { width: 4 }
        }]
    });

    const g1 = getChart('gaugeUtilization'); if(g1) g1.setOption(gaugeOpt('车辆使用率', utilRate, '#3cb371'));
    const g2 = getChart('gaugeShortage'); if(g2) g2.setOption(gaugeOpt('站点缺车率', shortRate, '#dc143c'));
    const g3 = getChart('gaugeSurplus'); if(g3) g3.setOption(gaugeOpt('站点积压率', surpRate, '#1e90ff'));

    // 更新告警列表
    const container = document.getElementById('alertsContainer');
    container.innerHTML = ''; // 清空重绘
    alerts.forEach(a => {
        const div = document.createElement('div');
        div.className = a.type === 'shortage' ? 'alert alert-danger' : 'alert alert-warning';
        div.innerText = `[${a.time}] ${a.msg}`;
        container.appendChild(div);
    });
}

function updateTimelineCharts() {
    if (trendData.length === 0) return;
    const tChart = getChart('trendChart');
    if (tChart) {
        tChart.setOption({
            title: { text: '库存趋势', left: 'center' },
            xAxis: { data: trendData.map(d => d.time) },
            yAxis: { min: 'dataMin' },
            series: [{ type: 'line', data: trendData.map(d => d.total), smooth: true, areaStyle: {} }]
        });
    }
    const sChart = getChart('stationChart');
    if (sChart) {
        sChart.setOption({
            title: { text: '异常站点数', left: 'center' },
            legend: {top: 25},
            xAxis: { data: trendData.map(d => d.time) },
            yAxis: {},
            series: [
                { name: '缺车', type: 'line', data: trendData.map(d => d.shortage), color: 'red' },
                { name: '积压', type: 'line', data: trendData.map(d => d.surplus), color: 'blue' }
            ]
        });
    }
    const pChart = getChart('predictChart');
    if (pChart) {
        const last = trendData[trendData.length-1].total;
        pChart.setOption({
            title: { text: 'AI预测', left: 'center' },
            xAxis: { data: ['+0', '+15', '+30', '+45'] },
            yAxis: { scale: true },
            series: [{ type: 'line', data: [last, last-5, last-10, last+2], lineStyle: {type: 'dashed'} }]
        });
    }
}

// ============================================================================
// 5. 仿真主循环
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

    // 根据当前 Tab 更新对应的视图
    if (currentTab === 'overview') updateMapVisuals(status);
    else if (currentTab === 'timeline') updateTimelineCharts();
    else if (currentTab === 'dispatch') updateDispatchLogic(status);
    else if (currentTab === 'heatmap') updateHeatmapLogic(status);
    else if (currentTab === 'dashboard') updateDashboardCharts(status);

    setTimeout(startSimulation, 50);
}

// ============================================================================
// 6. 交互逻辑
// ============================================================================
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
    alerts = [];
    document.getElementById('playBtn').innerText = '▶ 开始仿真';
    document.getElementById('playBtn').className = 'btn btn-play';
    document.getElementById('currentTime').innerText = "07:00";

    const status = calculateStationStatus();
    updateStats(status);
    updateMapVisuals(status);
}

function updateSpeed(val) {
    speed = parseInt(val);
    document.getElementById('speedValue').innerText = speed + "x";
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    const status = calculateStationStatus();
    // 延迟渲染以确保 DOM 尺寸正确
    setTimeout(() => {
        if (tabId === 'overview') { map.invalidateSize(); updateMapVisuals(status); }
        else if (tabId === 'timeline') updateTimelineCharts();
        else if (tabId === 'dispatch') { dispatchMapObj.invalidateSize(); updateDispatchLogic(status); }
        else if (tabId === 'heatmap') { heatmapObj.invalidateSize(); updateHeatmapLogic(status); }
        else if (tabId === 'dashboard') updateDashboardCharts(status);
    }, 100);
}

// 初始化
window.onload = function() {
    initMap();
    const status = calculateStationStatus();
    updateStats(status);
    updateMapVisuals(status);
};

window.addEventListener('resize', () => {
    Object.keys(chartInstances).forEach(k => {
        const chart = getChart(k + 'Chart');
        if (chart) chart.resize();
    });
});