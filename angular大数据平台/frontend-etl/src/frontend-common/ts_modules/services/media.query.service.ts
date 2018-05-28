/**
 * Created by lh on 2017/11/27.
 * 媒体查询服务
 */
import {Injectable, NgZone} from '@angular/core';
import {Subject} from 'rxjs/Subject';

/**
 * 类型枚举
 */
export enum MediaQueryEnum {
    PHONE = 'phone',

    PAD = 'pad',

    DESKTOP = 'desktop'
}

@Injectable()
export class MediaQueryService {

    // 这里的宽度是按照业务取的值 不是bootstrap里定义的比较标准的设备值
    private phone = 768;
    private pad = 1384;
    private desktop = 1385;

    private phoneMediaMatcher = matchMedia(`(max-width: ${this.phone}px)`);
    private padMediaMatcher = matchMedia(`(max-width: ${this.pad}px)`);
    private desktopMediaMatcher = matchMedia(`(min-width: ${this.desktop}px)`);

    // 宽度订阅 包含两个参数 {type: MediaQueryEnum, matches: Boolean}
    public mediaQuerySubject: Subject<any> = new Subject<any>();

    constructor(private zone: NgZone) {
        // this.initMediaMatcher();
    }

    /**
     * 初始化媒体查询对象
     */
    initMediaMatcher() {
        // phone
        if (this.phoneMediaMatcher.matches) {
            setTimeout(() => {
                this.mediaQuerySubject.next({
                    type: MediaQueryEnum.PHONE,
                    matches: this.phoneMediaMatcher.matches
                });
            });
        }
        this.phoneMediaMatcher.addListener(mql => {
            if (this.phoneMediaMatcher.matches) {
                this.mediaQuerySubject.next({
                    type: MediaQueryEnum.PHONE,
                    matches: this.phoneMediaMatcher.matches
                });
            }
            this.zone.run(() => this.phoneMediaMatcher = mql);
        });

        // pad
        if (this.padMediaMatcher.matches) {
            setTimeout(() => {
                this.mediaQuerySubject.next({
                    type: MediaQueryEnum.PHONE,
                    matches: this.phoneMediaMatcher.matches
                });
            });
        }
        this.padMediaMatcher.addListener(mql => {
            this.mediaQuerySubject.next({
                type: MediaQueryEnum.PAD,
                matches: this.padMediaMatcher.matches
            });
            this.zone.run(() => this.padMediaMatcher = mql);
        });

        // desktop
        if (this.desktopMediaMatcher.matches) {
            setTimeout(() => {
                this.mediaQuerySubject.next({
                    type: MediaQueryEnum.DESKTOP,
                    matches: this.desktopMediaMatcher.matches
                });
            });
        }
        this.desktopMediaMatcher.addListener(mql => {
            this.mediaQuerySubject.next({
                type: MediaQueryEnum.DESKTOP,
                matches: this.desktopMediaMatcher.matches
            });
            this.zone.run(() => this.desktopMediaMatcher = mql);
        });
    }
}
