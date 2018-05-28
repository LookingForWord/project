/**
 * Created by LIHUA on 2017-10-20.
 *  权限管理 对象管理 菜单管理 新增菜单管理
 */

import {Component, OnInit} from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {AuthorityService} from 'app/services/authority.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'authority-object-menu-add-component',
    templateUrl: './authority.object.menu.add.component.html',
    styleUrls: ['./authority.object.menu.add.component.scss']
})
export class AuthorityObjectMenuAddComponent implements OnInit {
    openStyle: any;
    list = [];
    resourceName: string;
    pLink: string;
    url: string;
    menuID: string;
    ownSystemId: string;
    parentId: any;
    type: any;
    types = [{name: '菜单', value: '1'}, {name: '按钮', value: '2'}];
    system: any;
    systems = [];
    status: any;
    statues = [{name: '正常', value: '0'}, {name: '注销', value: '1'}];
    action: any;  // 新增菜单addmenu   编辑  editMenu
    error: string;
    errorType: number;
    showParentMenu = false;
    parentMenuName: any;
    code: any;


    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private datatransferService: DatatransferService,
                private validateService: ValidateService) {
        let checkedSubjectSubscribe = this.datatransferService.authorityOrganizeTreeCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
            if (data.flow) {
                this.parentId = data.flow.id;
                this.parentMenuName = data.flow.name;
                if (this.errorType === 3) {
                    this.errorType = -1;
                }
            }
        });

    }

    ngOnInit () {
        if (this.action === 'addMenu' || this.action === 'editMenu') {
            // 获取上级菜单
            this.getUpperMenu();
            // 获取所属系统
            this.getOwnSystems();
        }
    }

    /**
     * 获取所属系统
     */
    getOwnSystems() {
        this.authorityService.getOwnSystem().then( d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                let arr = [];
                d.data && d.data.forEach(item => {
                    arr.push({name: item.dimName, value: item.dimCode});
                });
                this.systems = arr;
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 获取上级菜单
     */
    getUpperMenu() {
        this.authorityService.getUpperTree().then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                this.list = this.restructData(d.data, 0);
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    restructData(data, index) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.map(item => {
            item.expand = (i < 2 ? true : false);
            item.index = i;
            item.checked = false;
            item.name = item.resourceName;
            if (item.children && item.children.length > 0) {
                this.restructData(item.children, i + 1);
            }
        });
        // 返回新的arr
        return arr;
    }

    cancelClick() {
        this.hideInstance();
    }

    saveClick() {
        if (!this.check()) {
           return;
        }
        this.errorType = -1;
        if (this.action === 'addMenu') {
            this.authorityService.addMenu({
                parentId: this.parentId,
                resourceName: this.resourceName,
                url: this.url,
                type: this.type.value,
                ownSystemId: this.system.value,
                status: this.status.value,
                code: this.code.trim()
            }).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                    this.refreshList();
                } else {
                    this.modalService.alert(d.message || d.msg ||  '保存失败');
                }
            });
        }
        if (this.action === 'editMenu') {
            this.authorityService.editMenu({
                id: this.menuID,
                resourceName: this.resourceName,
                parentId: this.parentId,
                url: this.url,
                type: this.type.value,
                ownSystemId: this.system.value,
                status: this.status.value,
                code: this.code.trim()
            }).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                    this.refreshList();
                } else {
                    this.modalService.alert(d.message || d.msg || '保存失败');
                }
            });
        }
    }

    /**
     * 表单校验
     */
    check() {
        let validate = this.validateService.get(this, AuthorityObjectMenuAddComponent.getValidateObject());
        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }
        if (this.type.value === '1') {
            const menuIdReg = /^(f|s)[0-9]{2,}$/;
            if (!menuIdReg.test(this.code.trim())) {
                this.error = '菜单类型ID只能以f或s开头';
                this.errorType = 7;
                return;
            }
        } else if (this.type.value === '2') {
            const btnIdReg = /^b[0-9]{2,}$/;
            if (!btnIdReg.test(this.code.trim())) {
                this.error = '按钮类型ID只能以b开头';
                this.errorType = 7;
                return;
            }
        }
        if(this.code.slice(0, 1) !== 'f' && (!this.parentId || this.parentId === -1)) {
            this.errorType = 3;
            return false;
        }
        return true;
    }


    /**
     * @returns {{loginName: {presence: {message: string}}; password: {presence: {message: string}}}}
     */
    static getValidateObject() {
        return {
            resourceName: {
                presence: {message: '^请输入菜单名', allowEmpty: false},
                errorType: 1
            },
            url: {
                presence: {message: '^请输入链接地址', allowEmpty: false},
                errorType: 2
            },
            type: {
                presence: {message: '^请选择类型', allowEmpty: false},
                errorType: 4
            },
            system: {
                presence: {message: '^请选择所属系统', allowEmpty: false},
                errorType: 5
            },
            status: {
                presence: {message: '^请选择状态', allowEmpty: false},
                errorType: 6
            },
            code: {
                presence: {message: '^请输入菜单ID', allowEmpty: false},
                length: {minimum: 3, message: '^ID最少3个字符', allowEmpty: false},
                errorType: 7
            }
        };
    }

    /**
     * 下拉框选择
     * @param type
     * @param name
     */
    selectChecked(type, name) {
        this[`${name}`] = type;
    }


    openTree() {
        if (this.action === 'infoMenu') {
            return;
        }
        this.showParentMenu = !this.showParentMenu;
    }
    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        let arr = this.checkData(this.list , flow.parentId);
        flow.checked = !flow.checked;
        this.showParentMenu = false;
        this.list = arr;
    }

    /**
     * 选中遍历
     */
    checkData(data, pid) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, pid);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 删除上级菜单
     */
    deleteUpMenu() {
        if (this.action === 'infoMenu') {
            return;
        }

        this.parentMenuName = '';
        this.parentId = -1;
        if(this.code && this.code.slice(0, 1) !== 'f' && (!this.parentId || this.parentId === -1)) {
            this.errorType = 3;
        }
    }

    hideInstance: Function;

    refreshList: Function;
}
