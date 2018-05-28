/**
 * Created by lh on 2017/12/18.
 * 运维中心 操作日志
 */

import {Component, OnInit} from '@angular/core';
import {OperationService} from 'app/services/operation.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'task-operation-action-component',
    templateUrl: 'task.operation.action.component.html',
    styleUrls: ['task.operation.action.component.scss']
})
export class TaskOperationActionComponent implements OnInit {
    keyword: any;           // 搜索关键字
    pageNow = 1;            // 当前页
    pageSize = 10;          // 每页显示的数据数
    totalcount = 0;         // 总数据数
    noDataType = false;     // 判断有误数据
    actionLogs = [];  // 汇聚日志集合

    constructor (private operationService: OperationService,
                 private modalService: ModalService) {

    }

    ngOnInit () {
        this.getLogs(1);
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.getLogs(1);
    }

    /**
     *获取汇聚日志列表
     * @param pageNow
     */
    getLogs(pageNow: number) {
        this.pageNow = pageNow;
        this.operationService.getActionLogList({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            keyword: this.keyword
        }).then(d => {
            if (d.success && d.message) {
                this.actionLogs = d.message.content || [];
                this.totalcount = d.message.totalElements;
                this.noDataType = this.actionLogs.length ? false : true;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /*
     * 页码切换
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getLogs(obj.page);
    }

    /**
     * 获取执行状态   taskStatus
     */
    convergenceTransform (obj: any, type: string) {
        let arr = obj ? JSON.parse(obj) : [];
        if (type === 'source') {
            let sourceTables = [];
            arr.forEach(item => {
                item.sourceTableName.forEach(table => {
                    sourceTables.push(table);
                });
            });
            return sourceTables.join();
        } else if (type === 'target') {
            let targetTables = [];
            arr.forEach(item => {

                if (item.targetTableName instanceof Array) {
                    item.targetTableName.forEach(table => {
                        targetTables.push(table);
                    });
                } else {
                    targetTables.push(item.targetTableName);
                }
            });
            return targetTables.join();
        }
    }

    getTaskStatus (status: any) {
        let statusText = '';
        switch (status) {
            case 'success': statusText = '成功'; break;
            case 'running': statusText = '执行中'; break;
            case 'wait': statusText = '等待中'; break;
            case 'fail': statusText = '失败'; break;
        }
        return statusText;
    }
}
