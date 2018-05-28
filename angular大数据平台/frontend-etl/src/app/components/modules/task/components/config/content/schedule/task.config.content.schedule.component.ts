/**
 * Created by LIHUA on 2017-08-21.
 * 数据融合 任务配置管理 调度配置
 */
import {Component, EventEmitter, Input, Output, Renderer2} from '@angular/core';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';

@Component({
    selector: 'task-config-content-schedule-component',
    templateUrl: './task.config.content.schedule.component.html',
    styleUrls: ['./task.config.content.schedule.component.scss']
})
export class TaskConfigContentScheduleComponent {
    @Input()
    checkedTask: any;

    @Input()
    showPanel: boolean;

    @Output()
    showPanelCallback: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    markupUpdatingCallback: EventEmitter<boolean> = new EventEmitter<boolean>();

    // 调度日期
    dispatchs = [{ name: '天', value: 'day', checked: false },
        {name: '周', value: 'week', checked: false },
        {name: '月', value: 'month', checked: false },
        // { name: '分钟', value: 'minute', checked: false },  // 暂且删除分钟调度类型
        { name: '小时', value: 'hour', checked: false },
        { name: '时刻', value: 'moment', checked: false }];
    checkedDispatch: any;        // 选中的调度日期

    weeks = [];                  // 星期数
    checkedWeek = [];            // 选中的星期数
    months = [];                 // 月份
    checkedMonth = [];           // 选中的月份
    hours = [];                  // 具体时间 小时
    checkedHour: any;            // 选中的小时
    minutes = [];                // 具体时间 分钟
    checkedMinute: any;          // 选中的分钟

    startHours = [];             // 开始时间 小时
    checkedStartHour: any;       // 开始时间 选中小时
    startMinutes = [];           // 开始时间 分钟
    checkedStartMinute: any;     // 开始时间 选中小时
    intervalHours = [];          // 间隔 小时
    checkedIntervalHour: any;    // 间隔 选中小时
    intervalMinutes = [];        // 间隔 分钟
    checkedIntervalMinute: any;  // 间隔 选中分钟
    endHours = [];               // 结束时间 小时
    checkedEndHour: any;         // 结束时间 选中小时
    endMinutes = [];             // 结束时间 分钟
    checkedEndMinute: any;       // 结束时间 选中分钟
    givenTime: any;              // 时刻

    error: string;
    errorType: number;

    hidePanelEventHook = null; // 关闭右侧panel钩子函数

    datepickerOptions = {
        align: 'right'
    } as DatepickerOptions;

    constructor (private render: Renderer2) {
        this.initTime();
    }

    /**
     * 初始化weeks, hours, minutes
     */
    initTime() {
        let i, temp;

        ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'].forEach((week, index) => {
            this.weeks.push({
                name: week,
                value: index + 1
            });
        });
        for (i = 0; i < 31; i++) {
            this.months.push({
                name: '每月' + (i + 1) + '号',
                value: i + 1
            });
        }
        for (i = 0; i < 24; i++) {
            temp = {
                name: i > 9 ? i + '' : '0' + i,
                value: i
            };
            this.hours.push(JSON.parse(JSON.stringify(temp)));
            this.startHours.push(JSON.parse(JSON.stringify(temp)));
            this.endHours.push(JSON.parse(JSON.stringify(temp)));
        }
        for (i = 0; i < 60; i++) {
            temp = {
                name: i > 9 ? i + '' : '0' + i,
                value: i
            };
            this.minutes.push(JSON.parse(JSON.stringify(temp)));
            this.startMinutes.push(JSON.parse(JSON.stringify(temp)));
            this.endMinutes.push(JSON.parse(JSON.stringify(temp)));
        }

        for (i = 1; i < 12; i++) {
            temp = i * 5;
            this.intervalMinutes.push({
                name: temp + '分钟',
                value: temp
            });
        }
        for (i = 1; i < 24; i++) {
            this.intervalHours.push({
                name: i + '小时',
                value: i
            });
        }

        this.checkedDispatch = this.dispatchs[0];
        this.checkedStartMinute = this.startMinutes[0];
        this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];
    }

    /**
     * 初始化flowInfo数据
     */
    initFlowInfo() {
        // 调整周期
        if (this.checkedTask.task.projectCycle) {
            this.dispatchs.forEach(dispatch => {
                if (dispatch.value === this.checkedTask.task.projectCycle) {
                    this.checkedDispatch = dispatch;
                }
            });
        }
        // 具体时间
        if (this.checkedTask.task.cronTime_cn) {
            let cronTime_cn = JSON.parse(this.checkedTask.task.cronTime_cn);

            // 调整周期为日 周 月
            if (this.checkedDispatch.value === 'day' || this.checkedDispatch.value === 'week' || this.checkedDispatch.value === 'month') {
                this.hours.forEach(hour => {
                    if (hour.value === cronTime_cn.hour) {
                        this.checkedHour = hour;
                    }
                });
                this.minutes.forEach(minute => {
                    if (minute.value === cronTime_cn.minute) {
                        this.checkedMinute = minute;
                    }
                });
            }
            // 调整周期为周
            if (this.checkedDispatch.value === 'week') {
                this.checkedWeek.length = 0;
                this.weeks.forEach(week => {
                    cronTime_cn.weeks.forEach(w => {
                        if (w === week.value) {
                            this.checkedWeek.push(week);
                        }
                    });
                });
            }
            // 调整周期为月
            if (this.checkedDispatch.value === 'month') {
                this.checkedMonth.length = 0;
                this.months.forEach(month => {
                    cronTime_cn.months.forEach(m => {
                        if (m === month.value) {
                            this.checkedMonth.push(month);
                        }
                    });
                });
            }
            // 调整周期为 分钟 小时
            if (this.checkedDispatch.value === 'minute' || this.checkedDispatch.value === 'hour') {
                this.startMinutes.forEach(startMinute => {
                    if (startMinute.value === cronTime_cn.startMinute) {
                        this.checkedStartMinute = startMinute;
                    }
                });
                this.startHours.forEach(startHour => {
                    if (startHour.value === cronTime_cn.startHour) {
                        this.checkedStartHour = startHour;
                    }
                });
                this.endMinutes.forEach(endMinute => {
                    if (endMinute.value === cronTime_cn.endMinute) {
                        this.checkedEndMinute = endMinute;
                    }
                });
                this.endHours.forEach(endHour => {
                    if (endHour.value === cronTime_cn.endHour) {
                        this.checkedEndHour = endHour;
                    }
                });
                this.intervalMinutes.forEach(interval => {
                    if (interval.value === cronTime_cn.intervalMinute) {
                        this.checkedIntervalMinute = interval;
                    }
                });
                this.intervalHours.forEach(interval => {
                    if (interval.value === cronTime_cn.intervalHour) {
                        this.checkedIntervalHour = interval;
                    }
                });
            }
            // 调整周期为 时刻
            if (this.checkedDispatch.value === 'moment') {
                let date = new Date(cronTime_cn.givenTime);
                this.givenTime = {
                    date: date
                };
            }
        } else {
            // 没有设置具体调整时间就设置默认值
            this.checkedDispatch = this.dispatchs[0];
            this.checkedHour = null;
            this.checkedMinute = null;
            this.checkedWeek = [];
            this.checkedMonth = [];
            this.checkedStartHour = null;
            this.checkedStartMinute = this.startMinutes[0];
            this.checkedEndHour = null;
            this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];
            this.givenTime = null;
        }
    }

    /**
     * panel背景点击
     * @param {MouseEvent} $event
     */
    panelBackgroundClick($event: MouseEvent) {
        $event['formPanelBackground'] = true;
    }

    /**
     * 展开panel 查看详情
     * @param {MouseEvent} $event
     */
    showPanelClick($event: MouseEvent) {
        this.showPanel = !this.showPanel;

        if (this.showPanel) {
            setTimeout(() => this.hidePanelEvent());
            this.initFlowInfo();
        } else {
            this.removeHidePanelEventHook();
        }

        this.showPanelCallback.emit(this.showPanel);
    }

    /**
     * 给document新增点击事件 点击隐藏panel
     */
    hidePanelEvent() {
        this.hidePanelEventHook = this.render.listen(document, 'click', (e: MouseEvent) => {
            if (e['formPanelBackground']) {
                return;
            } else {
                if (this.showPanel) {
                    this.showPanel = false;
                    this.removeHidePanelEventHook();
                    this.showPanelCallback.emit(this.showPanel);
                }
            }
        });
    }

    /**
     * 删除document hook
     */
    removeHidePanelEventHook() {
        if (this.hidePanelEventHook) {
            this.hidePanelEventHook();
            this.hidePanelEventHook = null;
        }
    }

    /**
     * 调整周期
     * @param data
     */
    checkedDispatchCallback(data: any) {
        this.checkedDispatch = data;

        // 时刻的时候 初始化一下默认值
        if (this.checkedDispatch.value === 'moment') {
            let date = new Date();
            this.givenTime = {
                date: date
            };
        }

        this.markupUpdating();
    }

    /**
     * 选择时间 星期数
     * @param week
     */
    checkedWeekCallback(week: any) {
        this.checkedWeek = week;
        this.markupUpdating();
    }

    /**
     * 选中时间 日期
     * @param month
     */
    checkedMonthCallback(month: any) {
        this.checkedMonth = month;
        this.markupUpdating();
    }

    /**
     * 具体时间 小时
     * @param data
     */
    checkedHourCallback(data: any) {
        this.checkedHour = data;
        this.markupUpdating();
    }

    /**
     * 具体时间 分钟
     * @param data
     */
    checkedMinuteCallback(data: any) {
        this.checkedMinute = data;
        this.markupUpdating();
    }

    /**
     * 结束时间 小时
     * @param hour
     */
    checkedEndHourCallback(hour: any) {
        this.checkedEndHour = hour;
        this.markupUpdating();
    }

    /**
     * 开始时间 小时
     * @param hour
     */
    checkedStartHourCallback(hour: any) {
        this.checkedStartHour = hour;
        this.markupUpdating();
    }

    /**
     * 间隔时间 分钟
     * @param interval
     */
    checkedIntervalMinuteCallback(interval: any) {
        this.checkedIntervalMinute = interval;
        this.markupUpdating();
    }

    /**
     * 间隔时间 小时
     * @param interval
     */
    checkedIntervalHourCallback(interval: any) {
        this.checkedIntervalHour = interval;
        this.markupUpdating();
    }

    markupUpdating() {
        this.markupUpdatingCallback.emit(true);
    }

    /**
     * 获取配置数据
     * @returns {any}
     */
    getCronTime_cn() {
        let success = false;
        this.errorType = -1;

        let cronTime_cn = {
            hour: '',
            minute: '',
            months: [],
            weeks: [],
            startHour: '',
            startMinute: this.checkedStartMinute.value,
            intervalMinute: '',
            intervalHour: '',
            endHour: '',
            endMinute: this.checkedEndMinute.value,
            givenTime: null
        };

        // 根据类型存储数据
        if (this.checkedDispatch.value === 'week') {
            if (!this.checkedWeek || this.checkedWeek.length === 0) {
                this.errorType = 5;
                return [success];
            }

            cronTime_cn.weeks = this.checkedWeek.map(week => week.value);
        }
        if (this.checkedDispatch.value === 'month') {
            if (!this.checkedMonth || this.checkedMonth.length === 0) {
                this.errorType = 6;
                return [success];
            }

            cronTime_cn.months = this.checkedMonth.map(month => month.value);
        }

        if (this.checkedDispatch.value === 'day' || this.checkedDispatch.value === 'week' || this.checkedDispatch.value === 'month') {
            if (!this.checkedHour) {
                this.errorType = 3;
                return [success];
            }
            if (!this.checkedMinute) {
                this.errorType = 4;
                return [success];
            }

            cronTime_cn.hour = this.checkedHour.value;
            cronTime_cn.minute = this.checkedMinute.value;
        }
        if (this.checkedDispatch.value === 'minute' || this.checkedDispatch.value === 'hour') {
            if (!this.checkedStartHour) {
                this.errorType = 7;
                return [success];
            }
            if (!this.checkedEndHour) {
                this.errorType = 8;
                return [success];
            }
            cronTime_cn.startHour = this.checkedStartHour.value;
            cronTime_cn.endHour = this.checkedEndHour.value;
        }
        if (this.checkedDispatch.value === 'minute') {
            if (!this.checkedIntervalMinute) {
                this.errorType = 9;
                return [success];
            }

            cronTime_cn.intervalMinute = this.checkedIntervalMinute.value;
        }
        if (this.checkedDispatch.value === 'hour') {
            if (!this.checkedIntervalHour) {
                this.errorType = 10;
                return [success];
            }

            cronTime_cn.intervalHour = this.checkedIntervalHour.value;
        }

        if (this.checkedDispatch.value === 'moment') {
            // 采用自定义的datepicker
            if (!this.givenTime || !this.givenTime.value) {
                this.errorType = 11;
                return [success];
            }

            cronTime_cn.givenTime = this.givenTime.date._d.getTime();
        }

        this.errorType = -1;
        return [true, cronTime_cn, this.checkedDispatch.value];
    }
}
