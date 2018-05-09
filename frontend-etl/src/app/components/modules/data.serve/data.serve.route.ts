/**
 * Created by lh on 2018/01/30.
 * 数据服务 路由模块
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DataServeListComponent} from 'app/components/modules/data.serve/components/list/data.serve.list.component';
import {DataServiceAuditServiceComponent} from 'app/components/modules/data.serve/components/audit.service/data.service.audit.service.component';
import {DataServeAddComponent} from 'app/components/modules/data.serve/components/add/data.serve.add.component';
import {DataServeApplyComponent} from 'app/components/modules/data.serve/components/apply/data.serve.apply.component';
import {DataServeServiceCallComponent} from 'app/components/modules/data.serve/components/service.call/data.serve.service.call.component';
import {DataServeUserApplicationComponent} from 'app/components/modules/data.serve/components/user.application/data.serve.user.application.component';
import {DataServeDetailComponent} from 'app/components/modules/data.serve/components/detail/data.serve.detail.component';


const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
    }, {
        path: 'list',
        pathMatch: 'full',
        component: DataServeListComponent
    }, {
        path: 'auditService',
        pathMatch: 'full',
        component: DataServiceAuditServiceComponent
    }, {
        path: 'addServe/:id',
        pathMatch: 'full',
        component: DataServeAddComponent
    }, {
        path: 'applyServe',
        pathMatch: 'full',
        component: DataServeApplyComponent
    }, {
        path: 'service-call',
        pathMatch: 'full',
        component: DataServeServiceCallComponent
    }, {
        path: 'application',
        pathMatch: 'full',
        component: DataServeUserApplicationComponent
    }, {
        path: 'detail/:id/:systemName',
        pathMatch: 'full',
        component: DataServeDetailComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class DataServeRouteModule {}
