/**
 * Created by LIHUA on 2017-08-05.
 */

import {Component, Input, OnDestroy} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {Router} from '@angular/router';
import {NavigationServices} from 'app/services/navigation.services';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

@Component({
    selector: 'main-sidebar-component',
    templateUrl: './main.sidebar.component.html',
    styleUrls: ['./main.sidebar.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class MainSidebarComponent implements OnDestroy {

    @Input()
    isHome: boolean;

    state = 0; // sidebar状态  0 close， 1 min， 2 normal，3 mixMax，4 max

    // 导航信息
    navigate: any;

    // 是否最小化二级导航
    showChild = true;
    // 是否显示三级导航
    showSubChild = false;

    // 三级导航组件引用
    naviComponent: any;

    unsubscribes = []; // 订阅钩子函数集合

    nosides = ['/main/home', '/main/mining', '/main/dataServe/**']; // 不需要展示侧边栏的目录

    constructor(private datatransferService: DatatransferService,
                private rouetr: Router,
                private navigationServices: NavigationServices) {
        // 收到顶部发送的选中的导航信息
        let navigateSubject = this.datatransferService.navigateSubject.subscribe(data => {
            // 导航为home mining 直接关闭侧边栏
            let noside = false;
            this.nosides.forEach(n => {
                // 通配
                if (n.indexOf('/**') !== -1) {
                    let t = n.substr(0, n.indexOf('/**'));
                    if (data.link.indexOf(t) !== -1) {
                        noside = true;
                    }
                } else if (n === data.link) {
                    noside = true;
                }
            });
            // 首页详情单独处理
            if (this.rouetr.url !== '/main/home' && this.rouetr.url.indexOf('/main/home') !== -1) {
                noside = false;
            }
            this.state = noside ? 0 : 2;

            this.navigate = data.children || [];
            this.showSubChild = false;
            this.showChild = true;

            // 广播给外界 当前侧边栏的状态 主要是配合任务配置界面布局
            this.datatransferService.navigateStateSubject.next(this.state);

        });
        this.unsubscribes.push(navigateSubject);
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
    }

    /**
     * 切换
     * @param show
     */
    toggleShowChild(show: boolean) {
        if (show) {
            this.state = this.showSubChild ? 4 : 2;
        } else {
            this.state = this.showSubChild ? 3 : 1;

            // 关闭三级导航
            this.navigate.forEach(navi => {
                if (navi.expand) {
                    navi.expand = false;
                }
            });
        }
        this.showChild = show;

        // 广播给外界 当前侧边栏的状态 主要是配合任务配置界面布局
        this.datatransferService.navigateStateSubject.next(this.state);
    }

    /**
     * 导航点击
     * @param navi
     */
    naviClick(navi: any) {
        if (navi.children && navi.children.length) {
            navi.expand = !navi.expand;
            return;
        }
        // 被选中的时候不再执行路由
        if (navi.checked) {
            return;
        }
        this.clearCheckedNavi();
        navi.checked = true;
        if (navi.link) {
            this.state = this.showChild ? 2 : 1;
            this.showSubChild = false;

            this.rouetr.navigate([navi.link]);
        }
    }

    /**
     * 清除已选中的navi
      */
    clearCheckedNavi() {
        let temp = [];
        temp = temp.concat(this.navigationServices.navigate);
        while (temp.length) {
            let t = temp.pop();
            t.checked = false;
            if (t.children && t.children.length) {
                temp = temp.concat(t.children);
            }
        }
    }

    /**
     * 初始化三级导航
     */
    initSubChild(navi: any) {
        this.naviComponent = navi.component;
    }

}
