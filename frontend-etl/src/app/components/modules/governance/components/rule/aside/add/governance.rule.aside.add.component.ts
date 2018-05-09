/**
 * Created by xxy on 2017-11-22.
 *  新建规则
 */

import {Component, OnInit} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ActionTypeEnum} from 'app/components/modules/governance/components/rule/governance.rule.component';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

@Component({
    selector: 'governance-rule-aside-add-component',
    templateUrl: './governance.rule.aside.add.component.html',
    styleUrls: ['./governance.rule.aside.add.component.scss']
})
export class GovernanceRuleAsideAddComponent implements OnInit {
    error = '';
    errorType: number;
    checkedObj: any;                   // 选中的作用对象
    objList = [
        {name: '数据', value: 'data'},
        {name: '元数据', value: 'metadata'}
    ];                                // 作用对象
    regText: any;                     // 正则表达式
    status: any;                      // 类型
    ruleName: string;                 // 新规则
    ruleDesc: any;                   // 规则描述
    editId: any;

    constructor(
        private modalService: ModalService,
        private governanceService: GovernanceService
    ) {

    }

    async ngOnInit() {
        if (this.status === ActionTypeEnum.ADD) {
            this.checkedObj = this.objList[0];
        }
    }

    /**
     * 基本信息检查
     */
    check() {
        this.error = null;
        this.errorType = 0;
        if (!this.ruleName) {
            this.error = '请填写规则名称';
            this.errorType = 1;
            return;
        }
        if (!this.regText) {
            this.error = '请输入正则表达式';
            this.errorType = 2;
            return;
        }
        return true;
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
        const params = {
            ruleName: this.ruleName,
            actOn: this.checkedObj.value,
            ruleParams: this.regText,
            ruleDesc: this.ruleDesc
        }
        if (this.status === ActionTypeEnum.ADD) {
            this.governanceService.addRuleContent(params).then(d => {
                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === ActionTypeEnum.EDIT ) {
            this.governanceService.editRuleContent({
                id: this.editId,
                ...params
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
     * @param  obj
     */
    selectObjChange (obj: any) {
        if (this.checkedObj.value === obj.value) {
            this.checkedObj = obj;
        }
    }
    hideInstance: Function;

}
