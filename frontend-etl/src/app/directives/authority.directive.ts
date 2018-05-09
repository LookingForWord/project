/**
 * Created by LIHUA on 2018-01-17.
 *  按钮权限指令
 */

import {Directive, ElementRef} from '@angular/core';
import {LoginService} from 'app/services/login.service';

@Directive({
    selector: '[authority]'
})
export class AuthorityDirective {
    constructor(private element: ElementRef,
                private loginService: LoginService) {

        let authority = this.element.nativeElement.getAttribute('authority');
        let result = this.loginService.findButtonAuthority(authority);
        // this.element.nativeElement.style.display = result ? 'block' : 'none';
        if (!result) {
            this.element.nativeElement.parentNode.removeChild(this.element.nativeElement);
        }
    }
}
