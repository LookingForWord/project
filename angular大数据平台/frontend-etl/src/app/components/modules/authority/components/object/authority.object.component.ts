/**
 * Created by LIHUA on 2017-10-17.
 *  权限管理 对象管理
 */
import {Component, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'authority-object-component',
    templateUrl: './authority.object.component.html',
    styleUrls: ['./authority.object.component.scss']
})
export class AuthorityObjectComponent implements OnDestroy {

    tabType = 'menu';  // menu 菜单管理，system 系统管理，data 数据权限管理
    unsubscribes = []; // 订阅钩子函数集合

    constructor(private router: Router,
                private loginService: LoginService) {
        this.initRouterEvent();
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(u => u.unsubscribe());
    }

    /**
     * 路由初始化事件
     */
    initRouterEvent() {
        // let events = this.router.events.subscribe(event => {
        //     if (event instanceof NavigationEnd) {
        //         let url = event.urlAfterRedirects;
        //         console.log(url)
        //         if (url.indexOf('?') > -1) {
        //             url = url.substr(0, url.indexOf('?'));
        //         }
        //         url = url.substr(url.lastIndexOf('/') + 1);
        //         this.tabType = url;
        //     }
        // });
        // this.unsubscribes.push(events);
        if (this.checkBtnAuthority('authority.object.menuManage')) {
            this.tabType = 'menu';
            this.router.navigate(['/main/authority/object/menu']);
        } else if (!this.checkBtnAuthority('authority.object.menuManage') && this.checkBtnAuthority('authority.object.interfaceManage')) {
            this.tabType = 'interfaces';
            this.router.navigate(['/main/authority/object/interfaces']);
        } else if (!this.checkBtnAuthority('authority.object.menuManage') &&
            !this.checkBtnAuthority('authority.object.interfaceManage') &&
            this.checkBtnAuthority('authority.object.dataManage')) {
            this.tabType = 'dataPermission';
            this.router.navigate(['/main/authority/object/dataPermission']);
        }
    }

    /**
     * 类型切换
     * @param {string} type
     */
    tabClick(type: string) {
        if (type !== this.tabType) {
            this.tabType = type;
            this.router.navigateByUrl('main/authority/object/' + type);
        }
    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
