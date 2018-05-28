/**
 * Created by LIHUA on 2017-08-09.
 */

import {AfterViewInit, Component, OnInit, Renderer2, ViewChild, ViewContainerRef} from '@angular/core';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

@Component({
    selector: 'modal-basci-component',
    templateUrl: './modal.basci.component.html',
    styleUrls: ['./modal.basci.component.scss'],
    animations: [
        Animations.fadeInOut
    ]
})
export class ModalBasicComponent implements OnInit {
    // 控制背景动画显示
    isShow: boolean = true;
    // 控制内容动画显示
    isContentShow: boolean = false;

    // 是否显示背景 及 背景点击
    backdrop: boolean | 'static';
    // 额外传递的content class
    contentClass: string;
    // 额外传递的overlay class
    overlayClass: string;
    // 额外传递的container class
    containerClass: string;

    // 是否显示title
    showTitle: boolean = true;
    // 模态框title
    title: string;
    // 按钮
    btns: any;
    // 提示
    warns: any;
    // 模态位置top值
    top: number;

    // 背景层点击
    overlayClick() {}
    // 关闭按钮点击
    closeClick() {}

    // 容器节点引用 动态改变z-index的时候需要
    @ViewChild('container', {read: ViewContainerRef}) containerRef;
    // 内容节点引用
    @ViewChild('content', {read: ViewContainerRef}) contentRef;

    constructor(private render: Renderer2,
                private toolService: ToolService) {
        // render 用于样式修改
    }

    ngOnInit() {
        setTimeout(() => {
            // 调节模态top值
            let clientHeight = document.documentElement.clientHeight;
            this.top = clientHeight >= 750 ? 100 : 50;
            this.isContentShow = true;
        });
    }

    /**
     * 添加按钮
     * @param btns
     */
    setBtns(btns: any) {
        this.btns = btns;
    }

    /**
     *
     */
    setWarn(warns: any) {
        this.warns = warns;
    }
}
