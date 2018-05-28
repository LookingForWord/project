/**
 * Created by LIHUA on 2017-08-14.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MediaComponent} from 'frontend-common/ts_modules/services/media.service/components/media/media.component';
import {MediaService} from 'frontend-common/ts_modules/services/media.service/media.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        MediaComponent
    ],
    entryComponents: [
        MediaComponent
    ],
    providers: [
        MediaService
    ]
})
export class MediaModule {

}
