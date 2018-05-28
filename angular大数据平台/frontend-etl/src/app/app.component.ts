import {Component, OnDestroy} from '@angular/core';
import {NgProgress} from 'ngx-progressbar';
import {NavigationCancel, NavigationEnd, NavigationStart, Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

    unsubscribes = []; // 订阅钩子函数集合

    constructor(private ngProgress: NgProgress,
                private router: Router) {

        let routerEvent = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.ngProgress.start(); // 开始进度动画
            }
            if (event instanceof NavigationCancel) {
                this.ngProgress.done(); // 结束进度动画
            }
            if (event instanceof NavigationEnd) {
                this.ngProgress.done(); // 结束进度动画
            }
        });
        this.unsubscribes.push(routerEvent);
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(sub => sub.unsubscribe());
    }
}
