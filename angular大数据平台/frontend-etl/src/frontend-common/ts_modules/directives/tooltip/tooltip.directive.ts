/**
 * Created by LIHUA on 2017-08-14.
 * tooltip 文字提示
 */

import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {

    @Input()
    tooltip: string;

    @Input()
    tooltipShow: boolean;

    @Input()
    tooltipPosition: string;

    size: any;

    ele: any;

    constructor(private element: ElementRef, private render: Renderer2) {}

    ngOnInit() {
        this.tooltipPosition = this.tooltipPosition || 'bottom';

        this.render.listen(this.element.nativeElement, 'mouseenter', () => {
            if (this.tooltipShow !== undefined) {
                if (this.tooltipShow) {
                    this.size = this.getSize();
                    this.createTip();
                }
            } else {
                this.size = this.getSize();
                this.createTip();
            }
        });

        this.render.listen(this.element.nativeElement, 'mouseleave', () => {
            this.removeTip();
        });
    }

    ngOnDestroy() {
        this.removeTip();
    }

    getSize() {
        let size = {};
        size['offsetWidth'] = this.element.nativeElement.offsetWidth;
        size['offsetHeight'] = this.element.nativeElement.offsetHeight;
        let offset = this.getOffset(this.element.nativeElement);
        size['offsetTop'] = offset.top;
        size['offsetLeft'] = offset.left;

        return size;
    }

    getOffset(el) {
        let _x = 0,
            _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }

        // 滚动高度
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        return { top: _y + scrollTop, left: _x };
    }

    createTip() {
        this.ele = document.createElement('div');
        this.ele.className = 'tooltip-container ' + this.tooltipPosition;
        // this.ele.innerHTML = this.element.nativeElement.getAttribute('tooltip');
        this.ele.innerHTML = this.tooltip;


        let left, top;
        if (this.tooltipPosition === 'bottom') {
            left = this.size['offsetLeft'] + this.size['offsetWidth'] / 2;
            this.ele.style.left = left + 'px';
            this.ele.style.transform = 'translateX(-50%)';

            top = this.size['offsetTop'] + this.size['offsetHeight'] + 10;
            this.ele.style.top = top + 'px';
        }
        if (this.tooltipPosition === 'top') {
            left = this.size['offsetLeft'] + this.size['offsetWidth'] / 2;
            this.ele.style.left = left + 'px';

            top = this.size['offsetTop'] - 10;
            this.ele.style.top = top + 'px';

            this.ele.style.transform = 'translate(-50%, -100%)';
        }
        if (this.tooltipPosition === 'right') {
            left = this.size['offsetLeft'] + this.size['offsetWidth'] + 10;
            this.ele.style.left = left + 'px';

            top = this.size['offsetTop'] + this.size['offsetHeight'] / 2;
            this.ele.style.top = top + 'px';

            this.ele.style.transform = 'translateY(-50%)';
        }
        if (this.tooltipPosition === 'left') {
            left = this.size['offsetLeft'] - 10;
            this.ele.style.left = left + 'px';

            top = this.size['offsetTop'] + this.size['offsetHeight'] / 2;
            this.ele.style.top = top + 'px';

            this.ele.style.transform = 'translate(-100%, -50%)';
        }

        document.body.appendChild(this.ele);
    }

    removeTip() {
        if (this.ele) {
            document.body.removeChild(this.ele);
            this.ele = null;
        }
    }
}
