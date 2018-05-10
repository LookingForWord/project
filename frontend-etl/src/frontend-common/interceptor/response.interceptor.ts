/**
 * Created by lh on 2017/11/6.
 *  响应拦截器
 */
import {
    HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";
import {ModalService} from "../ts_modules/services/modal.service/modal.service";

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
    constructor (private router: Router,
                 private modalService: ModalService) {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                if (event.body.code === 113 ||
                    event.body.code === 121 ||
                    event.body.code === 116 ||
                    event.body.code === 119 ||
                    event.body.code === 120 ||
                    event.body.code === 100) {
                    let alertModal = document.querySelector('modal-alert-component');
                    !alertModal && this.modalService.alert(event.body.message);
                    // 如果页面中存在modal   要销毁modal  防止modal一直存在页面上（alert会自动销毁）
                    let basic = document.querySelector('.app-modal-container');
                    let confirm = document.querySelector('app-modal-confirm-container');
                    basic && basic.remove();
                    confirm && confirm.remove();
                    setTimeout(() => {
                        this.router.navigateByUrl('/login');
                    }, 2000);
                } else if (event.body.code === 115) {
                    this.modalService.alert(event.body.message);
                }
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                this.modalService.alert(err.error ? (err.error.message || err.error) : err.message);
            }
        });
    }
}
