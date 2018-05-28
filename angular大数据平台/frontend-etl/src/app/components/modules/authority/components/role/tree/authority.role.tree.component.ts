/**
 * Created by xxy on 2017-10-27.
 *  树形递归展示
 */

import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

import {ActionTypeEnum} from 'app/components/modules/authority/components/role/add/authority.role.add.component';
import {AuthorityService} from 'app/services/authority.service';

@Component({
    selector: 'authority-role-tree-component',
    templateUrl: './authority.role.tree.component.html',
    styleUrls: ['./authority.role.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class AuthorityRoleTreeComponent implements OnDestroy, OnInit {

    @Input()
    actionType: string;     // 类型 addmenu 添加目录， menulist 目录列表
    @Input()
    menuList: any;    // 目录列表
    @Input()
    index: number;    // 层级
    @Input()
    parent: any;      // 父级目录
    @Input()
    flows: any;       // 树的全部数据
    @Input()
    treeType: string; // 树的类型
    checkList =  [];


    // 目录 在目录上监听右键事件
    @ViewChild('titleContainer') titleContainer: ElementRef;
    projectName: any; // 目录名


    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private toolService: ToolService,
                private authorityService: AuthorityService) {
    }

    ngOnDestroy() {

    }
    ngOnInit() {
        if (typeof this.flows === 'undefined') {
            this.flows = this.menuList;
        }
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
    }

    // 获取当前的name，和给父级赋值
    getName(flow: any) {
        flow.parent = this.parent;
        if (this.treeType === ActionTypeEnum.DEPARTMENT) {   // 权限配置
            return flow.resourceName;
        } else if (this.treeType === ActionTypeEnum.STAFF) { // 人员配置
            if (flow.type === 0 && flow.code) {
                return flow.name + '(' + flow.code + ')';
            } else {
                return flow.name;
            }
        } else if (this.treeType === ActionTypeEnum.PORT) {
            return flow.dimName ;
        }
    }
    /**
     * 树形单击
     * @param flow
     * flow.type === 1 为菜单， flow.type === 2 为按钮，
     * @param {MouseEvent} $event
     */

    checkedClick(flow, $event: MouseEvent) {
        flow.checked = !flow.checked;
        if (this.treeType === ActionTypeEnum.DEPARTMENT) {
            if (!flow.checked && flow.type !== 2) {
                flow.some = false;
            }
        } else if (this.treeType === ActionTypeEnum.STAFF) {

        }

        setTimeout(() => {
            // 向上查找 选中或取消选中 父节点
            let findParent = (node) => {
                let temp, tempAll;
                if (this.treeType === ActionTypeEnum.DEPARTMENT) {
                    // 查询 类型为菜单 选中或者半选中的子节点
                    temp = node.children.filter(n => n.type === 1 && (n.checked || n.some));
                    // 查询 类型为菜单 全部子节点
                    tempAll = node.children.filter(n => n.type === 1);
                } else if (this.treeType === ActionTypeEnum.STAFF) {
                    // 查询 类型为菜单 选中或者半选中的子节点
                    temp = node.children.filter(n => n.checked || n.some);
                    // 查询 类型为菜单 全部子节点
                    tempAll = node.children;
                }


                if (temp.length > 0 && temp.length === tempAll.length) {
                    node.checked = true;
                    node.some = false;
                } else if (temp.length > 0) {
                    node.checked = false;
                    node.some = true;
                } else {
                    node.checked = false;
                    node.some = false;
                }

                if (node.parent) {
                    findParent(node.parent);
                }
            };

            // 只有菜单类型才向上查询父元素 确定父元素选中与否
            if (this.treeType === ActionTypeEnum.DEPARTMENT) {
                if (flow.type === 1 && flow.parent) {
                    findParent(flow.parent);
                }
            } else if (this.treeType === ActionTypeEnum.STAFF) {
                if (flow.parent) {
                    findParent(flow.parent);
                }

            }

            // 给子节点统一赋值当前节点的选中状态
            this.toolService.treesTraverse(flow, {
                callback: (leaf) => {
                    leaf.checked = flow.checked;
                    leaf.some = false;
                }
            });

            this.checkList = [];
            // 遍历树拿到选中的集合
            this.toolService.treesTraverse(this.flows, {
                callback: (temp) => {
                    // 如果树的treeType为staff时，只拿人员的id，故type为0时才加入选中集合中
                    if (this.treeType === ActionTypeEnum.STAFF) {
                        if (temp.checked && temp.type === 0) {
                            this.checkList.push(temp);
                        }
                    }

                    if (this.treeType === ActionTypeEnum.DEPARTMENT) {
                        if (temp.checked || temp.some) {
                            this.checkList.push(temp);
                        }
                    }
                    if (this.treeType === ActionTypeEnum.PORT) {
                        if (temp.checked || temp.some) {
                            this.checkList.push(temp);
                        }
                    }
                }
            });
            // 选中的id的集合
            let ids = '';
            let idList = [];
            this.checkList.forEach( (check) => {
                idList.push(
                    check.id
                );
                // 权限自己选中   父级就必须入参也选中
                if (this.treeType === ActionTypeEnum.DEPARTMENT) {
                    // 当不是按钮时才去找父元素的id
                    if (check.type !== 2) {
                        this.findParentMenu(idList, check);
                    }
                }
            });

            ids = idList.join(',');
            // 获取权限配置选中的权限的ids
            if ( this.treeType === ActionTypeEnum.DEPARTMENT) {
                this.datatransferService.authorityOrleIdsSubject.next({
                    treeType: this.treeType,
                    ids: ids
                });
            } else if (this.treeType === ActionTypeEnum.STAFF) {
                // 获取人员配置选中的ids
                this.datatransferService.authorityOrleIdsSubject.next({
                    treeType: this.treeType,
                    ids: ids
                });
            } else if (this.treeType === ActionTypeEnum.PORT) {
                this.datatransferService.authorityOrleIdsSubject.next({
                    treeType: this.treeType,
                    ids: ids
                });
            }
        });

    }

    /**
     * 人员的全选
     * @param flow
     * @param {MouseEvent} $event
     */
    staffCheck(flow, $event: MouseEvent) {
        flow.checked = !flow.checked;
        this.toolService.treesTraverse(flow.children, {
            callback: (leaf) => {
                if (leaf.type === 0) {
                    if (flow.checked) {
                        leaf.checked = true;
                    } else if (!flow.checked) {
                        leaf.checked = false;
                    }

                }
            }
        });

    }

    async expandClick(flow, $event: MouseEvent) {
        $event.stopPropagation();
        flow.expand = !flow.expand;
    }

    // /**
    //  * 获取接口列表
    //  */
    // async getPortList(id) {
    //     this.authorityService.getPortList({
    //         systemId: id
    //     }).then(data => {
    //         console.log(data);
    //     });
    // }

    /**
     * 角色的话只要有自己的权限 就必须同时拥有父级的权限
     * idList选中项的id集合   item   当前项
     */
    findParentMenu(idList: any, check: any) {
        if (check.parent && idList.join(',').indexOf(check.parent.id) === -1) {
            idList.push(check.parent.id);
            if (check.parent.parent) {
                this.findParentMenu(idList, check.parent);
            }
        }
    }

}
