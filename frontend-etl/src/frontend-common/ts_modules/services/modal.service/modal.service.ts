/**
 * Created by LIHUA on 2017-08-03.
 */

import {ApplicationRef, Component, ComponentFactoryResolver, Injectable, Injector} from '@angular/core';
import {ModalAlertComponent} from 'frontend-common/ts_modules/services/modal.service/components/alert/modal.alert.component';
import {ModalBasicComponent} from 'frontend-common/ts_modules/services/modal.service/components/basic/modal.basic.component';
import {ModalConfrimComponent} from 'frontend-common/ts_modules/services/modal.service/components/confrim/modal.confirm.component';
import {ModalLoadingComponent} from 'frontend-common/ts_modules/services/modal.service/components/loading/modal.loading.component';

export interface ModalOptions {
    /**
     * 给content容器增加class
     */
    contentClass?: string;

    overlayClass?: string;

    /**
     * 给container容器增加class
     */
    containerClass?: string;

    /**
     * 是否显示背景层
     * true 或者 null 显示背景，并点击背景消失
     * false 不显示背景
     * static 显示背景 但是点击背景不消失
     */
    backdrop?: boolean | 'static';

    /**
     * 是否显示title
     * true 显示标题个关闭按钮
     */
    showTitle?: boolean;

    /**
     * confirm标题
     */
    title?: string;
}
export interface AlertOptions {
    /**
     * alert显示时间
     */
    time?: number;

    /**
     * 标题
     */
    title?: string;

    /**
     * 内容自动长度
     */
    auto?: boolean;
}

/**
 * 打开默认弹框的配置
 */
export interface ToolOpenOptions {
    title: string;             // 标题
    component: any;            // 组件
    datas?: any;               // 数据
    cancelLabel?: string;      // 取消按钮文本
    okLabel?: string;          // 确定按钮文本
    cancelCallback?: Function; // 取消按钮回调
    okCallback?: Function;     // 确定按钮回调
    autoOkHide?: boolean;      // 是否确定按钮自定隐藏
    hideInstance?: Function;   // 自定义隐藏回调
}

@Injectable()
export class ModalService {
    // 层级
    private zIndex = 10;

    // loading实例对象
    loadingRef: any;

    constructor(private applicationRef: ApplicationRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector) {}

    /**
     * 弹出模态框
     * @param content 自定义的模态框组件
     * @param options 配置
     * @returns {any} 自定义模态框组件的引用
     */
    open(content: any, options: ModalOptions = {}) {
        let elems = document.querySelectorAll('.app-modal-content');
        if (!elems || elems.length === 0) {
            // 初始化根组件  解构赋值
            let [contentRef, modalComponentRef] = this.getModalComponentRef(options, ModalBasicComponent);
            // 初始化内容组件
            return [this.getContentInstance(content, contentRef, modalComponentRef, options), modalComponentRef.instance];
        }
    }

    /**
     * 默认的toolOpen配置
     * @type {{}}
     */
    defaultToolOpenOptions: ToolOpenOptions = {
        title: '',
        component: null,
        cancelLabel: '取消',
        okLabel: '确定',
        autoOkHide: false
    };

    /**
     * 工具方法 弹出模态框
     * @param {ToolOpenOptions} option
     * @returns {[any , any]}
     */
    toolOpen(option: ToolOpenOptions) {
        option = Object.assign(this.defaultToolOpenOptions, option);

        let [ins, pIns] = this.open(option.component, {
            title: option.title,
            backdrop: 'static'
        });

        ins.hideInstance = option.hideInstance || (() => {
            ins.destroy();
        });

        pIns.setBtns([{
            name: option.cancelLabel,
            'class': 'btn',
            click: () => {
                ins.destroy();
                option.cancelCallback && option.cancelCallback();
            }
        }, {
            name: option.okLabel,
            'class': 'btn primary',
            click: () => {
                option.okCallback && option.okCallback();

                if (option.autoOkHide) {
                    ins.destroy();
                }
            }
        }]);

        if (option.datas) {
            Object.keys(option.datas).forEach(key => {
                ins[key] = option.datas[key];
            });
        }

        return [ins, pIns];
    }

    /**
     * * 弹出提示pop
     * @param {string} message 显示的消息
     * @param {AlertOptions} options options.alertType 显示从哪个位置出来, options.time 保留时间,超过时间自动消失, options.bgColor背景色
     */
    alert(message: string, options: AlertOptions = {}) {
        // 防止页面出现多个
        // let elm = document.querySelectorAll('.app-modal-alert-container');
        // if (elm.length) {
        //     return;
        // }
        let factory = this.componentFactoryResolver.resolveComponentFactory(ModalAlertComponent);
        let newNode = document.createElement(factory.selector);
        document.body.appendChild(newNode);

        let ref = factory.create(this.injector, [], newNode);
        let ins = ref.instance;
        ins.parent = ref;
        ins.message = message;
        ins.title = typeof options.title !== 'undefined' ? options.title : null;
        ins.time = typeof options.time !== 'undefined' ? options.time : 3000;
        ins.auto = typeof options.auto !== 'undefined' ? options.auto : false;

        this.applicationRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();
    }

    /**
     * 确认框
     * @param message
     * @param options
     * @returns {C}
     */
    confirm(message: string, options: ModalOptions = {}) {
        options.title = options.title || '提示';

        let [ins, pIns] = this.open(ModalConfrimComponent, options);

        Object.assign(ins, {
            message: message
        });

        return [ins, pIns];
    }

    /**
     * 确认框 辅助方法
     * @param {string} title
     * @param okCallback
     * @param {Function} cancelCallback
     */
    toolConfirm(title: string, okCallback, cancelCallback?: Function) {
        let [ins, pIns] = this.confirm(title);

        pIns.setBtns([{
            'name': '取消',
            'class': 'btn',
            click: () => {
                ins.cancelClick();
            }
        }, {
            'name': '确认',
            'class': 'btn primary',
            click: () => {
                ins.okClick();
            }
        }]);
        ins.okClick = () => {
            okCallback();
            ins.destroy();
        };
        ins.cancelClick = () => {
            if (cancelCallback) {
                cancelCallback();
            }
            ins.destroy();
        };
    }

    /**
     * 显示loading
     * @param {number} delay 自动延迟关闭时间
     */
    loadingShow(delay?: number) {
        if (this.loadingRef) {
            return;
        }

        let factory = this.componentFactoryResolver.resolveComponentFactory(ModalLoadingComponent);
        let newNode = document.createElement(factory.selector);

        document.body.appendChild(newNode);

        this.loadingRef = factory.create(this.injector, [], newNode);

        this.applicationRef.attachView(this.loadingRef.hostView);
        this.loadingRef.changeDetectorRef.detectChanges();

        if (delay) {
            setTimeout(() => {
                this.loadingRef.destroy();
                this.loadingRef = null;
            }, delay);
        }
    }

    /**
     * 手动关闭loading
     */
    loadingHide() {
        if (this.loadingRef) {
            this.loadingRef.destroy();
            this.loadingRef = null;
        }
    }

    /**
     * 初始化根组件实例
     */
    getModalComponentRef(options: any, modalBaseComponent: any) {
        // 初始化根组件
        let modalComponentFactory = this.componentFactoryResolver.resolveComponentFactory(modalBaseComponent);
        // 插入根组件的dom
        document.body.insertBefore(document.createElement(modalComponentFactory.selector), document.body.firstChild);

        // 最重要的这里 把组件插入到根应用
        let modalComponentRef = this.applicationRef.bootstrap(modalComponentFactory);
        // 获取实例
        let modalComponentInstance = modalComponentRef.instance;
        // 赋值操作
        Object.assign(modalComponentInstance, options);

        // 设置根组件z-index层级
        modalComponentInstance['render'].setStyle(modalComponentInstance['containerRef']['element']['nativeElement'], 'z-index', this.zIndex);
        // z-index的顺序增加先取消 尽量不在模态框上再用模态框
        // this.zIndex++;

        // 返回动态组件引用和根组件引用
        return [modalComponentInstance['contentRef'], modalComponentRef];
    }

    /**
     * 动态初始化模态组件
     * @param content 动态组件
     * @param contentRef
     * @param modalComponentRef
     * @param options
     * @returns {C}
     */
    getContentInstance(content: any, contentRef: any, modalComponentRef: any, options: any) {

        const contentFactory = this.componentFactoryResolver.resolveComponentFactory(content);
        let contentComponent = contentRef.createComponent(contentFactory);
        let contentInstance = contentComponent.instance;

        // 绑定一个destroy给外部调用 删除模态组件
        contentInstance['destroy'] = () => {
            this.destroy(contentComponent, modalComponentRef);
        };

        // 获取根组件实例
        let modalComponentInstance = modalComponentRef.instance;
        // 给背景层增加点击事件 这个根组件不一定具备点击层 比如alert
        modalComponentInstance['overlayClick'] = () => {
            // confirm时点击蒙层不关闭
            if (document.querySelectorAll('.app-modal-confirm-container').length === 0) {
                options.backdrop !== false &&
                options.backdrop !== 'static' &&
                this.destroy(contentComponent, modalComponentRef);
            }
        };
        // 给关闭按钮增加点击事件，这个根组件不一定具备关闭按钮 比如alert
        modalComponentInstance['closeClick'] = () => {
            this.destroy(contentComponent, modalComponentRef);
        };

        return contentInstance;
    }

    /**
     * 销毁
     */
    private destroy(contentComponent: any, modalComponentRef: any) {
        modalComponentRef.instance.isShow = false;

        setTimeout(() => {
            // 当点击组件的关闭按钮的时候 自动调用组件上的onDestroy方法
            contentComponent && contentComponent.instance.onDestroy && contentComponent.instance.onDestroy();
            // contentComponent 可能为null， 比如alert组件就没有
            contentComponent && contentComponent.destroy();
            modalComponentRef.destroy();
        }, 200);
    }

}
