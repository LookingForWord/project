/**
 * Created by lh on 2017/11/13.
 *  自定义日期组件
 */
import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {DatepickerDirective} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare let moment: any;

interface DateInterface {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    second: number;
    now: boolean;
    checked: boolean;
    disabled: boolean;
}

@Component({
    selector: 'datapicker-component',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {
    parent: DatepickerDirective;

    time = {
        year: null,
        month: null,
        date: null,
        hour: null,
        minute: null,
        second: null,
        dates: Array<DateInterface>()
    };

    showYearView = false;
    yearLabels = [];

    showMonthView = false;
    monthLabels = [];

    showMomentView = false;

    toolNum = 0;

    hours = [];
    minutes = [];
    seconds = [];

    @ViewChild('moment') moment: ElementRef;

    @ViewChild('datepickerRef') datepickerRef: ElementRef;

    constructor(private render: Renderer2) {}

    /**
     * 初始化数据
     */
    ngOnInit() {
        Object.keys(this.parent.options.monthLabels).forEach(key => {
            this.monthLabels.push(this.parent.options.monthLabels[key]);
        });

        [this.parent.options.showMoment, this.parent.options.showToday, this.parent.options.showOk, this.parent.options.showDelete].forEach(show => {
            if (show) {
                this.toolNum ++;
            }
        });

        for (let i = 0; i < 24; i++) {
            this.hours.push({
                name: i > 9 ? (i + '') : ('0' + i),
                value: i
            });
        }
        for (let i = 0; i < 60; i++) {
            this.minutes.push({
                name: i > 9 ? (i + '') : ('0' + i),
                value: i
            });
            this.seconds.push({
                name: i > 9 ? (i + '') : ('0' + i),
                value: i
            });
        }

        this.initTime(this.parent.ngModel.model.date);
        this.initDom();
    }

    /**
     * 初始化时间对象
     * @param date
     */
    initTime(date: any) {
        // 初始化当前时间
        this.time.year = date.year();
        this.time.month = date.month();
        this.time.date = date.date();
        this.time.hour = date.hour();
        this.time.minute = date.minute();
        this.time.second = date.second();

        // 初始化当月日期集合
        let dates = this.getMonthDate(this.time.month),
            nowDay = moment(new Date());
        this.time.dates.length = 0;

        for (let i = 1; i <= dates; i++) {
            this.time.dates.push({
                year: this.time.year,
                month: this.time.month,
                date: i,
                hour: this.time.hour,
                minute: this.time.minute,
                second: this.time.second,
                now: nowDay.year() === this.time.year && nowDay.month() === this.time.month && nowDay.date() === i,
                checked: this.time.date === i,
                disabled: false
            });
        }

        // 补充当前月 前面几天
        let firstDate = this.time.dates[0],
            firstDateM = moment([firstDate.year, firstDate.month, firstDate.date, firstDate.hour, firstDate.minute, firstDate.second]),
            firstDay = firstDateM.day();
        if (firstDay > 0) {
            for (let i = firstDay - 1; i >= 0; i--) {
                firstDateM = firstDateM.add(-1, 'day');
                this.time.dates.unshift({
                    year: firstDateM.year(),
                    month: firstDateM.month(),
                    date: firstDateM.date(),
                    hour: firstDateM.hour(),
                    minute: firstDateM.minute(),
                    second: firstDateM.second(),
                    now: false,
                    checked: false,
                    disabled: true
                });
            }
        }

        // 补充当前月 后面几天
        let lastDate = this.time.dates[this.time.dates.length - 1],
            lastDateM = moment([lastDate.year, lastDate.month, lastDate.date, lastDate.hour, lastDate.minute, lastDate.second]),
            maxDates = 42;
        if (this.time.dates.length < maxDates) {
            for (let i = this.time.dates.length; i < maxDates; i++) {
                lastDateM = lastDateM.add(1, 'day');
                this.time.dates.push({
                    year: lastDateM.year(),
                    month: lastDateM.month(),
                    date: lastDateM.date(),
                    hour: lastDateM.hour(),
                    minute: lastDateM.minute(),
                    second: lastDateM.second(),
                    now: false,
                    checked: false,
                    disabled: true
                });
            }
        }
    }

    /**
     * 初始化dom
     */
    initDom() {
        // 自身只读
        this.parent.elementRef.nativeElement.readOnly = true;
        // 给父容器设置相对定位
        this.render.setStyle(this.parent.elementRef.nativeElement.parentNode, 'position', 'relative');

        let offsetLeft = this.parent.elementRef.nativeElement.offsetLeft;
        let offsetTop = this.parent.elementRef.nativeElement.offsetTop;
        let offsetHeight = this.parent.elementRef.nativeElement.offsetHeight;
        let offsetWidth = this.parent.elementRef.nativeElement.offsetWidth;

        let x, y;
        if (this.parent.options.align === 'left') {
            // 左对齐
            x = offsetLeft;
            y = offsetTop + offsetHeight + 15;
        }
        if (this.parent.options.align === 'right') {
            // 右对齐
            x = (offsetLeft + offsetWidth) - this.datepickerRef.nativeElement.offsetWidth;
            y = offsetTop + offsetHeight + 15;
        }

        this.render.setStyle(this.datepickerRef.nativeElement, 'left', x + 'px');
        this.render.setStyle(this.datepickerRef.nativeElement, 'top', y + 'px');

        let height = this.toolNum > 0 ? 250 : 208;
        this.render.setStyle(this.datepickerRef.nativeElement, 'height', height + 'px');
        let transitionendHook = this.render.listen(this.datepickerRef.nativeElement, 'transitionend', () => {
            transitionendHook();
            // 动画结束后把overflow重置一下 不然顶部的三角显示不出来
            this.render.setStyle(this.datepickerRef.nativeElement, 'overflow', 'inherit');
        });
    }

    /**
     * 返回指定月份的天数
     * @param {number} month
     * @returns {number}
     */
    getMonthDate(month: number) {
        if (DatepickerComponent.isLeapYear(this.time.year)) {
            return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        } else {
            return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        }
    }

    /**
     * 判定是否是闰年
     * @param year
     * @returns {boolean} true 是闰年，false 不是闰年
     */
    static isLeapYear(year) {
        return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);
    }

    /**
     * 月份切换
     * @param {string} type
     */
    nextMonthClick(type: string) {
        if (type === 'before') {
            // 上个月
            let prevMonth = this.time.month === 0 ? 11 : this.time.month - 1;

            // 上一个是2月份 且当前日期是31或者30号 日期就要变位28或者29
            if (prevMonth === 1 && (this.time.date === 31 || this.time.date === 30)) {
                this.time.date = DatepickerComponent.isLeapYear(this.time.year) ? 29 : 28;
            }

            // 上一个月是5 7 10 12月份 且当前日期是31 日期就要变为30
            if ((prevMonth === 4 || prevMonth === 6 || prevMonth === 9 || prevMonth === 11) && (this.time.date === 31)) {
                this.time.date = 30;
            }

            this.initTime(moment([(this.time.month === 0 ? this.time.year - 1 : this.time.year), (this.time.month === 0 ? 11 : this.time.month - 1), this.time.date, this.time.hour, this.time.minute, this.time.second]));
        }
        if (type === 'after') {
            let nextMonth = this.time.month === 11 ? 0 : this.time.month + 1;

            // 下个一个是2月份 且当前日期是31或者30号 日期就要变位28或者29
            if (nextMonth === 1 && (this.time.date === 31 || this.time.date === 30)) {
                this.time.date = DatepickerComponent.isLeapYear(this.time.year) ? 29 : 28;
            }
            // 下一个月是4 6 9 11 月份 且当前日期是31 日期就要变为30
            if ((nextMonth === 3 || nextMonth === 5 || nextMonth === 8 || nextMonth === 10) && (this.time.date === 31)) {
                this.time.date = 30;
            }

            this.initTime(moment([(this.time.month === 11 ? this.time.year + 1 : this.time.year), (this.time.month === 11 ? 0 : this.time.month + 1), this.time.date, this.time.hour, this.time.minute, this.time.second]));
        }
    }

    /**
     * 年份切换
     * @param {string} type
     */
    nextYearClick(type: string) {
        // 闰年2月29日 往后减少一天
        if (this.time.month === 1 && this.time.date === 29) {
            this.time.date = this.time.date - 1;
        }

        if (type === 'before') {
            this.initTime(moment([this.time.year - 1, this.time.month, this.time.date, this.time.hour, this.time.minute, this.time.second]));
        }
        if (type === 'after') {
            this.initTime(moment([this.time.year + 1, this.time.month, this.time.date, this.time.hour, this.time.minute, this.time.second]));
        }
    }

    /**
     * 日期点击
     * @param {DateInterface} date
     */
    dateClick(date: any) {
        let d = moment([date.year, date.month, date.date, date.hour, date.minute, date.second]);
        let value = d.format(this.parent.options.format);
        this.parent.ngModel.model = {
            date: d,
            value: value
        };
        this.parent.ngModel.valueAccessor.writeValue(value);
        this.parent.ngModel.viewToModelUpdate(this.parent.ngModel.model);

        if (!date.disabled) {
            this.time.date = date.date;
            this.time.dates.forEach(d => {
                d.checked = (d.month === date.month && d.date === date.date);
            });
        } else {
            this.initTime(d);
        }
    }

    /**
     * 选择月份点击
     * @param {number} month
     */
    selectMonthClick(month: number) {
        this.time.month = month;

        // 当前点击2月份 且当前日期是31或者30号 日期就要变位28或者29
        if (this.time.month === 1 && (this.time.date === 30 || this.time.date === 31)) {
            this.time.date = DatepickerComponent.isLeapYear(this.time.year) ? 29 : 28;
        }
        // 当前点击月是4 6 9 11 月份 且当前日期是31 日期就要变为30
        if ((this.time.month === 3 || this.time.month === 5 || this.time.month === 8 || this.time.month === 10) && (this.time.date === 31)) {
            this.time.date = 30;
        }

        let d = moment([this.time.year, this.time.month, this.time.date, this.time.hour, this.time.minute, this.time.second]);
        let value = d.format(this.parent.options.format);
        this.parent.ngModel.model = {
            date: d,
            value: value
        };
        this.parent.ngModel.valueAccessor.writeValue(value);
        this.parent.ngModel.viewToModelUpdate(this.parent.ngModel.model);

        this.initTime(d);

        this.showMonthView = false;
    }

    /**
     * 切换到 年视图
     */
    showYearViewClick() {
        let year = this.time.year;

        // 补充年视图数据 总是把当前时间年份放到第五个位置
        this.yearLabels.length = 0;
        this.yearLabels.push(year);
        for (let i = 1; i <= 4; i++) {
            this.yearLabels.unshift(year - i);
        }
        for (let i = 1; i <= 7; i++) {
            this.yearLabels.push(year + i);
        }

        this.showYearView = true;
    }

    /**
     * 年视图 选中点击
     * @param {number} year
     */
    selectYearClick(year: number) {
        this.time.year = year;

        // 闰年的第29天
        if (this.time.month === 1 && this.time.date === 29) {
            // 选择年份不是闰年
            if (!DatepickerComponent.isLeapYear(this.time.year)) {
                this.time.date = 28;
            }
        }

        let d = moment([this.time.year, this.time.month, this.time.date, this.time.hour, this.time.minute, this.time.second]);
        let value = d.format(this.parent.options.format);
        this.parent.ngModel.model = {
            date: d,
            value: value
        };
        this.parent.ngModel.valueAccessor.writeValue(value);
        this.parent.ngModel.viewToModelUpdate(this.parent.ngModel.model);

        this.initTime(d);

        this.showYearView = false;
    }

    /**
     * 年视图 年切换点击
     * @param {string} type
     */
    nextSelectYearClick(type: string) {
        if (type === 'before') {
            let first = this.yearLabels[0];
            this.yearLabels.length = 0;
            for (let i = 1; i <= 12; i++) {
                this.yearLabels.unshift(first - i);
            }
        }
        if (type === 'after') {
            let last = this.yearLabels[this.yearLabels.length - 1];
            this.yearLabels.length = 0;
            for (let i = 1; i <= 12; i++) {
                this.yearLabels.push(last + i);
            }
        }
    }

    /**
     * 时刻/时间 点击
     * @param {boolean} type
     */
    momentClick(type: boolean) {
        this.showMomentView = type;

        if (type) {
            setTimeout(() => {
                this.initMomentSlider();
            }, 100);
        }
    }

    /**
     * 初始化时分秒滑块的位置
     */
    initMomentSlider() {
        let container = this.moment.nativeElement;
        ['hour', 'minute', 'second'].forEach(moment => {
            let momentContainer = container.querySelector('.' + moment),
                momentScroll = momentContainer.querySelector('.scroll'),
                momentScrollInner = momentScroll.querySelector('.scroll-inner'),
                momentSlider = momentContainer.querySelector('.slider'),
                momentSliderSpan = momentSlider.querySelector('span');

            let val = this.time[moment];
            if (val > 3) {
                let top = 0;
                if (moment === 'hour') {
                    top = val < 19 ? (val - 3) * 26 : 16 * 26;
                } else if (moment === 'minute' || moment === 'second') {
                    top = val < 55 ? (val - 3) * 26 : 52 * 26;
                }
                momentScrollInner['style']['top'] = (-top) + 'px';

                let sliderTop = (container['offsetHeight'] - momentSliderSpan['offsetHeight']) * (top / (momentScrollInner['offsetHeight'] - 26 * 8));
                momentSliderSpan['style']['top'] = sliderTop + 'px';
            }

            this.render.listen(momentContainer, 'mouseenter', () => {
                momentSlider.classList.add('show');
                momentSlider.setAttribute('mouseon', true); // 标明滑块正在显示
            });

            this.render.listen(momentContainer, 'mouseleave', () => {
                // 先判定滑块是否在移动 滑块不在移动的时候才隐藏按钮
                if (!momentSlider.getAttribute('moveon')) {
                    momentSlider.classList.remove('show');
                }

                momentSlider.removeAttribute('mouseon');
            });
        });
    }

    /**
     * 时刻点击
     * @param {string} type 类型
     * @param val           值
     */
    momentCheckedClick(type: string, val: any) {
        this.time[type] = val.value;

        this.updateNgModal();
    }

    /**
     * 今天 点击
     */
    todayClick() {
        let today = new Date();
        this.time.year = today.getFullYear();
        this.time.month = today.getMonth();
        this.time.date = today.getDate();
        this.time.hour = today.getHours();
        this.time.minute = today.getMinutes();
        this.time.second = today.getSeconds();

        this.updateNgModal();

        this.parent.destoryDatepicker();
    }

    /**
     * 确定点击
     */
    okClick() {
        this.updateNgModal();

        this.parent.destoryDatepicker();
    }

    /**
     * 更新模型的显示值
     */
    updateNgModal() {
        let d = moment([this.time.year, this.time.month, this.time.date, this.time.hour, this.time.minute, this.time.second]);
        let value = d.format(this.parent.options.format);
        this.parent.ngModel.model = {
            date: d,
            value: value
        };
        this.parent.ngModel.valueAccessor.writeValue(value);
        this.parent.ngModel.viewToModelUpdate(this.parent.ngModel.model);
    }

    /**
     * 删除 点击
     */
    deleteClick() {
        this.parent.ngModel.model.value = null;
        this.parent.ngModel.valueAccessor.writeValue('');
        this.parent.ngModel.viewToModelUpdate(this.parent.ngModel.model);

        this.parent.destoryDatepicker();
    }

    /**
     * 时分秒选择 滑块点击
     * @param {string} type
     * @param {MouseEvent} $event
     */
    sliderMouseDown(type: string, $event: MouseEvent) {
        this.initMouseMove($event);
    }

    /**
     * 鼠标滑动事件
     * @param {MouseEvent} event
     */
    initMouseMove(event: MouseEvent) {
        let target = event.target;

        // 这个点击事件可能点到 span 里的i标签上
        if (target['nodeName'] === 'I') {
            target = target['parentNode'];
        }

        let container = target['parentNode']['parentNode'];
        let scroll = container.querySelector('.scroll'),
            scrollInner = scroll.querySelector('.scroll-inner');
        let pageY = event.pageY;

        target['classList'].add('active');

        // 鼠标移动
        let mouseMoveHook = this.render.listen(document, 'mousemove', e => {
            let top = target['style']['top'] || 0;
            if (top !== 0) {
                top = Number(top.replace('px', ''));
            }
            top = top + (e.pageY - pageY);
            pageY = e.pageY;

            if (top >= 0 && (top <= container['offsetHeight'] - target['offsetHeight'])) {
                target['style']['top'] = top + 'px';

                // 单个时间块的高度是26
                let scrollTop = (scrollInner['offsetHeight'] - 26 * 8) * (top / (container['offsetHeight'] - target['offsetHeight']));

                scrollInner['style']['top'] = (-scrollTop) + 'px';
            }

            target['parentNode'].setAttribute('moveon', true);
        });

        this.parent.mouseMoveUpHook = true;
        // 鼠标停止移动
        let mouseMoveUpHook = this.render.listen(document, 'mouseup', () => {
            mouseMoveHook && mouseMoveHook();
            mouseMoveUpHook && mouseMoveUpHook();
            setTimeout(() => this.parent.mouseMoveUpHook = false);

            target['classList'].remove('active');

            // 先判定鼠标是否还在区域内
            if (!target['parentNode'].getAttribute('mouseon')) {
                target['parentNode'].classList.remove('show');
            }

            target['parentNode'].removeAttribute('moveon');
        });
    }


}



