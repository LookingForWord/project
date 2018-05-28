/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WorkflowService} from 'app/services/workflow.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {INgxMyDpOptions} from 'ngx-mydatepicker';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
declare var moment: any;

@Component({
    selector: 'workflow-work-result-trigger-component',
    templateUrl: './workflow.work.result.trigger.component.html',
    styleUrls: ['./workflow.work.result.trigger.component.scss'],
    animations: [Animations.slideLeft]
})
export class WorkflowWorkResultTriggerComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() task: any;
    @Input() type: any;     // result 表示是运行结果详情

    triggerTab = '0';
    dateOption: INgxMyDpOptions = {     // 开始日期选择配置
        todayBtnTxt: '今天',
        dateFormat: 'yyyy-mm-dd',
        dayLabels: { su: '周日', mo: '周一', tu: '周二', we: '周三', th: '周四', fr: '周五', sa: '周六' },
        monthLabels: { 1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月' },
        alignSelectorRight: true        // 选择器右对齐
    };

    // 调度日期
    dispatchs = [
        { name: '天', value: 'day', checked: false },
        {name: '周', value: 'week', checked: false },
        {name: '月', value: 'month', checked: false },
        { name: '小时', value: 'hour', checked: false }
    ];
    checkedDispatch: any;               // 选中的调度日期

    weeks = [
        {name: '星期日', value: 'SUN'},
        {name: '星期一', value: 'MON'},
        {name: '星期二', value: 'TUE'},
        {name: '星期三', value: 'WED'},
        {name: '星期四', value: 'THU'},
        {name: '星期五', value: 'FRI'},
        {name: '星期六', value: 'SAT'}
    ];                                  // 星期数
    checkedWeek = [];                   // 选中的星期数
    months = [];                        // 月份
    checkedMonth = [];                  // 选中的月份
    hours = [];                         // 具体时间 小时
    checkedHour: any;                   // 选中的小时
    minutes = [];                       // 具体时间 分钟
    checkedMinute: any;                 // 选中的分钟


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
    givenHour: any;              // 时刻 小时
    givenHours = [];             // 时刻 小时集合
    givenMinute: any;            // 时刻 分钟
    givenMinutes = [];           // 时刻 分钟集合
    givenSecond: any;            // 时刻 秒
    givenSeconds = [];           // 时刻 秒集合

    oneceDate: any;                 // 一次性日期
    oneceHour: any;                 // 一次性时
    oneceMinutes: any;              // 一次性分
    oneceSeconds: any;              // 一次性秒

    error: string;               // 错误消息
    errorType = -1;              // 错误类型

    hidePanelEventHook = null; // 关闭右侧panel钩子函数

    constructor(private workflowService: WorkflowService,
                private modalService: ModalService) {
        this.initTime();
    }

    ngOnInit() {

    }
    /**
     * 初始化weeks, hours, minutes
     */
    initTime() {
        let i, temp;
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
        for (i = 0; i < 24; i++) {
            this.givenHours.push({
                name: i > 9 ? i + '' : '0' + i,
                value: i
            });
        }
        for (i = 0; i < 60; i++) {
            this.givenMinutes.push({
                name: i > 9 ? i + '' : '0' + i,
                value: i
            });
            this.givenSeconds.push({
                name: i > 9 ? i + '' : '0' + i,
                value: i
            });
        }

        this.checkedDispatch = this.dispatchs[0];
        this.checkedStartMinute = this.startMinutes[0];
        this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];



        setTimeout(() => {
            if (this.task && this.task.timing) {
                let timeArr = this.task.timing.split(' ');
                // 先判断最末以为  来区别出day、week、一次性任务、
                // 0 15 10 ? * * 每天10点15分触发  day
                // 0 15 10 ? * MON,FRI 从周一到周五每天上午的10点15分触发  week
                // 0 15 10 15 * ? 每月15号上午10点15分触发  month
                // 0 0 3-7/1 * * ?   hour
                // 一次性 最末以为为数字   0 0 23 8 12 ? 2017
                const lastIndex = timeArr[timeArr.length - 1];
                const reg = /^[a-zA-Z]{1,}$/;
                // day
                if (lastIndex === '*') {
                    this.checkedDispatch = this.dispatchs[0];
                    this.checkedHour = this.hours[timeArr[2]];
                    this.checkedMinute = this.minutes[timeArr[1]];
                } else if (RegExgConstant.integer.test(lastIndex)) {
                    // 一次性
                    this.triggerTab = '1';
                    let month = this.addZero(timeArr[4]);
                    let day = this.addZero(timeArr[3]);
                    this.oneceDate = {
                        date: {
                            year: lastIndex,
                            month: timeArr[4],
                            day: timeArr[3]
                        },
                        formatted: (lastIndex + '-' + month + '-' + day),
                    };
                    this.oneceHour = this.givenHours[timeArr[2]];
                    this.oneceMinutes = this.givenMinutes[timeArr[1]];
                    this.oneceSeconds = this.givenSeconds[timeArr[0]];
                } else if (reg.test(lastIndex[lastIndex.length - 1])) {
                    // week
                    this.checkedDispatch = this.dispatchs[1];
                    let weeks = lastIndex.split(',');
                    weeks.forEach(item => {
                        this.weeks.forEach(week => {
                            if (item === week.value) {
                                this.checkedWeek.push(week);
                            }
                        });
                    });
                    this.checkedHour = this.hours[timeArr[2]];
                    this.checkedMinute = this.minutes[timeArr[1]];
                } else if (lastIndex === '?' && timeArr[timeArr.length - 3] !== '*') {
                    // month
                    this.checkedDispatch = this.dispatchs[2];
                    let months = timeArr[timeArr.length - 3].split(',');
                    months.forEach(item => {
                        this.months.forEach(month => {
                            if (item === String(Number(month.value) - 1) ) {
                                this.checkedMonth.push(month);
                            }
                        });
                    });
                    this.checkedHour = this.hours[timeArr[2]];
                    this.checkedMinute = this.minutes[timeArr[1]];
                } else {
                    // 0 0 3-7/1 * * ?   hour  时间间隔
                    this.checkedDispatch = this.dispatchs[3];
                    let str = timeArr[2];
                    const firstIndex = str.indexOf('-');
                    const lastIndex = str.indexOf('/');
                    this.checkedStartHour = this.startHours[timeArr[2].slice(0, firstIndex)];
                    this.checkedEndHour = this.endHours[timeArr[2].slice(firstIndex + 1, lastIndex)];
                    this.checkedIntervalHour = this.intervalHours[Number(timeArr[2].slice(lastIndex + 1, )) - 1];
                }
            }
        }, 500);

    }

    /**
     * 补零操作
     */
    addZero(str) {
        let newStr = '';
        if (str.length === 1) {
            newStr = '0' + str;
        } else {
            newStr = str;
        }
        return newStr;
    }

    /**
     * 触发器侧边栏 定时/一次选择
     */
    togglePanelTab(tabId: any) {
        if (tabId !== this.triggerTab) {
            this.triggerTab = tabId;
        }
    }

    /**
     * 频率选择
     */
    checkedDispatchCallback(frequency) {
        this.checkedDispatch = frequency;
    }

    /**
     * 时刻 时分秒 选择
     */
    givenCallback(value, type) {
        this[`${type}`] = value;
    }

    /**
     * 时间间隔
     */
    checkedIntervalCallback(value, type) {
        this[`${type}`] = value;
    }
    /**
     * 开始时间 小时
     * @param hour
     */
    checkedStartHourCallback(hour: any) {
        this.checkedStartHour = hour;
    }
    /**
     * 结束时间 小时
     * @param hour
     */
    checkedEndHourCallback(hour: any) {
        this.checkedEndHour = hour;
    }

    /**
     * 时间 月、周、时、分选择
     */
    checkedTimeCallback(value, type) {
        this[`${type}`] = value;
    }

    /**
     * 保存
     */
    save() {
        if (!this.check()) {
           return;
        }
        this.errorType = -1;
        let str = '';
        if (this.triggerTab === '0') {
            switch (this.checkedDispatch.value) {
                case 'day':
                    str = `0 ${this.checkedMinute.value} ${this.checkedHour.value} ? * *`;
                    // 0 15 10 ? * * 每天10点15分触发
                    break;
                case 'week':
                    let weekArr = [];
                    this.checkedWeek.forEach(item => {
                        weekArr.push(item.value);
                    });
                    str = `0 ${this.checkedMinute.value} ${this.checkedHour.value} ? * ${weekArr.join()}`;
                    // 0 15 10 ? * MON-FRI 从周一到周五每天上午的10点15分触发
                    break;
                case 'month':
                    let monthArr = [];
                    this.checkedMonth.forEach(item => {
                        monthArr.push(item.value);
                    });
                    str = `0 ${this.checkedMinute.value} ${this.checkedHour.value} ${monthArr.join()} * ?`;
                    // 0 15 10 15 * ? 每月15号上午10点15分触发
                    break;
                case 'hour':
                    str = `0 0 ${this.checkedStartHour.value}-${this.checkedEndHour.value}/${this.checkedIntervalHour.value} * * ?`;
                    // 0 0/30 9-17 * * ? 朝九晚五工作时间内每半小时
                    break;
                // case 'moment':
                //     break;
            }
        } else if (this.triggerTab === '1') {
            str = `${this.oneceSeconds.value} ${this.oneceMinutes.value} ${this.oneceHour.value} ${this.oneceDate.date.day} ${this.oneceDate.date.month} ? ${this.oneceDate.date.year}`;
        }

        const params = {
            flowId: this.task.flowId,
            name: this.task.name,
            timing: str
        };
        this.workflowService.saveTrigger(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
               this.modalService.alert('触发器添加成功');
               this.cancle(str);
            } else {
                this.modalService.alert('保存失败');
            }
        });
    }

    /**
     * 关闭取消
     */
    cancle(str?: any) {
        this.close.emit(str);
    }

    check() {
        if (this.triggerTab === '1') {
            if (!this.oneceDate) {
                this.errorType = 1;
                return false;
            }

            if (!this.oneceHour || !this.oneceMinutes || !this.oneceSeconds) {
                this.errorType = 2;
                return false;
            }
            let now = new Date().getTime();
            let chooseTime = this.oneceDate.date.year + '/' +
                this.oneceDate.date.month + '/' +
                this.oneceDate.date.day + ' ' +
                this.oneceHour.name + ':' +
                this.oneceMinutes.name + ':' +
                this.oneceSeconds.name;
            if (new Date(chooseTime).getTime() < now) {
                this.errorType = 13;
                this.modalService.alert('您选择的时间早于当前时间');
                return false;
            }
        } else {
            if (this.checkedDispatch.value === 'day' || this.checkedDispatch.value === 'week' || this.checkedDispatch.value === 'month') {
                if (!this.checkedHour) {
                    this.errorType = 5;
                    return false;
                }
                if (!this.checkedMinute) {
                    this.errorType = 6;
                    return false;
                }
            }
            if (this.checkedDispatch.value === 'week' && !this.checkedWeek) {
                this.errorType = 3;
                return false;
            }
            if (this.checkedDispatch.value === 'month' && !this.checkedMonth) {
                this.errorType = 4;
                return false;
            }
            if (this.checkedDispatch.value === 'hour') {
                if (!this.checkedStartHour) {
                    this.errorType = 7;
                    return false;
                }
                if (!this.checkedEndHour) {
                    this.errorType = 8;
                    return false;
                }
                if (!this.checkedIntervalHour) {
                    this.errorType = 10;
                    return false;
                }
                if (this.checkedEndHour.value < this.checkedStartHour.value) {
                    this.errorType = 13;
                    return false;
                }
            }
            if (this.checkedDispatch.value === 'moment') {
                if (!this.givenTime) {
                    this.errorType = 11;
                    return false;
                }
                if (!this.givenHour || !this.givenMinute || !this.givenSecond) {
                    this.errorType = 12;
                    return false;
                }
            }
        }
        return true;
    }
}
