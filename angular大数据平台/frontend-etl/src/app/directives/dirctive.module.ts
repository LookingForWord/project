/**
 * Created by LIHUA on 2018-01-18.
 *  directive模块导出
 */

import {NgModule} from '@angular/core';
import {AuthorityDirective} from './authority.directive';

@NgModule({
    declarations: [
        AuthorityDirective
    ],
    exports: [
        AuthorityDirective
    ]
})
export class DirctiveModule {

}
