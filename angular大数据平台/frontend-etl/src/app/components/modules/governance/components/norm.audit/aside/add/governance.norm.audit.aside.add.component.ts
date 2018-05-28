/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'governance-norm-audit-aside-add-component',
    templateUrl: './governance.norm.audit.aside.add.component.html',
    styleUrls: ['./governance.norm.audit.aside.add.component.scss']
})
export class GovernanceNormAuditAsideAddComponent implements OnInit {
    type: String;                                   // 类型  新增目录addDirectory、新增任务addTask

    dircName: any;                                  // 目录名称
    dircPath = '';                                  // 目录
    id: any;
    menuIndex = 0;                                  // 目录层级
    menuList = [];                                  // 目录list
    allMenuList = [];                               // 所有目录数据

    checkedFlow: any;                               // 当前选中目录项

    errorType: any;
    error: any;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private datatransferService: DatatransferService,
                private toolService: ToolService) {
        this.datatransferService.normAuditTreeDbCheckedSubject.subscribe(data => {
            if (data.method === 'oneClick' && data.type === 'add') {
                this.checkedFlow = data.flow;
                this.dircPath = '';
                this.checkData(this.menuList , data.flow.parentId);
                this.onCheckedEvent(data.flow);
                this.findParentNode(this.menuList, data.flow);
            }
        });
    }

    ngOnInit() {
        this.getTreeList();
    }
    getTreeList() {
        this.governanceService.getAuditDirectoryTree({parentId: 0, catalogType: 'norm'}).then(d => {
            if (d.success && d.message) {
                let arr = d.message.catalog || [];
                arr.forEach(item => {
                    this.menuList.push({
                        ...item,
                        checked: false,
                        expand: false,
                        name: item.catalogName,
                        type: 'catalog'
                    });
                });
            }
        });
    }

    retrustData(data) {
        let map = {};
        let that = this;
        let arr = [];
        data.forEach(function (item) {
            // 默认展开一级
            if (item.parentId === '0') {
                item.checked = false;
                item.expand = true;
                item.type = 'catalog';
            } else {
                item.checked = false;
                item.expand = true;
                item.type = 'catalog';
            }
            map[item.id] = item;
            if (!item.flowId) {
                arr.push(item);
            }
        });
        this.allMenuList = arr;
        let val = [];
        data.forEach(function (item) {
            // 只显示目录  ，不显示工作流
            if (!item.flowId) {
                // 以当前遍历项，的pid,去map对象中找到索引的id
                let parent = map[item.parentId];
                // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
                if (parent) {
                    (parent.children || ( parent.children = [] )).push(item);
                } else {
                    // 如果没有在map中找到对应的索引id,那么直接把 当前的item添加到 val结果集中，作为顶级
                    item.checked = false;
                    item.expand = true;
                    val.push(item);
                }
            }
        });
        return val;
    }

    /**
     * 寻找父节点
     * @param data
     * @param flow
     */
    findParentNode(data: any, flow: any) {
        let checkedList = this.toolService.treesPositions(this.menuList, flow);
        // 将选中的部门从父级自下拼接为字符串
        checkedList && checkedList.forEach(item => {
            this.dircPath += `/${item.name}`;
        });
    }
    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow: any) {
        flow.checked = !flow.checked;
    }

    /**
     * 选中遍历
     */
    checkData(data: any, parentId: any) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, parentId);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 确认创建目录
     */
    okClick() {
        if (!this.check()) {
            return;
        }
        // 新建目录
        this.governanceService.addAuditDirectory({
            parentId: this.checkedFlow.id,
            catalogName: this.dircName,
            catalogType: 'norm'
        }).then(d => {
            if (d.success) {
                this.hideInstance();
                this.modalService.alert('目录创建成功');
                this.datatransferService.normAuditAddTreeSubject.next({action: 'add', flow: this.checkedFlow});
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '创建失败');
            }
        }, (error) => {
            this.modalService.alert('服务器异常');
        } );
    }

    /**
     * 创建目录、任务
     * @returns {boolean}
     */
    check() {
        if (!this.dircName) {
            this.errorType = 1;
            this.error = '请填写名称';
            return;
        }
        if (!this.dircPath || !this.checkedFlow) {
            this.errorType = 2;
            this.error = '请选择目录';
            return;
        }
        return true;
    }

    /**
     * 编辑保存
     */
    editSave(checkedFlow: any) {
        if (!this.check()) {
            return;
        }
        if (this.type === 'editTask') {
            this.governanceService.changeAuditTaskName({
                configName: this.dircName,
                id: this.id,
                catalogId: this.checkedFlow.id,
                taskType: 'DATACHECKNORM'
            }).then(d => {
                if (d.success) {
                    this.modalService.alert('修改成功');
                    this.hideInstance();
                    this.datatransferService.normAuditUpdateTreeSubject.next({action: 'edit', flow: {...this.checkedFlow, newName: this.dircName}});
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else {
            this.governanceService.editAuditDirectory({
                catalogName: this.dircName,
                id: this.id,
                parentId: this.checkedFlow.id,
                catalogType: 'norm'
            }).then(d => {
                if (d.success) {
                    this.modalService.alert('修改成功');
                    this.hideInstance();
                    this.datatransferService.normAuditUpdateTreeSubject.next({action: 'edit', flow: {...this.checkedFlow, newName: this.dircName}});
                } else {
                    this.modalService.alert(d.message);
                }
            }, (err) => {
                this.modalService.alert('服务器异常');
            });
        }
    }

    /**
     * 新建任务
     */
    addWorkFlow() {
        if (!this.check()) {
            return;
        }
        this.governanceService.addAuditTask({
            catalogId: this.checkedFlow.id,
            configName: this.dircName,
            taskType: 'DATACHECKNORM'
        }).then(d => {
            if (d.success) {
                this.modalService.alert('任务创建成功');
                this.datatransferService.normAuditAddTreeSubject.next({action: 'add', flow: this.checkedFlow});
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '创建失败');
            }
        }, (err) => {
            this.modalService.alert('服务器异常');
        });
    }

    hideInstance: Function;
}
