/**
 * Created by LIHUA on 2017-08-12.
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NgxMyDatePickerModule} from 'ngx-mydatepicker';

import {DemoComponent} from 'app/components/demo/demo.component';
import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {DemoTreeComponent} from 'app/components/demo/tree/demo.tree.component';

@NgModule({
    imports: [
        CommonModule,
        TsModule,
        FormsModule,
        NgxMyDatePickerModule.forRoot()
    ],
    declarations: [
        DemoComponent,
        DemoTreeComponent
    ],
    exports: [
        DemoComponent
    ]
})
export class DemoModule {

}
