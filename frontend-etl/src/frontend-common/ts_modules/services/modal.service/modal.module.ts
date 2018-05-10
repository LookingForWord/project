/**
 * Created by LIHUA on 2017-08-03.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ModalAlertComponent} from 'frontend-common/ts_modules/services/modal.service/components/alert/modal.alert.component';
import {ModalBasicComponent} from 'frontend-common/ts_modules/services/modal.service/components/basic/modal.basic.component';
import {ModalConfrimComponent} from 'frontend-common/ts_modules/services/modal.service/components/confrim/modal.confirm.component';
import {ModalLoadingComponent} from 'frontend-common/ts_modules/services/modal.service/components/loading/modal.loading.component';
import {ModalSlotComponent} from 'frontend-common/ts_modules/services/modal.service/components/slot/modal.slot.component';

@NgModule({
    imports: [CommonModule],
    declarations: [
        ModalAlertComponent,
        ModalBasicComponent,
        ModalConfrimComponent,
        ModalLoadingComponent,
        ModalSlotComponent
    ],
    providers: [ModalService],
    entryComponents: [
        ModalAlertComponent,
        ModalBasicComponent,
        ModalConfrimComponent,
        ModalLoadingComponent
    ],
    exports: [
        ModalSlotComponent
    ]
})
export class ModalModule {}
