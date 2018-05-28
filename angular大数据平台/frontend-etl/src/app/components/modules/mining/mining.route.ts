/**
 * Created by lh on 2017/12/20.
 * 数据挖掘路由
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MiningComponent} from 'app/components/modules/mining/mining.component';
import {AuthGuard} from 'app/services/auth-guard.service';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: MiningComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class MiningRouteModule {

}
