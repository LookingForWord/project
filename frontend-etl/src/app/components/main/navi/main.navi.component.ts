/**
 * Created by LIHUA on 2017/7/31/031.
 * tab 导航页
 * 使用的时候需要手动导入到异步加载的module
 */

import {Component, ComponentFactoryResolver, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {NavigationServices} from 'app/services/navigation.services';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
    selector: 'main-navi-component',
    templateUrl: './main.navi.component.html',
    styleUrls: ['./main.navi.component.scss']
})
export class MainNaviComponent implements OnDestroy {

    navigate: any;

    components: any;

    index: number = 0;

    contentRef: any;

    @ViewChild('content', {read: ViewContainerRef}) content: ViewContainerRef;

    constructor(private datatransferService: DatatransferService,
                private navigationServices: NavigationServices,
                private router: Router,
                private route: ActivatedRoute,
                private componentFactoryResolver: ComponentFactoryResolver) {

        // this.route.queryParams.subscribe(query => {
        //     if (query && query['index']) {
        //         this.index = query['index'];
        //     }
        // });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.navigate = this.navigationServices.getNavigate(event.urlAfterRedirects);
                this.navigate.forEach(navi => {
                    if (navi.children) {
                        navi.children.forEach(child => {
                            if (child.components) {
                                this.components = child.components;
                                this.initComponent((this.components[this.index].component));
                            }
                        });
                    }
                });

                // if (this.components && !this.index) {
                //     this.router.navigate([], {
                //         queryParams: {
                //             index: '0'
                //         }
                //     });
                // }
            }
        });

    }

    ngOnDestroy() {
        this.contentRef && this.contentRef.destroy();
    }

    initComponent(component: any) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(component);
        this.contentRef = this.content.createComponent(factory);
    }

    toggleComponent(component: any, index: number) {
        if (this.index !== index) {
            this.index = index;

            this.contentRef.destroy();
            this.initComponent(component);
        }
    }

}
