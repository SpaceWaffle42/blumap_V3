// Initialize the chart on the container
var chartDom = document.getElementById('network-diagram');
var myChart = echarts.init(chartDom);

// Generate some dynamic network data (routers and hosts)
function generateNetworkData() {
    // Routers (representing main network hubs)
    const routers = ['Router1', 'Router2', 'Router3', 'Router4'];

    // Generate a random number of hosts connected to each router
    const hosts = [];
    for (let i = 0; i < routers.length; i++) {
        let numHosts = Math.floor(Math.random() * 4) + 2; // Random number of hosts per router (2-5)
        for (let j = 0; j < numHosts; j++) {
            hosts.push({
                name: `Host${i * 10 + j + 1}`,
                symbolSize: 15,
                itemStyle: { color: '#00BFFF' }, // Color for host nodes
                category: i // Associate host with router category
            });
        }
    }

    // Create links between routers and hosts
    const links = [];
    for (let i = 0; i < routers.length; i++) {
        for (let j = 0; j < hosts.length; j++) {
            // Link hosts to routers based on category
            if (hosts[j].category === i) {
                links.push({
                    source: routers[i],
                    target: hosts[j].name,
                    lineStyle: { color: '#A9A9A9' } // Link color
                });
            }
        }
    }

    // Combine routers and hosts data
    const data = [
        ...routers.map((router, index) => ({
            name: router,
            symbolSize: 40,
            itemStyle: { color: '#ff6347' }, // Color for router nodes
            category: index, // Router category
            draggable: true  // Enable dragging for router nodes
        })),
        ...hosts.map(host => ({
            ...host,
            draggable: true  // Enable dragging for host nodes
        }))
    ];

    return { data, links };
}

// Fetch network data
const networkData = generateNetworkData();

// Graph option with dynamic network topology (Routers and Hosts)
var option = {
    tooltip: {
        formatter: '{b}'
    },
    series: [{
        type: 'graph',
        layout: 'force',
        force: {
            repulsion: 100, // Force distance between nodes
            edgeLength: 100, // Force length between connected nodes
            gravity: 0.1     // Force of gravity that attracts nodes towards the center
        },
        roam: true,  // Allow pan and zoom
        label: {
            show: true,
            position: 'right',
            formatter: '{b}'
        },
        edgeSymbol: 'none',  // No arrows on the edges
        edgeSymbolSize: [4, 10],
        data: networkData.data, // Dynamic nodes (routers and hosts)
        links: networkData.links // Dynamic links between nodes
    }]
};

// Set the option for the chart
myChart.setOption(option);

// Resize the chart when the window is resized
window.onresize = function () {
    myChart.resize();
};