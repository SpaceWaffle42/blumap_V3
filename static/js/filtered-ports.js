// Prepare the data for the chart
var chartDom = document.getElementById('filtered');
var myChart = echarts.init(chartDom);

var option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        orient: 'horizontal',
        type: 'scroll',
        data: ['Port 80', 'Port 443', 'Port 8080'],
        textStyle: {
            color: 'azure',
        },
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
        data: ['192.168.0.1', '192.168.0.2', '192.168.0.3', '192.168.0.4'], // Example IPs
        axisLabel: {
            interval: 0,  // Show all IPs
        }
    },
    xAxis: {
        type: 'value',
        name: 'Open Ports',
    },
    series: [
        {
            name: 'Port 80',
            type: 'bar',
            stack: 'open-ports',  // Stack group name
            data: [1, 1, 1, 1],  // Open ports for port 80 across IPs
        },
        {
            name: 'Port 443',
            type: 'bar',
            stack: 'open-ports',
            data: [1, 1, 1],
        },
        {
            name: 'Port 8080',
            type: 'bar',
            stack: 'open-ports',
            data: [1, 1],
        }
    ]
};

// Set the option for the chart
myChart.setOption(option);



window.onresize = function () {
    myChart.resize();
};