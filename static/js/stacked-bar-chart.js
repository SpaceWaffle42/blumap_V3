document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        console.log("Initializing stacked bar chart after 1-second delay...");
        initializeStackedBarChart();
    }, 1000); // 1-second delay

    function initializeStackedBarChart() {
        var chartDom = document.getElementById('stacked-bar-chart');

        if (!chartDom) {
            console.error("Error: Element with ID 'stacked-bar-chart' not found!");
            return;
        }

        var myChart = echarts.init(chartDom);
        let hiddenSeries = new Set(); // Store hidden series for toggling

        function getRandomColor() {
            return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }

        async function fetchStackedBarData() {
            try {
                console.log("Fetching Stacked Bar Chart Data...");
                const response = await fetch('/data');
                if (!response.ok) throw new Error('Network response was not ok');
                const rawData = await response.json();
                console.log("Raw Data Received:", rawData);

                if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('No valid data received');

                let selectedIPs = getSelectedSubnets();
                let selectedOS = document.querySelector("#os-filter").value;
                let selectedState = document.querySelector("#port-state").value;

                console.log("Selected Filters:", { selectedIPs, selectedOS, selectedState });

                let hosts = [];
                let portData = {};
                let presetColors = { open: '#1f77b4', closed: '#d62728', filtered: '#9467bd' };
                let dynamicColors = {};
                let useDynamicColors = selectedState !== 'all';

                rawData.forEach(entry => {
                    const [host, details] = Object.entries(entry)[0];
                    if (!host || !details) return;
                    if (selectedIPs !== "all" && !selectedIPs.includes(host)) return;
                    if (selectedOS !== "all" && details.os_name && details.os_name.toLowerCase() !== selectedOS.toLowerCase()) return;

                    hosts.push(host);

                    [...details.port_open, ...details.port_closed, ...details.port_filtered].forEach(port => {
                        if (!portData[port]) {
                            portData[port] = { open: [], closed: [], filtered: [] };
                            dynamicColors[port] = getRandomColor();
                        }

                        if (selectedState === 'open' || selectedState === 'all') {
                            portData[port].open.push(details.port_open.includes(port) ? 1 : 0);
                        } else {
                            portData[port].open.push(0);
                        }

                        if (selectedState === 'closed' || selectedState === 'all') {
                            portData[port].closed.push(details.port_closed.includes(port) ? 1 : 0);
                        } else {
                            portData[port].closed.push(0);
                        }

                        if (selectedState === 'filtered' || selectedState === 'all') {
                            portData[port].filtered.push(details.port_filtered.includes(port) ? 1 : 0);
                        } else {
                            portData[port].filtered.push(0);
                        }
                    });
                });

                return { hosts, portData, presetColors, dynamicColors, useDynamicColors };
            } catch (error) {
                console.error('Error loading stacked bar chart data:', error.message);
                return { hosts: [], portData: {}, presetColors: {}, dynamicColors: {}, useDynamicColors: false };
            }
        }

        async function generateStackedBarChart() {
            console.log("Generating Stacked Bar Chart...");

            myChart.clear();

            let { hosts, portData, presetColors, dynamicColors, useDynamicColors } = await fetchStackedBarData();
            let seriesData = [];
            let legendData = [];
            let stackName = 'ports';

            Object.entries(portData).forEach(([port, data]) => {
                if (data.open.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Open)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: data.open.map(value => Math.round(value)),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.open }
                    });
                    legendData.push(`Port ${port} (Open)`);
                }

                if (data.closed.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Closed)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: data.closed.map(value => Math.round(value)),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.closed }
                    });
                    legendData.push(`Port ${port} (Closed)`);
                }

                if (data.filtered.some(val => val > 0)) {
                    seriesData.push({
                        name: `Port ${port} (Filtered)`,
                        type: 'bar',
                        stack: stackName,
                        barMinHeight: 10,
                        data: data.filtered.map(value => Math.round(value)),
                        itemStyle: { color: useDynamicColors ? dynamicColors[port] : presetColors.filtered }
                    });
                    legendData.push(`Port ${port} (Filtered)`);
                }
            });

            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        return `${params.marker} ${params.seriesName}: ${Math.round(params.value)}`;
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
            console.log("Stacked Bar Chart Updated Successfully");

            myChart.on('click', function (params) {
                let seriesName = params.seriesName;
                if (hiddenSeries.has(seriesName)) {
                    hiddenSeries.delete(seriesName);
                } else {
                    hiddenSeries.add(seriesName);
                }

                myChart.dispatchAction({
                    type: 'legendToggleSelect',
                    name: seriesName
                });

                console.log(`Toggled visibility for: ${seriesName}`);
            });
        }

        function attachFilterListeners() {
            console.log("Attaching event listeners...");

            document.querySelector("#port-state").addEventListener('change', () => {
                console.log("Port State Changed");
                generateStackedBarChart();
            });

            document.querySelector("#os-filter").addEventListener('change', () => {
                console.log("OS Filter Changed");
                generateStackedBarChart();
            });

            document.addEventListener("subnetChange", () => {
                console.log("Subnet Selection Changed");
                generateStackedBarChart();
            });
        }

        attachFilterListeners();
        generateStackedBarChart();

        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }
});
