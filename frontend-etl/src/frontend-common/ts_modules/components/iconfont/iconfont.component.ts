/**
 * Created by LIHUA on 2017-10-23.
 *  iconfont 图标组件
 */
import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';

@Component({
    selector: 'iconfont-component',
    template: `
        <svg #container
             aria-hidden="true" 
             [style.width.px]="width"
             [style.height.px]="height"
             [style.fill]="fill"
             style="vertical-align: -0.15em;overflow: hidden;">
            <use [attr.xlink:href]="renderName"></use>
        </svg>
    `
})
export class IconfontComponent implements OnInit, OnDestroy {
    @Input()
    name: string;       // icon输入名字

    @Input()
    fill: string;       // 填充颜色
    @Input()
    hover: string;      // 填充颜色

    @Input()
    width: number;      // 宽度
    @Input()
    height: number;     // 高度

    @ViewChild('container')
    container: ElementRef; // 内容容器

    defaultFill = 'currentColor'; // 默认填充颜色
    defaultWidth = 16;            // 默认宽度
    defaultHeight = 16;           // 默认高度

    renderName: string;  // render name

    eventsHooks = [];

    constructor(private render: Renderer2) {}

    ngOnInit() {
        this.width = this.width || this.defaultWidth;
        this.height = this.height || this.defaultHeight;
        this.fill = this.fill || this.defaultFill;
        this.defaultFill = this.fill;
        this.hover = this.hover || this.fill;
        this.renderName = '#icon-' + this.name;

        let mouseenter = this.render.listen(this.container.nativeElement, 'mouseenter', () => {
            this.fill = this.hover;
        });
        this.eventsHooks.push(mouseenter);

        let mouseleave = this.render.listen(this.container.nativeElement, 'mouseleave', () => {
            this.fill = this.defaultFill;
        });
        this.eventsHooks.push(mouseleave);
    }

    ngOnDestroy() {
        this.eventsHooks.forEach(e => e());
    }
}
