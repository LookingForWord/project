/**
 * Created by LIHUA on 2017/7/31/031.
 * 主界面 首页模块路由
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from 'app/components/modules/home/home.component';
import {AuthGuard} from 'app/services/auth-guard.service';
import {HomeDetailComponent} from 'app/components/modules/home/detail/home.detail.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'detail/:categoryId/:type',
        pathMatch: 'full',
        component: HomeDetailComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class HomeRouteModule {

}
