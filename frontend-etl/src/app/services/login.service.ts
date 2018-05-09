/**
 * Created by LIHUA on 2017-08-07.
 * 登录服务
 */

import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {NavigationServices} from 'app/services/navigation.services';
import {AllButtonAuthority} from 'app/constants/all.button.authority';

@Injectable()
export class LoginService {

    // 用户的权限

    // 是否登录
    islogin: boolean;
    // 真实名字
    realName: string;

    // http userId
    userId: string;

    // 按钮权限
    buttonArr: any;

    // 非权限登录地址
    loginUrl = '/rest/security/login';

    // 非权限自动登录地址
    autoLoginUrl = '/rest/security/loginByToken';

    // 权限登录接口
    authorityLoginUrl = '/butler/sso/login';
    // 权限自动登录接口
    autoAuthorityLoginUrl = '/butler/sso/relogin';
    // 退出登录
    logoutUrl = '/butler/sso/logout';
    // 修改密码
    changePwdUrl = '/butler/manage/user/update_password';
    // 密码解密接口
    decryptionPwdUrl = '/butler/manage/system/passwordDecrypt/{password}';

    constructor(private httpService: HttpService,
        private cookieService: CookieService,
        private navigationServices: NavigationServices) {
    }

    /**
     * 非权限登录
     * @param param
     * @returns {Promise<T>}
     */
    async loginByEtl(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.loginUrl, param).toPromise();
    }

    /**
     * 权限登录
     * @param param
     * @returns {Promise<T>}
     */
    async loginByAuthority(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.authorityLoginUrl, param).toPromise();
    }

    /**
     * 非权限自动登录
     * @returns {Promise<any>}
     */
    async autologin(): Promise<any> {
        let token = this.cookieService.get(Cookie.TOKEN);

        if (token) {
            // 权限
            this.islogin = true;
            this.userId = this.cookieService.get(Cookie.USERID);
            this.realName = this.cookieService.get(Cookie.REALNAME);
            let navigates = localStorage.getItem('navigate');
            if (navigates) {
                this.navigationServices.navigate = JSON.parse(navigates);
            }
            return {
                message: '已登录',
                success: true
            };
        } else {
            return {
                message: '未登录',
                success: false
            };
        }
    }

    /**
     * 权限自动登录
     */
    async autoAuthorityLogin (param?: any): Promise<any> {
        return await  this.httpService.get(this.autoAuthorityLoginUrl).toPromise();
    }

    /**
     * 退出登录
     */
    async logout(param?: any): Promise<any> {
        return await  this.httpService.postByJSON(this.logoutUrl, param).toPromise();
    }

    /**
     * 修改密码
     * @param param
     * @returns {Promise<any>}
     */
    async changePassword(param?: any): Promise<any> {
        return await  this.httpService.postByJSON(this.changePwdUrl, param).toPromise();
    }

    /**
     * 路由重组
     */
    retrustRoute(responseData, navigate) {
        let newArr = [];
        this.buttonArr = {
            b02: [],
            b03: [],
            b04: [],
            b05: [],
            b06: [],
            b07: [],
            b08: []
        };
        // 一级
        navigate.forEach((item, index) => {
            responseData.forEach(menu => {
                if (item.id === menu.code && menu.code !== 'f01') {
                    newArr.push(item);
                } else if (item.id === menu.code && menu.code === 'f01') {
                    newArr.unshift(item);
                }
                if ((menu.type === 2 || menu.type === '2') && index === 0) {
                    if (menu.code.indexOf('b02') !== -1) {
                        this.buttonArr['b02'].push(menu);
                    } else if (menu.code.indexOf('b03') !== -1) {
                        this.buttonArr['b03'].push(menu);
                    } else if (menu.code.indexOf('b04') !== -1) {
                        this.buttonArr['b04'].push(menu);
                    } else if (menu.code.indexOf('b05') !== -1) {
                        this.buttonArr['b05'].push(menu);
                    } else if (menu.code.indexOf('b06') !== -1) {
                        this.buttonArr['b06'].push(menu);
                    } else if (menu.code.indexOf('b07') !== -1) {
                        this.buttonArr['b07'].push(menu);
                    } else if (menu.code.indexOf('b08') !== -1) {
                        this.buttonArr['b08'].push(menu);
                    }
                }
            });
        });

        // 二级
        newArr.forEach(item => {
            if (item.children && item.children.length) {
                let childArr = [];
                item.children.forEach((child, idx) => {
                    responseData.forEach(menu => {
                        if (menu.code === child.id) {
                            childArr.push(child);
                        }
                    });
                });
                item.children = childArr;
            }
        });

        // 三级
        newArr.forEach((parent) => {
           if (parent.children) {
               parent.children.forEach(item => {
                    if (item.children) {
                        let childArr = [];
                        item.children.forEach(child => {
                            responseData.forEach(menu => {
                                if (menu.code === child.id) {
                                    childArr.push(child);
                                }
                            });
                        });
                        item.children = childArr;
                    }
               });
           }
        });
        return newArr;
    }

    /**
     * 找到当前按钮
     */
    findPresentButton(name: any) {
        let arr = AllButtonAuthority.allButtonArr;
        let present = null;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name === name) {
                present = arr[i];
                break;
            }
        }
        return present;
    }

    /**
     * 判断是否有按钮权限   code 按钮code值   modeType  模块code
     */

    findButtonAuthority(name: any) {
        let item = this.findPresentButton(name);
        if (!item) {
            return false;
        }
        let model = item.code.slice(0, 3);
        let buttonArr = this.buttonArr[model];
        if (!buttonArr || buttonArr.length === 0) {
            return false;
        }
        let result = false;
        for (let i = 0; i < buttonArr.length; i++) {
            if (item.code === buttonArr[i].code) {
                result = true;
                break;
            }
        }
        return result;
    }
}
