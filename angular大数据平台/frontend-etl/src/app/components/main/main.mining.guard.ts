/**
 * Created by lh on 2017/12/17.
 * 数据挖掘 守卫 由于采用守卫的形式要报内存溢出 暂且弃用
 */

import {CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

export class MainMiningGuard implements CanActivateChild {

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let a = document.createElement('a');
        a.href = 'http://192.168.0.13:8888/#/';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
        });

        return false;
    }
}
