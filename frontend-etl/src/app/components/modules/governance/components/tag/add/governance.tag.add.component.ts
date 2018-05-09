/**
 * Created by xxy on 2017/11/21/021.
 */

import {Component} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {LoginService} from 'app/services/login.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'governance-tag-add-component',
    templateUrl: './governance.tag.add.component.html',
    styleUrls: ['./governance.tag.add.component.scss']
})
export class GovernanceTagAddComponent {
    error: string;
    errorType: number;
    pIns: any;            // 按钮集合
    name = '';            // 标签名称
    description = '';     // 标签描述
    id = '';              // 标签Id
    status: any;          // 0为查看详情，1为创建标签，2为编辑标签

    constructor(private governanceService: GovernanceService,
                private modalService: ModalService,
                private loginService: LoginService) {
    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;
        let name = this.name && this.name.replace(/\s/g, '');
        if (!this.name || this.name === '' || !name || name.length < 1) {
            this.error = '请填写标签名称';
            this.errorType = 1;
            return;
        }
        return true;
    }

    /**
     * 保存数据源
     */
    async saveClick() {
        if (!this.check()) {
            return;
        }
        if (this.status === 1) {
            this.governanceService.addLabel({
                name: this.name,
                description: this.description,
                creatorId: this.loginService.userId,
                createUser: this.loginService.realName,
            }).then(data => {
                if (data.success) {
                    this.modalService.alert('新增成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(data.message);
                }
            });  // 新建保存
        } else if (this.status === 2) {
            this.governanceService.editLabel({
                id: this.id,
                name: this.name,
                description: this.description
            }).then(data => {
                if (data.success) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(data.message);
                }
            });
            // 编辑保存
        }
    }

    /**
     * 取消保存
     */
    cancelClick() {
        this.hideInstance();
    }
    hideInstance: Function;
}
