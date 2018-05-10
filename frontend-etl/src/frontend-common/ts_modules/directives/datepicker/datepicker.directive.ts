/**
 * Created by lh on 2017/11/13.
 *  日期选择器
 */
import {AfterViewInit, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewContainerRef} from '@angular/core';
import {NgModel} from '@angular/forms';
import {DatepickerComponent} from 'frontend-common/ts_modules/directives/datepicker/datepicker.component';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

declare let moment: any;

export interface DatepickerDayLabels {
    [day: string]: string;
}
export interface DatepickerMonthLabels {
    [day: number]: string;
}
export interface DatepickerOptions {
    format?: string | 'YYYY/MM/DD';
    dayLabels?: DatepickerDayLabels;
    monthLabels?: DatepickerMonthLabels;
    showToday?: boolean;
    showTodayLabel?: string;
    showOk?: boolean;
    showOkLabel?: string;
    showMoment?: boolean;
    showMonentLabel?: string;
    showTimeLabel?: string;
    showDelete?: boolean;
    showDeleteLabel?: string;
    align?: string;
}

@Directive({
    selector: '[datepicker]'
})
export class DatepickerDirective implements OnInit, AfterViewInit {
    elementRef: ElementRef;
    ngModel: NgModel;

    @Input()
    options: DatepickerOptions;

    @Input()
    enabled: boolean;

    @Output()
    okCallback: EventEmitter<any> = new EventEmitter(); // 确定点击回调

    show = false;

    defaultOptions: DatepickerOptions = {
        format: 'YYYY/MM/DD HH:mm:ss',
        dayLabels: { su: '日', mo: '一', tu: '二', we: '三', th: '四', fr: '五', sa: '六' },
        monthLabels: { 1: '1月', 2: '2月', 3: '3月', 4: '4月', 5: '5月', 6: '6月', 7: '7月', 8: '8月', 9: '9月', 10: '10月', 11: '11月', 12: '12月' },
        showToday: true,
        showTodayLabel: '现在',
        showOk: true,
        showOkLabel: '确定',
        showMoment: true,
        showMonentLabel: '设置时间',
        showTimeLabel: '设置日期',
        showDelete: true,
        showDeleteLabel: '清除',
        align: 'left'
    };

    datepickerRef: ComponentRef<DatepickerComponent>;
    datepickerInstance: DatepickerComponent;

    docClickHook: any;

    mouseMoveUpHook: any; // 时分秒选择器 鼠标mouseup hook

    constructor(elementRef: ElementRef,
                private render: Renderer2,
                private componentFactoryResolver: ComponentFactoryResolver,
                private viewContainerRef: ViewContainerRef,
                ngModel: NgModel,
                private toolService: ToolService) {
        this.elementRef = elementRef;
        this.ngModel = ngModel;

        this.ngModel.valueChanges.subscribe(v => {
            if (v && v.date) {
                this.initDate();
            }
        });
    }

    ngOnInit() {
        this.options = Object.assign(this.defaultOptions, this.options);
        this.enabled = typeof(this.enabled) === 'undefined' ? true : this.enabled;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.ngModel.model && typeof(this.ngModel.model.date) !== 'undefined') {
                this.initDate();
            }
            // this.initDate();
        });
    }

    /**
     * 初始化组件
     * ngModal如果需要初始化，就必须保证值为 {date: number | string | date}
     */
    initDate() {
        // 有初始化值
        if (this.ngModel.model && this.ngModel.model.date) {
            let date = this.ngModel.model.date;
            let d, v;

            if (date && this.toolService.isNumber(date) || this.toolService.isDate(date)) {
                d = moment(date);
            }
            if (this.toolService.isString(date)) {
                d = moment(date, this.options.format);
            }

            if (d) {
                v = d.format(this.options.format);

                this.ngModel.model = {
                    date: d,
                    value: v
                };
                this.ngModel.valueAccessor.writeValue(this.ngModel.model.value);
                this.ngModel.viewToModelUpdate(this.ngModel.model);
            }
        } else {
            // 没有值就初始化当前日期
            this.ngModel.model = {
                date: moment(new Date()),
                value: ''
            };
            this.ngModel.valueAccessor.writeValue(this.ngModel.model.value);
            this.ngModel.viewToModelUpdate(this.ngModel.model);
        }
    }

    /**
     * 给input增加点击事件
     * @param {MouseEvent} event
     */
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.enabled && !this.show) {
            if (!this.ngModel.model) {
                this.initDate();
            }

            this.initDatepickerComponent(event);
            setTimeout(() => {
                this.initDocClick();
                this.show = true;
            });
        } else if (!this.enabled) {
            event.srcElement.removeAttribute('readonly');
        }
    }

    /**
     * 初始化日期组件
     * @param {MouseEvent} event
     */
    initDatepickerComponent(event: MouseEvent) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(DatepickerComponent);
        this.datepickerRef = this.viewContainerRef.createComponent(factory);
        this.datepickerInstance = this.datepickerRef.instance;
        this.datepickerInstance.parent = this;
    }

    /**
     * 初始化背景点击事件
     */
    initDocClick() {
        this.docClickHook = this.render.listen(document, 'click', () => {
            // 正常点击 就删除datepicker
            if (!this.mouseMoveUpHook) {
                this.destoryDatepicker();
                this.mouseMoveUpHook = false;
            }
        });
    }

    /**
     * 删除日期选择框
     */
    destoryDatepicker() {
        if (this.show) {
            this.show = false;
        }
        if (this.docClickHook) {
            this.docClickHook();
            this.docClickHook = null;
        }
        if (this.datepickerRef) {
            this.datepickerRef.destroy();
            this.datepickerRef = null;
            this.datepickerInstance = null;
        }

        this.okCallback.emit('datepicker destory');
    }
}
