/**
 * Created by lh on 2017/12/20.
 * 数据挖掘界面
 */

import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {CookieService} from 'ngx-cookie';

import {Cookie} from 'app/constants/cookie';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {NavigationServices} from 'app/services/navigation.services';

@Component({
    selector: 'mining-component',
    templateUrl: './mining.component.html',
    styleUrls: ['./mining.component.scss']
})
export class MiningComponent implements AfterViewInit {

    @ViewChild('iframe')
    iframe: ElementRef;

    constructor(private httpServer: HttpService,
                private render: Renderer2,
                private modalService: ModalService,
                private cookieService: CookieService,
                private navigationServices: NavigationServices) {
    }

    ngAfterViewInit() {
        this.initIframe();
    }

    /**
     * iframe初始化
     */
    initIframe() {
        let navigate = this.navigationServices.navigate;
        if (!navigate) {
            return;
        }
        let authorityArr = navigate.filter(item => {
           return item.id === 'f05';
        });
        if (authorityArr.length === 0) {
            this.modalService.alert('您没有数据挖掘权限');
            return;
        }
        if (authorityArr && authorityArr.length && authorityArr[0].children && authorityArr[0].children.length) {
            let iframe = this.iframe.nativeElement;
            // 因为0502是工作台，并无页面展示，所以只配置工作台的时候提示用户
            if (authorityArr[0].children.length === 1 && authorityArr[0].children[0].id === 's0502') {
                this.modalService.alert('当前用户的数据挖掘中无页面展示', {time: 3000});
                return;
            }
            // 因为0502是工作台，并无页面展示，因为交换位置
            if (authorityArr[0].children.length > 1 && authorityArr[0].children[0].id === 's0502') {
                [authorityArr[0].children[0], authorityArr[0].children[1]] = [authorityArr[0].children[1], authorityArr[0].children[0]]
            }

            iframe.src = this.httpServer.getMiningServerUrl() +
                '?token=' + this.cookieService.get(Cookie.TOKEN) +
                '&loginName=' + this.cookieService.get(Cookie.LOGINNAME) +
                '&auth=' + authorityArr[0].children.map(m => {
                    return m.id;
                }).join(',');

            this.modalService.loadingShow();
            this.render.listen(iframe, 'load', () => {
                this.modalService.loadingHide();
            });
        }
    }
}
