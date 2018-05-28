/**
 * Created by LIHUA on 2017-08-05.
 */

import {Component, Input, OnDestroy, Renderer2, AfterViewInit, NgZone} from '@angular/core';
import {NavigationServices} from 'app/services/navigation.services';
import {DatatransferService} from 'app/services/datatransfer.service';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {LoginService} from 'app/services/login.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {environment} from 'environments/environment';
import {MediaQueryEnum, MediaQueryService} from 'frontend-common/ts_modules/services/media.query.service';
import {MainHeaderChangePasswordComponent} from "./change.password/main.header.change.password.component";

@Component({
    selector: 'main-header-component',
    templateUrl: './main.header.component.html',
    styleUrls: ['./main.header.component.scss']
})
export class MainHeaderComponent implements OnDestroy, AfterViewInit {
    realName: string;
    navigate: any;
    showContent = false; // 是否显示下拉内容

    unsubscribes = []; // 订阅钩子函数集合
    docHook: any;      // 当显示了content内容后监听界面点击

    // 屏幕宽度检测 小于1300时修改navi
    isSmall = false;

    // 是否是首页
    isHome: any;

    constructor(private navigationServices: NavigationServices,
                private datatransferService: DatatransferService,
                private router: Router,
                private render: Renderer2,
                private loginService: LoginService,
                private cookieService: CookieService,
                private mediaQueryService: MediaQueryService,
                private modalService: ModalService) {

        this.realName = this.loginService.realName || this.cookieService.get(Cookie.REALNAME);

        let routerEvent = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                if (event.urlAfterRedirects === '/main/home') {
                    let body = document.getElementsByTagName('body')[0];
                    body.classList.add('isHome');
                    this.isHome = true;
                } else {
                    let body = document.getElementsByTagName('body')[0];
                    body.classList.remove('isHome');
                    this.isHome = false;
                }
                // 根据地址栏路由查找到真正的路由对象
                this.navigate = this.navigationServices.getNavigate(event.urlAfterRedirects);
                this.navigate.forEach(navi => {
                    if (navi.checked) {
                        // 把选中的路由对象发送给侧边栏显示
                        this.datatransferService.navigateSubject.next(navi);
                    }
                });
            }
        });
        this.unsubscribes.push(routerEvent);

        // 界面宽度订阅
        this.mediaQueryService.mediaQuerySubject.subscribe(data => {
            this.isSmall = !(data.type === MediaQueryEnum.DESKTOP && data.matches);
        });

        this.mediaQueryService.initMediaMatcher();
    }

    ngAfterViewInit() {
        this.render.listen(window, 'storage', function (e) {
            if (e.newValue === 'true') {
               window.location.pathname = '/login';
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(sub => sub.unsubscribe());
    }

    /**
     * 导航点击
     * @param navigate
     */
    navigateClick(navigate) {
        // 存在三级菜单的时候
        if (navigate.children && navigate.children.length > 0 && navigate.children[0].children && navigate.children[0].children.length > 0 && navigate.id !== 'f04') {
            this.router.navigate([navigate.children[0].children[0].link]);
        } else if (navigate.children && navigate.children.length > 0 && navigate.id !== 'f05') {
            this.router.navigate([navigate.children[0].link]);
        } else {
            this.router.navigate([navigate.link]);
        }

    }

    /**
     * 退出登录
     */
    logoutClick() {
        if (environment.loginType === 'etl') {
            this.logoutByEtl();
        }
        if (environment.loginType === 'authority') {
            this.logoutByAuthority();
        }
    }

    logoutByEtl() {
        this.loginService.islogin = false;
        this.cookieService.remove(Cookie.TOKEN);
        localStorage.setItem('logout', 'true');
        this.router.navigateByUrl('/login');
    }

    /**
     * 权限退出登录
     */
    logoutByAuthority() {
        // this.modalService.toolConfirm('您确认退出吗？', () => {
            this.loginService.logout({}).then(d => {
                if (d.code === ServiceStatusEnum.SUCCESS) {
                    // 重置
                    this.navigationServices.navigate = [];
                    localStorage.removeItem('navigate');
                    localStorage.setItem('logout', 'true');
                    this.loginService.islogin = false;
                    this.loginService.buttonArr = {
                        b02: [],
                        b03: [],
                        b04: [],
                        b05: [],
                        b06: [],
                        b07: []
                    };
                    this.cookieService.remove(Cookie.TOKEN);
                    this.cookieService.remove(Cookie.USERID);
                    this.cookieService.remove(Cookie.REALNAME);
                    this.cookieService.remove(Cookie.ROLES);
                    this.router.navigateByUrl('/login');
                }
            });
        // });
    }

    toggleShowContent($event: MouseEvent) {
        if (!this.showContent) {
            this.showContent = true;
            this.addDocumentEvent();
        } else {
            this.showContent = false;
            if (this.docHook) {
                this.docHook();
                this.docHook = null;
            }
        }

        $event.stopPropagation();
    }

    /**
     * 监听背景点击 然后关闭content
     */
    addDocumentEvent() {
        this.docHook = this.render.listen(document, 'click', (e) => {
            if (this.showContent) {
                this.showContent = false;
            }
            this.docHook();
            this.docHook = null;
        });
    }

    /**
     * 修改密码
     */
    changePwd() {
        let [ins] = this.modalService.toolOpen({
            title: '修改密码',
            component: MainHeaderChangePasswordComponent,
            datas: {
                type : 'changePwd'
            },
            okCallback: () => {
                ins.changePassword();
            }
        } as ToolOpenOptions);

        ins.hideInstance = () => {
            ins.destroy();
        };
    }

    /**
     * 密码服务
     */
    passwordService() {
        let [ins] = this.modalService.toolOpen({
            title: '密码服务',
            component: MainHeaderChangePasswordComponent,
            datas: {
                type : 'passwordService'
            },
            okCallback: () => {
                ins.passwordService();
            }
        } as ToolOpenOptions);

        ins.hideInstance = () => {
            ins.destroy();
        };
    }
}
