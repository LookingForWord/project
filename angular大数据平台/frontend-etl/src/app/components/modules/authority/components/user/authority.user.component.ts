/**
 * Created by LIHUA on 2017-10-17.
 *  权限管理 用户管理
 */
import {Component} from '@angular/core';
import {CookieService} from 'ngx-cookie';

import {ServiceStatusEnum} from 'app/constants/service.enum';
import {AuthorityService} from 'app/services/authority.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

import {Cookie} from 'app/constants/cookie';

import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';
import {AuthorityUserAddComponent} from 'app/components/modules/authority/components/user/add/authority.user.add.component';

@Component({
    selector: 'authority-user-component',
    templateUrl: './authority.user.component.html',
    styleUrls: ['./authority.user.component.scss']
})
export class AuthorityUserComponent {

    pagenow = 1;        // 当前页码
    pagesize = 10;      // 当页显示的条数
    totalcount = 0;     // 数据总数
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    keyWord: string;    // 搜索输入的关键字
    users: any;         // 存储表格数据的数组
    token: any;
    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private httpService: HttpService,
                private cookieService: CookieService
               ) {
        this.token = this.cookieService.get(Cookie.TOKEN);
        this.getUsers();
    }

    /**
     * 获取用户列表
     */
    getUsers(pagenow?: number) {

        // 界面上每次搜索都需要把pagenow置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }

        this.authorityService.getUsers({
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
            keyWord: this.keyWord
        }).then(d => {
            this.users = [];
            if (d.status === ServiceStatusEnum.SUCCESS && d.data && d.data.list) {
                d.data.list.forEach(user => {
                    if (user.roles) {
                        let roles = [];
                        user.roles.forEach( role => {
                             roles.push(role.roleName);
                        });
                        user.roleName = roles.join(',');
                    }
                });
                this.users = d.data.list;
                this.totalcount = d.data.total;
                this.noDataType = d.data.total === 0 ? true : false;
            } else {
                this.modalService.alert(d.msg || d.message);
            }
        });
    }

    /**
     * 修改密码
     */
    updatePsw(id) {

        let [ins] = this.modalService.toolOpen({
            title: '修改密码',
            component: AuthorityUserAddComponent,
            datas: {
                status : 'updatePsw',
                userID : id
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
            this.getUsers();
        };

    }

    /**
     * 新增用户
     */
    newUser() {
        let [ins, pIns] = this.modalService.open(AuthorityUserAddComponent, {
            title: '创建用户',
            backdrop: 'static'
        });

        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                ins.destroy();
            }
        }, {
            name: '保存',
            class: 'btn primary',
            click: () => {
                ins.saveClick();
            }
        }]);
        ins.password = '';
        ins.status = 'addUser';
        ins.pIns = pIns;
        ins.hideInstance = () => {
            ins.dpStartRef.clearDate();
            ins.destroy();
            this.getUsers(1);
        };
    }

    /**
     *用户详情点击
     * @param id
     */
    detailClick(id: any) {
        this.authorityService.getUserInfo(id).then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                let [ins] = this.modalService.open(AuthorityUserAddComponent, {
                    title: '查看用户详情',
                    backdrop: 'static'
                });
                ins.userName = d.data.userName;
                ins.password = 'gjkhjchjhj';
                ins.userCnname = d.data.userCnname;
                ins.workNo = d.data.workNo;
                ins.phone = d.data.phone;
                ins.orgName = d.data.orgName ;
                ins.email = d.data.email ;
                ins.roles = d.data.roles;
                ins.orgId = d.data.orgId;
                ins.orgName = d.data.orgName;
                ins.birthDay = d.data.birthDate;
                if (d.data.roles) {
                    let rolesArr = [];
                    d.data.roles.forEach( role => {
                        rolesArr.push({
                            roleName: role.roleName,
                            roleId: role.roleId
                        });
                    });
                    ins.roles = rolesArr;
                }
                ins.userStatus = ins.userStatusArray[d.data.status];
                ins.sex = ins.sexs[d.data.sex - 1];
                ins.isInfo = true;
                ins.status = 'infoUser';
            } else {
                this.modalService.alert(d.msg || d.message);
            }
        });
    }

    /**
     * 编辑用户
     * @param id
     */
    updateClick(id: any) {
        this.authorityService.getUserInfo(id)
            .then(d => {
                if (d.status === ServiceStatusEnum.SUCCESS) {
                    let [ins, pIns] = this.modalService.open(AuthorityUserAddComponent, {
                        title: '修改用户详情',
                        backdrop: 'static'
                    });

                    pIns.setBtns([{
                        name: '取消',
                        class: 'btn',
                        click: () => {
                            ins.destroy();
                        }
                    }, {
                        name: '保存',
                        class: 'btn primary',
                        click: () => {
                            ins.saveClick();
                        }
                    }]);

                    ins.userName = d.data.userName;
                    ins.password = 'gjkhjchjhj';
                    ins.userCnname = d.data.userCnname;
                    ins.workNo = d.data.workNo;
                    let dateArr = (d.data.birthDate ? d.data.birthDate.split('-') : []);
                    if (dateArr.length) {
                        ins.birthDay = {
                            date: {day: dateArr[2][0] === '0' ? dateArr[2][1] : dateArr[2], month: dateArr[1][0] === '0' ? dateArr[1][1] : dateArr[1], year: dateArr[0]},
                            formatted: d.data.birthDate
                        };
                    }

                    ins.phone = d.data.phone;
                    ins.orgName = d.data.orgName ;
                    ins.orgId = d.data.orgId;
                    ins.email = d.data.email ;
                    if (d.data.roles) {
                        let rolesArr = [];
                        d.data.roles.forEach( role => {
                            rolesArr.push({
                                roleName: role.roleName,
                                roleId: role.roleId
                            });
                        });
                        ins.roles = rolesArr;
                        ins.oldRoles = JSON.parse(JSON.stringify(rolesArr));
                    }

                    ins.userStatus = ins.userStatusArray[d.data.status];
                    ins.sex = ins.sexs[d.data.sex - 1];
                    ins.userID = d.data.id;
                    ins.status = 'editUser';
                    ins.isInfo = false;
                    ins.pIns = pIns;

                    ins.hideInstance = () => {
                        ins.dpStartRef.clearDate();
                        ins.destroy();
                        this.getUsers();
                    };
                } else {
                    this.modalService.alert(d.msg || d.message);
                }
            });

    }

    /**
     * 删除用户
     * @param id
     */

    deleteClick(id: any) {
        if (String(id) === this.cookieService.get(Cookie.USERID)) {
            this.modalService.alert('您不能删除自己');
            return;
        }
        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityService.deleteUser(id).then(d => {

                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('删除成功');
                    this.getUsers();
                } else {
                    this.modalService.alert(d.msg || d.message || '删除失败');
                }
            });
        });
    }

    /**
     * 导入用户
     */
    importUsers() {
        let [ins] = this.modalService.toolOpen({
            title: '导入用户',
            component: AuthorityExportComponent,
            datas: {
                type : 'import',
                model : 'user',
                status: 'importUsers'
            },
            okCallback: () => {
                ins.saveImport();
            }
        } as ToolOpenOptions);

        ins.hideInstance = () => {
            ins.destroy();
            this.getUsers();
        };
        ins.refreshList = () => {
            this.getUsers();
        };
    }

    /**
     * 导出用户的点事件
     */
    exportUsers() {
        let [ins] = this.modalService.toolOpen({
            title: '导出用户',
            component: AuthorityExportComponent,
            datas: {
                type : 'export',
                model : 'user'
            },
            okCallback: () => {
                this.authorityService.getUsers({
                    pageNum: 1,
                    pageSize: this.pagesize ,
                    keyWord: ins.exportKeyword
                }).then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS && d.data && d.data.list && d.data.list.length) {
                        ins.errorType = -1;
                        ins.exportClick();
                    } else {
                        ins.errorType = 1;
                        ins.error = '当前搜索条件下无数据';
                    }
                });
            }
        } as ToolOpenOptions);

        ins.status = 'exportUsers';
        ins.hideInstance = () => {
            ins.destroy();
            // this.getUsers();
        };
    }

    /**
     * 导出用户模板
     */
    exportUsersTemplate() {
        let url = this.httpService.getRealUrl(this.authorityService.exportUserTemplateUrl) + `?token=${this.token}`;
        return url;
    }

    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getUsers();
    }

    /**
     * 获取显示状态
     * @param status
     * @returns {string}
     */
    getStatusLabel(status) {
        let label = '';
        switch (status) {
            case 'open': label = '开启'; break;
            case 'close': label = '关闭'; break;
            case 'delete': label = '已删除'; break;
        }
        return label;
    }

    /**
     * 延时搜索
     * @param {MouseEvent} $event
     */
    searchChange($event: MouseEvent) {
        this.getUsers(1);
    }
}
