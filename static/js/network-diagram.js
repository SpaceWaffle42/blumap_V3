var chartDom = document.getElementById('network-diagram');
var myChart = echarts.init(chartDom);

function generateNetworkData() {
    const routers = ['Router1', 'Router2', 'Router3', 'Router4'];
    const hosts = [];
    for (let i = 0; i < routers.length; i++) {
        let numHosts = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < numHosts; j++) {
            hosts.push({
                name: `Host${i * 10 + j + 1}`,
                symbolSize: 15,
                itemStyle: { color: '#00BFFF' },
                category: i
            });
        }
    }
    const links = [];
    for (let i = 0; i < routers.length; i++) {
        for (let j = 0; j < hosts.length; j++) {
            if (hosts[j].category === i) {
                links.push({
                    source: routers[i],
                    target: hosts[j].name,
                    lineStyle: { color: '#A9A9A9' }
                });
            }
        }
    }
    const data = [
        ...routers.map((router, index) => ({
            name: router,
            symbolSize: 40,
            itemStyle: { color: '#ff6347' },
            category: index,
            draggable: true
        })),
        ...hosts.map(host => ({ ...host, draggable: true }))
    ];
    return { data, links };
}

var option = {
    tooltip: { formatter: '{b}' },
    series: [{
        type: 'graph',
        layout: 'force',
        force: { repulsion: 100, edgeLength: 100, gravity: 0.1 },
        roam: true,
        label: { show: true, position: 'right', formatter: '{b}' },
        edgeSymbol: 'none',
        data: generateNetworkData().data,
        links: generateNetworkData().links
    }]
};
myChart.setOption(option);

window.addEventListener('resize', function () {
    myChart.resize();
});

document.querySelectorAll('.tabs a').forEach(function (tab) {
    tab.addEventListener('click', function () {
        const activeTab = this.getAttribute('href');
        if (activeTab === '#network') {
            setTimeout(() => {
                myChart.resize(); // Force resize
            }, 0); // sleep time
        }
    });
});
