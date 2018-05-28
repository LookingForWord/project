import {Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

@Injectable()
export class WebSocketService {
    ws: WebSocket;
    url = 'ws://192.168.0.122:9999/dispatch-platform/ws';
    constructor(private httpService: HttpService) {

    }
    /** *
     * 这个方法返回一个流，流中包括服务器推送的消息
     * @returns {Observable<any>}
     */

    createObservableSocket(): Observable<any> {
        // 创建一个websocket对象，这个对象会根据传进去的url去连接指定的websocket服务器
        let url = this.getRealSocketServer();
        this.ws = new WebSocket(url);

        return new Observable( observer => {
            this.ws.onmessage = (event) => observer.next(event.data);
            this.ws.onerror = (event) => observer.error(event);
            this.ws.onclose = (event) => observer.complete();
        });
    }
    // 向服务器发送一个消息
    sendMessage(message: string) {
        if (this.ws && this.ws.readyState === 1) {
            this.ws.send(message);
        }
    }
    // 关闭连接
    close() {
        console.log('已断开连接');
        this.ws.close();
    }//
    /**
     * 获取websocket的请求地址
     * @returns {string}
     */
    getRealSocketServer() {
        // return window['WEBSOCKETSERVER'] ? window['WEBSOCKETSERVER'] : this.url;
        let url = window.location.host;
        return 'ws://' + url + '/dispatch-platform/ws';
    }
}
