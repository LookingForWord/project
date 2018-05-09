/**
 * Created by LIHUA on 2017/7/31/031.
 * 主界面 首页模块
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AngularEchartsModule} from 'ngx-echarts';

import {HomeComponent} from 'app/components/modules/home/home.component';
import {HomeRouteModule} from 'app/components/modules/home/home.route';

import {HomeService} from 'app/services/home.service';
import {AuthGuard} from 'app/services/auth-guard.service';
import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {HomeDetailComponent} from "app/components/modules/home/detail/home.detail.component";

@NgModule({
    imports: [
        CommonModule,
        HomeRouteModule,
        AngularEchartsModule,
        TsModule
    ],
    declarations: [
        HomeComponent,
        HomeDetailComponent
    ],
    providers: [
        HomeService,
        AuthGuard
    ],
    exports: [
        HomeComponent
    ]
})
export class HomeModule {

}
