/**
 * Created by LIHUA on 2017/7/31/031.
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from 'app/components/login/login.component';
import {MainComponent} from 'app/components/main/main.component';
import {DemoComponent} from 'app/components/demo/demo.component';
import {environment} from 'environments/environment';

import {MainGuard} from 'app/components/main/main.guard';
import {LoginGuard} from 'app/components/login/login.guard';
import {MainMiningGuard} from 'app/components/main/main.mining.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }, {
        path: 'login',
        component: LoginComponent,
        pathMatch: 'full',
        canActivate: [LoginGuard]
    }, {
        path: 'main',
        component: MainComponent,
        canActivate: [MainGuard],
        children: [
            {
                path: 'home',
                loadChildren: 'app/components/modules/home/home.module#HomeModule'
            }, {
                path: 'task',
                loadChildren: 'app/components/modules/task/task.module#TaskModule'
            }, {
                path: 'authority',
                loadChildren: 'app/components/modules/authority/authority.module#AuthorityModule',
            }, {
                path: 'governance',
                loadChildren: 'app/components/modules/governance/governance.module#GovernanceModule'
            }, {
                path: 'workflow',
                loadChildren: 'app/components/modules/workflow/workflow.module#WorkflowModule',
            }, {
                path: 'mining',
                loadChildren: 'app/components/modules/mining/mining.module#MiningModule',
            }, {
                path: 'dataServe',
                loadChildren: 'app/components/modules/data.serve/data.serve.module#DataServeModule',
            }
        ]
    }, {
        path: '**',
        // redirectTo: 'main'
        redirectTo: 'login'
        // component: NotFoundComponent // 404
    }
];

// 开发环境下加入demo模块
if (!environment.production) {
    routes.unshift({
        path: 'demo',
        component: DemoComponent,
        pathMatch: 'full'
    });
}

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRouteModule {

}
