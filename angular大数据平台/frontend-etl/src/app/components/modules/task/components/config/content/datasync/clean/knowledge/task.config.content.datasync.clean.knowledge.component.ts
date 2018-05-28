/**
 * Created by LIHUA on 2017-10-10.
 * 数据清洗里 知识库
 */

import {Component} from '@angular/core';

import {SystemService} from 'app/services/system.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'task-config-content-datasync-clean-knowledge-component',
    templateUrl: './task.config.content.datasync.clean.knowledge.component.html',
    styleUrls: ['./task.config.content.datasync.clean.knowledge.component.scss']
})
export class TaskConfigContentDatasyncCleanKnowledgeComponent {

    enums = []; // 选中的知识库数据
    tress = []; // 知识库目录树 原始数据

    constructor(private userService: SystemService,
                private toolService: ToolService) {
        this.getTrees();
    }

    /**
     * 获取目录原始数据
     */
    getTrees() {
        this.tress = [];
        this.userService.getMenus({pid: '0'}).then(d => {
            if (d.success) {
                this.initTress(d.message);
            }
        });
    }

    /**
     * 目录数据解析
     * @param tress
     * @returns {Array}
     */
    initTress(tress: any) {
        // 初始化树形结构
        this.toolService.treesInit(tress, {
            container: this.tress,
            callback: (leaf: any) => {
                leaf.expand = false;
                leaf.checked = false;
                leaf.selected = false;
            }
        });

        // 恢复原始选中状态
        this.toolService.treesTraverse(this.tress, {
            callback: (leaf: any) => {
                this.enums.forEach(e => {
                    if (e.id === leaf.id) {
                        leaf.selected = true;
                    }
                });
            }
        });
    }

    /**
     * 确认点击
     */
    okClick() {
        let selectedTress = [];

        // 树形结构遍历
        this.toolService.treesTraverse(this.tress, {
            callback: (leaf: any) => {
                if (leaf.selected) {
                    selectedTress.push(leaf);
                }
            }
        });

        return selectedTress;
    }

    /**
     * 隐藏回调
     */
    hideInstance: Function;

}
