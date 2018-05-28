/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WorkflowService} from '../../../../../../../../services/workflow.service';
import {ModalService} from '../../../../../../../../../frontend-common/ts_modules/services/modal.service/modal.service';
import {ServiceStatusEnum} from '../../../../../../../../constants/service.enum';
import {RegExgConstant} from '../../../../../../../../../frontend-common/ts_modules/constants/regexp';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare var moment: any;
import {INgxMyDpOptions} from 'ngx-mydatepicker';
import {Animations} from '../../../../../../../../../frontend-common/ts_modules/animations/animations';


@Component({
    selector: 'governance-norm-audit-content-items-trigger-component',
    templateUrl: './governance.norm.audit.content.items.trigger.component.html',
    styleUrls: ['./governance.norm.audit.content.items.trigger.component.scss'],
    animations: [Animations.slideLeft]
})
export class GovernanceNormAuditContentItemsTriggerComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() task: any;

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

    oneceDate: any;                 // 一次性日期

    error: string;               // 错误消息
    errorType = -1;              // 错误类型

    hidePanelEventHook = null; // 关闭右侧panel钩子函数

    customOptions: DatepickerOptions = {
        format: 'YYYY/MM/DD HH:mm:ss'
    };

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

        this.checkedDispatch = this.dispatchs[0];
        this.checkedStartMinute = this.startMinutes[0];
        this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];

        setTimeout(() => {
            if (this.task && this.task.flowInfo && this.task.flowInfo.flow && this.task.flowInfo.flow.timing) {
                let timeArr = this.task.flowInfo.flow.timing.split(' ');
                // 先判断最末一位  来区别出day、week、一次性任务、
                // 0 15 10 ? * * 每天10点15分触发  day类型
                // 0 15 10 ? * MON,FRI 从周一到周五每天上午的10点15分触发  week类型
                // 0 15 10 15 * ? 每月15号上午10点15分触发  month类型
                // 0 0 3-7/1 * * ?   hour类型
                // 最末以为为数字   0 0 23 8 12 ? 2017    一次性任务
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
                    const second = this.addZero(timeArr[0]);
                    const minute = this.addZero(timeArr[1]);
                    const hour = this.addZero(timeArr[2]);
                    let day = this.addZero(timeArr[3]);
                    let month = this.addZero(timeArr[4]);
                    const year = timeArr[6];
                    this.oneceDate = {
                        date: year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
                    };

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
            if (this.triggerTab === '1') {
                this.oneceDate = this.oneceDate && this.oneceDate.value ? {date: this.oneceDate.value} : '';
            }
        }
    }

    /**
     * 频率选择
     */
    checkedDispatchCallback(frequency) {
        this.checkedDispatch = frequency;
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
     * 时间  月、周、时、分选择
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
                    // 0 0 3-7/1 * * ? 朝九晚五工作时间内每半小时
                    break;
                // case 'moment':
                //     break;
            }
        } else if (this.triggerTab === '1') {
            let arr = this.oneceDate.date['_i'];
            str = `${arr[5]} ${arr[4]} ${arr[3]} ${arr[2]} ${arr[1] + 1} ? ${arr[0]}`;
        }
        const params = {
            flowId: this.task.workflow.flowId,
            name: this.task.workflow.name,
            timing: str
        };
        this.workflowService.saveTrigger(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
               this.modalService.alert('保存成功');
               this.task.flowInfo.flow.timing = str;
               this.task.updating = true;
               this.cancle();
            } else {
                this.modalService.alert('保存失败');
            }
        });
    }

    /**
     * 关闭取消
     */
    cancle() {
        this.close.emit(false);
    }

    /**
     * 校验
     * @returns {boolean}
     */
    check() {
        if (this.triggerTab === '1') {
            if (!this.oneceDate || !this.oneceDate.date) {
                this.errorType = 1;
                return false;
            }
            let now = new Date().getTime();
            let chooseTime = new Date(this.oneceDate.date).getTime();
            if (chooseTime < now) {
                this.errorType = 2;
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

        }
        return true;
    }
}
