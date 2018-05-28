/**
 * Created by lh on 2017/12/18.
 * 运维中心 汇聚日志
 */

import {Component, OnInit} from '@angular/core';

import {OperationService} from 'app/services/operation.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {TaskOperationConvergencePreviewComponent} from 'app/components/modules/task/components/operation/convergence/preview/task.operation.convergence.preview.component';

@Component({
    selector: 'task-operation-convergence-component',
    templateUrl: 'task.operation.convergence.component.html',
    styleUrls: ['task.operation.convergence.component.scss']
})
export class TaskOperationConvergenceComponent implements OnInit {
    keyWord: any;           // 搜索关键字
    pageNow = 1;            // 当前页
    pageSize = 10;          // 每页显示的数据数
    totalcount = 0;         // 总数据数
    noDataType = false;     // 判断有误数据
    converngenceLogs = [];  // 汇聚日志集合

    constructor (private operationService: OperationService,
                 private modalService: ModalService) {}

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
        this.operationService.getConvergenceLog({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            configName: this.keyWord
        }).then(d => {
            if (d.success && d.message) {
                this.converngenceLogs = d.message.content || [];
                this.totalcount = d.message.totalElements;
                this.noDataType = this.converngenceLogs.length ? false : true;
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

    /**
     * 查看映射还原
     */
    preview(item) {
        if ((!item.dataAttr) || (item.dataType !== 'split' && item.dataType !== 'merge')) {
            this.modalService.alert('当前项未正确汇聚');
            return;
        }
        let [ins, pIns] = this.modalService.open(TaskOperationConvergencePreviewComponent, {
            title: '汇聚详情',
            backdrop: 'static'
        });

        ins.dataAttr = JSON.parse(item.dataAttr);
        ins.dataType = item.dataType;
    }
}
