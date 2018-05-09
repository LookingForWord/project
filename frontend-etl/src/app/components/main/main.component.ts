/**
 * Created by LIHUA on 2017/7/31/031.
 *  主界面
 */

import {Component, OnDestroy} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'main-component',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    animations: [Animations.routeAnimation]
})
export class MainComponent implements OnDestroy {
    isHome = false;              // 是否是首页
    isFullScreen = true;         // 显示背景
    routerState = true;          // 动画状态
    routerStateCode = 'active';  // 动画属性
    leftState: number;           // 根据导航栏宽度，修改自身left值
    unsubscribes = [];           // 订阅钩子函数集合

    homeUrls = ['/main', '/main/home', '/main/mining', '/main/dataServe/**']; // 首页路由
    fullScreenUrls = ['/main', '/main/home', '/main/task/home', '/main/task/config', '/main/system/knowledge', '/main/repository/datacenter']; // 需要全屏的路由

    constructor(private router: Router,
                private datatransferService: DatatransferService) {
        this.initRouterEvent();
        this.initNavigationState();
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
    }

    /**
     * 初始化router事件
     */
    initRouterEvent() {
        let events = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // 是否是全屏界面
                let isFullScreen = false;
                this.fullScreenUrls.forEach(url => {
                    if (event.url === url || event.urlAfterRedirects === url) {
                        isFullScreen = true;
                    }
                });
                this.isFullScreen = isFullScreen;

                // 是否首页
                this.isHome = false;
                this.homeUrls.forEach(url => {
                    // 通配
                    if (url.indexOf('/**') !== -1) {
                        let u = url.substr(0, url.indexOf('/**')); // 路径通配符
                        if (event.url.indexOf(u) !== -1 || event.urlAfterRedirects.indexOf(u) !== -1) {
                            this.isHome = true;
                        }
                    } else if (event.url === url || event.urlAfterRedirects === url) {
                        // 固定匹配
                        this.isHome = true;
                    }
                });
                // 首页不做动画
                if (!this.isHome) {
                    // 每次路由跳转改变状态
                    this.routerState = !this.routerState;
                    this.routerStateCode = this.routerState ? 'active' : 'inactive';
                }
            }
            if (event instanceof NavigationStart) {
                // 路由开始切换的时候产生loading
                // this.modalService.loadingShow(500);
            }
        });
        this.unsubscribes.push(events);
    }

    /**
     * 订阅侧边栏收缩状态
     */
    initNavigationState() {
        let navigateStateSubject = this.datatransferService.navigateStateSubject.subscribe(data => {
             this.leftState = data;
        });
        this.unsubscribes.push(navigateStateSubject);
    }
}
