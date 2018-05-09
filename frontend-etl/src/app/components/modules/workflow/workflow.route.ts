/**
 * Created by lh on 2017/11/9.
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WorkflowWorkComponent} from 'app/components/modules/workflow/components/work/workflow.work.component';
import {WorkflowResultComponent} from 'app/components/modules/workflow/components/result/workflow.result.component';
import {WorkflowNodeComponent} from 'app/components/modules/workflow/components/node/workflow.node.component';
import {WorkflowResultDetailComponent} from 'app/components/modules/workflow/components/result/detail/workflow.result.detail.component';
import {WorkflowResultDetailListComponent} from 'app/components/modules/workflow/components/result/detail.list/workflow.result.detail.list.component';

import {AuthGuard} from 'app/services/auth-guard.service';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'work'
    },
    {
        path: 'work',
        pathMatch: 'full',
        component: WorkflowWorkComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'result',
        pathMatch: 'full',
        component: WorkflowResultComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'result/detail/list/:id/:page',
        pathMatch: 'full',
        component: WorkflowResultDetailListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'result/detail/:id/:exeId/:page',
        pathMatch: 'full',
        component: WorkflowResultDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'node',
        pathMatch: 'full',
        component: WorkflowNodeComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class WorkflowRouteModule {}
