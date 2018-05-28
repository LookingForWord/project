/**
 * Created by xxy on 2017-11-22.
 *  组织机构操作
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'governance-catalog-aside-add-component',
    templateUrl: './governance.catalog.aside.add.component.html',
    styleUrls: ['./governance.catalog.aside.add.component.scss']
})
export class GovernanceCatalogAsideAddComponent implements OnInit, OnDestroy {
    error = '';
    errorType: number;
    fromtable = false;              // 是否是列表点击的
    status: any;                    // 类型  add 添加 edit 编辑   detail 查看详情
    flow: any;                      // 当前选中项
    name: string;                   // 目录名
    dircPath: string;               // 目录路径
    oldDircPath: string;            // 原本的路径
    pid: any;                       // 父ID
    description: string;            // 描述
    flows: any;                     // 目录树
    modal = true;
    parentFlow: any;

    catalogType = 'menu';
    // catalogTypes = [{
    //     name: 'menu',
    //     value: 'menu'
    // },{
    //     name: 'button',
    //     value: 'button'
    // }];

    unsubscribes = [];
    constructor(
        private modalService: ModalService,
        private governanceService: GovernanceService,
        private datatransferService: DatatransferService,
        private toolService: ToolService,
        private validateService: ValidateService
    ) {
        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow, data.type);
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);

        // 树形新增删除订阅
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe(data => {
                this.getAllRule(data);
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
    }

    async ngOnInit() {
        if (this.status === 'add' || this.status === 'edit') {
            let data = await this.getAllRule(0);
            if (data) {
                this.flows = data;
            }
        }
        // 勿删
        // if (this.status === 'edit' || this.status === 'detail') {
        //     this.governanceService.getCatalogDetail({id: this.flow.id}).then(d => {
        //     });
        // }
    }
    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 查询目录
     * @param parentId
     */
    async getAllRule(parentId, excludeId?: any) {
        let d = await this.governanceService.getCatalogList({
            id: parentId,
            excludeId: excludeId
        });
        if (d.success) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];
                msg.type = 'CatalogList';
            });
        }
        return d.message;
    }
    /**
     * 目录选中点击
     * @param flow
     */
    async onCheckedEvent(flow, type?: any) {
        if (!flow || !this.flows) {
            return;
        }
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = true;
        // 当节点是展开状态 且未查询子节点

        this.parentFlow = flow;

        // 查询子节点
        let data = [];
        if (type === 'edit' && !flow.expand) {
            data = await this.getAllRule(flow.id, this.flow.id);
        } else if (type !== 'edit' && !flow.expand) {
            data = await this.getAllRule(flow.id);
        }
        flow.expand = !flow.expand;
        if (data) {
            flow.children = data;
        }
        flow.queryChild = true;

        this.dircPath = '/';
        let tempFlow = this.toolService.treesPositions(this.flows, flow);
        tempFlow && tempFlow.forEach(fl => {
            this.dircPath = this.dircPath + (fl.name + '/');
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
        if (this.status === 'edit') {
            const params = {
                id: this.flow.id,
                parentId: (this.parentFlow ? this.parentFlow.id : this.flow.parentId),
                name: this.name,
                description: this.description
            };
            this.governanceService.updateDirectory(params).then(d => {
                if (d.success) {
                    this.modalService.alert('保存成功');
                    // 如果是table页的编辑 重新获取选择项的左侧tree子目录
                    if (this.fromtable) {
                        if (!this.parentFlow) {
                            this.datatransferService.addCatalogSubject.next({method: 'delete', parentId: this.flow.parentId, flow: this.flow});
                        } else {
                            this.datatransferService.addCatalogSubject.next({method: 'edit', flow: this.parentFlow});
                        }
                    } else {
                        this.flow.name = this.name;
                        this.flow.description = this.description;
                        this.datatransferService.addCatalogSubject.next({method: 'edit', flow: this.parentFlow || this.flow});
                    }

                    this.hideInstance();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (this.status === 'add') {
            const params = {
                parentId: this.parentFlow.id,
                name: this.name,
                description: this.description,
                extra: JSON.stringify({path: this.dircPath})
            };
            this.governanceService.addDirectory(params).then(d => {
                if (d.success) {
                    this.modalService.alert('目录创建成功');
                    this.datatransferService.addCatalogSubject.next({method: 'add', flow: this.parentFlow});
                    this.hideInstance();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
    }

    /**
     * 基本信息检查
     */
    check() {
        this.error = null;
        this.errorType = 0;
        // if (!this.name) {
        //     this.error = '请填写目录名称';
        //     this.errorType = 1;
        //     return false;
        // }
        // if (this.name.length > 20) {
        //     this.error = '目录名称长度大于20';
        //     this.errorType = 1;
        //     return false;
        // }
        // if (!this.dircPath && this.status !== 'edit') {
        //     this.error = '请选择目录';
        //     this.errorType = 2;
        //     return false;
        // }
        let validate;

        if (this.status !== 'edit') {
            validate = this.validateService.get(this, this.getValidateObject(), ['name', 'dircPath']);
        } else {
            validate = this.validateService.get(this, this.getValidateObject(), ['name']);
        }

        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }
        return true;
    }

    /**
     * 校验
     */
    getValidateObject() {
        return {
            name: {
                presence: {message: '^请填写目录名', allowEmpty: false},
                length: {maximum: 20, message: '^请正确填写目录名,长度最多20位', allowEmpty: false},
                errorType: 1
            },
            dircPath: {
                presence: {message: '^请选择上级目录', allowEmpty: false},
                errorType: 2
            }
        };
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
