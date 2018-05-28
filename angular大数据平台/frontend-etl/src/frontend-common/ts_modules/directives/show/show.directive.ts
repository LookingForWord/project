/**
 * Created by LIHUA on 2017-08-16.
 *  show 切换显示
 *  用法: <div [show]='show'>Show</div>
 */

import {AfterViewChecked, Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
    selector: '[show]'
})
export class ShowDirective implements AfterViewChecked {

    @Input('show') show: boolean;

    constructor(private element: ElementRef) {}

    ngAfterViewChecked() {
        this.element.nativeElement.style.display = this.show ? 'block' : 'none';
    }

}
