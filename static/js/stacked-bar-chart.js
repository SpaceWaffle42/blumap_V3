document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializeStackedBarChart();
    }, 1000); // 1-second delay

    function initializeStackedBarChart() {
        var chartDom = document.getElementById('stacked-bar-chart');

        if (!chartDom) {
            console.error("Error: Element with ID 'stacked-bar-chart' not found!");
            return;
        }

        var myChart = echarts.init(chartDom);
        let hiddenSeries = new Set();

        function getRandomColor() {
            return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }

        async function fetchStackedBarData() {
            try {
                const response = await fetch('/data');
                if (!response.ok) throw new Error('Network response was not ok');
                const rawData = await response.json();

                if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('No valid data received');

                let selectedIPs = getSelectedSubnets();
                let selectedOS = document.querySelector("#os-filter").value;
                let selectedState = document.querySelector("#port-state").value;

                let hosts = [];
                let portData = {};
                let presetColors = { open: '#1f77b4', closed: '#d62728', filtered: '#9467bd' };
                let dynamicColors = {};
                let useDynamicColors = selectedState !== 'all';

                let filteredPorts = new Set();

                rawData.forEach(entry => {
                    const [host, details] = Object.entries(entry)[0];
                    if (!host || !details) return;
                    if (selectedIPs !== "all" && !selectedIPs.includes(host)) return;
                    if (selectedOS !== "all" && details.os_name && details.os_name.toLowerCase() !== selectedOS.toLowerCase()) return;

                    hosts.push(host);

                    let relevantPorts = [];

                    if (selectedState === 'open' || selectedState === 'all') relevantPorts.push(...details.port_open);
                    if (selectedState === 'closed' || selectedState === 'all') relevantPorts.push(...details.port_closed);
                    if (selectedState === 'filtered' || selectedState === 'all') relevantPorts.push(...details.port_filtered);

                    relevantPorts.forEach(port => filteredPorts.add(port));

                    relevantPorts.forEach(port => {
                        if (!portData[port]) {
                            portData[port] = { open: {}, closed: {}, filtered: {} };
                            dynamicColors[port] = getRandomColor();
                        }

                        if (selectedState === 'open' || selectedState === 'all') {
                            if (details.port_open.includes(port)) portData[port].open[host] = 1;
                        }
                        if (selectedState === 'closed' || selectedState === 'all') {
                            if (details.port_closed.includes(port)) portData[port].closed[host] = 1;
                        }
                        if (selectedState === 'filtered' || selectedState === 'all') {
                            if (details.port_filtered.includes(port)) portData[port].filtered[host] = 1;
                        }
                    });
                });

                return { hosts, portData, filteredPorts, presetColors, dynamicColors, useDynamicColors };
            } catch (error) {
                console.error('Error loading stacked bar chart data:', error.message);
                return { hosts: [], portData: {}, filteredPorts: new Set(), presetColors: {}, dynamicColors: {}, useDynamicColors: false };
            }
        }

        async function generateStackedBarChart() {
            myChart.clear();

            let { hosts, portData, filteredPorts, presetColors, dynamicColors, useDynamicColors } = await fetchStackedBarData();
            let seriesData = [];
            let legendData = [];
            let stackName = 'ports';

            filteredPorts.forEach(port => {
                let openData = hosts.map(host => (portData[port]?.open[host] ? { value: 1, ip: host } : null)).filter(val => val);
                let closedData = hosts.map(host => (portData[port]?.closed[host] ? { value: 1, ip: host } : null)).filter(val => val);
                let filteredData = hosts.map(host => (portData[port]?.filtered[host] ? { value: 1, ip: host } : null)).filter(val => val);

                if (openData.length > 0) {
                    seriesData.push({
                        name: `Port ${port} (Open)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: openData,
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.open }
                    });
                    legendData.push(`Port ${port} (Open)`);
                }

                if (closedData.length > 0) {
                    seriesData.push({
                        name: `Port ${port} (Closed)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: closedData,
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.closed }
                    });
                    legendData.push(`Port ${port} (Closed)`);
                }

                if (filteredData.length > 0) {
                    seriesData.push({
                        name: `Port ${port} (Filtered)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: filteredData,
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.filtered }
                    });
                    legendData.push(`Port ${port} (Filtered)`);
                }
            });

            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        let portType = params.seriesName.match(/\(([^)]+)\)/)[1];
                        let portNumber = params.seriesName.match(/\d+/)[0];
                        let ipAddress = params.data.ip || "Unknown";

                        return `IP: ${ipAddress}<br>Port: ${portNumber}<br>State: ${portType}`;
                    }
                },
                legend: {
                    orient: 'horizontal',
                    type: 'scroll',
                    data: legendData.length ? legendData : ["No Data Available"],
                    textStyle: { color: 'azure' }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    top: '3%',
                    bottom: '3%',
                    containLabel: true
                },
                yAxis: {
                    type: 'category',
                    data: hosts,
                    axisLabel: { interval: 0 },
                    axisTick: { alignWithLabel: true },
                    minInterval: 5
                },
                xAxis: {
                    type: 'value',
                    name: 'Port Count'
                },
                series: seriesData
            };

            myChart.setOption(option);
        }

        function attachFilterListeners() {
            document.querySelector("#port-state").addEventListener('change', generateStackedBarChart);
            document.querySelector("#os-filter").addEventListener('change', generateStackedBarChart);
            document.addEventListener("subnetChange", generateStackedBarChart);
        }

        attachFilterListeners();
        generateStackedBarChart();

        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }
});
