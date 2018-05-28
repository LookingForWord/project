/**
 * Created by LIHUA on 2017/7/31/031.
 * ETL模块路由
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {TaskDataSourceComponent} from 'app/components/modules/task/components/data.source/task.data.source.component';
import {TaskConfigComponent} from 'app/components/modules/task/components/config/task.config.component';
import {TaskHomeComponent} from 'app/components/modules/task/components/home/task.home.component';
import {TaskDatabaseComponent} from 'app/components/modules/task/components/database/task.database.component';
import {TaskDatabaseTableComponent} from 'app/components/modules/task/components/database/table/task.database.table.component';
import {TaskDatabaseTableAddComponent} from './components/database/table/add/task.database.table.add.component';
import {TaskKnowledgeComponent} from 'app/components/modules/task/components/knowledge/task.knowledge.component';
import {TaskRuleComponent} from 'app/components/modules/task/components/rule/task.rule.component';
import {TaskConvergeComponent} from 'app/components/modules/task/components/converge/task.converge.component';
import {TaskOperationInstanceComponent} from 'app/components/modules/task/components/operation/instance/task.operation.instance.component';
import {TaskOperationMaintenanceComponent} from 'app/components/modules/task/components/operation/maintenance/task.operation.maintenance.component';
import {TaskOperationConvergenceComponent} from 'app/components/modules/task/components/operation/convergence/task.operation.convergence.component';
import {TaskOperationActionComponent} from 'app/components/modules/task/components/operation/action/task.operation.action.component';

import {AuthGuard} from 'app/services/auth-guard.service';
import {TaskTextComponent} from "./components/text/task.text.component";

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    }, {
        path: 'home',
        pathMatch: 'full',
        component: TaskHomeComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'database',
        pathMatch: 'full',
        component: TaskDatabaseComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'database/table',
        pathMatch: 'full',
        component: TaskDatabaseTableComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'database/table/add',
        pathMatch: 'full',
        component: TaskDatabaseTableAddComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'database/table/info',
        pathMatch: 'full',
        component: TaskDatabaseTableAddComponent,
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'dataSource',
    //     pathMatch: 'full',
    //     component: TaskDataSourceComponent,
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'config',
        pathMatch: 'full',
        component: TaskConfigComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'knowledge',
        pathMatch: 'full',
        component: TaskKnowledgeComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'rule',
        pathMatch: 'full',
        component: TaskRuleComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'converge',
        pathMatch: 'full',
        component: TaskConvergeComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'operation/instance',
        pathMatch: 'full',
        component: TaskOperationInstanceComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'operation/maintenance',
        pathMatch: 'full',
        component: TaskOperationMaintenanceComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'operation/convergence',
        pathMatch: 'full',
        component: TaskOperationConvergenceComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'operation/action',
        pathMatch: 'full',
        component: TaskOperationActionComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'text',
        pathMatch: 'full',
        component: TaskTextComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class TaskRouteModule {

}
