/**
 * Created by XMW on 2017-10-19.
 *  组织机构操作
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {AuthorityService} from 'app/services/authority.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'authority-organize-aside-add-component',
    templateUrl: './authority.organize.aside.add.component.html',
    styleUrls: ['./authority.organize.aside.add.component.scss']
})
export class AuthorityOrganizeAsideAddComponent implements OnInit, OnDestroy {
    type: any;                      // 控制modal显示的内容
    flow: any;                      // 当前选中项
    company: string;                // 公司
    department: string;
    list: any;                      // 组织树
    parentOrganize: any;
    disabled = false;               // 禁用上级部门/公司选择
    leader: any;                    // 负责人
    leaderArr = [];                 // 负责人集合
    // 错误集合
    errorObj = {
        companyError: false,
        departmentError: false,
        parentOrganizeError: false,
        leaderError: false
    };

    error = '';
    toggleTree = false;

    constructor(
        private modalService: ModalService,
        private authorityService: AuthorityService,
        private datatransferService: DatatransferService,
    ) {
        this.datatransferService.authorityOrganizeTreeCheckedSubject.subscribe(data => {
            this.parentOrganize = {id: data.flow.id, name: data.flow.name};
            this.onCheckedEvent(data.flow);
            this.toggleTree = false;
        });
    }

    ngOnInit() {
        this.getAllUsers();
        if (this.type === 'editCompany' || this.type === 'editDepartment') {
            this.getAllOrganize();
        }
    }

    /**
     * 获取负责人
     * @returns {Promise<void>}
     */
    async getAllUsers() {
        let d = await this.authorityService.getAllPersons();

        if (d.status === ServiceStatusEnum.SUCCESS) {
            let arr = [];
            d.data.forEach(item => {
                arr.push({name: `${item.user_cnname}(${item.user_name})`, value: item.id});
            });
            this.leaderArr = arr;
        }
        if (this.type === 'editDepartment' || this.type === 'editCompany' || this.type === 'headOffice') {
            this.authorityService.getOrganizeDetail({id: this.flow.id}).then(now => {

                if (now.status === ServiceStatusEnum.SUCCESS) {
                    let newArr = [];
                    this.leaderArr.forEach(idx => {

                       if ( idx.value === now.data.chargerId) {
                           newArr.unshift(idx);
                           this.leader = idx;
                       } else {
                           newArr.push(idx);
                       }
                    });
                    this.leaderArr = newArr;
                }

            });
        }

    }

    /**
     * 获取组织树
     */
    getAllOrganize() {
        this.authorityService.getOrganizationTree().then(d => {
            let list = this.restructData(d.data, 0 , this.flow.parentId);
            this.list = list;
        });
    }

    /**
     * 遍历
     */
    restructData(data, index, parentId) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.forEach(item => {
            item.expand = true;
            item.index = i;
            item.checked = false;
            if (item.id === parentId) {
                item.checked = true;
                item.children = [];
            }
            if (item.children && item.children.length > 0) {
                this.restructData(item.children, i + 1, parentId);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        let arr = this.checkData(this.list , flow.parentId);
        flow.checked = !flow.checked;
        this.list = arr;
    }

    /**
     * 选中遍历
     */
    checkData(data, pid) {
        let arr = data || []; // 数据暂存
        arr.forEach(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, pid);
            }
        });
        // 返回新的arr
        return arr;
    }
    ngOnDestroy() {

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

        // 新建、编辑保存
        let result = true;
        let orgType = 0;   // 0初始值   1表示是新增/编辑公司、   2表示新增/编辑部门
        if (this.type === 'headOffice') {
            if (!this.company) {
                this.errorObj.companyError = true;
                result = false;
            }
            orgType = 1;
        } else if (this.type === 'addCompany' || this.type === 'editCompany') {
            if (!this.company || this.company.length > 10 || this.company.length < 2) {
                this.errorObj.companyError = true;
                result = false;
            }
            if (!this.parentOrganize.id) {
                this.errorObj.parentOrganizeError = true;
                result = false;
            }
            orgType = 1;
        } else if (this.type === 'addDepartment' || this.type === 'editDepartment') {
            if (!this.department || this.department.length > 10 || this.department.length < 2) {
                this.errorObj.departmentError = true;
                result = false;
            }
            if (!this.parentOrganize.id) {
                this.errorObj.parentOrganizeError = true;
                result = false;
            }
            orgType = 2;
        }

        if (result && (this.type === 'addCompany' || this.type === 'addDepartment')) {
            this.errorObj.companyError = false;
            this.errorObj.parentOrganizeError = false;
            this.errorObj.departmentError = false;

            const params = {
                name: this.company || this.department,
                parentId: this.parentOrganize.id,
                chargerId: this.leader ? this.leader.value : '',
                orgType: orgType,
                seq: this.parentOrganize.id
            };

            this.authorityService.addOrganization(params).then(d => {

               if (d.status === ServiceStatusEnum.SUCCESS) {
                  this.modalService.alert('保存成功');
                   this.datatransferService.authorityOrganizeTreeAddSubject.next('editOradd');
                  this.hideInstance();
               } else {
                   this.modalService.alert(d.msg || d.message || '保存失败');
               }
            });
        } else if (result && (this.type === 'editCompany' || this.type === 'editDepartment' || this.type === 'headOffice')) {
            this.errorObj.companyError = false;
            this.errorObj.parentOrganizeError = false;
            this.errorObj.departmentError = false;
            let name = '';
            if (this.type === 'addCompany' || this.type === 'editCompany' || this.type === 'headOffice') {
                name = this.company;
            } else if (this.type === 'addDepartment' || this.type === 'editDepartment') {
                name = this.department;
            }

            const params = {
                name: name,
                parentId: this.type === 'headOffice' ? '' : this.parentOrganize.id,
                chargerId: this.leader ? this.leader.value : '',
                orgType: this.flow.orgType,
                id: this.flow.id
            };
            // console.log(params);
            this.authorityService.editOrganization(params).then(d => {

               if (d.status === ServiceStatusEnum.SUCCESS) {
                   this.modalService.alert(d.message || d.msg || '修改成功');
                   this.datatransferService.authorityOrganizeTreeAddSubject.next('editOradd');
                   this.hideInstance();
               } else {
                   this.modalService.alert(d.message || d.msg || '修改失败');
               }
            });
        }

    }

    /**
     * 下拉框选择
     * @param  type:操作的类型   部门   公司  负责人 obj当前选中项
     */
    selectChange (obj, type) {
        this[`${type}`] = obj;
    }

    /**
     *
     */
    changeToggle() {
        if (this.type === 'addCompany' || this.type === 'addDepartment') {
            return;
        }
        this.toggleTree = !this.toggleTree;
    }
    hideInstance: Function;

}
