/**
 * Created by LIHUA on 2017/7/31/031.
 * 登录界面
 *
 *  禁止表单自动填充
 *  https://segmentfault.com/q/1010000006090445?_ea=1009491
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Router} from '@angular/router';
import {Md5} from 'ts-md5/dist/md5';

import {LoginService} from 'app/services/login.service';
import {Cookie} from 'app/constants/cookie';
import {Navigation} from 'app/constants/navigation';
import {NavigationServices} from 'app/services/navigation.services';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

import {ServiceStatusEnum} from 'app/constants/service.enum';
import {KeysPsw} from 'app/constants/keys.psw';
import {environment} from 'environments/environment';

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent {
    // 用户名
    loginName: string;
    // 密码
    password: string;
    // 验证码
    verifyCode: any;
    // 记住用户名
    remembered: boolean;
    // 是否正在提交请求
    submiting = false;

    error: any;
    errorType: number;
    // 验证码地址
    imgSrc = '/butler/sso/verifyCode';

    @ViewChild('container') container: ElementRef;

    constructor(private loginService: LoginService,
                private cookieService: CookieService,
                private router: Router,
                private navigationServices: NavigationServices,
                private toolService: ToolService,
                private validateService: ValidateService) {
        this.checkedRemembered();
        this.changeImgSrc();
    }
    // 初始化是否有记住密码功能
    checkedRemembered() {
        let remembered = this.cookieService.get(Cookie.REMENBERED);

        if (remembered === 'true') {
            this.loginName = this.cookieService.get(Cookie.LOGINNAME);
            this.password = this.cookieService.get(Cookie.PASSWORD);
            this.remembered = true;
        }
    }

    login() {
        if (!this.checkLogin() || this.submiting) {
            return;
        }

        if (environment.loginType === 'etl') {
            this.loginByEtl();
        }

        if (environment.loginType === 'authority') {
            this.loginByAuthorith();
        }
    }

    /**
     * 采用etl登录
     */
    loginByEtl() {
        this.submiting = true;
        let password = Md5.hashStr(this.password);

        this.loginService.loginByEtl({
            loginName: this.loginName,
            password: password,
        }).then(d => {
            // 非权限的话，打开这部分代码的注释
            if (d.success) {
                // 登录成功后需要写入保存token，写入token到cookie
                this.loginService.islogin = true;
                this.loginService.realName = d.message.realName;
                this.loginService.userId = d.message.userId;

                this.cookieService.put(Cookie.TOKEN, d.message.token);
                this.cookieService.put(Cookie.REALNAME, d.message.realName);
                this.cookieService.put(Cookie.LOGINNAME, this.loginName);
                this.cookieService.put(Cookie.USERID, d.message.userId);

                // 如果记住密码 就把密码写入cookie
                if (this.remembered) {
                    this.cookieService.put(Cookie.REMENBERED, 'true');
                    this.cookieService.put(Cookie.LOGINNAME, this.loginName);
                } else {
                    this.cookieService.remove(Cookie.REMENBERED);
                    // this.cookieService.remove(Cookie.LOGINNAME);
                }
                localStorage.removeItem('logout');

                // etl登录直接赋值导航对象
                this.navigationServices.navigate = Navigation.navigate;
                // 持久化导航对象，重刷新的时候是从持久化对象里查询的数据
                localStorage.setItem('navigate', JSON.stringify(Navigation.navigate));

                // 这里为了让按钮动画过度平滑 延迟一点时间
                setTimeout(() => {
                    this.router.navigate(['/main/home']);
                }, 500);

            } else {
                this.error = d.message || '登录失败，请检查用户名和密码';
                this.errorType = 3;

                this.submiting = false;
            }
        }).catch(data => {
            this.error = '登录失败，请联系管理员';
            this.errorType = 3;

            this.submiting = false;
        });
    }

    /**
     * 采用权限登录
     */
    loginByAuthorith() {
        this.submiting = true;
        let authPassword = this.toolService.encrypt(this.password, KeysPsw.AUTHORITYkEY);

        this.loginService.loginByAuthority({
            account: this.loginName,
            password: authPassword,            // 权限登录用这个des加密
            verifyCode: this.verifyCode,
            isWebLogin: 1
        }).then(d => {
            // 权限放开这部分代码的注释
            if (d.code === ServiceStatusEnum.SUCCESS) {
                // 登录成功后需要写入保存token，写入token到cookie
                localStorage.removeItem('navigate');
                this.navigationServices.navigate = [];
                this.loginService.islogin = true;
                this.loginService.realName = d.data.userInfo.userCnname;
                this.loginService.userId = d.data.userInfo.id;

                this.cookieService.put(Cookie.REALNAME, d.data.userInfo.userCnname);
                this.cookieService.put(Cookie.LOGINNAME, this.loginName);
                this.cookieService.put(Cookie.TOKEN, d.data.token);
                this.cookieService.put(Cookie.USERID, d.data.userInfo.id);
                this.cookieService.put(Cookie.ROLES, JSON.stringify(d.data.userInfo.roles));
                // 需要优化
                let lgArr = d.data.resourceInfo;
                // 为了不改变Navigation.navigate的值
                let arr = JSON.parse(JSON.stringify(Navigation.navigate));

                let newArr = this.loginService.retrustRoute(lgArr, arr);

                // 需要优化
                if (newArr.length === 0 || !newArr) {
                    this.error = '您没有操作权限';
                    this.errorType = 3;
                    this.submiting = false;
                    this.changeImgSrc();

                    this.loginService.logout({}).then(d => {
                        if (d.code === ServiceStatusEnum.SUCCESS) {
                            // 重置
                            this.navigationServices.navigate = [];

                            localStorage.removeItem('navigate');
                            localStorage.setItem('logout', 'true');
                            this.loginService.islogin = false;
                            this.cookieService.remove(Cookie.TOKEN);
                            this.cookieService.remove(Cookie.REALNAME);
                        }
                    });
                } else {
                    // 存入本地，防止刷新时丢失
                    this.navigationServices.navigate = newArr;
                    // localStorage.setItem('navigate', JSON.stringify(newArr));
                    // 如果记住密码 就把密码写入cookie
                    if (this.remembered) {
                        this.cookieService.put(Cookie.REMENBERED, 'true');
                        this.cookieService.put(Cookie.LOGINNAME, d.data.userInfo.userName);
                    } else {
                        this.cookieService.remove(Cookie.REMENBERED);
                        // this.cookieService.remove(Cookie.LOGINNAME);
                    }

                    localStorage.removeItem('logout');
                    // 这里为了让按钮动画过度平滑 延迟一点时间
                    setTimeout(() => {
                        this.submiting = false;
                        if (!newArr[0].children || newArr[0].children.length === 0 || newArr[0].id === 'f05') {
                            // 一级或者数据挖掘
                            this.router.navigate([newArr[0].link]);
                        } else if (newArr[0].children && newArr[0].children.length > 0 && !newArr[0].children[0].children) {
                            // 只有二级的时候
                            this.router.navigate([newArr[0].children[0].link]);
                        } else {
                            // 存在三级菜单的时候
                            this.router.navigate([newArr[0].children[0].children[0].link]);
                        }

                    }, 500);
                }
            } else {
                this.error = d.message || '登录失败，请检查用户名和密码';
                this.errorType = 3;
                this.changeImgSrc();
                this.submiting = false;
            }
        }).catch(data => {
            this.error = '登录失败，请联系管理员';
            this.errorType = 3;
            this.changeImgSrc();
            this.submiting = false;
        });
    }

    checkLogin() {
        this.error = null;
        this.errorType = 0;

        let validate = this.validateService.get(this, LoginComponent.getValidateObject());
        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }

        return true;
    }

    /**
     * @returns {{loginName: {presence: {message: string}}; password: {presence: {message: string}}}}
     */
    static getValidateObject() {
        return {
            loginName: {
                presence: {message: '^请填写用户名', allowEmpty: false},
                errorType: 1
            },
            password: {
                presence: {message: '^请填写密码', allowEmpty: false},
                errorType: 2
            },
            verifyCode: {
                presence: {message: '^请填写验证码', allowEmpty: false},
                errorType: 3
            }
        };
    }

    /**
     * 切换验证码图片
     */
    changeImgSrc() {
        let num = Math.floor(Math.random() * 1000000);
        let url = (this.imgSrc.indexOf('?') === -1 ? this.imgSrc : this.imgSrc.slice(0, this.imgSrc.indexOf('?')));
        this.imgSrc = url + `?code=${num}`;
        this.getImgSrc(num);
    }

    /**
     * 获取验证码地址
     * @param num
     * @returns {string}
     */
    getImgSrc(num?: any) {
        if (num) {
            return this.imgSrc;
        }
        return this.imgSrc;
    }
}
