/**
 * Created by lh on 2017/11/10.
 */

import {
    Component, ComponentFactoryResolver, OnInit, QueryList, ViewChildren,
    ViewContainerRef
} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceNormAuditContentItemsCanvasComponent} from 'app/components/modules/governance/components/norm.audit/content/items/canvas/governance.norm.audit.content.items.canvas.component';
import {GovernanceNormAuditContentRunPluginShellComponent} from 'app/components/modules/governance/components/norm.audit/content/run.plugin/shell/governance.norm.audit.content.run.plugin.shell.component';

// 组件基础接口属性
export interface WorkflowWorkContentItemsInterface {
    type: string;      // 组件类型
    instance: any;     // 组件挂载实例
    checked: boolean;  // 组件是否显示
    uuid: string;      // 组件id
}

@Component({
    selector: 'governance-norm-audit-content-items-component',
    templateUrl: './governance.norm.audit.content.items.component.html',
    styleUrls: ['./governance.norm.audit.content.items.component.scss']
})
export class GovernanceNormAuditContentItemsComponent implements OnInit {
    task: any; // 任务基础信息

    contents = Array<WorkflowWorkContentItemsInterface>(); // 内容
    asides = Array<WorkflowWorkContentItemsInterface>();   // 侧边栏内容

    showAsides = false;     // 是否显示侧边栏
    showAsidesHook: any;    // 侧边栏显示hook

    sidesArr = [];          // 侧边栏数据集合
    shellUpdate = false;    // 侧边栏是否更新过
    checkedNorm: any;
    uuid: any;


    @ViewChildren('cons', {read: ViewContainerRef}) cons: QueryList<ViewContainerRef>; // 动态组件挂载列表
    @ViewChildren('asis', {read: ViewContainerRef}) asis: QueryList<ViewContainerRef>; // 动态组件挂载列表

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private modalService: ModalService) {

    }

    ngOnInit() {
        this.initCanvas();
        if (this.task && this.task.flowInfo && this.task.flowInfo.taskPosition) {
            this.sidesArr = [{
                checkedFunc: this.task.flowInfo.configInfo && JSON.parse(this.task.flowInfo.configInfo).checkedFunc,
                templateContent: this.task.flowInfo.configInfo && JSON.parse(this.task.flowInfo.configInfo).jsStr,
                sql: this.task.flowInfo.configInfo && JSON.parse(this.task.flowInfo.configInfo).sql,
                uuid: this.uuid || (this.task.flowInfo.configInfo && JSON.parse(this.task.flowInfo.configInfo).uuid)
            }];
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
            const num = this[type].length > 0 ? this[type].length : 1;
            this[type][num - 1].uuid = content.uuid;
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
            case 'canvas': component = GovernanceNormAuditContentItemsCanvasComponent; break;
            case 'run.plugin.shell': component = GovernanceNormAuditContentRunPluginShellComponent; break;
        }
        let first = type === 'contents' ? this.cons.first : this.asis.first;
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        content.instance = first.createComponent(componentFactory).instance;
        content.host = first;

        if (content.type === 'canvas') {
            content.instance.task = this.task;
            content.instance.parent = this;
            // 还原
            if (this.task.flowInfo) {
                content.instance.initCanvas();
            }
        } else if (content.type === 'run.plugin.shell') {
            content.instance.task = this.task;
            content.instance.uuid = this.uuid || content.uuid;
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
}
