/**
 * Created by LIHUA on 2017-08-14.
 */

import {ApplicationRef, ComponentFactoryResolver, Injectable, Injector} from '@angular/core';
import {MediaComponent} from 'frontend-common/ts_modules/services/media.service/components/media/media.component';

@Injectable()
export class MediaService {

    constructor(private applicationRef: ApplicationRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector) {}

    /**
     * 打开一个媒体资源
     * @param src 资源地址
     * @param type 资源类型 image video audio
     * @returns {MediaComponent}
     */
    open(src: string, type: string = 'image') {
        let factory = this.componentFactoryResolver.resolveComponentFactory(MediaComponent);
        let newNode = document.createElement(factory.selector);
        document.body.appendChild(newNode);

        let ref = factory.create(this.injector, [], newNode);
        let ins = ref.instance;
        ins.src = src;
        ins.type = type;
        ins.closeClick = () => {
            ref.destroy();
        };

        this.applicationRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();

        return ins;
    }

}
