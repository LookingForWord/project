/**
 * Created by LIHUA on 2017-08-12.
 * 动画函数
 */

import {AnimationEntryMetadata, Injectable} from "@angular/core";
import {animate, group, query, state, style, transition, trigger} from "@angular/animations";

@Injectable()
export class Animations {

    /**
     * 高度收缩
     * @type {AnimationTriggerMetadata}
     */
    static slideUpDwon = trigger('slideUpDwon', [
        transition('void => *', [
            style({height: 0}),
            animate(240)
        ]),
        transition('* => void', [
            style({height: '*'}),
            animate(240, style({height: 0}))
        ])
    ]);

    /**
     * 淡入淡出
     * @type {AnimationTriggerMetadata}
     */
    static fadeInOut = trigger('fadeInOut', [
        transition(':enter', [
            style({opacity: '0'}),
            animate(100)
        ]),
        transition(':leave', [
            animate(100, style({opacity: '0'}))
        ])
    ]);

    /**
     * 也是淡入淡出 可以自定义参数
     * @param options
     */
    static fadeInOutFun(options: any) {
        return trigger('fadeInOut', [
            transition('void => *', [
                style({opacity: options.opacity}),
                animate(options.time)
            ]),
            transition('* => void', [
                animate(options.time, style({opacity: '0'}))
            ])
        ]);
    }

    /**
     * 路由变化
     * @type {AnimationTriggerMetadata}
     */
    static routeAnimation: AnimationEntryMetadata = trigger('routerAnimation', [
        transition('* => *', [
            query(':enter', style({ position: 'fixed', right: '0', left: '180px', opacity: 0 }), { optional: true }),
            group([
                // query(':leave', [
                //     style({ opacity: 1 }),
                //     animate('0.1s ease-out', style({ opacity: 0 }))
                // ], { optional: true }),
                query(':enter', [
                    style({ opacity: 0.5 }),
                    animate('250ms ease', style({ opacity: 1 }))
                ], { optional: true }),
            ])
        ])
    ]);

    /**
     * 向左滑动弹出
     * @type {AnimationTriggerMetadata}
     */
    static slideLeft = trigger('slideLeft', [
        transition(':enter', [
            style({transform: 'translateX(100%)'}),
            animate('200ms ease', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0)'}),
            animate('200ms ease', style({transform: 'translateX(100%)'}))
        ])
    ]);

    /**
     * 向上滑动弹出
     * @type {AnimationTriggerMetadata}
     */
    static slideBottom = trigger('slideBottom', [
        transition(':enter', [
            style({transform: 'translateY(100%)'}),
            animate('200ms ease', style({transform: 'translateY(0)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateY(0)'}),
            animate('200ms ease', style({transform: 'translateY(100%)'}))
        ])
    ]);

}
