/**
 * Created by LIHUA on 2017-08-12.
 */
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';

import {LoginService} from 'app/services/login.service';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(private loginService: LoginService,
                private router: Router) {
    }

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (this.loginService.islogin) {
        //     this.router.navigateByUrl('/main');
        // } else {
        //     let data = await this.loginService.autologin();
        //     if (data.success) {
        //         // 自动登录成功
        //         this.router.navigateByUrl('/main');
        //     } else {
        //         return true;
        //     }
        // }
        return true;
    }
}
