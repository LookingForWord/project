/**
 * Created by LIHUA on 2017-08-12.
 */

import {
    Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, ViewChild,
    ViewContainerRef
} from "@angular/core";

@Component({
    selector: 'main-sidebar-child-component',
    templateUrl: './main.sidebar.child.component.html',
    styleUrls: ['./main.sidebar.child.component.scss']
})
export class MainSidebarChildComponent implements OnInit, OnDestroy {

    @Input()
    component: any;

    // 动态子组件引用
    dynamicHostRef: any;
    // 动态子组件元素引用
    @ViewChild('dynamicHost', {read: ViewContainerRef}) dynamicHost: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {

    }

    ngOnInit() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.component);
        this.dynamicHostRef = this.dynamicHost.createComponent(factory);
    }

    ngOnDestroy() {
        this.dynamicHostRef && this.dynamicHostRef.destroy();
    }

}
