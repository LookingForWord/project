/**
 * Created by lh on 2017/12/17.
 *  数据挖掘模块
 */
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CookieModule} from 'ngx-cookie';

import {MiningComponent} from 'app/components/modules/mining/mining.component';
import {MiningRouteModule} from 'app/components/modules/mining/mining.route';

import {AuthGuard} from 'app/services/auth-guard.service';
import {TsModule} from 'frontend-common/ts_modules/ts.module';

@NgModule({
    imports: [
        FormsModule,
        CookieModule.forRoot(),
        MiningRouteModule,
        TsModule
    ],
    declarations: [
        MiningComponent
    ],
    providers: [
        AuthGuard
    ],
    exports: [
        MiningComponent
    ]
})
export class MiningModule {}
