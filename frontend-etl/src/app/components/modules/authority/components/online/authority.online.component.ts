/**
 * Created by LIHUA on 2017-10-17.
 *  权限管理 在线管理
 */
import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie';

import {Cookie} from 'app/constants/cookie';
import {ServiceStatusEnum} from 'app/constants/service.enum';

import {AuthorityService} from 'app/services/authority.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {AuthorityUserAddComponent} from 'app/components/modules/authority/components/user/add/authority.user.add.component';

@Component({
    selector: 'authority-online-component',
    templateUrl: './authority.online.component.html',
    styleUrls: ['./authority.online.component.scss']
})
export class AuthorityOnlineComponent implements OnInit {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    keyWord: string;
    userList: any;

    constructor(private modalService: ModalService,
                private authorityservice: AuthorityService,
                private cookieService: CookieService) {
    }
    ngOnInit () {
        this.getOnlineUsers();
    }
    /**
     * 获取用户列表
     */
    getOnlineUsers(pagenow?: number) {
        // 界面上每次搜索都需要把pagenow置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }
        this.authorityservice.getOnlineUser({
            pageNum: this.pagenow,
            pageSize: this.pagesize,
            keyWord: this.keyWord
        }).then(d => {
            this.userList = [];

            if (d.code === ServiceStatusEnum.SUCCESS) {
                d.data.list.forEach(item => {
                   item.time = new Date(item.loginTime).getTime();
                });
                d.data.list.sort(this.compare('time'));
                this.userList = d.data.list;
                this.totalcount = d.data.total;
                // 判断有无数据
                this.noDataType = d.data.total === 0 ? true : false;
            } else {
                this.modalService.alert(d.message || d.msg);
            }

        });
    }

    compare (property: any) {
        return function(a, b) {
            let value1 = a[property];
            let  value2 = b[property];
            return value2 - value1;
        };
    }

    /**
     *用户详情点击
     * @param userId
     */
    detailClick(userId: any) {
        this.authorityservice.getUserInfo(userId).then(d => {

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

                ins.hideInstance = () => {
                    ins.destroy();
                };
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 强制下线
     * @param userId
     */
    offlineClick(userId: any) {
        if (String(userId) === this.cookieService.get(Cookie.USERID)) {
            this.modalService.alert('您不能强制下线自己');
            return;
        }

        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityservice.offlineUser({userId: userId}).then(d => {

                if (d.code === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('强制下线成功');
                    this.getOnlineUsers();
                } else {
                    this.modalService.alert(d.message || d.msg || '操作失败');
                }
            });
        });
    }


    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getOnlineUsers();
    }


    /**
     * 延时搜索
     * @param {MouseEvent} $event
     */
    searchChange($event: MouseEvent) {
        this.getOnlineUsers(1);
    }
}
