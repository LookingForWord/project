/**
 * Created by LIHUA on 2017-10-17.
 * 权限系统模块路由
 */
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from 'app/services/auth-guard.service';

import {AuthorityOrganizeComponent} from 'app/components/modules/authority/components/organize/authority.organize.component';
import {AuthorityUserComponent} from 'app/components/modules/authority/components/user/authority.user.component';
import {AuthorityRoleComponent} from 'app/components/modules/authority/components/role/authority.role.component';
import {AuthorityObjectComponent} from 'app/components/modules/authority/components/object/authority.object.component';
import {AuthorityOnlineComponent} from 'app/components/modules/authority/components/online/authority.online.component';
import {AuthorityObjectMenuComponent} from 'app/components/modules/authority/components/object/menu/authority.object.menu.component';
import {AuthorityObjectInterfaceComponent} from 'app/components/modules/authority/components/object/interfaceManage/authority.object.interface.component';
import {AuthorityObjectDataComponent} from 'app/components/modules/authority/components/object/data/authority.object.data.component';
import {AuthorityObjectDataPermissionComponent} from 'app/components/modules/authority/components/object/data.permission/authority.object.data.permission.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'organize'
    },
    {
        path: 'organize',
        pathMatch: 'full',
        component: AuthorityOrganizeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'user',
        pathMatch: 'full',
        component: AuthorityUserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'role',
        pathMatch: 'full',
        component: AuthorityRoleComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'object',
        component: AuthorityObjectComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'menu',
            },
            {
                path: 'menu',
                pathMatch: 'full',
                component: AuthorityObjectMenuComponent,
                canActivateChild: [AuthGuard]
            },
            {
                path: 'interfaces',
                pathMatch: 'full',
                component: AuthorityObjectInterfaceComponent,
                canActivateChild: [AuthGuard]
            },
            {
                path: 'data',
                pathMatch: 'full',
                component: AuthorityObjectDataComponent,
                canActivateChild: [AuthGuard]
            },
            {
                path: 'dataPermission',
                pathMatch: 'full',
                component: AuthorityObjectDataPermissionComponent,
                canActivateChild: [AuthGuard]
            }
        ]
    },
    {
        path: 'online',
        pathMatch: 'full',
        component: AuthorityOnlineComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class AuthorityRouteModule {

}
