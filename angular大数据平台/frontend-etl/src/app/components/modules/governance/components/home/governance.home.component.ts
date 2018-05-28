import {Component, OnInit, Renderer2} from '@angular/core';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import * as echarts from 'echarts';

@Component({
    selector: 'governance-home-component',
    templateUrl: './governance.home.component.html',
    styleUrls: ['./governance.home.component.scss']
})
export class GovernanceHomeComponent implements OnInit {

    timesArr = [{
        checked: true,
        name: '今天',
        value: '0'
    }, {
        checked: false,
        name: '昨天',
        value: '1'
    }, {
        checked: false,
        name: '本周',
        value: '2'
    }, {
        checked: false,
        name: '本月',
        value: '3'
    }];
    option: any;
    presentTime: any;
    tableList = [];
    noData = false;
    resizeEventHook: any;

    constructor (private governanceService: GovernanceService,
                 private modalService: ModalService,
                 private render: Renderer2) {
        this.presentTime = this.timesArr[0];
        this.option = {
            legend: {
                data: [{
                    name: '数据总数'
                }],
                icon: 'rect',
                textStyle: {
                    color: '#1C96D4',
                    fontSize: '14'
                },
                left: '40',
                itemWidth: 14
            },
            tooltip : {
                trigger: 'axis'
            },
            grid: {
                left: '20px',
                right: '20px',
                bottom: '30px',
                containLabel: true
            },
            textStyle: {
                color: '#6FA5DE'
            },
            xAxis : {
                type : 'category',
                data: [],
                axisLine: {
                    lineStyle: {
                        color: '#9BC5EA',
                    }
                },
                axisLabel: {
                    color: '#9BC5EA',
                }
            },
            yAxis : {
                type : 'value',
                name: '总量',
                splitLine: {
                    show: true,
                    lineStyle : {
                        color : '#CFE5F9',
                        type : 'dashed',
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#9BC5EA',
                    }
                },
                axisLabel: {
                    color: '#9BC5EA',
                }
            },
            series : [
                {
                    name: '数据总数',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color:  new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#08B994'
                            }, {
                                offset: 1,
                                color: '#C6F28B '
                            }]),
                            // shadowColor: 'rgba(0, 0, 0, 0.7)',
                            // shadowBlur: -3
                        }
                    },
                    barWidth: '40',
                    barGap: 30,
                    barCategoryGap: 30,
                    data: []
                }
            ]
        };
    }

    ngOnInit () {
        let obj = this.getTodayTime(new Date());
        this.getData(obj);
    }

    /**
     * 获取数据
     */
    getData (timeObj: any) {
        this.governanceService.getHomeData(timeObj).then(d => {
            if (d.success && JSON.stringify(d.message) !== '{}') {
                this.option.series[0].data = [];
                this.option.xAxis.data = [];
                let chartArr = d.message['dataCountVos'] || [];
                chartArr.forEach(item => {
                    this.option.series[0].data.unshift(item.dataCount);
                    this.option.xAxis.data.unshift(item.date.substr(5));
                });
                this.tableList = d.message.dsInfoCountVos;
                if (!this.tableList || this.tableList.length === 0) {
                    this.noData = true;
                }
                let chart = echarts.init(document.getElementsByClassName('chart-box')[0]);
                // 重绘图表
                chart.setOption(this.option, true);
                this.resize(chart);
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 时间切换
     * item 当强项
     */
    timeChange (item: any) {
        if (this.presentTime !== item) {
            let obj = this.getTodayTime(new Date());
            this.presentTime = item;
            this.timesArr.forEach(present => {
                present.checked = false;
            });
            item.checked = true;
            if (item.value === '0') {
                this.getData(obj);
            } else if (item.value === '1') {
                let startTime = obj['startTime'] - 24 * 60 * 60 * 1000;
                let endTime = obj['endTime'] - 24 * 60 * 60 * 1000;
                this.getData({startTime: startTime, endTime: endTime});
            } else if (item.value === '2') {
                // 一天的毫秒数
                let millisecond = 1000 * 60 * 60 * 24;
                // 获取当前时间
                let currentDate = new Date();
                // 返回date是一周中的某一天
                let week = currentDate.getDay();
                // 减去的天数
                let minusDay = (week !== 0 ? week - 1 : 6);
                // 获得当前周的第一天
                let currentWeekFirstDay = new Date(currentDate.getTime() - (millisecond * minusDay));

                let startTime = this.getTodayTime(currentWeekFirstDay).startTime;
                let endTime = this.getTodayTime(new Date()).endTime;
                this.getData({startTime: startTime, endTime: endTime});
            } else if (item.value === '3') {
                let start = new Date(new Date().setDate(1));
                let startTime = this.getTodayTime(start).startTime;
                let endTime = this.getTodayTime(new Date()).endTime;
                this.getData({startTime: startTime, endTime: endTime});
            }
        }
    }

    /**
     * 获取当天时间开始和结尾
     */
    getTodayTime(data: any) {
        const year = data.getFullYear();
        let month = String(data.getMonth() + 1);
        let day = String(data.getDate());
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        let startTime = new Date(`${year}/${month}/${day} 00:00:00`).getTime();
        let endTime = new Date(`${year}/${month}/${day} 23:59:59`).getTime();
        return {startTime: startTime, endTime: endTime};
    }

    /*
    * 监听窗口尺寸变化，重绘图表
    * @param {any} lineChart
    * @param {any} barChart
     */
    resize(chart: any) {
        this.resizeEventHook = this.render.listen(window, 'resize', () => {
            chart.resize();
        });
    }
}
