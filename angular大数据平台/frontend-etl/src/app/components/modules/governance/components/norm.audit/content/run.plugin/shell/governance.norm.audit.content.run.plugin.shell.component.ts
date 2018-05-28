/**
 * Created by lh on 2017/11/15.
 */
import {Component, OnInit, OnDestroy} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';

@Component({
    selector: 'governance-norm-audit-content-run-plugin-shell-component',
    templateUrl: './governance.norm.audit.content.run.plugin.shell.component.html',
    styleUrls: ['./governance.norm.audit.content.run.plugin.shell.component.scss']
})
export class GovernanceNormAuditContentRunPluginShellComponent implements OnInit, OnDestroy {
    task: any;
    parent: any;
    fieldList: any;                     // 字段集合
    fieldTxt: any;
    sql: any;
    funcList: any;                      // 函数模板集合
    checkedFunc: any;
    keyword: any;
    templateContent: any;

    uuid: string;                          // uuid

    errorType = 0;
    error = '';
    showAsidesHook: any;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {
    }

    ngOnInit() {
        if (this.task && this.task.flowInfo && this.task.flowInfo.taskPosition) {
            let elems = JSON.parse(this.task.flowInfo.taskPosition).elements;
            elems.forEach(item => {
                if (item.uuid === this.uuid) {
                    this.parent.checkedNorm = {name: item.innerHTML, id: this.task.flowInfo.normId};
                }
            });
            this.checkedFunc = JSON.parse(this.task.flowInfo.configInfo).checkedFunc;
            this.templateContent = JSON.parse(this.task.flowInfo.configInfo).jsStr;
            this.parent.sidesArr = [{
                checkedFunc: this.checkedFunc,
                templateContent: this.templateContent,
                sql: this.sql,
                uuid: this.uuid
            }];
        }
        // 调用函数模板接口   和 字段列表接口   是否需要做一个还原操作
        this.getFieldMessage(this.parent.checkedNorm.id);
        this.getFunctionModal();
    }

    /**
     * 获取指标对应的字段列表
     */
    getFieldMessage(normId: any) {
        this.governanceService.getFieldMessage({
            normId: normId
        }).then(d => {
            if (d.success && d.message) {
                this.fieldList = d.message.fieldList || [];
                this.fieldTxt = this.fieldList.map(item => item.fieldName).join(',');
                this.sql = d.message.sql;
                if (this.task.flowInfo && this.task.flowInfo.taskPosition) {
                    this.parent.sidesArr[0].sql = d.message.sql;
                }
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 获取函数模板列表
     */
    getFunctionModal() {
        this.governanceService.getFunctionModal({
            keyword: this.keyword || '',
            type: 'AUDIT_TEMPLATE'
        }).then(d => {
           if (d.success) {
                this.funcList = d.message || [];
           } else {
               this.modalService.alert(d.message);
           }
        });
    }

    ngOnDestroy() {
        this.showAsidesHook = null;
    }


    /**
     * 保存每个任务配置
     * @param event
     */
    saveTaskClick() {
        if (!this.check()) {
           return;
        }
        let fileArr = this.parent.sidesArr.filter(item => {
           return item.uuid === this.uuid;
        });
        if (fileArr.length === 0) {
            this.checkedFunc.templateContent = this.templateContent;
            this.parent.sidesArr.push({
                checkedFunc: this.checkedFunc,
                templateContent: this.templateContent,
                sql: this.sql,
                uuid: this.uuid
            });
        } else {
            fileArr.forEach(item => {
               if (item.uuid === this.uuid) {
                   item['checkedFunc'] = this.checkedFunc;
                   item['templateContent'] = this.templateContent;
                   item['sql'] = this.sql;
               }
            });
        }
        this.parent.showAsides = false;
        this.parent.shellUpdate = false;
        this.modalService.alert('已暂存', {time: 1000});
    }

    /**
     * 关闭右侧弹框
     */
    closePanel() {
        this.parent.showAsides = false;
    }

    /**
     * 表单校验
     */
    check() {
        if (!this.checkedFunc) {
            this.errorType = 1;
            this.error = '请选择函数模板';
            return;
        }
        this.errorType = -1;
        return true;
    }

    /**
     * 函数模板选择
     */
    chooseFunc(item: any) {
        if (!this.checkedFunc || item.id !== this.checkedFunc.id) {
            this.makeUpdating();
        }
        this.checkedFunc = item;
        this.templateContent = item.templateContent;
    }

    /**
     * 是否更新过
     */
    makeUpdating () {
        this.parent.shellUpdate = true;
        this.task.updating = true;
    }

}
