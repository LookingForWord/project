/**
 * Created by lh on 2017/11/10.
 */

import {
    Component, ComponentFactoryResolver, OnInit, QueryList, Renderer2, ViewChildren,
    ViewContainerRef
} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WebSocketService} from 'app/services/websocket.service';
import {WorkflowWorkContentItemsCanvasComponent} from 'app/components/modules/workflow/components/work/content/items/canvas/workflow.work.content.items.canvas.component';
import {WorkflowWorkContentRunPluginShellComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/shell/workflow.work.content.run.plugin.shell.component';

// 组件基础接口属性
export interface WorkflowWorkContentItemsInterface {
    type: string;      // 组件类型
    instance: any;     // 组件挂载实例
    checked: boolean;  // 组件是否显示
    uuid: string;      // 组件id,
}

@Component({
    selector: 'workflow-work-content-items-component',
    templateUrl: './workflow.work.content.items.component.html',
    styleUrls: ['./workflow.work.content.items.component.scss']
})
export class WorkflowWorkContentItemsComponent implements OnInit {
    task: any; // 任务基础信息

    contents = Array<WorkflowWorkContentItemsInterface>(); // 内容
    asides = Array<WorkflowWorkContentItemsInterface>();   // 侧边栏内容

    showAsides = false;     // 是否显示侧边栏
    showAsidesHook: any;    // 侧边栏显示hook

    showTrigger = false;    // 是否显示侧边栏
    showTriggerHook: any;   // 侧边栏显示hook
    sidesArr = [];          // 侧边栏数据集合
    shellUpdate = false;    // 侧边栏是否更新过


    @ViewChildren('cons', {read: ViewContainerRef}) cons: QueryList<ViewContainerRef>; // 动态组件挂载列表
    @ViewChildren('asis', {read: ViewContainerRef}) asis: QueryList<ViewContainerRef>; // 动态组件挂载列表

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private modalService: ModalService,
                private webSocketService: WebSocketService,
                private render: Renderer2) {

    }

    ngOnInit() {
        this.initCanvas();
        if (this.task.flowInfo && this.task.flowInfo.jobs) {
            this.task.flowInfo.jobs.forEach(job => {
                this.sidesArr.push({...job, uuid: job.jobId});
            });
        }
    }

    /**
     * 添加content
     * @param content 带添加或显示的组件参数
     * @param {string} type 组件属性
     */
    addContent(content, type: string) {
        // 先查找要显示的组件是否存在 存在就直接显示
        let find = -1;
        this[type].forEach((con, index) => {
            if (content.notShow) { // 强制不显示，就不去管切换显示问题
                return;
            }

            if (con.uuid === content.uuid) {
                con.checked = true;
                find = index;
                con.instance.onShow && con.instance.onShow();
            } else {
                con.checked = false;
            }
        });

        // 不存在就新增组件
        if (find === -1) {
            this[type].unshift(content);
            setTimeout(() => {
                this.addComponent(content, type);
            });
        }
    }

    /**
     * 根据content type 动态添加组件，也可以根据类型让组件选中显示
     * 每次创建的时候  对应的侧边栏也会被同时创建
     * @param content
     */
    addComponent(content: any, type: string) {
        let component;
        // 每个tab下又对应一个list    包含了数据源、数据清洗、数据输出、插件管理
        switch (content.type) {
            case 'canvas': component = WorkflowWorkContentItemsCanvasComponent; break;
            case 'run.plugin.shell': component = WorkflowWorkContentRunPluginShellComponent; break;
        }
        let first = type === 'contents' ? this.cons.first : this.asis.first;
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        content.instance = first.createComponent(componentFactory).instance;
        content.host = first;

        if (content.type === 'canvas') {
            content.instance.task = this.task;
            content.instance.parent = this;
            // 双击工作流
            clearInterval(content.instance.runHook);
            this.webSocketService.ws && this.webSocketService.close();

            if (this.task.flowInfo) {
                content.instance.initCanvas();
            }
        } else if (content.type === 'run.plugin.shell') {
            content.instance.cid = content.cid;
            content.instance.external = (content.cid === '46' ? true : false);
            content.instance.task = this.task;
            content.instance.uuid = content.uuid;
            content.instance.parent = this;
        }
    }

    /**
     * 初始化画布信息
     */
    initCanvas() {
        this.addContent({
            checked: true,
            instance: null,
            type: 'canvas'
        }, 'contents');
    }

    /**
     * 侧边栏点击
     */
    asidesPanelClick($event) {
        $event['asidesPanelBackground'] = true;
    }

    /**
     * 展开asides侧边栏
     */
    expandAsidesPanel() {
        if (!this.showAsides) {
            this.showAsides = true;
            // setTimeout(() => {
            //     this.showAsidesHook = this.render.listen(document, 'click', (e: MouseEvent) => {
            //         if (e['asidesPanelBackground']) {
            //             return;
            //         } else {
            //             if (this.shellUpdate) {
            //                 this.modalService.alert('请保存配置信息', {time: 1000});
            //                 return;
            //             }
            //             if (this.showAsides && !this.shellUpdate) {
            //                 this.showAsides = false;
                            // this.removeAsidesHook();
                        // }
            //         }
            //     });
            // });
        } else {
            if (this.shellUpdate) {
                this.modalService.alert('请保存配置信息', {time: 1000});
                return;
            }
            if (this.showAsides && !this.shellUpdate) {
                this.showAsides = false;
            }
        }
    }

    /**
     * 删除asideshook
     */
    removeAsidesHook() {
        if (this.showAsidesHook) {
            this.showAsidesHook();
            this.showAsidesHook = null;
        }
    }

    /**
     * 侧边栏点击
     */
    triggerPanelClick($event) {
        $event['triggerPanelBackground'] = true;
    }

    /**
     * 展开asides侧边栏
     */
    expandTriggerPanel() {
        this.showTrigger = true;
        setTimeout(() => {
            this.showTriggerHook = this.render.listen(document, 'click', (e: MouseEvent) => {
                if (e['triggerPanelBackground']) {
                    return;
                } else {
                    if (this.showTrigger) {
                        this.showTrigger = false;
                        this.removeTriggerHook();
                    }
                }
            });
        });
    }

    /**
     * 删除asideshook
     */
    removeTriggerHook() {
        if (this.showTriggerHook) {
            this.showTriggerHook();
            this.showTriggerHook = null;
        }
    }

    /**
     * 关闭trigger
     */
    closeTrigger(action) {
        this.showTrigger = false;
        this.removeTriggerHook();
    }
}
