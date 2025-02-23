document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializeStackedBarChart();
    }, 1000);

    function initializeStackedBarChart() {
        var chartDom = document.getElementById('stacked-bar-chart');
        if (!chartDom) {
            console.error("Error: Element with ID 'stacked-bar-chart' not found!");
            return;
        }

        var myChart = echarts.init(chartDom);

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
                let selectedOS = document.querySelector("#os-filter").value.toLowerCase();
                let selectedState = document.querySelector("#port-state").value;

                let hostSet = new Set();
                let portData = {};
                let presetColors = { open: '#1f77b4', closed: '#d62728', filtered: '#9467bd' };
                let dynamicColors = {};
                let useDynamicColors = selectedState !== 'all';
                let hostDetails = {}; // Store OS per IP

                rawData.forEach(entry => {
                    const [host, details] = Object.entries(entry)[0];
                    if (!host || !details) return;
                    if (selectedIPs !== "all" && !selectedIPs.includes(host)) return;

                    let osName = details.os_name ? details.os_name.toLowerCase() : "other";
                    hostDetails[host] = details.os_name || "Other";

                    if (selectedOS !== "all" && selectedOS !== "other" && !osName.includes(selectedOS)) {
                        return; // Remove IP if OS doesn't match
                    }

                    let relevantPorts = new Set();
                    if (selectedState === 'open' || selectedState === 'all') details.port_open.forEach(p => relevantPorts.add(p));
                    if (selectedState === 'closed' || selectedState === 'all') details.port_closed.forEach(p => relevantPorts.add(p));
                    if (selectedState === 'filtered' || selectedState === 'all') details.port_filtered.forEach(p => relevantPorts.add(p));

                    if (relevantPorts.size > 0) {
                        hostSet.add(host);
                        relevantPorts.forEach(port => {
                            if (!portData[port]) {
                                portData[port] = {};
                                dynamicColors[port] = getRandomColor();
                            }
                            portData[port][host] = {
                                open: details.port_open.includes(port) ? 1 : 0,
                                closed: details.port_closed.includes(port) ? 1 : 0,
                                filtered: details.port_filtered.includes(port) ? 1 : 0,
                                os_name: hostDetails[host]
                            };
                        });
                    }
                });

                return { hosts: Array.from(hostSet), portData, hostDetails, presetColors, dynamicColors, useDynamicColors };
            } catch (error) {
                console.error('Error loading stacked bar chart data:', error.message);
                return { hosts: [], portData: {}, hostDetails: {}, presetColors: {}, dynamicColors: {}, useDynamicColors: false };
            }
        }

        async function generateStackedBarChart() {
            myChart.clear();

            let { hosts, portData, hostDetails, presetColors, dynamicColors, useDynamicColors } = await fetchStackedBarData();
            let seriesData = [];
            let legendData = [];
            let stackName = 'ports';

            Object.entries(portData).forEach(([port, hostValues]) => {
                let openData = hosts.map(host => hostValues[host]?.open ? { value: 1, ip: host, os_name: hostValues[host]?.os_name } : null);
                let closedData = hosts.map(host => hostValues[host]?.closed ? { value: 1, ip: host, os_name: hostValues[host]?.os_name } : null);
                let filteredData = hosts.map(host => hostValues[host]?.filtered ? { value: 1, ip: host, os_name: hostValues[host]?.os_name } : null);

                if (openData.some(item => item !== null)) {
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

                if (closedData.some(item => item !== null)) {
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

                if (filteredData.some(item => item !== null)) {
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
                        let ipAddress = params.data?.ip || "Unknown";
                        let operatingSystem = params.data?.os_name || "Other";

                        return `IP: ${ipAddress}<br>Port: ${portNumber}<br>State: ${portType}<br>OS: ${operatingSystem}`;
                    }
                },
                legend: {
                    orient: 'horizontal',
                    type: 'scroll',
                    data: legendData.length ? legendData : ["No Data Available"],
                    textStyle: { color: 'azure' }
                },
                grid: { left: '3%', right: '4%', top: '3%', bottom: '3%', containLabel: true },
                yAxis: { type: 'category', data: hosts, axisLabel: { interval: 0 }, axisTick: { alignWithLabel: true } },
                xAxis: { type: 'value', name: 'Port Count' },
                series: seriesData
            };

            myChart.setOption(option);
        }

        document.querySelector("#port-state").addEventListener('change', generateStackedBarChart);
        document.querySelector("#os-filter").addEventListener('change', generateStackedBarChart);
        document.addEventListener("subnetChange", generateStackedBarChart);

        generateStackedBarChart();
        window.addEventListener('resize', () => myChart.resize());
    }
});
