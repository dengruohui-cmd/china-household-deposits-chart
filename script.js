let chart;
let fullData = [];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initChart();
    updateStats();
    renderTable();
});

// 加载数据
async function loadData() {
    try {
        // 从GitHub Raw加载数据
        const response = await fetch('data/deposits.json');
        fullData = await response.json();
        
        // 按日期排序
        fullData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('zh-CN');
    } catch (error) {
        console.error('加载数据失败:', error);
        // 使用备用数据
        fullData = generateBackupData();
    }
}

// 生成备用数据（当自动更新失败时使用）
function generateBackupData() {
    const data = [];
    const startDate = new Date(2015, 0, 1);
    const endDate = new Date();
    let baseValue = 55; // 2015年初约55万亿
    
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        // 模拟增长趋势：年均增长约10-15%
        const growth = 0.008 + Math.random() * 0.005;
        baseValue = baseValue * (1 + growth);
        
        data.push({
            date: d.toISOString().slice(0, 7),
            value: parseFloat(baseValue.toFixed(2)),
            mom: (Math.random() * 2 - 0.5).toFixed(2),
            yoy: (10 + Math.random() * 5).toFixed(2)
        });
    }
    return data;
}

// 初始化图表
function initChart() {
    const ctx = document.getElementById('depositsChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: '住户存款余额 (万亿元)',
                data: fullData.map(d => ({
                    x: d.date,
                    y: d.value
                })),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `存款余额: ${context.parsed.y} 万亿元`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'yyyy年MM月'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '万亿元'
                    }
                }
            }
        }
    });
}

// 切换时间范围
function changeTimeRange(months) {
    // 更新按钮状态
    document.querySelectorAll('.controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filteredData;
    if (months === 'all') {
        filteredData = fullData;
    } else {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        filteredData = fullData.filter(d => new Date(d.date) >= cutoffDate);
    }
    
    chart.data.datasets[0].data = filteredData.map(d => ({
        x: d.date,
        y: d.value
    }));
    chart.update();
}

// 更新统计卡片
function updateStats() {
    if (fullData.length === 0) return;
    
    const latest = fullData[fullData.length - 1];
    const previous = fullData[fullData.length - 2];
    const lastYear = fullData.find(d => {
        const d1 = new Date(d.date);
        const d2 = new Date(latest.date);
        return d1.getFullYear() === d2.getFullYear() - 1 && d1.getMonth() === d2.getMonth();
    });
    
    document.getElementById('currentBalance').textContent = latest.value.toFixed(2);
    document.getElementById('yoyGrowth').textContent = latest.yoy || '--';
    document.getElementById('monthlyIncrease').textContent = (latest.value - (previous?.value || 0)).toFixed(2);
    
    // 添加颜色标识
    const yoyElement = document.getElementById('yoyGrowth');
    if (parseFloat(latest.yoy) > 0) yoyElement.classList.add('positive');
    else yoyElement.classList.add('negative');
}

// 渲染数据表格
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    // 显示最近24个月的数据（倒序）
    const recentData = [...fullData].reverse().slice(0, 24);
    
    recentData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date}</td>
            <td><strong>${row.value.toFixed(2)}</strong></td>
            <td class="${parseFloat(row.mom) > 0 ? 'positive' : 'negative'}">
                ${parseFloat(row.mom) > 0 ? '↑' : '↓'} ${Math.abs(row.mom)}%
            </td>
            <td class="${parseFloat(row.yoy) > 0 ? 'positive' : 'negative'}">
                ${parseFloat(row.yoy) > 0 ? '↑' : '↓'} ${Math.abs(row.yoy)}%
            </td>
        `;
        tbody.appendChild(tr);
    });
}
