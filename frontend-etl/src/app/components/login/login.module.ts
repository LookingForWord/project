/**
 * Created by LIHUA on 2017/7/31/031.
 * 登录模块
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CookieModule} from 'ngx-cookie';

import {LoginComponent} from 'app/components/login/login.component';
import {LoginService} from 'app/services/login.service';
import {TsModule} from 'frontend-common/ts_modules/ts.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CookieModule.forRoot(),
        TsModule
    ],
    declarations: [
        LoginComponent
    ],
    exports: [
        LoginComponent
    ],
    providers: [
        LoginService,
    ]
})
export class LoginModule {

}
