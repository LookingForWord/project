/**
 * Created by lh on 2018/01/30.
 *  数据服务 主模块
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxMyDatePickerModule} from 'ngx-mydatepicker';
import {DirctiveModule} from 'app/directives/dirctive.module';
import {TsModule} from 'frontend-common/ts_modules/ts.module';

import {DataServeRouteModule} from 'app/components/modules/data.serve/data.serve.route';
import {DataServeService} from 'app/services/data.serve.service';

import {DataServeListComponent} from 'app/components/modules/data.serve/components/list/data.serve.list.component';
import {DataServiceAuditServiceComponent} from 'app/components/modules/data.serve/components/audit.service/data.service.audit.service.component';
import {DataServiceAuditServiceModalComponent} from 'app/components/modules/data.serve/components/audit.service/modal/data.service.audit.service.modal.component';
import {DataServeAddComponent} from 'app/components/modules/data.serve/components/add/data.serve.add.component';
import {DataServeAddSetColRangeModelComponent} from 'app/components/modules/data.serve/components/add/model/data.serve.add.set.col.range.model.component';

import {DataServeApplyComponent} from 'app/components/modules/data.serve/components/apply/data.serve.apply.component';
import {DataServeApplyModalComponent} from 'app/components/modules/data.serve/components/apply/apply.modal/data.serve.apply.modal.component';
import {DataServeServiceCallComponent} from 'app/components/modules/data.serve/components/service.call/data.serve.service.call.component';
import {DataServeUserApplicationComponent} from 'app/components/modules/data.serve/components/user.application/data.serve.user.application.component';
import {DataServeDetailComponent} from 'app/components/modules/data.serve/components/detail/data.serve.detail.component';

@NgModule({
    declarations: [
        DataServeListComponent,
        DataServiceAuditServiceComponent,
        DataServiceAuditServiceModalComponent,
        DataServeAddComponent,
        DataServeApplyComponent,
        DataServeApplyModalComponent,
        DataServeServiceCallComponent,
        DataServeUserApplicationComponent,
        DataServeAddSetColRangeModelComponent,
        DataServeDetailComponent
    ],
    imports: [
        CommonModule,
        DataServeRouteModule,
        TsModule,
        FormsModule,
        DirctiveModule,
        NgxMyDatePickerModule.forRoot(),
    ],
    exports: [

    ],
    providers: [
        DataServeService
    ],
    entryComponents: [
        DataServiceAuditServiceModalComponent,
        DataServeAddComponent,
        DataServeApplyModalComponent,
        DataServeAddSetColRangeModelComponent
    ]
})
export class DataServeModule {}
