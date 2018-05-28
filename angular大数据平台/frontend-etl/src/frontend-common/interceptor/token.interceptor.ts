/**
 * Created by lh on 2017/11/7.
 *  token interceptor
 */
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {environment} from 'environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private cookieService: CookieService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (environment.token) {
            let token = this.cookieService.get('token');
            if (token) {
                request = request.clone({ headers: request.headers.set('Token', token) });
            }
        }

        if (environment.cache) {
            request = request.clone({ headers: request.headers.set('Cache-Control', 'no-store') });
        }

        return next.handle(request);
    }
}
