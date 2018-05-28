/**
 * Created by lh on 2017/12/16.
 *  ETL 首页
 */

import * as echarts from 'echarts';
import {Component, OnInit, Renderer2, OnDestroy } from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {TaskService} from 'app/services/task.service';

@Component({
    selector: 'task-home-component',
    templateUrl: './task.home.component.html',
    styleUrls: ['./task.home.component.scss']
})
export class TaskHomeComponent implements OnInit , OnDestroy {
    showloading: boolean = true;
    chartOption: any;
    resultRatio: number = 0;            // 任务完成率
    successRatio: number = 0;           // 清洗成功率

    dbCount: any;                       // 数据仓库数
    dbTableCount: any;                  // 数据仓库表数
    dsCount: any;                       // 数据源数
    taskCount: any;                     // 今日任务总数
    dsTableCount: any;                  // 数据源表数
    failTaskCount: any;                 // 失败任务数当页显示集合
    totalFailTasks: any;                // 失败任务数总集合

    letfTabs = [
        {name: '清洗总数', checked: true, type: 'all', value: 0},
        {name: '清洗成功数', checked: false, type: 'success', value: 0},
        {name: '脏数据数', checked: false, type: 'dirty', value: 0}
    ];                                  // 图表切换
    innerHeight: number = 0;
    hidePanelEventHook: any;

    cleanTotalArr = [];                 // 清洗总数集合
    cleanSuccessArr = [];               // 清洗成功集合
    dirtyArr = [];                      // 脏数据集合
    failTasks: any;                     // 失败列表当前页显示项集合
    pageNow = 1;                        // 当前页码
    pageSize = 28;                      // 每页显示条数
    noNext = false;                     // 无下一页
    noPre = true;                       // 无上一页

    noTotalAuthority: any;              // 没有页面header部分统计接口访问权限
    noChartAuthority: any;              // 没有表类接口访问权限

    constructor(
        private taskService: TaskService,
        private render: Renderer2,
        private modalService: ModalService
    ) {
        this.chartOption = {
            legend: {
                data: [{
                    name: '清洗总数'
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
                left: '10px',
                right: '20px',
                bottom: '30px',
                containLabel: true
            },
            textStyle: {
                color: '#6FA5DE'
            },
            xAxis : {
                // name: '天',
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
                    name: '清洗总数',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color:  new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#08B994'
                            }, {
                                offset: 1,
                                color: '#C6F28B'
                            }]),
                        }
                    },
                    barWidth: '27%',
                    data: []
                }
            ]
        };
        this.getIndexData();
    }
    ngOnInit() {
        let innerHeight = (document.body.clientHeight - 350);
        this.innerHeight = innerHeight;
    }
    ngOnDestroy() {
        this.hidePanelEventHook = null;
    }

    /**
     * 获取首页数据
     */
    getIndexData() {
        this.taskService.getIndexSources().then(d => {
            let innerHeight = (document.body.clientHeight - 350);
            this.innerHeight = innerHeight;
            if (d.success && d.message) {
                this.noChartAuthority = false;
                this.failTaskCount = d.message.failTaskCount || 0;
                // 判断失败列表有没有上一页和下一页
                this.totalFailTasks = d.message.failTasks;
                this.failTasks = JSON.parse(JSON.stringify(this.totalFailTasks)).splice(0, this.pageSize);
                if (!this.failTaskCount || Number(this.failTaskCount) <= this.pageSize) {
                    this.noPre = true;
                    this.noNext = true;
                }
                if (d.message.indexChartCountVos && d.message.indexChartCountVos.length) {
                    // 清洗成功率、任务完成率 计算
                    let successRatio = (d.message.indexChartCountVos[0].outputCount && Number(d.message.indexChartCountVos[0].inputCount) ?
                        (Number(d.message.indexChartCountVos[0].outputCount) / Number(d.message.indexChartCountVos[0].inputCount) * 100).toFixed(1) : 0);
                    let resultRatio = (d.message.successTaskCount !== '0' || d.message.failTaskCount !== '0' ?
                        (Number(d.message.successTaskCount) / (Number(d.message.successTaskCount) + Number(d.message.failTaskCount)) * 100).toFixed(1) :
                        0);
                    this.successRatio = Number(successRatio) > 100 ? 100 : Number(successRatio);
                    this.resultRatio = Number(resultRatio) > 100 ? 100 : Number(resultRatio);
                } else if (!d.message.indexChartCountVos || d.message.indexChartCountVos.length === 0) {
                    this.successRatio = 0;
                    this.resultRatio = 0;
                }


                // 柱状图数据填充
                let dateArr = [];
                d.message.indexChartCountVos.forEach((item, index) => {
                    this.cleanSuccessArr.unshift(item.outputCount || 0);
                    this.cleanTotalArr.unshift(item.inputCount || 0);
                    this.dirtyArr.unshift(item.dirtyCount || 0);
                    dateArr.unshift(item.date.substr(5));
                });
                this.chartOption.series[0].data = this.cleanTotalArr;
                this.chartOption.xAxis.data = dateArr;
                // 清洗总数   清洗成功数   脏数据数
                this.letfTabs[0].value = d.message.indexChartCountVos[0].inputCount || 0;
                this.letfTabs[1].value = d.message.indexChartCountVos[0].outputCount || 0;
                this.letfTabs[2].value = d.message.indexChartCountVos[0].dirtyCount || 0;

                let chart = echarts.init(document.getElementsByClassName('chart-box')[0]);
                // 重绘图表
                chart.setOption(this.chartOption, true);
                this.hidePanelEvent(chart);
            } else if (d.code === 115) {
                this.noChartAuthority = true;
            } else {
                this.noChartAuthority = false;
                this.modalService.alert(d.message);
            }
        });

        this.taskService.getIndexTotal().then(d => {
            if (d.success && d.message) {
                this.noTotalAuthority = false;
                this.dbCount = d.message.dbCount || 0;
                this.dbTableCount = d.message.dbTableCount || 0;
                this.dsCount = d.message.dsCount || 0;
                this.dsTableCount = d.message.dsTableCount || 0;
            } else if (d.code === 115) {
                this.noTotalAuthority = true;
            } else {
                this.noTotalAuthority = false;
                this.modalService.alert(d.message);
            }
        });
    }
    /*
    * 监听窗口尺寸变化，重绘图表
    * @param {any} lineChart
    * @param {any} barChart
     */
    hidePanelEvent(chart: any) {
        this.hidePanelEventHook = this.render.listen(window, 'resize', () => {
            let height = (document.body.clientHeight - 350);
            this.innerHeight = (height > 200 ? height : 200);
            chart.resize();
        });
    }

    /**
     * 左边tab测试
     */
    resetLeftCanvas(item) {
        if (!item.checked) {
            this.letfTabs.forEach(item => {
                item.checked = false;
            });
            item.checked = true;
            if (item.type === 'success') {
                this.chartOption.series[0].data = this.cleanSuccessArr;
                this.chartOption.series[0].name = '清洗成功数';
                this.chartOption.legend.data[0].name = '清洗成功数'
            } else if (item.type === 'all') {
                this.chartOption.series[0].data = this.cleanSuccessArr;
                this.chartOption.series[0].name = '清洗总数';
                this.chartOption.legend.data[0].name = '清洗总数'
            } else {
                this.chartOption.series[0].data = this.dirtyArr;
                this.chartOption.series[0].name = '脏数据数';
                this.chartOption.legend.data[0].name = '脏数据数'
            }
            let chart = echarts.init(document.getElementsByClassName('chart-box')[0]);
            // 重绘图表
            chart.setOption(this.chartOption, true);
        }
    }

    /**
     * 失败任务列表上一页
     */
    previousPage() {
        if (this.pageNow <=1) {
            this.noPre = true;
            return;
        }
        this.pageNow = this.pageNow - 1;
        let num = (this.pageNow > 1 ? (this.pageSize * this.pageNow - 1) : 0);
        this.failTasks = JSON.parse(JSON.stringify(this.totalFailTasks)).splice(num, this.pageSize);
        this.noNext = false;
        if (this.pageNow === 1) {
            this.noPre = true;
        }
    }

    /**
     * 失败任务列表下一页
     */
    nextPage() {
        if (this.pageNow * this.pageSize >= this.failTaskCount) {
            this.noNext = true;
            return;
        }
        this.failTasks = JSON.parse(JSON.stringify(this.totalFailTasks)).splice(this.pageSize * this.pageNow, this.pageSize);
        this.pageNow = this.pageNow + 1;
        this.noPre = false;
        if (this.pageNow * this.pageSize >= this.failTaskCount) {
            this.noNext = true;
        }
    }
}
