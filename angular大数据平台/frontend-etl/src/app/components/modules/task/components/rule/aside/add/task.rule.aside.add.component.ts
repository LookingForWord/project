/**
 * Created by XMW on 2017-10-19.
 *  组织机构操作
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {SystemService} from 'app/services/system.service';
import {ActionTypeEnum} from 'app/components/modules/task/components/rule/task.rule.component';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {LoginService} from 'app/services/login.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'task-rule-aside-add-component',
    templateUrl: './task.rule.aside.add.component.html',
    styleUrls: ['./task.rule.aside.add.component.scss']
})
export class TaskRuleAsideAddComponent implements OnInit, OnDestroy {
    error = '';
    errorType: number;

    status: any;                  // 树的类型
    flow: any;                      // 当前选中项
    newRule: string;                // 新规则
    dircPath: string;               // 目录
    pid: any;                       // 父ID
    remark: string;                 // 描述
    flows = [];                     // 组织树
    createUser: any;                // 创建人
    parentId: any;                  // 父id
    editId: any;

    projectId = '0';
    catalogType = 'menu';
    // catalogTypes = [{
    //     name: 'menu',
    //     value: 'menu'
    // },{
    //     name: 'button',
    //     value: 'button'
    // }];

    disabled = false;               // 禁用上级部门/公司选择


    unsubscribes = [];
    constructor(
        private modalService: ModalService,
        private systemService: SystemService,
        private datatransferService: DatatransferService,
        private toolService: ToolService,
        private loginService: LoginService,
        private validateService: ValidateService
    ) {
        // 树形目录展开订阅  已在tree组件中控制了
        let expandSubjectSubscribe = this.datatransferService.taskTreeExpandSubject.subscribe(data => {
            if ( data.type ===  ActionTypeEnum.ADDCATALOG) {
                this.onExpandEvent(data.flow);
            }
        });
        this.unsubscribes.push(expandSubjectSubscribe);

        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.type === ActionTypeEnum.ADDCATALOG) {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);

        // 树形目录选中点击订阅
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe(data => {
                this.getAllRule(data);
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);


    }

    async ngOnInit() {
        let data = await this.getAllRule(0);
        if (data) {
            this.flows = data;
        }
    }
    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 基本信息检查
     */
    check() {
        this.error = null;
        this.errorType = 0;
        let validate;
        if (!this.newRule || this.newRule === '') {
            validate = this.validateService.get(this, this.getValidateObject(),
                ['newRule']);
            if (this.status === ActionTypeEnum.ADD || this.status === ActionTypeEnum.EDIT) {

                this.error = '请填写规则';
            } else if (this.status === ActionTypeEnum.ADDCATALOG || this.status === ActionTypeEnum.EDITCATALOG) {
                this.error = '请填写名称';
            }
            if (validate) {
                this.errorType = validate['errorType'];
                return false;
            }
        }

        if (this.status === ActionTypeEnum.ADDCATALOG) {
            validate = this.validateService.get(this, this.getValidateObject());
            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }
        }
        return true;
    }


    /**
     * @returns
     */
    getValidateObject() {
        return {
            newRule: {
                presence: {message: '^请填写规则', allowEmpty: false},
                errorType: 1,
            },
            dircPath: {
                presence: { message: '^请选择目录', allowEmpty: false},
                errorType: 2
            }
        };
    }

    /**
     * 查询目录
     * @param parentId
     */
    async getAllRule(parentId) {
        // let data = await this.userService.queryAllRuleTree(parentId);
        let d = await this.systemService.queryAllRuleTree({
            pid: parentId
        });

        if (d.success && d.message) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];

            });
            return d.message;
        } else {
            this.modalService.alert(d.message);
        }


    }

    /**
     * 获取目录展开关闭点击
     * @param flow
     */
    async onExpandEvent(flow) {
        // 当节点是展开状态 且未查询子节点
        if (!flow.expand && !flow.queryChild) {
            // 查询子节点
            let data = await this.getAllRule(flow.id);
            if (data) {
                flow.children = flow.children.concat(data);
            }
            flow.queryChild = true;
            flow.expand = true;

        } else {
            flow.expand = !flow.expand;
        }
    }
    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        this.parentId = flow.id;
        this.createUser = flow.createUser;
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;

        this.dircPath = '/';
        let tempFlow = this.toolService.treesPositions(this.flows, flow);
        tempFlow.forEach(fl => {
            this.dircPath += (fl.menuName + '/');
        });

    }
    /**
     * 取消
     */
    cancelClick() {
        this.hideInstance();
    }

    /**
     * 保存
     */
    saveClick() {
        if (!this.check()) {
            return;
        }

        if (this.status === ActionTypeEnum.ADD) {
            this.systemService.addRuleContent({
                pid: this.pid,
                content: this.newRule,
                remark: this.remark,
                createUser: this.loginService.userId
            }).then(d => {

                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();

                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === ActionTypeEnum.ADDCATALOG ) {
            this.systemService.addRuleCatalog({
                pid: this.parentId,
                menuName: this.newRule,
                remark: this.remark,
                createUser: this.createUser,
                type: this.catalogType
            }).then(d => {

                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.datatransferService.addCatalogSubject.next(0);
                    this.hideInstance();

                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === ActionTypeEnum.EDITCATALOG ) {
            this.systemService.updateRule({
                id: this.editId,
                pid: this.pid,
                menuName: this.newRule,
                remark: this.remark,
                createUser: this.createUser,
                type: this.catalogType
            }).then(d => {

                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.datatransferService.addCatalogSubject.next(0);

                    this.hideInstance();

                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === ActionTypeEnum.EDIT ) {
            this.systemService.editRuleContent({
                id: this.editId,
                pid: this.pid,
                content: this.newRule,
                remark: this.remark,
                createUser: this.createUser,
            }).then(d => {

                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();

                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        }

    }

    /**
     * 下拉框选择
     * @param  Type
     */
    selectChange (obj, Type) {
        this[`${Type}`] = obj;
    }
    hideInstance: Function;

}
