/**
 * Created by LIHUA on 2017-08-05.
 * 路由服务
 */

import {Injectable} from '@angular/core';
import {Navigation} from '../constants/navigation';

@Injectable()
export class NavigationServices {

    navigate: any; // 整个导航对象

    constructor() {

    }

    /**
     * 获取路由信息
     * @param url
     * @returns {any}
     */
    getNavigate(url?: string) {
        if (url) {
            this.initNavigateByUrl(url);
        }

        return this.navigate;
    }

    /**
     * 导航初始化 就是根据url选中显示的路由
     * @param url
     */
    initNavigateByUrl(url: string) {
        const nums = url.indexOf('?');
        if (nums !== -1) {
            url = url.substr(0, nums);
        }

        this.navigate.forEach(navi => { // 一级目录遍历
            navi.checked = url.indexOf(navi.link) !== -1;
            if (navi.children) {
                navi.children.forEach(child => { // 二级目录遍历
                    if (child.children && child.children.length) {
                        child.children.forEach(c => { // 三级目录遍历
                            c.checked = url.indexOf(c.link) !== -1;
                            if (c.checked) {
                                child.expand = true;
                            }
                        });
                    } else {
                        child.checked = url.indexOf(child.link) !== -1;
                    }
                });
            }
        });
    }
}
