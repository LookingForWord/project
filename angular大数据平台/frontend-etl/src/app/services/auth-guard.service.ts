import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {NavigationServices} from 'app/services/navigation.services';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Injectable()
export class AuthGuard implements CanActivate {
    result = false;
    constructor(private navigationServices: NavigationServices,
                private modalService: ModalService,
                private router: Router) {
        this.result = false;
    }
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.navigationServices.navigate) {
            this.mapRoutes(this.navigationServices.navigate, state.url);
        }
        if (!this.result) {
            this.router.navigate(['/login']);
            this.modalService.alert('没有该地址的访问权限', {auto: true});
        }
        return this.result;
    }

    mapRoutes(data, url) {
        data.map(item => {
            // 这里路由采用模糊匹配就行 不然的话 数据仓库管理->数据表管理 这个界面不能支持刷新显示  下穿的单独处理（否则更改权限刷新的话虽然无菜单显示但守卫返回依然为true）
            if (url.indexOf(item.link) !== -1 &&
                (item.id === 's0402' || item.id === 's0602' || item.id === 's020302' || item.id === 's020401')
            ) {
                this.result = true;
                return;
            }
            if (url === item.link && item.id !== 's0402' && item.id !== 's0602' && item.id !== 's020302') {
                this.result = true;
                return;
            }
            if (item.children && item.children.length) {
                this.mapRoutes(item.children, url);
            }
        });
    }
}
