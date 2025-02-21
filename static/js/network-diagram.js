var chartDom = document.getElementById('network-diagram');
var myChart = echarts.init(chartDom);

async function fetchNetworkData() {
    try {
        const response = await fetch('/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const rawData = await response.json();
        if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('No valid data received');
        
        let nodes = [], links = [];
        let ipGroups = {};
        
        rawData.forEach(entry => {
            const [host, details] = Object.entries(entry)[0];
            if (!host || !details) return;
            
            let osName = details.os_name || "Unknown";
            let color = '#FF6347'; // Default (red)
            if (osName.includes('Windows')) color = '#0000FF'; // Blue for Windows
            else if (osName.includes('Mac') || osName.includes('Apple')) color = '#008000'; // Green for Apple
            else if (osName.includes('Linux') || osName.includes('Ubuntu') || osName.includes('Kali')) color = '#FFD700'; // Yellow for Linux
            
            let ipParts = host.split('.');
            if (ipParts.length !== 4) return;
            let ipBase = ipParts.slice(0, 3).join('.'); // Extract first three octets
            if (!ipGroups[ipBase]) ipGroups[ipBase] = [];
            ipGroups[ipBase].push({ host, color, osName });
        });
        
        Object.keys(ipGroups).forEach(ipBase => {
            let sortedHosts = ipGroups[ipBase].sort((a, b) => {
                return parseInt(a.host.split('.')[3]) - parseInt(b.host.split('.')[3]); // Sort by last octet numerically
            });
            let masterNode = sortedHosts[0];
            let borderColor = masterNode.color; // Assign master node border based on OS color
            
            if (!nodes.some(n => n.name === masterNode.host)) {
                nodes.push({ name: masterNode.host, symbolSize: 50, itemStyle: { color: '#FFA500', borderColor: borderColor, borderWidth: 3 }, category: 1, draggable: true, label: { show: true, formatter: masterNode.host } });
            }
            
            sortedHosts.slice(1).forEach(({ host, color }) => {
                nodes.push({ name: host, symbolSize: 40, itemStyle: { color: color }, category: 0, draggable: true, label: { show: true, position: 'inside', formatter: host.split('.')[3] } });
                links.push({ source: masterNode.host, target: host, lineStyle: { color: '#A9A9A9' } });
            });
        });
        
        return { nodes, links, rawData };
    } catch (error) {
        console.error('Error loading network data:', error.message);
        return { nodes: [], links: [], rawData: [] };
    }
}

async function generateNetworkGraph() {
    let { nodes, links, rawData } = await fetchNetworkData();
    if (nodes.length === 0) {
        console.error('No nodes to display');
        return;
    }
    
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                let nodeData = rawData.find(entry => Object.keys(entry)[0] === params.name);
                if (nodeData) {
                    let details = Object.values(nodeData)[0];
                    return `<b>IP:</b> ${params.name}<br><b>Hostname:</b> ${details.host_name || 'Unknown'}<br><b>OS:</b> ${details.os_name || 'Unknown'}`;
                }
                return params.name;
            }
        },
        series: [{
            type: 'graph',
            layout: 'force',
            force: { repulsion: 100, edgeLength: 100, gravity: 0.1 },
            roam: true,
            label: { show: true, position: 'right' },
            edgeSymbol: 'none',
            data: nodes,
            links: links
        }]
    };
    myChart.setOption(option);
}

generateNetworkGraph();

window.addEventListener('resize', function () {
    myChart.resize();
});

document.querySelectorAll('.tabs a').forEach(function (tab) {
    tab.addEventListener('click', function () {
        const activeTab = this.getAttribute('href');
        if (activeTab === '#network') {
            setTimeout(() => {
                myChart.resize();
            }, 0);
        }
    });
});
