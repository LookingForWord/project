import {Component, OnInit, OnDestroy} from '@angular/core';
import {WebSocketService} from 'app/services/websocket.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {WorkflowService} from 'app/services/workflow.service';
import {Cookie} from 'app/constants/cookie';
import {CookieService} from 'ngx-cookie';
@Component({
    selector: 'workflow-result-detail-log-component',
    templateUrl: './workflow.result.detail.log.html',
    styleUrls: ['./workflow.result.detail.log.scss']
})
export class WorkflowResultDetailLogComponent implements OnInit, OnDestroy {

    logs: any;                  // 日志集合
    exeId: any;                 // 运行id
    flowId: any;                // 工作流id
    jobId: any;                 // 任务id
    noLog = false;
    token: any;
    status: any;                // 任务执行情况


    constructor(private webSocketService: WebSocketService,
                private modalService: ModalService,
                private cookieService: CookieService,
                private httpService:HttpService,
                private workflowService:WorkflowService) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }

    ngOnInit() {
        this.webSocketService.createObservableSocket().subscribe( (data) => {
            let d = JSON.parse(data).data;
            if (d.status === 'SUCCESS') {
                if (d.log && d.log.data && d.log.data.info) {
                    this.logs = d.log.data.info;
                    this.noLog = false;
                } else if (d.log && d.log.data && !d.log.data.info) {
                    this.noLog = true;
                }
            } else {
                this.modalService.alert(d.error || '网络异常,请稍后再试');
            }
        }, (err) => {
                console.log(err);
        });

        setTimeout(() => {
            this.sendMessageToServer();
        }, 500);
    }

    ngOnDestroy() {
        this.close();
    }

    /**
     * 发送数据
     */
    sendMessageToServer() {
        const params = {
            op: 'TASK_LOG',
            data: {
                exeId: this.exeId,
                flowId: this.flowId,
                taskId: this.jobId,
                token: this.token
            }
        };
        this.webSocketService.sendMessage(JSON.stringify(params));
    }

    /**
     * 关闭websocket
     */
    close() {
        this.webSocketService.close();
    }

    /**
     * 下载日志
     */
    downLoad() {
        let url = this.httpService.getRealUrl(this.workflowService.downLoadLogUrl) + `?token=${this.token}&exeId=${this.exeId}&flowId=${this.flowId}&jobId=${this.jobId}`;
        return url;
    }
}
