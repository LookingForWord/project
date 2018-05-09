/**
 * Created by LIHUA on 2017-10-20.
 * 权限管理 对象管理 系统管理 新增系统管理
 */

import {Component, OnInit} from '@angular/core';

import {ServiceStatusEnum} from 'app/constants/service.enum';
import {AuthorityService} from 'app/services/authority.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'authority-object-interface-add-component',
    templateUrl: './authority.object.interface.add.component.html',
    styleUrls: ['./authority.object.interface.add.component.scss']
})
export class AuthorityObjectInterfaceAddComponent implements OnInit {
    type: any;                          // add 添加  edit编辑   detail查看详情
    present: any;                       // 当前接口
    name: string;                       // 接口名
    url: string;                        // 接口地址
    ownSystemId: any;                   // 当前接口所属系统id
    system: any;                        // 所属系统
    systems = [];                       // 所有系统集合
    status: any;                        // 接口状态
    statusArr = [
        {name: '正常', value: 0},
        {name: '注销', value: -1}
    ];                                  // 接口状态集合

    error: string;
    errorType: number;

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private validateService: ValidateService) {

    }
    ngOnInit () {
        this.getSystems();
    }

    /**
     * 获取所有系统
     */
    getSystems () {
        this.authorityService.getOwnSystem().then( d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                let arr = [];
                d.data && d.data.forEach(item => {
                    if (this.ownSystemId === item.dimCode && this.ownSystemId) {
                        this.system = {name: item.dimName, value: item.dimCode};
                    }
                    arr.push({name: item.dimName, value: item.dimCode});
                });
                this.systems = arr;
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 保存
     */
    saveClick() {
        if (!this.check()) {
            return;
        }
        let params = {
            ownSystemId: this.system.value,
            status: this.status.value,
            name: this.name,
            url: this.url
        };
        if (this.type !== 'edit') {
            this.authorityService.addInterface(params).then(data => {
                if (data.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('新增成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(data.msg);
                }
            });
        } else {
            params['id'] = this.present.id;
            this.authorityService.updateInterface(params).then(data => {
                if (data.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(data.msg);
                }
            });
        }
    }

    check() {
        this.error = null;
        this.errorType = 0;
        let validate = this.validateService.get(this, AuthorityObjectInterfaceAddComponent.getValidateObject());
        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }

        // if (!this.name || this.name.length < 2) {
        //     this.errorType = 1;
        //     this.error = '请输入2-20位接口名称';
        //     return false;
        // }
        // if (!this.url) {
        //     this.errorType = 2;
        //     this.error = '请输入接口地址';
        //     return false;
        // }
        // if (!this.system) {
        //     this.errorType = 3;
        //     this.error = '请选择所属系统';
        //     return false;
        // }
        // if (!this.status) {
        //     this.errorType = 4;
        //     this.error = '请选择接口状态';
        //     return false;
        // }
        return true;
    }

    /**
     * @returns
     */
    static getValidateObject() {
        return {
            name: {
                presence: {message: '^请输入2-20位接口名称', allowEmpty: false},
                length: {minimum: 2, message: '^请输入2-20位接口名称', allowEmpty: false},
                errorType: 1
            },
            url: {
                presence: { message: '^请输入接口地址', allowEmpty: false},
                errorType: 2
            },
            system: {
                presence: { message: '^请选择所属系统', allowEmpty: false},
                errorType: 3
            },
            status: {
                presence: { message: '^请选择接口状态', allowEmpty: false},
                errorType: 4
            }
        };
    }

    /**
     * 状态、所属系统选择
     * @param value
     * @param name
     */
    systemChecked(value, name) {
        this[`${name}`] = value;
    }

    hideInstance: Function;
}
