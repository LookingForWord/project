import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ActionTypeEnum} from 'app/components/modules/authority/components/role/add/authority.role.add.component';
import {AuthorityService} from 'app/services/authority.service';
@Component({
    selector: 'authority-role-permission-tree-component',
    templateUrl: './authority.role.permission.tree.component.html',
    styleUrls: ['./authority.role.permission.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class AuthorityRolePermissionTreeComponent implements OnDestroy, OnInit {
    @Input()
    dataList: any;                  // 数据模型
    @Input()
    treeType: any;                  // 树类型
    @Input()
    index: number;                  // 层级
    @Input()
    parent: any;

    checkList: any;

    constructor(private authorityService: AuthorityService,
                private toolService: ToolService,
                private modalService: ModalService,
                private datatransferService: DatatransferService) {

    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

    /**
     * 展开关闭
     */
    expandClick(flow, $event: MouseEvent) {
        $event.stopPropagation();
        flow.expand = !flow.expand;
    }

    /**
     * 选框点击
     */
    checkedClick(flow, $event: MouseEvent) {
        flow.checked = !flow.checked;
        if (flow.some) {
            flow.some = false;
        }
        // setTimeout(() => {
        //     // 向上查找 选中或取消选中 父节点
        //     let findParent = (node) => {
        //         let temp, tempAll;
        //         if (this.treeType === ActionTypeEnum.DEPARTMENT) {
        //             // 查询 类型为菜单 选中或者半选中的子节点
        //             temp = node.children.filter(n => n.type === 1 && (n.checked || n.some));
        //             // 查询 类型为菜单 全部子节点
        //             tempAll = node.children.filter(n => n.type === 1);
        //         } else if (this.treeType === ActionTypeEnum.STAFF) {
        //             // 查询 类型为菜单 选中或者半选中的子节点
        //             temp = node.children.filter(n => n.checked || n.some);
        //             // 查询 类型为菜单 全部子节点
        //             tempAll = node.children;
        //         }
        //
        //
        //         if (temp.length > 0 && temp.length === tempAll.length) {
        //             node.checked = true;
        //             node.some = false;
        //         } else if (temp.length > 0) {
        //             node.checked = false;
        //             node.some = true;
        //         } else {
        //             node.checked = false;
        //             node.some = false;
        //         }
        //
        //         if (node.parent) {
        //             findParent(node.parent);
        //         }
        //     };
        //
        //     // 只有菜单类型才向上查询父元素 确定父元素选中与否
        //     if (this.treeType === ActionTypeEnum.DEPARTMENT) {
        //         if (flow.type === 1 && flow.parent) {
        //             findParent(flow.parent);
        //         }
        //     } else if (this.treeType === ActionTypeEnum.STAFF) {
        //         if (flow.parent) {
        //             findParent(flow.parent);
        //         }
        //
        //     }
        //
        //     // 给子节点统一赋值当前节点的选中状态
        //     this.toolService.treesTraverse(flow, {
        //         callback: (leaf) => {
        //             leaf.checked = flow.checked;
        //             leaf.some = false;
        //         }
        //     });
        //
        //     this.checkList = [];
        //     // 遍历树拿到选中的集合
        //     this.toolService.treesTraverse(this.dataList, {
        //         callback: (temp) => {
        //             // 如果树的treeType为staff时，只拿人员的id，故type为0时才加入选中集合中
        //             if (this.treeType === ActionTypeEnum.STAFF) {
        //                 if (temp.checked && temp.type === 0) {
        //                     this.checkList.push(temp);
        //                 }
        //             }
        //
        //             if (this.treeType === ActionTypeEnum.DEPARTMENT) {
        //                 if (temp.checked || temp.some) {
        //                     this.checkList.push(temp);
        //                 }
        //             }
        //             if (this.treeType === ActionTypeEnum.PORT) {
        //                 if (temp.checked || temp.some) {
        //                     this.checkList.push(temp);
        //                 }
        //             }
        //         }
        //     });
        //     // 选中的id的集合
        //     let ids = '';
        //     let idList = [];
        //     this.checkList.forEach( (check) => {
        //         idList.push(
        //             check.id
        //         );
        //         // 权限自己选中   父级就必须入参也选中
        //         if (this.treeType === ActionTypeEnum.DEPARTMENT) {
        //             // 当不是按钮时才去找父元素的id
        //             if (check.type !== 2) {
        //                 this.findParentMenu(idList, check);
        //             }
        //         }
        //     });
        //
        //     ids = idList.join(',');
        //     // 获取权限配置选中的权限的ids
        //     if ( this.treeType === ActionTypeEnum.DEPARTMENT) {
        //         this.datatransferService.authorityOrleIdsSubject.next({
        //             treeType: this.treeType,
        //             ids: ids
        //         });
        //     } else if (this.treeType === ActionTypeEnum.STAFF) {
        //         // 获取人员配置选中的ids
        //         this.datatransferService.authorityOrleIdsSubject.next({
        //             treeType: this.treeType,
        //             ids: ids
        //         });
        //     } else if (this.treeType === ActionTypeEnum.PORT) {
        //         this.datatransferService.authorityOrleIdsSubject.next({
        //             treeType: this.treeType,
        //             ids: ids
        //         });
        //     }
        // });

    }
}
