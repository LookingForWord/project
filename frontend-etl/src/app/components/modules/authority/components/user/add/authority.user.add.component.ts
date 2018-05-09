/**
 * Created by xxy on 2017/10/19/014.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import {INgxMyDpOptions, NgxMyDatePickerDirective} from 'ngx-mydatepicker';
import {CookieService} from 'ngx-cookie';

import {DatatransferService} from 'app/services/datatransfer.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {AuthorityService} from 'app/services/authority.service';
import {LoginService} from 'app/services/login.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

import {KeysPsw} from 'app/constants/keys.psw';
import {Cookie} from 'app/constants/cookie';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'authority-add-component',
    templateUrl: './authority.user.add.component.html',
    styleUrls: ['./authority.user.add.component.scss']
})
export class AuthorityUserAddComponent implements  OnInit {
    error: string;
    errorType: number;   // 错误类型

    pIns: any;

    userName: string;    // 用户名
    userCnname: string;  // 用户名称
    workNo:  string;     // 工号
    email: string;       // 邮箱
    orgId: any;          // 部门id
    orgName: string;     // 部门名称
    roleIds: string;     // 角色Id
    roles = [];          // 选中的角色数组
    rolesList: any;      // 可选角色数组
    oldRoles: any;
    birthDay: any;       // 生日日期
    password: string;    // 密码
    phone: string;       // 手机号
    userID: string;      // 用户ID
    status: any;         // 0 infoUser为查看详情，1 addUser为创建数据源，2 editUser为编辑数据源 ，
    // importUsers导入用户,exportUsers导出用户,updatePsw修改密码
    sex: any;            // 性别
    sexs = [{
            name: '男',
            value: 1
        },
        {
            name: '女',
            value: 2
        }
    ];
    userStatus: any;     // 用户状态
    userStatusArray = [
        {
            name: '正常',
            value: 0
        },
        {
            name: '注销',
            value: 1
        }
    ];
    departmentTree = false;
    dataOption: INgxMyDpOptions = {
        todayBtnTxt: '今天',
        dateFormat: 'yyyy-mm-dd',
        dayLabels: { su: '周日', mo: '周一', tu: '周二', we: '周三', th: '周四', fr: '周五', sa: '周六' },
        monthLabels: { 1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月' },
        // alignSelectorRight: false     // 选择器右对齐
    };

    @ViewChild('dpStart') dpStartRef: NgxMyDatePickerDirective;
    dpStart: any;

    exportKeyword = '';   // 导出的关键字

    newPassword: any;     // 新密码
    surePassword: any;
    token = '';

    list: any;
    menuList = [];
    checkedList = [];
    checkName = '';
    unsubscribes = [];
    constructor(
                private modalService: ModalService,
                private  loginService: LoginService,
                private authorityService: AuthorityService,
                private datatransferService: DatatransferService,
                private cookieService: CookieService,
                private toolService: ToolService,
                private validateService: ValidateService) {
        let checkedSubjectSubscribe = this.datatransferService.authorityOrganizeTreeCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
            if (data.flow) {
                this.orgId = data.flow.id;
                this.orgName = data.flow.name;
            }
            this.checkedList = [{parentId: data.flow.parentId, name: data.flow.name}];
            this.checkName = '';
            this.findParentNode(data.flow);
            // 将选中的部门从父级自下拼接为字符串
            this.checkedList.forEach(item => {
                this.checkName += `/${item.name}`;
            });
        });
        this.unsubscribes.push(checkedSubjectSubscribe);
        this.token = this.cookieService.get(Cookie.TOKEN);
    }

    ngOnInit () {
        this.authorityService.getOrganizationTree().then(d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                if (!d.data || d.data.length === 0) {
                    return;
                }
                let arr = this.restructData(d.data, 0);
                this.list = arr;

                this.menuList.forEach(item => {
                    if (item.id === this.orgId) {
                        this.checkedList.push({parentId: item.parentId, id: item.id, name: item.name});
                    }
                });
                if (this.status === 'editUser' || this.status === 'infoUser') {
                    this.findParentNode(this.checkedList[0]);
                    // 将选中的部门从父级自下拼接为字符串
                    this.checkedList.forEach(item => {
                        this.checkName += `/${item.name}`;
                    });
                }
            }
        });
        this.getRoles();
    }


    /**
     * 获取用户角色的集合
     */
    async getRoles() {
        let d = await this.authorityService.getAlluserRoles();
        if (d.status === ServiceStatusEnum.SUCCESS) {
            let arr = [];
            d.data.forEach(item => {
                arr.push({roleName: item.role_name, roleId: item.id});
            });
            this.rolesList = arr;
        }
    }

    /**
     * 寻找父节点
     */
    findParentNode(flow?: any) {
        let result = true;
        this.menuList.forEach(item => {
           if (item.id === flow.parentId) {
               this.checkedList.unshift({parentId: item.parentId, name: item.name});
               result = false;
           }
        });
        !result && this.findParentNode(this.checkedList[0]);
    }

    /**
    * 遍历
    */
    restructData(data, index) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.map(item => {
            item.expand = (i < 2 ? true : false);
            item.index = i;
            item.checked = false;
            this.menuList.push(item);
            if (item.children && item.children.length > 0) {
                this.restructData(item.children, i + 1);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 保存用户
     */
    saveClick() {
        if (this.roles) {
            let arr = [];
            this.roleIds = '';
            this.roles.forEach( role => {
                arr.push(role.roleId);
            });
            this.roleIds = arr.join(',');
        }
        if (!this.check()) {
            return;
        }
        this.errorType = -1;
        this.error = '';
        let params = {};
        if (this.status === 'addUser' || this.status === 'editUser') {
            params = {
                userName: this.userName,
                userCnname: this.userCnname.replace(/\s/g, ''),
                password: this.status === 'addUser' ? this.toolService.encrypt(this.password.replace(/\s/g, ''), KeysPsw.AUTHORITYkEY) : null,
                id: this.userID,
                workNo:  this.workNo,
                birthDate: this.birthDay && this.birthDay.formatted,
                phone: this.phone,
                email: this.email,
                sex: this.sex.value,
                status: this.userStatus.value,
                orgId: this.orgId,
                roleIds: this.roleIds
            };
        }
        if (this.status === 'addUser') {
            this.authorityService.addUser(params).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(d.msg || d.message || '保存失败');
                }
            });

        } else if ( this.status === 'editUser') {
            let loginName = this.cookieService.get(Cookie.LOGINNAME);
            let result = false;
            if (loginName === this.userName) {
                let oldRoleIds = [];
                this.oldRoles.forEach(item => {
                    oldRoleIds.push(item.roleId);
                });

                if (oldRoleIds.join(',') !== this.roleIds) {
                    result = true;
                }
            }

            this.authorityService.editUser(params).then(d => {
                if (d.status === ServiceStatusEnum.SUCCESS) {
                    // 如果编辑的是当前用户更新cookie和loginService里面的当前用户信息
                    if (this.cookieService.get(Cookie.USERID) === String(this.userID)) {
                        this.loginService.realName = this.userCnname;
                        this.cookieService.remove('realName');
                        this.cookieService.put('realName', this.userCnname);
                        document.querySelector('.header-container .user .mr5').innerHTML = '你好，' + this.userCnname;
                    }

                    this.modalService.alert('保存成功');
                    this.hideInstance();
                    setTimeout(() => {
                        if (result) {
                            location.reload();
                        }
                    }, 1000);
                }  else  {
                    this.modalService.alert(d.msg || d.message || '保存失败');
                }
            });
        } else if ( this.status === 'updatePsw') {

            this.authorityService.updatePassword({
                id: this.userID,
                // password:  Md5.hashStr(this.newPassword)
                password: this.toolService.encrypt(this.newPassword, KeysPsw.AUTHORITYkEY)
            }).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('修改成功');
                    this.hideInstance();
                }  else  {
                    this.modalService.alert(d.msg || d.message || '修改失败');
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
        let validate;
        // 添加用户和编辑用户时的校验
        if (this.status === 'addUser' || this.status === 'editUser') {
            if (!this.phone && !this.email) {
                validate = this.validateService.get(this, this.getValidateObject(),
                    ['userName', 'password', 'orgId', 'orgName', 'userCnname', 'sex', 'userStatus']);
            }
            if (this.phone && !this.email) {
                validate = this.validateService.get(this, this.getValidateObject(),
                    ['userName', 'password', 'orgId', 'orgName', 'userCnname', 'sex', 'phone', 'userStatus']);
            }

            if (!this.phone && this.email) {
                validate = this.validateService.get(this, this.getValidateObject(),
                    ['userName', 'password', 'orgId', 'orgName', 'userCnname', 'sex',  'email', 'userStatus']);
            }
            if (this.phone && this.email) {
                validate = this.validateService.get(this, this.getValidateObject(),
                    ['userName', 'password', 'orgId', 'orgName', 'userCnname', 'sex', 'phone', 'email', 'userStatus']);
            }
            if (this.birthDay && this.birthDay.formatted) {
                const now = new Date((new Date().toLocaleDateString()) + ' 23:59:59').getTime();
                const choose = new Date(this.birthDay.formatted).getTime();
                if (choose > now) {
                    this.error = '请重新选择出生日期';
                    this.errorType = 13;
                    return;
                }
            }
        }

        // 修改密码的校验
        if (this.status === 'updatePsw') {
            validate = this.validateService.get(this, this.getValidateObject(),
                ['newPassword', 'surePassword']);
        }
        if (validate) {
            this.error = validate['error'];
            this.errorType = validate['errorType'];
            return false;
        }
        if (this.status === 'updatePsw') {
            if (this.surePassword !== this.newPassword) {
                this.errorType = 14;
                this.error = '两次输入的密码不一致';
                return;
            }
        }
        return true;
    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            userName: {
                presence: {message: '^请输入登陆名', allowEmpty: false},
                length: {minimum: 2, message: '^请正确填写登录名,长度至少2位', allowEmpty: false},
                reg: {format: RegExgConstant.username, message: '^登录名字母开头,只包含字母数字下划线'},
                errorType: 1,
            },
            password: {
                presence: { message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 2
            },
            orgId: {
                presence: { message: '^请选择所在部门', allowEmpty: false},
                errorType: 3
            },
            orgName: {
                presence: { message: '^请选择所在部门', allowEmpty: false},
                errorType: 3
            },
            userCnname: {
                presence: { message: '^请正确填写用户姓名,用户姓名非空', allowEmpty: false},
                length: {minimum: 2, message: '^请正确填写用户姓名,长度至少2位', allowEmpty: false},
                reg: {format: RegExgConstant.chinese, message: '^用户姓名为纯中文'},
                errorType: 4
            },
            sex: {
                presence: { message: '^请选择性别', allowEmpty: false},
                errorType: 6
            },
            phone: {
                reg: {format: RegExgConstant.cellPhone, message: '^电话不符合格式'},
                errorType: 7
            },
            email: {
                reg: {format: RegExgConstant.emailReg, message: '^请正确填写邮箱'},
                errorType: 8
            },
            userStatus: {
                presence: { message: '^请选择状态', allowEmpty: false},
                errorType: 10
            },
            newPassword: {
                presence: {message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 12
            },
            surePassword: {
                presence: {message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                length: {minimum: 6, message: '^请正确填写密码，长度至少6位', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^密码不能包含中文'},
                errorType: 14
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
     * 性别选择 和状态选择
     * @param type
     */
    selectChecked(type: any, name) {
        this[`${name}`] = type;
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        let arr = this.checkData(this.list , flow.parentId);
        flow.checked = !flow.checked;
        this.departmentTree = false;
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
     * 打开树形结构
     */
    openTree() {
        if (this.status === 'infoUser') {
            return;
        }
        this.departmentTree = !this.departmentTree;
    }

    /**
     * 角色选择
     * @param option
     */
    checkRole(option: any) {
        this.roles = option;
    }


    hideInstance: Function;

}
