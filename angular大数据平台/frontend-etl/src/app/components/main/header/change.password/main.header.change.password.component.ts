import {Component, OnInit} from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {LoginService} from 'app/services/login.service';
import {AuthorityService} from 'app/services/authority.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {KeysPsw} from 'app/constants/keys.psw';

@Component({
    selector: 'main-header-change-password-component',
    templateUrl: './main.header.change.password.component.html',
    styleUrls: ['./main.header.change.password.component.scss']
})
export class MainHeaderChangePasswordComponent implements OnInit {
    type: any;
    error: any;
    errorType: any;
    oldPassword: any;
    newPassword: any;
    secondPassword: any;
    triggerTab = '0';
    encryptPwd: any;
    decryptPwd: any;
    showEncryptPwd = false;
    showDecryptPwd = false;
    decryptInterfacePwd: any;
    encryptInterfacePwd: any;

    constructor(private modalService: ModalService,
                private loginService: LoginService,
                private cookieService: CookieService,
                private validateService: ValidateService,
                private toolService: ToolService,
                private authorityService: AuthorityService) {

    }

    ngOnInit() {

    }

    /**
     * 密码服务
     */
    passwordService() {
        if (!this.encryptPwd && this.triggerTab === '0' ) {
            this.errorType = 3;
            this.error = '请输入原始密码';
            return;
        }
        if (!RegExgConstant.faultChinese.test(this.encryptPwd) && this.triggerTab === '0') {
            this.errorType = 3;
            this.error = '密码不能包含中文';
            return;
        }
        if (!this.decryptPwd && this.triggerTab === '1' ) {
            this.errorType = 4;
            this.error = '请输入原始密码';
            return;
        }
        this.errorType = -1;
        this.error = '';
        if (this.triggerTab === '0') {
            // 加密
            this.authorityService.encryptPwd({password: this.encryptPwd}).then(d => {
                if (d.status === 0) {
                    this.encryptInterfacePwd = d.data;
                    this.showEncryptPwd = true;
                } else {
                    this.encryptInterfacePwd = '';
                    this.showEncryptPwd = false;
                    this.modalService.alert(d.message);
                }
            });
        } else if (this.triggerTab === '1') {
            this.authorityService.decryptPwd({password: this.decryptPwd}).then(d => {
                if (d.status === 0) {
                    this.decryptInterfacePwd = d.data;
                    this.showDecryptPwd = true;
                } else {
                    this.decryptInterfacePwd = '';
                    this.showDecryptPwd = false;
                    this.modalService.alert(d.message);
                }
            });
        }
    }
    /**
     * 确认修改密码
     */
    changePassword() {
        if (!this.check()) {
            return;
        }
        this.errorType = -1;
        this.error = '';
        let userId = this.cookieService.get(Cookie['USERID']);
        this.loginService.changePassword({
            oldPassword: this.toolService.encrypt(this.oldPassword, KeysPsw.AUTHORITYkEY),
            newPassword: this.toolService.encrypt(this.newPassword, KeysPsw.AUTHORITYkEY),
            id: Number(userId)
        }).then(d => {
           if (d.status === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('密码修改成功');
                this.hideInstance();
           } else {
               this.modalService.alert(d.message || d.msg || '请稍后再试');
           }
        });
    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;
        let validate = this.validateService.get(this, this.getValidateObject(), ['oldPassword', 'newPassword', 'secondPassword']);
        if (validate) {
            this.error = validate['error'];
            this.errorType = validate['errorType'];
            return false;
        }
        if (this.newPassword === this.oldPassword) {
            this.error = '新密码不能与旧密码相同';
            this.errorType = 2;
            return;
        }
        if (this.newPassword !== this.secondPassword) {
            this.error = '两次输入的新密码不相同';
            this.errorType = 3;
            return;
        }
        return true;
    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            oldPassword: {
                presence: {message: '^请填写旧密码，至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请填写旧密码，至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 1
            },
            newPassword: {
                presence: {message: '^请填写新密码，至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请填写新密码，至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 2
            },
            secondPassword: {
                presence: {message: '^请再次填写新密码，至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请再次填写新密码，至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 3
            }
        };
    }

    togglePanelTab(tabId: any) {
        if (tabId !== this.triggerTab) {
            this.triggerTab = tabId;
        }
    }

    hideInstance: Function;
}
