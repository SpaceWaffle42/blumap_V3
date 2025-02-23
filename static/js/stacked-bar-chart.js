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

                let allPorts = new Set();

                rawData.forEach(entry => {
                    const [host, details] = Object.entries(entry)[0];
                    if (!host || !details) return;
                    if (selectedIPs !== "all" && !selectedIPs.includes(host)) return;
                    if (selectedOS !== "all" && details.os_name && details.os_name.toLowerCase() !== selectedOS.toLowerCase()) return;

                    hosts.push(host);

                    details.port_open.forEach(port => allPorts.add(port));
                    details.port_closed.forEach(port => allPorts.add(port));
                    details.port_filtered.forEach(port => allPorts.add(port));

                    [...details.port_open, ...details.port_closed, ...details.port_filtered].forEach(port => {
                        if (!portData[port]) {
                            portData[port] = { open: {}, closed: {}, filtered: {} };
                            dynamicColors[port] = getRandomColor();
                        }

                        portData[port].open[host] = details.port_open.includes(port) ? 1 : 0;
                        portData[port].closed[host] = details.port_closed.includes(port) ? 1 : 0;
                        portData[port].filtered[host] = details.port_filtered.includes(port) ? 1 : 0;
                    });
                });

                return { hosts, portData, allPorts, presetColors, dynamicColors, useDynamicColors };
            } catch (error) {
                console.error('Error loading stacked bar chart data:', error.message);
                return { hosts: [], portData: {}, allPorts: new Set(), presetColors: {}, dynamicColors: {}, useDynamicColors: false };
            }
        }

        async function generateStackedBarChart() {
            myChart.clear();

            let { hosts, portData, allPorts, presetColors, dynamicColors, useDynamicColors } = await fetchStackedBarData();
            let seriesData = [];
            let legendData = [];
            let stackName = 'ports';

            allPorts.forEach(port => {
                let openData = hosts.map(host => portData[port]?.open[host] ?? 0);
                let closedData = hosts.map(host => portData[port]?.closed[host] ?? 0);
                let filteredData = hosts.map(host => portData[port]?.filtered[host] ?? 0);

                if (openData.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Open)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: openData.map((value, i) => ({ value, ip: hosts[i] })),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.open }
                    });
                    legendData.push(`Port ${port} (Open)`);
                }

                if (closedData.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Closed)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: closedData.map((value, i) => ({ value, ip: hosts[i] })),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.closed }
                    });
                    legendData.push(`Port ${port} (Closed)`);
                }

                if (filteredData.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Filtered)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: filteredData.map((value, i) => ({ value, ip: hosts[i] })),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.filtered }
                    });
                    legendData.push(`Port ${port} (Filtered)`);
                }
            });

            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        let portType = params.seriesName.match(/\(([^)]+)\)/)[1]; // Extract state from series name
                        let portNumber = params.seriesName.match(/\d+/)[0]; // Extract port number
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
