var chartDom = document.getElementById('os-dist');
var myChart = echarts.init(chartDom);

var option = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        type: 'scroll',
        orient: 'horizontal',
        textStyle: {
            color: 'azure',
        },
        pageIconColor: 'azure',
    },
    series: [
        {
            name: 'OS Distribution',
            type: 'pie',
            radius: '50%',
            data: [
                { value: 1048, name: 'Windows 10' },
                { value: 735, name: 'Ubuntu' },
                { value: 580, name: 'Kali' },
                { value: 484, name: 'Windows 7' },
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
myChart.setOption(option);



function resizeChart() {
    myChart.resize();
}
window.onload = resizeChart;

window.onresize = resizeChart;
