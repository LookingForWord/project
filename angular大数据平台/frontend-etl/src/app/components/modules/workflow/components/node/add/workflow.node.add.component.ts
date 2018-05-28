/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';

@Component({
    selector: 'workflow-node-add-component',
    templateUrl: './workflow.node.add.component.html',
    styleUrls: ['./workflow.node.add.component.scss']
})
export class WorkflowNodeAddComponent implements OnInit {
    address: any;       // 节点地址
    name: string;       // 节点名称(未定)
    environments: any;  // 运行环境
    environmentArr = [];
    errorType = -1;
    error = '';

    constructor(private modalService: ModalService,
                private workflowService: WorkflowService) {

    }

    ngOnInit() {
        if (this.environments) {
            let arr = Object.keys(this.environments);
            arr.forEach(key => {
               this.environmentArr.push({
                   checked: this.environments[key] === true,
                   name: key
               });
            });
        }
    }

    saveClick() {
        if (!this.check()) {
            return;
        }
        let obj = {};
        this.environmentArr.length && this.environmentArr.forEach(item => {
            obj[`${item.name}`] = item.checked;
        });
        this.workflowService.updateNode({
            address: this.address,
            name: this.name,
            tags: obj
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('保存成功');
                this.hideInstance();
                this.refreshList();
            } else {
                this.modalService.alert('保存失败');
            }
        });
    }

    /**
     * 表单校验
     */
    check() {
        // if (!this.name) {
        //     this.errorType = 1;
        //     this.error = '请填写节点名称';
        //     return false;
        // }
        if (!this.address) {
            this.errorType = 2;
            this.error = '请填写节点地址';
            return false;
        }
        if (this.address && this.address.indexOf(':') === -1) {
            this.errorType = 2;
            this.error = '节点地址缺少端口号';
            return false;
        }
        return true;
    }

    hideInstance: Function;

    refreshList: Function;
}
