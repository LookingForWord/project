/**
 * Created by LIHUA on 2017/7/31/031.
 * 主界面路由拦截器
 */

import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {LoginService} from 'app/services/login.service';
import {environment} from 'environments/environment';
import {NavigationServices} from 'app/services/navigation.services';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {Navigation} from 'app/constants/navigation';

@Injectable()
export class MainGuard implements CanActivate {
    url: any;
    constructor(private loginService: LoginService,
        private router: Router,
        private cookieService: CookieService,
        private navigationServices: NavigationServices) {
    }

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.url = state.url;
        if (this.loginService.islogin) {
            // xmw
            // this.router.navigateByUrl('/main/home');
            return true;
        } else {
            if (environment.loginType === 'etl') {
                let result = await this.autoLogin();
                if (result) {
                    return true;
                }
            } else if (environment.loginType === 'authority') {
                let result = await this.autoAuthorityLogin();
                if (result) {
                    return true;
                }
            }
        }
    }

    /**
     * 非权限自动登录
     */
    async autoLogin () {
        let result = false;
        let data = await this.loginService.autologin();
        if (data.success) {
            // 自动登录成功   xmw
            if (this.url === '/login' || this.url === '/main') {
                this.router.navigateByUrl('/main/home');
            } else {
                return true;
            }
            result = true;
        } else {
            // 自动登录失败
            this.router.navigateByUrl('/login');
        }
        return result;
    }
    /**
     * 权限自动登录
     */
    async autoAuthorityLogin () {
        if (!this.cookieService.get(Cookie.TOKEN)) {
            this.router.navigateByUrl('/login');
            return;
        }
        let result = false;
        let d = await this.loginService.autoAuthorityLogin();
        if (d.code === 0 && d.data && d.data.resourceInfo.length !== 0) {
            // 需要优化
            let lgArr = d.data.resourceInfo;
            // 为了不改变Navigation.navigate的值
            let arr = JSON.parse(JSON.stringify(Navigation.navigate));
            let newArr = this.loginService.retrustRoute(lgArr, arr);
            this.navigationServices.navigate = newArr;
            this.loginService.userId = d.data.userInfo.id;

            this.cookieService.put(Cookie.REALNAME, d.data.userInfo.userCnname);
            this.cookieService.put(Cookie.LOGINNAME, d.data.userInfo.userName);
            this.cookieService.put(Cookie.TOKEN, d.data.token);
            this.cookieService.put(Cookie.USERID, d.data.userInfo.id);
            this.cookieService.put(Cookie.ROLES, JSON.stringify(d.data.userInfo.roles));

            if (this.url === '/login' || this.url === '/main' || this.url === '/main/') {
                // this.router.navigateByUrl('/main/home');

                // 这里不是简单的返回/main/home 应该调转具备权限的第一个大模块
                let firstLevel = this.navigationServices.navigate.filter(f => {
                    return (f.code && f.code.indexOf('f') !== -1) || f.id.indexOf('f') !== -1;
                }).sort((b, a) => {
                    let bNumber = Number(b.code.replace('f', ''));
                    let aNumber = Number(a.code.replace('f', ''));
                    return bNumber > aNumber;
                });
                if (firstLevel.length) {
                    this.router.navigateByUrl(firstLevel[0].link);
                }
            }
            result = true;
        } else {
            // 自动登录失败
            this.router.navigateByUrl('/login');
        }
        return result;
    }
}
