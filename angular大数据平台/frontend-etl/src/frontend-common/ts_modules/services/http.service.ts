/**
 * Created by LIHUA on 2017-08-02.
 * 基础请求服务
 */

import {URLSearchParams, Response} from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';

import {environment} from 'environments/environment';

@Injectable()
export class HttpService {

    // 基本服务器地址
    serverUrl = '';

    constructor(private http: HttpClient) {
    }

    /**
     * get请求
     * @param url
     * @param option
     * @returns {Observable<Response>}
     */
    get(url: string): Observable<any> {
        return this.http.get(this.getRealUrl(url));
    }

    /**
     * delete请求
     * @param url
     * @param option
     * @returns {Observable<Response>}
     */
    delete(url: string): Observable<any> {
        return this.http.delete(this.getRealUrl(url));
}

    /**
     * post请求
     * @param url
     * @param body
     * @param option
     * @returns {Observable<Response>}
     */
    post(url: string, body?: any): Observable<any> {
        let newBody = String(this.parseToURLSearchParams(body));
        newBody = (newBody.indexOf('+') === -1) ? newBody : newBody.replace(/\+/g, '%2B');
        return this.http.post(this.getRealUrl(url), newBody, {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        });
    }

    /**
     * post请求
     * @param url
     * @param body
     * @param option
     * @returns {Observable<Response>}
     */
    postByJSON(url: string, body?: any): Observable<any> {
        return this.http.post(this.getRealUrl(url), JSON.stringify(body), {
            headers: new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8')
        });
    }

    /**
     * put请求
     */
    putByJSON(url: string, body?: any): Observable<any> {
        return this.http.put(this.getRealUrl(url), JSON.stringify(body), {
            headers: new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8')
        });
    }

    /**
     * 异步 get请求
     * @param url
     * @param option
     * @returns {Promise<T>}
     */
    async getByPromise(url: string): Promise<any> {
        return await this.http.get(this.getRealUrl(url)).toPromise();
    }

    /**
     * 异步 post请求
     * @param url
     * @param body
     * @param option
     * @returns {Promise<T>}
     */
    async postByPromise(url: string, body?: any): Promise<any> {
        return await this.http.post(this.getRealUrl(url), this.parseToURLSearchParams(body), {
            headers: new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8')
        }).toPromise();
    }

    /**
     * 把对象变成查询参数
     * @param data
     * @returns {URLSearchParams}
     */
    parseToURLSearchParams(data: Object): String {
        const searchParams = new URLSearchParams();

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== '' && data[key] !== null) {
                searchParams.set(key, data[key]);
            }
        });
        return searchParams.toString();
    }

    /**
     * 替换url预定义的值
     * @param {string} url
     * @param data
     * @returns {string}
     */
    getDataUrl(url: string, data: any): string {
        Object.keys(data).forEach(key => {
            if (url.indexOf('{' + key + '}') !== -1) {
                url = url.replace('{' + key + '}', data[key]);
            }
        });

        return url;
    }

    /**
     * 给url加上一个单层查询对象数据 辅助方法
     * @param url
     * @param data
     * @returns {string}
     */
    getSearchDataUrl(url: string, data: any): string {
        if (!data) {
            return url;
        }

        let search = this.parseToURLSearchParams(data);
        return url + (search !== '' ? ('?' + search) : '');
    }

    /**
     * 获取真实请求地址
     * @param url
     * @returns {string}
     */
    getRealUrl(url: string) {
        // 本身是绝对地址就不继续判定了
        if (url.indexOf('http') !== -1) {
            return url;
        } else {
            return this.getServerUrl() + url;
        }
    }

    /**
     * 获取服务器地址 优先查找window上的BASICHTTPSERVER
     * @returns {string|any}
     */
    getServerUrl() {
        // return window['BASICHTTPSERVER'] ? window['BASICHTTPSERVER'] : this.serverUrl; // http 请求都采用代理的方式
        return this.serverUrl;
    }

    /**
     * 获取数据挖掘系统的请求地址
     * @returns {any | string}
     */
    getMiningServerUrl() {
        return window['MININGHTTPSERVER'] || environment.mining;
    }
}
