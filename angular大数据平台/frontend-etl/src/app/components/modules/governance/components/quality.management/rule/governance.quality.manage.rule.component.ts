/**
 * created by CaoYue on 2017/12/4/
 * 质量管理 规则检查
 */


import {Component, OnInit} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'governance-quality-manage-rule-component',
    templateUrl: './governance.quality.manage.rule.component.html',
    styleUrls: ['./governance.quality.manage.rule.component.scss']
})
export class GovernanceQualityManageRuleComponent implements OnInit {
    source: any;            // table当前项
    ruleList: any;          // 所有规则集合
    allChecked = false;     // 所有规则是否选中
    errorType: any;         // 错误类型
    resultList: any;        // 检查结果列表

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {
    }

    ngOnInit() {
        this.getAllRuleList();
    }

    /**
     * 获取表对应规则列表
     */
    getAllRuleList() {
        this.governanceService.getFormDetail({id: this.source.id}).then(d => {
           if (d.success && d.message) {
               let arr = [];
               d.message.checkConfigs.forEach(item => {
                   arr.push({
                       name: item.ruleNamecn,
                       checked: false,
                       id: item.id
                   });
                   this.ruleList = arr;
               });
           }
        });
    }

    /**
     * 执行检查
     */
    startCheck() {
        if (!this.ruleList || this.ruleList.length === 0) {
            this.modalService.alert('该表未配置规则');
            return;
        }
        let arr = [];
        this.ruleList.forEach(item => {
            if (item.checked) {
                arr.push(item.id);
            }
        });
        if (arr.length === 0) {
            this.errorType = 1;
        } else {
            this.errorType = -1;
            this.governanceService.runRuleCheck({
                checkIds: arr.join('#%#'),
                id: this.source.id
            }).then( d => {
                if (d.success) {
                    let arr = [];
                    d.message.forEach(item => {
                       let str = JSON.stringify(item).slice(1, -1);
                       arr.push(str);
                    });
                    this.resultList = arr;
                    this.refreshList;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
    }

    /**
     * 选中规则
     * @param item
     */
    shoose(item) {
        item.checked = !item.checked;
        let result = true;
        this.ruleList.forEach(item => {
           if (!item.checked) {
               result = false;
           }
        });
        this.allChecked = result;
    }

    /**
     * 全选
     */
    chooseAll() {
        this.allChecked = !this.allChecked;
        this.ruleList.forEach(item => {
            item.checked = this.allChecked;
        });
    }
    refreshList: Function;
}





