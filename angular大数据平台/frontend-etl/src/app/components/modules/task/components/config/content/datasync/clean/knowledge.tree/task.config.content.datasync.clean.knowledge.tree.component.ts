/**
 * Created by LIHUA on 2017-10-10.
 * 数据清洗里 知识库 树形
 */

import {Component, Input, OnInit} from '@angular/core';

import {SystemService} from 'app/services/system.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'task-config-content-datasync-clean-knowledge-tree-component',
    templateUrl: './task.config.content.datasync.clean.knowledge.tree.component.html',
    styleUrls: ['./task.config.content.datasync.clean.knowledge.tree.component.scss']
})
export class TaskConfigContentDatasyncCleanKnowledgeTreeComponent implements OnInit {

    @Input()
    tress: any;

    @Input()
    tressAll: any;

    @Input()
    tressParent: any;

    @Input()
    index: number;

    constructor(private toolService: ToolService,
                private userService: SystemService) {
    }

    ngOnInit() {
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
        if (typeof this.tressAll === 'undefined') {
            this.tressAll = this.tress;
        }
    }

    /**
     * 树形单行点击选中
     * @param tree
     * @param {MouseEvent} $event
     */
    checkedClick(tree: any, $event: MouseEvent) {
        // 树形遍历
        this.toolService.treesTraverse(this.tressAll, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });

        // tree.checked = !tree.checked;
        tree.expand = !tree.expand;

        if (typeof tree.children === 'undefined') {
            this.getChildrenTree(tree);
        }
    }

    /**
     * 树形展开关闭点击
     * @param tree
     * @param {MouseEvent} $event
     */
    expandClick(tree: any, $event: MouseEvent) {
        tree.expand = !tree.expand;
    }

    /**
     * checkbox切换点击
     * @param tree
     * @param {MouseEvent} $event
     */
    selectedChange(tree, $event: MouseEvent) {
        let selected = tree.selected;

        this.toolService.treesTraverse(this.tressAll, {
            callback: (leaf: any) => {
                leaf.selected = false;
            }
        });

        tree.selected = selected;
    }

    /**
     * 获取子节点
     * @param tree
     */
    getChildrenTree(tree: any) {
        this.userService.getMenus({pid: tree.id})
            .then(d => {
                if (d.success) {
                    tree.children = d.message || [];
                    tree.children.forEach(t => {
                        t.expand = false;
                        t.checked = false;
                        t.selected = false;
                    });
                    tree.expand = true;
                }
            });
    }
}
