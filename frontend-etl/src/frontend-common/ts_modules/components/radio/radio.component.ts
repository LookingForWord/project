/**
 * Created by LIHUA on 2017-10-23.
 *  Radio 组件
 */
import {
    Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'radio-component',
    templateUrl: './radio.component.html',
    styleUrls: ['./radio.component.scss'],
})
export class RadioComponent implements OnInit, OnDestroy, OnChanges {
    @Input()
    value: any;        // 原始值
    @Input()
    modal: any;        // 模型值
    checked: boolean;  // 是否选中

    @Input()
    label: string;     // 显示的文字
    @Input()
    disabled: boolean; // 是否禁止
    @Input()
    index: number;     // 辅助的序号
    @Input()
    type: string;      // 辅助的类型
    @Output()
    callback: EventEmitter<any> = new EventEmitter();

    hover: boolean;

    @ViewChild('container')
    container: ElementRef;

    eventsHooks = [];

    constructor(private render: Renderer2) {}

    ngOnChanges(changes: SimpleChanges) {
        this.checked = changes.modal.currentValue === this.value;
    }

    ngOnDestroy() {
        this.eventsHooks.forEach(e => e());
    }

    ngOnInit() {
        let mouseenter = this.render.listen(this.container.nativeElement, 'mouseenter', () => {
            this.hover = true;
        });
        this.eventsHooks.push(mouseenter);

        let mouseleave = this.render.listen(this.container.nativeElement, 'mouseleave', () => {
            this.hover = false;
        });
        this.eventsHooks.push(mouseleave);
    }

    checkedClick() {
        if (this.disabled) {
            return;
        }

        if (this.callback) {
            this.callback.emit({
                checked: this.checked,
                index: this.index,
                type: this.type
            });
        }
    }
}

