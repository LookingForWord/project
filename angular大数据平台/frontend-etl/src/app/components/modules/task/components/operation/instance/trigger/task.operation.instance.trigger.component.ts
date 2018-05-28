import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {OperationService} from 'app/services/operation.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import * as echarts from 'echarts';

@Component({
    selector: 'task-operation-instance-trigger-component',
    templateUrl: 'task.operation.instance.trigger.component.html',
    styleUrls: ['./task.operation.instance.trigger.component.scss']
})
export class TaskOperationInstanceTriggerComponent implements OnInit, OnChanges {
    @Input()
    task: any;
    @Output() closePanel = new EventEmitter<any>();
    tabId = '0';
    present: any;
    presentTimes = [];
    runLog = [];                    // 日志集合
    noLog = false;                  // 是否有日志
    chartOption: any;
    constructor(private operationService: OperationService,
                private modalService: ModalService) {

    }

    ngOnInit () {
        for (let i = 1; i < 7; i++) {
            this.presentTimes.push({
                name: `过去${i * 2}小时`,
                value: (i * 2)
            });
        }
        this.presentTimes = this.presentTimes.concat([{name: '过去24小时', value: 24}, {name: '过去48小时', value: 48}]);
        this.present = this.presentTimes[0];

        this.chartOption = {
            tooltip: {
                trigger: 'axis',
                    axisPointer: {              // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'              // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: ['脏数据数', '采集数', '清洗成功数'],
                icon: 'rect',
                textStyle: {
                    color: '#1C96D4',
                    fontSize: '14'
                },
                itemWidth: 14
            },
            grid: {
                left: '1%',
                right: '1%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : []
                }
            ],
                yAxis : [
                {
                    type : 'value'
                }
            ],
            barGap: 0,
            series : [
                {
                    name: '脏数据数',
                    type: 'bar',
                    // stack: '总量',
                    data: []
                },
                {
                    name: '采集数',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color:  new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#CAA307'
                            }, {
                                offset: 1,
                                color: '#FDFE89'
                            }]),
                        }
                    },
                    data: []
                },
                {
                    name: '清洗成功数',
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
                    data: []
                },
            ],
            dataZoom: [{
                startValue: ''
            }, {
                type: 'inside'
            },  {
                show: false,
                yAxisIndex: 0,
                filterMode: 'empty',
                width: 30,
                height: '80%',
                showDataShadow: false,
                // left: '93%'
            }],
        };
        // 获取实时监控数据
        this.getWorkTaskkLog();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['task'].previousValue && changes['task'].currentValue && changes['task'].currentValue !== changes['task'].previousValue) {
            this.getWorkTaskkLog();
        }
    }

    /**
     * tab切换
     */
    togglePanelTab(tabId: any, $event: MouseEvent) {
        if (tabId === this.tabId) {
            return;
        }
        this.tabId = tabId;
        $event.stopPropagation();
    }

    /**
     * 关闭侧边栏
     */
    hideRightPannel($event: MouseEvent) {
        this.closePanel.emit(true);
        $event.stopPropagation();
    }

    /**
     * 时间间隔选择
     * @param value
     */
    timeChange(value: any) {
        this.present = value;
        this.getWorkTaskkLog();
    }

    /**
     * 说去实时监控数据
     */
    getWorkTaskkLog() {
        this.chartOption.series[0].data = [];
        this.chartOption.series[1].data = [];
        this.chartOption.series[2].data = [];
        this.chartOption.xAxis[0].data = [];
        this.chartOption.dataZoom[0].startValue = '';
        this.operationService.getWorkflowLog({
            flowId: this.task.id,
            time: this.present.value
        }).then(d => {
            if (d.success && d.message) {
                let date = [];
                let data = [];
                if (d.message.list && d.message.list.length) {
                    d.message.list.sort(this.compare('date'));
                    d.message.list.forEach((item, index) => {
                        let now = new Date(Number(item.date));
                        date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                        this.chartOption.series[0].data.push(item.dirty);
                        this.chartOption.series[1].data.push(item.total);
                        this.chartOption.series[2].data.push(item.success);
                        if (index < d.message.list.length - 1 && d.message.list[index + 1].date - item.date > 60 * 1000) {
                            let num = Math.floor((d.message.list[index + 1].date / d.message.list[index].date) / 60 / 1000);
                            for (let i = 1; i < num; i++) {
                                let now = new Date(Number(item.date) + i * 60 * 1000);
                                date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                                this.chartOption.series[0].data.push(0);
                                this.chartOption.series[1].data.push(0);
                                this.chartOption.series[2].data.push(0);
                            }
                        }
                    });
                    let present = new Date().getTime();
                    let minusResult = present - Number(d.message.list[d.message.list.length - 1]['date']);
                    if ( minusResult > (60 * 60 * 1000) ) {
                        let num = Math.ceil(minusResult / ( 30 * 60 * 1000));
                        for (let i = num; i >= 0 ; i--) {
                            let now = new Date(present - i * 30 * 60 * 1000);
                            date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                            this.chartOption.series[0].data.push(0);
                            this.chartOption.series[1].data.push(0);
                            this.chartOption.series[2].data.push(0);
                        }
                    }
                } else {
                    let present = new Date().getTime();
                    let num = Math.ceil(Number(this.present.value) / 0.5);
                    for (let i = num; i >= 0 ; i--) {
                        let now = new Date(present - i * 30 * 60 * 1000);
                        date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                        this.chartOption.series[0].data.push(0);
                        this.chartOption.series[1].data.push(0);
                        this.chartOption.series[2].data.push(0);
                    }
                }
                // d.message.list.sort(this.compare('date'));
                // d.message.list.forEach((item, index) => {
                //     let now = new Date(Number(item.date));
                //     date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                //     this.chartOption.series[0].data.push(item.dirty);
                //     this.chartOption.series[1].data.push(item.total);
                //     this.chartOption.series[2].data.push(item.success);
                //     if (index < d.message.list.length - 1 && d.message.list[index + 1].date - item.date > 60 * 1000) {
                //         let num = Math.floor((d.message.list[index + 1].date / d.message.list[index].date) / 60 / 1000);
                //         for (let i = 1; i < num; i++) {
                //             let now = new Date(Number(item.date) + i * 60 * 1000);
                //             date.push(this.addZero(now.getHours()) + ':' + this.addZero(now.getMinutes()));
                //             this.chartOption.series[0].data.push(0);
                //             this.chartOption.series[1].data.push(0);
                //             this.chartOption.series[2].data.push(0);
                //         }
                //     }
                // });
                this.chartOption.xAxis[0].data = date;
                this.chartOption.dataZoom[0].startValue = this.chartOption.xAxis[0].data[0];
                let chart = echarts.init(document.getElementsByClassName('chart-box')[1]);
                // 重绘图表
                chart.setOption(this.chartOption, true);
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 时分补零
     * @param present
     * @returns {any}
     */
    addZero(present: any) {
        if (!present) {
            return '00';
        }
        if (present < 10) {
            return '0' + present;
        }
        return present;
    }

    /**
     * 导入字段按position排序
     * @param property
     * @returns {(a, b) => number}
     */
    compare (property: any) {
        return function(a, b) {
            let value1 = a[property];
            let value2 = b[property];
            return value1 - value2;
        };
    }

    /**
     * 任务类型  @param taskType
     * @param taskType
     * @returns {string}
     */
    getTaskType (taskType: any) {
        let type = '';
        switch (taskType) {
            case 'node': type = '节点任务'; break;
            case 'work': type = '工作流任务'; break;
            case 'extract': type = '数据采集'; break;
            case 'clean': type = '数据清洗'; break;
            case 'load': type = '数据装载'; break;
            case 'etl': type = '数据同步'; break;
            case 'mining': type = ' 机器学习'; break;
            case 'bi': type = 'BI'; break;
        }
        return type;
    }
}

