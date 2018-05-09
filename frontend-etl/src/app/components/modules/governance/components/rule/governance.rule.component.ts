/**
 * Created by xxy on 2017-11-22.
 *  数据治理 规则库管理
 */
import {Component, OnInit} from '@angular/core';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {GovernanceRuleAsideAddComponent} from 'app/components/modules/governance/components/rule/aside/add/governance.rule.aside.add.component';

export enum ActionTypeEnum {
    INFO = 'infoRule',         // 查看规则详情
    ADD = 'addRule',           // 新建规则
    EDIT = 'editRule',         // 编辑规则详情
}

@Component({
    selector: 'governance-rule-component',
    templateUrl: './governance.rule.component.html',
    styleUrls: ['./governance.rule.component.scss']
})

export class GovernanceRuleComponent implements OnInit {
    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    noCheck = false;
    keyWord: string;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {

    }
    ngOnInit() {
        this.getAllRuleContentList();
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.pageNum = 1;
        this.getAllRuleContentList();
    }

    /**
     * 获取所有规则
     * @param {number} type
     */
    getAllRuleContentList() {
        this.governanceService.getAllRuleContent({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            keyWord: this.keyWord
        }).then(data => {
            let d = data;
            if (d.success ) {
                this.list = d.message.items;
                this.totalcount = d.message.totalCount;
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
            let [ins] = this.modalService.toolOpen({
                title: '创建规则',
                component: GovernanceRuleAsideAddComponent,
                datas: {
                    status: ActionTypeEnum.ADD,
                },
                okCallback: () => {
                    ins.saveClick();
                }
            } as ToolOpenOptions);
            ins.hideInstance = () => {
                ins.destroy();
                this.pageNum = 1;
                this.getAllRuleContentList();
            };
        }
    }

    /**
     *规则详情点击
     * @param id
     */
    detailClick(id: any) {
        this.governanceService.getRuleContent(id)
            .then(d => {
                if (d.success) {
                    let [ins] = this.modalService.open(GovernanceRuleAsideAddComponent, {
                        title: '规则详情',
                        backdrop: 'static'
                    });
                    ins.editId = id;
                    ins.ruleName = d.message.ruleName;
                    ins.ruleDesc = d.message.ruleResc;
                    ins.regText = d.message.ruleParams;
                    ins.checkedObj = d.message.actOn === 'data' ? ins.objList[0] : ins.objList[1];
                    ins.status = ActionTypeEnum.INFO;
                }
            });
    }

    /**
     * 编辑规则
     * @param id
     */
    updateClick(id: any) {
        this.governanceService.getRuleContent(id)
            .then(d => {
                if (d.success) {
                    let [ins] = this.modalService.toolOpen({
                        title: '编辑规则',
                        component: GovernanceRuleAsideAddComponent,
                        datas: {
                            editId: id,
                            ruleName: d.message.ruleName,
                            ruleDesc: d.message.ruleResc,
                            regText: d.message.ruleParams,
                            status: ActionTypeEnum.EDIT,
                        },
                        okCallback: () => {
                            ins.saveClick();
                        }
                    } as ToolOpenOptions);
                    ins.checkedObj = d.message.actOn === 'data' ? ins.objList[0] : ins.objList[1];
                    ins.hideInstance = () => {
                        ins.destroy();
                        this.getAllRuleContentList();
                    };
                }
            });
    }

    /**
     * 删除规则
     * @param id
     */
    deleteClick(id) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteRuleContent(id).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getAllRuleContentList();
                } else {
                    this.modalService.alert('删除失败');
                }
            });
        });
    }

    /**
     * 页码切换
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getAllRuleContentList();
    }

    /**
     * 创建者转码
     */
    changeCode(item: any) {
        if (!item || !item.createUser) {
            return;
        }
        item.createUser = decodeURI(item.createUser);
        return item.createUser;
    }
}
