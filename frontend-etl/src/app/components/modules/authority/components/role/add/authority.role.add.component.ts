/**
 * Created by xxy on 2017/10/20/017.
 */

import {Component, OnDestroy} from '@angular/core';
import {CookieService} from 'ngx-cookie';

import {AuthorityService} from 'app/services/authority.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {Cookie} from 'app/constants/cookie';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

export const ActionTypeEnum = {
    INFO: 'infoRole',
    ADD: 'addRole',
    EDIT: 'editRole',
    IMPORT: 'importRole',
    EXPORT: 'exportRole',

    // 树的类型
    STAFF: 'staff',
    DEPARTMENT: 'department',
    PORT: 'port',
    DATA: 'roleData',
};

export class SourceTypes {
    name: string;
    value: string;
}

@Component({
    selector: 'authority-role-add-component',
    templateUrl: './authority.role.add.component.html',
    styleUrls: ['./authority.role.add.component.scss']
})
export class AuthorityRoleAddComponent implements OnDestroy {
    error: string;
    errorType: number;

    roleId: any;          // 角色id
    pid: string;          // 上级ID
    roleName: string;     // 角色名称
    remark: string;       // 备注
    roleID: string;       // 角色ID
    resourceIds: string;  // 权限ids
    oldResourceIds: string;
    roleStatus: any;      // 角色状态

    roleStatusArray = [
        {name: '正常', value: 0},
        {name: '失效', value: 1}
    ];
    status: any;         // infoRole为查看详情，addRole为创建角色，editRole为编辑角色，importRole导入角色, exportRole导出角色

    sourceTypes: Array<SourceTypes>;

    unsubscribes = [];

    constructor(private authorityService: AuthorityService,
                private modalService: ModalService,
                private cookieService: CookieService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                private validateService: ValidateService) {}

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
        }
    }

    /**
     * 保存用户
     */
    saveClick() {
        if (!this.check()) {
            return;
        }

        // 添加人员
        if (this.status === ActionTypeEnum.ADD) {
            this.authorityService.addRole({
                roleName: this.roleName,
                status: this.roleStatus.value
            }).then(d => {
                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(d.message || d.msg || '保存失败');
                }
            });

        }

        // 更新人员
        if (this.status === ActionTypeEnum.EDIT) {
            let roles = JSON.parse(this.cookieService.get(Cookie.ROLES));

            let result = false;
            if (roles && roles.length !== 0 && this.resourceIds !== this.oldResourceIds) {
                roles.forEach(item => {
                   if (item.roleId === this.roleID) {
                       result = true;
                    }
                });
            }
            this.authorityService.editRole({
                id: this.roleID,
                roleName: this.roleName,
                status: this.roleStatus.value
            }).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                    if (result) {
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                } else {
                    this.modalService.alert(d.message || d.msg || '保存失败');
                }
            });
        }

    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;

        // 添加和编辑时的数据验证
        if (this.status === ActionTypeEnum.ADD || this.status === ActionTypeEnum.EDIT) {
            let validate = this.validateService.get(this, AuthorityRoleAddComponent.getValidateObject());
            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }
        }

        return true;
    }

    /**
     * 编辑和添加角色时的校验
     * @returns
     */
    static getValidateObject() {
        return {
            roleName: {
                presence: {message: '^请输入角色名', allowEmpty: false},
                length: {minimum: 2, maximum: 10, message: '^请输入2-10位角色名', allowEmpty: false},
                errorType: 1
            },
            roleStatus: {
                presence: { message: '^请选择状态', allowEmpty: false},
                errorType: 2
            }
        };
    }

    /**
     * 取消保存
     */
    cancelClick() {
        this.hideInstance();
    }

    /**
     * 用户状态选择
     * @param type
     */
    statusChecked(type: any) {
        this.roleStatus = type;
    }

    hideInstance: Function;

}
