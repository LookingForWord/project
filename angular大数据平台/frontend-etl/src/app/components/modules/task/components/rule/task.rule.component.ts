/**
 * Created by XMW on 2017-10-17.
 *  权限管理 组织管理
 */
import {Component, OnDestroy} from '@angular/core';

import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {TaskRuleAsideAddComponent} from 'app/components/modules/task/components/rule/aside/add/task.rule.aside.add.component';

import {DatatransferService} from 'app/services/datatransfer.service';
import {SystemService} from 'app/services/system.service';

export enum ActionTypeEnum {
    INFO = 'infoRule',         // 查看规则详情
    ADD = 'addRule',           // 新建规则
    EDIT = 'editRule',         // 编辑规则详情

    // 树的类型
    CATALOGLIST = 'CatalogList',  // 查看规则库列表
    ADDCATALOG = 'addCatalog',  // 新建规则库
    EDITCATALOG = 'editCatalog' // 编辑规则库
};

@Component({
    selector: 'task-rule-component',
    templateUrl: './task.rule.component.html',
    styleUrls: ['./task.rule.component.scss']
})

export class TaskRuleComponent implements OnDestroy {
    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    pid: any;
    noCheck = true;
    unsubscribes = [];

    constructor(private modalService: ModalService,
                private systemService: SystemService,
                private datatransferService: DatatransferService
    ) {
        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.type === ActionTypeEnum.CATALOGLIST) {
                this.getAllRuleContentList(data.flow.id);
                this.noCheck = false;
            }
            this.pid = data.flow.id;
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);
        // 删除、新增操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe( () => {
            this.noCheck = true;
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
    }
    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 获取所有规则
     * @param pid
     */
    getAllRuleContentList(pid?: any) {
        this.systemService.getAllRuleContent(pid).then(d => {
            if (d.success ) {
                this.list = d.message;
                this.pid = pid;
                if (this.list.length <= 0) {
                   this.noData = true;
                } else {
                    this.noData = false;
                }
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 新增规则
     */
    newRule() {
        if (!this.noCheck) {
            // let [ins, pIns] = this.modalService.open(TaskRuleAsideAddComponent, {
            //     title: '创建规则',
            //     backdrop: 'static'
            // });
            // pIns.setBtns([{
            //     name: '取消',
            //     class: 'btn',
            //     click: () => {
            //         ins.cancelClick();
            //     }
            // }, {
            //     name: '保存',
            //     class: 'btn primary',
            //     click: () => {
            //         ins.saveClick();
            //     }
            // }]);
            // ins.pid = this.pid;
            // ins.status = ActionTypeEnum.ADD;
            let [ins] = this.modalService.toolOpen({
                title: '创建规则',
                component: TaskRuleAsideAddComponent,
                datas: {
                    pid: this.pid,
                    status: ActionTypeEnum.ADD,
                },
                okCallback: () => {
                    ins.saveClick();
                }
            } as ToolOpenOptions);
            ins.hideInstance = () => {
                ins.destroy();
                this.getAllRuleContentList(this.pid);
            };
        }
    }

    /**
     *规则详情点击
     * @param id
     */
    detailClick(id: any) {
        this.systemService.getRuleContent(id)
            .then(d => {
                if (d.success) {
                    // let [ins] = this.modalService.open(TaskRuleAsideAddComponent, {
                    //     title: '规则详情',
                    //     backdrop: 'static'
                    // });
                    // ins.editId = id;
                    // ins.newRule = d.message.content;
                    // ins.remark = d.message.remark;
                    // ins.status = ActionTypeEnum.INFO;
                    let [ins] = this.modalService.toolOpen({
                        title: '规则详情',
                        component: TaskRuleAsideAddComponent,
                        datas: {
                            editId: id,
                            newRule: d.message.content,
                            remark: d.message.remark,
                            status: ActionTypeEnum.INFO,
                        },
                        okCallback: () => {
                            ins.destroy();
                        }
                    } as ToolOpenOptions);
                    ins.hideInstance = () => {
                        ins.destroy();
                    };
                }
            });
    }

    /**
     * 编辑规则
     * @param id
     */
    updateClick(id: any) {
        this.systemService.getRuleContent(id)
            .then(d => {
                if (d.success) {
                    // let [ins, pIns] = this.modalService.open(TaskRuleAsideAddComponent, {
                    //     title: '规则详情',
                    //     backdrop: 'static'
                    // });
                    // pIns.setBtns([{
                    //     name: '取消',
                    //     class: 'btn',
                    //     click: () => {
                    //         ins.cancelClick();
                    //     }
                    // }, {
                    //     name: '保存',
                    //     class: 'btn primary',
                    //     click: () => {
                    //         ins.saveClick();
                    //     }
                    // }]);
                    // ins.editId = id;
                    // ins.pid = d.message.pid;
                    // ins.newRule = d.message.content;
                    // ins.createUser = d.message.createUser;
                    // ins.remark = d.message.remark;
                    // ins.status = ActionTypeEnum.EDIT;
                    let [ins] = this.modalService.toolOpen({
                        title: '规则详情',
                        component: TaskRuleAsideAddComponent,
                        datas: {
                            editId: id,
                            pid: d.message.pid,
                            newRule: d.message.content,
                            createUser: d.message.createUser,
                            remark: d.message.remark,
                            status: ActionTypeEnum.EDIT,
                        },
                        okCallback: () => {
                            ins.saveClick();
                        }
                    } as ToolOpenOptions);
                    ins.hideInstance = () => {
                        ins.destroy();
                        this.getAllRuleContentList(d.message.pid);
                    };
                }
            });
    }

    /**
     * 删除规则
     * @param id
     * @param pid
     */
    deleteClick(id, pid: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.systemService.deleteRuleContent(id)
                .then(d => {
                    if (d.success) {
                        this.modalService.alert('删除成功');
                        this.getAllRuleContentList(pid);
                    } else {
                        this.modalService.alert(d.message || '删除失败');
                    }
                });
        });
    }
}
