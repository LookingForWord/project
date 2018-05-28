/**
 * Created by LIHUA on 2017-08-14.
 * 默认导出ts_modules下的全部模块
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {PaginationComponent} from 'frontend-common/ts_modules/components/pagination/pagination.component';
import {MultiPaginationComponent} from 'frontend-common/ts_modules/components/multi.pagination/multi.pagination.component';
import {SelectComponent} from 'frontend-common/ts_modules/components/select/select.component';
import {MultiSelectComponent} from 'frontend-common/ts_modules/components/multi.select/multi.select.component';
import {IconfontComponent} from 'frontend-common/ts_modules/components/iconfont/iconfont.component';
import {RadioComponent} from 'frontend-common/ts_modules/components/radio/radio.component';
import {TableComponent} from 'frontend-common/ts_modules/components/table/table.component';

import {DatePipe} from 'frontend-common/ts_modules/pipe/date.pipe';
import {SizePipe} from 'frontend-common/ts_modules/pipe/size.pipe';
import {SubstrPipe} from 'frontend-common/ts_modules/pipe/string.pipe';
import {NumberPipe} from 'frontend-common/ts_modules/pipe/number.pipe';

import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalModule} from 'frontend-common/ts_modules/services/modal.service/modal.module';
import {MediaModule} from 'frontend-common/ts_modules/services/media.service/media.module';
import {MediaQueryService} from 'frontend-common/ts_modules/services/media.query.service';
import {ModalSlotComponent} from 'frontend-common/ts_modules/services/modal.service/components/slot/modal.slot.component';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

import {TooltipDirective} from 'frontend-common/ts_modules/directives/tooltip/tooltip.directive';
import {ShowDirective} from 'frontend-common/ts_modules/directives/show/show.directive';
import {DatepickerDirective} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
import {DatepickerComponent} from 'frontend-common/ts_modules/directives/datepicker/datepicker.component';
import {InputDebounceDirective} from 'frontend-common/ts_modules/directives/input.debounce/input.debounce.directive';

import {TokenInterceptor} from 'frontend-common/interceptor/token.interceptor';
import {ResponseInterceptor} from 'frontend-common/interceptor/response.interceptor';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        MediaModule,
        HttpClientModule,
        FormsModule
    ],
    declarations: [
        PaginationComponent,
        MultiPaginationComponent,
        SelectComponent,
        MultiSelectComponent,
        IconfontComponent,
        RadioComponent,
        DatePipe,
        SizePipe,
        SubstrPipe,
        NumberPipe,
        TooltipDirective,
        ShowDirective,
        DatepickerDirective,
        DatepickerComponent,
        InputDebounceDirective,
        TableComponent
    ],
    entryComponents: [
        DatepickerComponent
    ],
    providers: [
        HttpService,
        ToolService,
        MediaQueryService,
        ValidateService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ResponseInterceptor,
            multi: true
        }
    ],
    exports: [
        PaginationComponent,
        MultiPaginationComponent,
        SelectComponent,
        MultiSelectComponent,
        ModalSlotComponent,
        IconfontComponent,
        RadioComponent,
        DatePipe,
        SizePipe,
        SubstrPipe,
        TooltipDirective,
        ShowDirective,
        DatepickerDirective,
        DatepickerComponent,
        InputDebounceDirective,
        TableComponent
    ]
})
export class TsModule {

}
