document.addEventListener("DOMContentLoaded", function () {
    setTimeout(initializePieChart, 1000); // 1-second delay before initializing

    function initializePieChart() {
        var chartDom = document.getElementById("os-dist");

        if (!chartDom) {
            console.error("Error: Element with ID 'os-dist' not found!");
            return;
        }

        var myChart = echarts.init(chartDom);

        async function fetchOSPieChartData() {
            try {
                console.log("Fetching OS Pie Chart Data...");
                const response = await fetch("/data");
                if (!response.ok) throw new Error("Network response was not ok");
                const rawData = await response.json();
                console.log("Raw Data Received:", rawData);

                if (!Array.isArray(rawData) || rawData.length === 0) throw new Error("No valid data received");

                let selectedIPs = getSelectedSubnets();
                let selectedOS = document.querySelector("#os-filter").value;

                console.log("Selected Filters:", { selectedIPs, selectedOS });

                let osData = {};

                rawData.forEach(entry => {
                    const [host, details] = Object.entries(entry)[0];
                    if (!host || !details) return;

                    let osName = details.os_name || "Unknown";
                    if (selectedOS !== "all" && osName.toLowerCase() !== selectedOS.toLowerCase()) return;
                    if (selectedIPs !== "all" && !selectedIPs.includes(host)) return;

                    if (!osData[osName]) {
                        osData[osName] = { count: 0, ips: [] };
                    }
                    osData[osName].count += 1;
                    osData[osName].ips.push(host);
                });

                let finalData = Object.entries(osData).map(([name, data]) => ({
                    name,
                    value: data.count,
                    ips: data.ips
                }));

                console.log("Final Data for Pie Chart:", finalData);
                return finalData;
            } catch (error) {
                console.error("Error loading OS Pie Chart data:", error.message);
                return [];
            }
        }

        async function generateOSPieChart() {
            console.log("Generating OS Pie Chart...");
            let data = await fetchOSPieChartData();

            var option = {
                title: {
                    left: "center",
                    textStyle: { color: "azure" },
                },
                tooltip: {
                    trigger: "item",
                    formatter: function (params) {
                        let ipList = params.data.ips || [];
                        let displayIPs = ipList.slice(0, 5).join(", "); // Show first 5 IPs
                        let moreCount = ipList.length - 10;
                        let extraInfo = moreCount > 0 ? `... (${moreCount} more IPs)` : "";

                        return `<b>${params.name}</b><br>
                                Count: ${params.value} (${params.percent}%)<br>
                                <small>IPs: ${displayIPs} ${extraInfo}</small>`;
                    }
                },
                series: [
                    {
                        name: "OS",
                        type: "pie",
                        radius: "50%",
                        data: data,
                        label: {
                            color: "azure",
                        },
                    },
                ],
            };

            myChart.setOption(option);
            console.log("Pie Chart Updated Successfully");
        }

        function attachFilterListeners() {
            console.log("Attaching event listeners...");

            document.addEventListener("subnetChange", () => {
                console.log("Subnet IP Selection Changed");
                generateOSPieChart();
            });

            document.querySelectorAll(".subnet-option").forEach(checkbox => {
                checkbox.addEventListener("change", () => {
                    console.log("IP Checkbox Selection Changed", getSelectedSubnets());
                    generateOSPieChart();
                });
            });

        }

        attachFilterListeners();
        generateOSPieChart();

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }
});
