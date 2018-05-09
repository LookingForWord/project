/**
 * Created by LIHUA on 2017/7/31/031.
 * 主界面模块
 */
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MainComponent} from 'app/components/main/main.component';
import {MainHeaderComponent} from 'app/components/main/header/main.header.component';
import {MainSidebarComponent} from 'app/components/main/sidebar/main.sidebar.component';
import {NavigationServices} from 'app/services/navigation.services';
import {AuthorityService} from 'app/services/authority.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DatatransferService} from 'app/services/datatransfer.service';
import {MainSidebarChildComponent} from 'app/components/main/sidebar/child/main.sidebar.child.component';
import {MainNaviComponent} from 'app/components/main/navi/main.navi.component';
import {MainHeaderChangePasswordComponent} from 'app/components/main/header/change.password/main.header.change.password.component';
import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {MediaQueryService} from 'frontend-common/ts_modules/services/media.query.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TsModule
    ],
    declarations: [
        MainComponent,
        MainHeaderComponent,
        MainSidebarComponent,
        MainSidebarChildComponent,
        MainHeaderChangePasswordComponent,

        MainNaviComponent
    ],
    exports: [
        MainComponent,
        MainNaviComponent
    ],
    providers: [
        NavigationServices,
        DatatransferService,
        MediaQueryService,
        AuthorityService
    ],
    entryComponents: [
        MainHeaderChangePasswordComponent
    ]
})
export class MainModule {

}
