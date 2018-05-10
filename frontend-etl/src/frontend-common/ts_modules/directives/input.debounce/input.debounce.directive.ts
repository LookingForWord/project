import {Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

@Directive({
    selector: '[inputDebounce]'
})
export class InputDebounceDirective implements OnInit, OnDestroy {

    @Output()
    debounceClick = new EventEmitter();

    @Input()
    debounceTime = 500;

    private click = new Subject();

    private subscription: any;

    @HostListener('keyup', ['$event'])
    keyupEvent(event: MouseEvent) {
        this.click.next(event);
    }

    ngOnInit() {
        this.subscription = this.click.debounceTime(this.debounceTime).subscribe(e => this.debounceClick.emit(e));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
