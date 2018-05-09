/**
 * Created by XMW on 2017-10-19.
 *  树形递归展示
 */

import {AfterContentInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {AuthorityService} from 'app/services/authority.service';

import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';

@Component({
    selector: 'authority-object-data-tree-component',
    templateUrl: './authority.object.data.tree.component.html',
    styleUrls: ['./authority.object.data.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class AuthorityObjectDataTreeComponent implements AfterContentInit, OnDestroy {
    @Input()
    type: any;
    @Input()
    menuList: any;
    @Input()
    index: number;    // 层级
    @Input()
    parent: any;      // 父级目录
    @Input()
    menuAll: any;     // 全部目录

    // 角色数据权限用到的变量
    @Input()
    dataAuthority: any;         // 接口权限数据列表
    @Input()
    roleId: any;


    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    editId: any;                // 删除的目录的ID
    projectName: any;           // 目录名称
    checkList = [];
    content = '';               // 知识内容
    knowledge = [];             // 知识内容扩展



    pagenow = 1;
    pagesize = 10;
    totalcount = 0;

    constructor(private modalService: ModalService,
                private datatransferService: DatatransferService,
                private authorityService: AuthorityService,
                private toolService: ToolService) {
        this.datatransferService.authorityOrganizeTreeAddSubject.subscribe(data => {

        });
    }

    ngAfterContentInit() {

    }
    ngOnDestroy() {

    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        flow.checked = !flow.checked;
        flow.some = false;
        if (flow.checked && (flow.objType || flow.dsType) && flow.expand) {
            let Ids = [];
            flow.children.forEach(item => {
                Ids.push(item.id);
            });
            let needType = 0;
            if (flow.dsType) {
                needType = 1;
            } else if (flow.children) {
                flow.objType = flow.children[0].objType;
            }
            this.authorityService.addData({
                objType: needType ? needType : flow.objType,
                objIds: Ids
            }).then( d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (!flow.checked && (flow.objType || flow.dsType) && flow.expand) {
            let Ids = [];
            flow.children.forEach(item => {
                Ids.push(item.id);
            });
            let needType = 0;
            if (flow.dsType) {
                needType = 1;
            }
            this.authorityService.deleteData({
                objType: needType || flow.objType,
                objIds: Ids
            }).then( d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (!flow.checked && (flow.objType || flow.dsType) && !flow.expand) {
            let Ids = [];
            Ids.push(flow.id);
            this.authorityService.deleteData({
                objType: flow.objType,
                objIds: Ids
            }).then( d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (flow.checked && (flow.objType || flow.dsType) && !flow.expand) {
            let Ids = [];
            Ids.push(flow.id);
            this.authorityService.addData({
                objType: flow.objType,
                objIds: Ids
            }).then( d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
        setTimeout(() => {
            // 向上查找 选中或取消选中 父节点
            let findParent = (node) => {
                let temp, tempAll;
                    // 查询 类型为菜单 选中或者半选中的子节点
                    temp = node.children.filter(n => n.type !== 'a' && (n.checked || n.some));
                    // 查询 类型为菜单 全部子节点
                    tempAll = node.children.filter(n => n.type !== 'a');
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
            if (flow.children) {
                // 给子节点统一赋值当前节点的选中状态
                this.toolService.treesTraverse(flow, {
                    callback: (leaf) => {
                        leaf.checked = flow.checked;
                        leaf.some = false;
                    }
                });
            }

        });
        // 防止重复点击 重复发送请求
        if (this.menuAll) {
            let temp;
            this.toolService.treesTraverse(this.menuAll, {
                callback: (leaf) => {
                    // 到树形里查找节点是否被选中了
                    if (leaf.id === flow.id && leaf.checked) {
                        temp = leaf;
                    }
                }
            });
            if (temp) {
                return;
            }
        }
    }

    searchClick(flow, $event: MouseEvent) {
        flow.queryChecked = !flow.queryChecked;
        this.authorityClick(flow);
    }

    editClick(flow, $event: MouseEvent) {
        flow.editChecked = !flow.editChecked;
        this.authorityClick(flow);
    }
    deleteClick(flow, $event: MouseEvent) {
        flow.deleteChecked = !flow.deleteChecked;
        this.authorityClick(flow);
    }
    addClick(flow, $event: MouseEvent) {
        flow.addChecked = !flow.addChecked;
        this.authorityClick(flow);
    }

    /**
     * 点击增删改查的统一操作
     * @param flow,当前操作的数据
     */
    authorityClick(flow) {
        if (this.dataAuthority && this.dataAuthority.length) {
            this.dataAuthority = this.dataAuthority.filter(d => {
                return d.id !== flow.id;
            });
            if (!(!flow.queryChecked && !flow.editChecked && !flow.deleteChecked && !flow.addChecked)) {
                this.dataAuthority.push(flow);
            }

        }  else {
            this.dataAuthority.push(flow);
        }
        this.datatransferService.authorityOrleIdsSubject.next({
            treeType: this.type,
            dataAuthority: this.dataAuthority
        });
    }


    /**
     * 展开点击
     * @param flow
     * @param {MouseEvent} $event
     * 改变当前项expand即可  索引地址
     */
    expandClick(flow, $event?: MouseEvent) {
        if (!flow.expand) {
            if (flow.dsType === 'mysql' || flow.dsType === 'hive' ||
                flow.dsType === 'oracle' || flow.dsType === 'hadoop') {
                this.getFieldName(flow);
            }
            if (flow.objType && flow.objType === 1) {
                // 表格字段的数据还原
                let fieldParentId, fieldObjType;
                    if (flow.children) {
                        fieldParentId = flow.id;
                        fieldObjType = flow.children[0].objType;
                    }
                    // flow.children.forEach( field => {
                    //     fieldChecks.push(field.id);
                    //     fieldObjType = field.objType;
                    // });
                    this.checkRestore(fieldObjType, fieldParentId, flow.children);

            }
        }
        flow.expand = !flow.expand;
        $event.stopPropagation();
    }

    /**
     * 获取数据库下的字段
     * @param flow
     */
    getFieldName(flow) {
        let data = {};
        // rightSign为1时是纳入权限管理
        if (this.type === 'roleData') {
            data = {
                pageSize: 10,
                pageNum: this.pagenow,
                dsId: flow.dsId,
                rightSign: 1
            };
        } else {
            data = {
                pageSize: 10,
                pageNum: this.pagenow,
                dsId: flow.dsId
            };
        }
        this.authorityService.searchData(data).then(d => {
            if (d.success) {
                this.totalcount = d.message.totalElements;
                flow.children = [];
                d.message.content.forEach(item => {
                    item.children = item.fields;

                    item.children.forEach( node => {
                        node.parentId = item.id || item.dsId;
                        node.index = 3;
                        node.checked = (item.rightSign === 1 ? true : false);
                    });
                    if (this.type === 'roleData') {
                        // 给当前对象添加增删改查的状态（文件夹中queryChecked为读、
                        // editChecked为写、deleteChecked为执行）
                        item.queryChecked = false;
                        item.editChecked = false;
                        item.deleteChecked = false;
                        item.addChecked = false;
                        // 表格字段的添加增删改查的状态
                        if (item.children && item.children.length > 0) {
                            item.children.forEach( field => {
                                field.queryChecked = false;
                                field.editChecked = false;
                                field.deleteChecked = false;
                                field.addChecked = false;
                            });
                        }


                    }
                    flow.children.push({
                        parentId: flow.id || flow.dsId,
                        checked: (item.rightSign === 1 ? true : false),
                        expand: false,
                        type: this.type,
                        index: 2,
                        ...item
                    });
                });
                // 数据权限还原

                if (this.type === 'roleData') {
                    // 表格的数据还原
                    let tableParentId , tableObjType;
                    if (flow.children) {
                        tableParentId = flow.id;
                        tableObjType = flow.children[0].objType;
                        // flow.children.forEach( data => {
                        //     tablsChecks.push(data.id);
                        //     tableObjType = data.objType;
                        // });
                        this.checkRestore( tableObjType, tableParentId, flow.children);
                    }


                }
            }
        });
    }

    /**
     * 还原原来选中的数据
     * @param ObjType，数据类型
     * @param ParentId， 选中的数据父id
     * @param list，操作的数据list
     */
    checkRestore(ObjType, ParentId, list) {
        this.authorityService.searchDataAuthority({
            roleId: this.roleId,
            objType: ObjType,
            // objIds: idList,
            objParentId: ParentId
        }).then(d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                if (d.data && d.data) {
                    d.data.forEach( item => {
                        list.forEach( data => {
                            if (item.objId === data.id ) {
                                if (ObjType === 2) {
                                    data.queryChecked = item.readRight === 1 ? true : false;
                                } else if (ObjType === 1 || ObjType === 3) {
                                    data.queryChecked = item.readRight === 1 ? true : false;
                                    data.editChecked = item.writeRight === 1 ? true : false;
                                    data.deleteChecked = item.deleteRight === 1 ? true : false;
                                    data.excuteChecked = item.excuteRight === 1 ? true : false;
                                }
                            }
                        });


                    });
                }
            } else {
                this.modalService.alert(d.message || d.msg || d.data );
            }
        });
    }


    /**
     * 分页
     * @param page
     */
    doPageChange(flow, page) {
        this.pagenow = page;
        this.getFieldName(flow);
    }

}

