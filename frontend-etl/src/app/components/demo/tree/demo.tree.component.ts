/**
 * Created by lh on 2017/11/1.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'demo-tree-component',
    templateUrl: './demo.tree.component.html',
    animations: [Animations.slideUpDwon]
})
export class DemoTreeComponent implements OnInit {
    @Input()
    tress: any;
    @Input()
    tressAll: any;
    @Input()
    treeParent: any;
    @Input()
    index: number;

    checklist = [];
    result = {};

    constructor(private toolService: ToolService) {

    }

    ngOnInit() {
        if (typeof this.tressAll === 'undefined') {
            this.tressAll = this.tress;
        }
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
    }

    getName(tree: any) {
        tree.parent = this.treeParent;

        return tree.name;
    }

    toggleExpandClick(tree: any) {
        tree.expand = !tree.expand;
    }


    toggleCheckedClick(tree: any, $event: MouseEvent) {
        tree.checked = !tree.checked;
        if (!tree.checked) {
            tree.some = false;
        }
        setTimeout(() => {
            // 向上查找 选中或取消选中 父节点

            let findParent = (node) => {
                let temp = node.children.filter(n => n.checked);
                let hasSome = node.children.filter(n => n.some);
                if (node.children) {
                    if (temp.length === node.children.length) {
                        node.checked = true;
                        node.some = false;
                    } else if (temp.length && (temp.length < node.children.length)) {
                        node.checked = false;
                        node.some = true;
                    } else if (hasSome.length && hasSome.length > 0) {
                        node.checked = false;
                        node.some = true;
                    } else if (temp.length <= 0 && hasSome.length <= 0) {
                        node.checked = false;
                        node.some = false;
                    }
                }
                // node.checked = temp.length === node.children.length;
                // node.some = !(temp.length === node.children.length) ;

                if (node.parent) {
                    findParent(node.parent);
                }
            };
            if (tree.parent) {
                findParent(tree.parent);
            }

            // 给子节点赋予当前节点的checked状态
            this.toolService.treesTraverse(tree, {
                callback: (leaf) => {
                    leaf.checked = tree.checked;
                }
            });
            // console.log(this.tressAll);
            this.checklist = [];
            this.toolService.treesTraverse(this.tressAll, {
                callback: (temp) => {
                    if (temp.checked) {
                        this.checklist.push(temp);
                    }
                }
            });
            // console.log(this.checklist);
        });
    }
    up(all, now, upItem) {
        let items = now;
        now.forEach( ( item, index) => {
            if (item.id === upItem.id) {
                items.splice(index, 1);
                items.splice((index - 1), 0 , upItem);
            }
        });
    }
    down(all, now, downItem) {
        let items = now;
        for (let i = 0; i < now.length; i++) {
            if (now[i].id === downItem.id) {
                // console.log(i);
                items.splice(i, 1);
                // console.log(items);

                items.splice((i + 1), 0 , downItem);
                // console.log(items);
                return;
            }
        }
    }
}
