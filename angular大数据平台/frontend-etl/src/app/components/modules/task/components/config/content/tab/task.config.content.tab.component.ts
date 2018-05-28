/**
 * Created by LIHUA on 2017-09-18.
 *  内容 tab
 */

import {Component, ComponentFactoryResolver, QueryList, ViewChildren, ViewContainerRef} from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {TaskConfigContentDatasyncComponent} from 'app/components/modules/task/components/config/content/datasync/task.config.content.datasync.component';
import {TaskConfigContentDatasyncCollectionComponent} from 'app/components/modules/task/components/config/content/datasync/collection/task.config.content.datasync.collection.component';
import {TaskConfigContentDatasyncCleanComponent} from 'app/components/modules/task/components/config/content/datasync/clean/task.config.content.datasync.clean.component';
import {TaskConfigContentDatasyncOutputComponent} from 'app/components/modules/task/components/config/content/datasync/output/task.config.content.datasync.output.component';
import {TaskConfigContentDatasyncConvergeComponent} from 'app/components/modules/task/components/config/content/datasync/converge/task.config.content.datasync.converge.component';
import {TaskConfigContentDatasyncMergeSplitComponent} from 'app/components/modules/task/components/config/content/datasync/merge.split/task.config.content.datasync.merge.split.component';

@Component({
    selector: 'task-config-content-tab-component',
    templateUrl: './task.config.content.tab.component.html',
    styleUrls: ['./task.config.content.tab.component.scss']
})
export class TaskConfigContentTabComponent {
    modules: any;        // dataitem节点配置列表
    configs: any;        // datasync节点配置列表
    plugins: any;        // plugin节点配置列表
    task: any;           // 任务基础信息

    contents = [];       // 内容列表 包含以下字段 title, checked, host, instance, type
    @ViewChildren('cons', {read: ViewContainerRef}) cons: QueryList<ViewContainerRef>; // 动态组件挂载列表

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private modalService: ModalService,
                private toolService: ToolService) {}

    /**
     * 添加content
     * @param content
     */
    addContent(content) {
        // 先查找要显示的组件是否存在 存在就直接显示
        let find = -1;
        this.contents.forEach((con, index) => {
            if (content.notShow) { // 强制不显示，就不去管切换显示问题
                content.checked = false;
                return;
            }
            if (con.uuid === content.uuid) { // 根据id查找显示
                con.checked = true;
                find = index;
                con.instance.onShow && con.instance.onShow();
            } else {
                con.checked = false;
            }
        });

        // 不存在就新增组件
        if (find === -1) {
            this.contents.push(content);
            setTimeout(() => {
                this.addComponent(content);
            });
        }
    }

    /**
     * 根据content type 动态添加组件，也可以根据类型让组件选中显示
     * @param content
     */
    addComponent(content: any) {
        let component;

        switch (content.type) {
            case 'datasync': component = TaskConfigContentDatasyncComponent; break;
            case 'datasync.collection': component = TaskConfigContentDatasyncCollectionComponent; break;
            case 'datasync.clean': component = TaskConfigContentDatasyncCleanComponent; break;
            case 'datasync.output': component = TaskConfigContentDatasyncOutputComponent; break;
            case 'datasync.converge': component = TaskConfigContentDatasyncConvergeComponent; break;
            case 'datasync.merge.split': component = TaskConfigContentDatasyncMergeSplitComponent; break;
        }

        let last = this.cons.last;
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        content.instance = last.createComponent(componentFactory).instance;
        content.host = last;
        content.instance.nickname = content.nickname;
        if (content.type === 'datasync') {
            content.instance.task = this.task;
            content.instance.parent = this;
            content.instance.modules = content.modules;
            content.instance.initCanvas();
        } else if (this.toolService.contains(content.type, ['datasync.collection', 'datasync.clean', 'datasync.merge.split', 'datasync.converge', 'datasync.output'])) {
            content.instance.task = this.task;
            content.instance.parent = this;
            content.instance.uuid = content.uuid;
            content.instance.moduleNumber = content.moduleNumber;
        }
    }

    /**
     * 底部导航切换
     * @param content
     */
    toggleContentClick(content) {
        this.contents.forEach(c => c.checked = false);
        content.checked = true;
        content.instance.onShow && content.instance.onShow();
    }

    /**
     * 根据类型 获取content
     * @param {string} type
     * @returns {any[]}
     */
    getContentByType(type: string) {
        let cons = this.contents.filter(content => {
            return content.type === type;
        });
        if (cons && cons.length) {
            return cons[0];
        }
    }

    /**
     * 根据uuid 获取content
     * @param {string} uuid
     * @returns {any}
     */
    getContentByUuid(uuid: string) {
        let cons = this.contents.filter(content => {
            return content.uuid === uuid;
        });
        if (cons && cons.length) {
            return cons[0];
        }
    }

    /**
     * 根据类型 删除content
     * @param {string} uuid
     */
    removeContentByUuid(uuid: string) {
        this.contents = this.contents.filter(content => {
            return content.uuid !== uuid;
        });

        // 默认都显示画布首页
        let component = this.getContentByType('datasync');
        component.checked = true;
    }

    /**
     * 删除点击，这个点击同时会触发画布元素的删除操作
     * @param content
     * @param {MouseEvent} $event
     */
    removeContent(content: any, $event: MouseEvent) {
        let component = this.getContentByType('datasync');
        component.instance.deleteItemByUuid(content.uuid);
        $event.stopPropagation();
    }

    /**
     * 返回画布页面
     */
    backDatasync() {
        this.contents.forEach(content => {
            content.checked = content.type === 'datasync';
        });
    }

}
