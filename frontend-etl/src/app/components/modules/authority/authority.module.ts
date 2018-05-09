/**
 * Created by LIHUA on 2017-10-17.
 *  权限系统模块
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgxMyDatePickerModule} from 'ngx-mydatepicker';
import {FileUploadModule} from 'ng2-file-upload';

import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {AuthorityRouteModule} from 'app/components/modules/authority/authority.route';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {TaskService} from 'app/services/task.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {AuthorityService} from 'app/services/authority.service';
import {AuthGuard} from 'app/services/auth-guard.service';
// 测试接口，新接口出来后删除
import {SystemService} from 'app/services/system.service';

import {DirctiveModule} from 'app/directives/dirctive.module';

import {AuthorityOrganizeComponent} from 'app/components/modules/authority/components/organize/authority.organize.component';
import {AuthorityUserComponent} from 'app/components/modules/authority/components/user/authority.user.component';
import {AuthorityRoleComponent} from 'app/components/modules/authority/components/role/authority.role.component';
import {AuthorityOnlineComponent} from 'app/components/modules/authority/components/online/authority.online.component';
import {AuthorityObjectComponent} from 'app/components/modules/authority/components/object/authority.object.component';
import {AuthorityUserAddComponent} from 'app/components/modules/authority/components/user/add/authority.user.add.component';
import {AuthorityOrganizeAsideComponent} from 'app/components/modules/authority/components/organize/aside/authority.organize.aside.component';
import {AuthorityOrganizeAsideAddComponent} from 'app/components/modules/authority/components/organize/aside/add/authority.organize.aside.add.component';
import {AuthorityOrganizeTreeComponent} from 'app/components/modules/authority/components/organize/tree/authority.organize.tree.component';
import {AuthorityObjectMenuComponent} from 'app/components/modules/authority/components/object/menu/authority.object.menu.component';
import {AuthorityObjectDataComponent} from 'app/components/modules/authority/components/object/data/authority.object.data.component';
import {AuthorityRoleAddComponent} from 'app/components/modules/authority/components/role/add/authority.role.add.component';
import {AuthorityObjectMenuAddComponent} from 'app/components/modules/authority/components/object/menu/add/authority.object.menu.add.component';
import {AuthorityObjectInterfaceComponent} from 'app/components/modules/authority/components/object/interfaceManage/authority.object.interface.component';
import {AuthorityObjectInterfaceAddComponent} from 'app/components/modules/authority/components/object/interfaceManage/add/authority.object.interface.add.component';
import {AuthorityRoleTreeComponent} from 'app/components/modules/authority/components/role/tree/authority.role.tree.component';
import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';
import {AuthorityObjectMenuTreeComponent} from 'app/components/modules/authority/components/object/menu/tree/authority.object.menu.tree.component';
import {AuthorityObjectDataTreeComponent} from 'app/components/modules/authority/components/object/data/tree/authority.object.data.tree.component';
import {AuthorityObjectDataPermissionComponent} from 'app/components/modules/authority/components/object/data.permission/authority.object.data.permission.component';
import {AuthorityRolePermissionTreeComponent} from 'app/components/modules/authority/components/role/permission.tree/authority.role.permission.tree.component';

@NgModule({
    imports: [
        CommonModule,
        AuthorityRouteModule,
        TsModule,
        FormsModule,
        RouterModule,
        NgxMyDatePickerModule.forRoot(),
        FileUploadModule,
        DirctiveModule
    ],
    declarations: [
        AuthorityOrganizeComponent,
        AuthorityOrganizeAsideComponent,
        AuthorityOrganizeAsideAddComponent,
        AuthorityOrganizeTreeComponent,

        AuthorityUserComponent,
        AuthorityUserAddComponent,

        AuthorityRoleComponent,
        AuthorityRoleAddComponent,
        AuthorityRoleTreeComponent,

        AuthorityOnlineComponent,

        AuthorityObjectComponent,
        AuthorityObjectComponent,
        AuthorityObjectMenuComponent,
        AuthorityObjectMenuAddComponent,
        AuthorityObjectInterfaceComponent,
        AuthorityObjectInterfaceAddComponent,
        AuthorityObjectDataComponent,
        AuthorityObjectDataTreeComponent,
        AuthorityExportComponent,
        AuthorityObjectMenuTreeComponent,
        AuthorityObjectDataPermissionComponent,
        AuthorityRolePermissionTreeComponent
    ],
    providers: [
        ModalService,
        DatatransferService,
        TaskService,
        ToolService,
        AuthorityService,
        SystemService,
        AuthGuard
    ],
    entryComponents: [
        AuthorityUserAddComponent,

        AuthorityOrganizeAsideAddComponent,

        AuthorityRoleAddComponent,

        AuthorityObjectMenuAddComponent,
        AuthorityObjectInterfaceAddComponent,
        AuthorityExportComponent,
        AuthorityObjectMenuTreeComponent,
        AuthorityObjectDataComponent,
        AuthorityObjectDataTreeComponent,
        AuthorityRolePermissionTreeComponent
    ]
})
export class AuthorityModule {

}
