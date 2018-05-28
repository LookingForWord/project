/**
 * Created by LIHUA on 2017-08-09.
 */

import {AfterViewInit, Component, Renderer2, ViewChild, ViewContainerRef} from '@angular/core';

@Component({
    selector: 'modal-alert-component',
    templateUrl: './modal.alert.component.html',
    styleUrls: ['./modal.alert.component.scss']
})
export class ModalAlertComponent implements AfterViewInit {

    // 父节点
    parent: any;

    // top位置
    top = -60;

    opacity = 0;

    // 显示的消息内容
    message: string;

    // 消失毫秒数
    time: number;

    // 标题
    title: string;

    // 内容自动长度
    auto: boolean;

    // 根容器节点引用
    @ViewChild('alert') alertRef;

    constructor(private render: Renderer2) {}

    ngAfterViewInit() {
        let alerts = document.querySelectorAll('.app-modal-alert-container');

        if (alerts && alerts.length > 1) {
            let top = alerts[alerts.length - 2].getAttribute('top');
            let lastOffset = alerts[alerts.length - 2]['offsetHeight'];
            let lastTop = Number(top);

            this.top = lastTop > 0 ? lastTop + lastOffset + 10 : 20;
            this.opacity = 1;

            alerts[alerts.length - 1].setAttribute('top', this.top + '');
        } else {
            setTimeout(() => {
                this.top = 20;
                this.opacity = 1;

                // 把前一个滑块的位置保存在dom里
                alerts[0].setAttribute('top', this.top + '');
            });
        }

        if (this.time) {
            setTimeout(() => {
                this.closeClick();
            }, this.time);
        }
    }

    /**
     * css 动画函数回调
     */
    initTransitionEndCallback() {
        this.render.listen(this.alertRef.nativeElement, 'transitionend', () => {
            this.parent.destroy();
        });
    }

    /**
     * 点击隐藏
     */
    closeClick() {
        this.top = Number(this.alertRef.nativeElement['style']['top'].replace('px', '')) - 30;
        this.opacity = 0;

        this.initTransitionEndCallback();
    }

}
