/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WorkflowService} from 'app/services/workflow.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import 'rxjs/Rx';

@Component({
    selector: 'workflow-result-component',
    templateUrl: './workflow.result.component.html',
    styleUrls: ['./workflow.result.component.scss']
})
export class WorkflowResultComponent implements OnInit {

    pageNow = 1;                        // 当前页码
    pageSize = 10;                      // 当前页显示数据数
    totalcount = 0;                    // 总的数据条数
    flowName: any;                       // 关键字搜索
    resultList: any;                    // 运行结果工作流集合
    singleTask: any;
    noDataType = false;                 // 无数据

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private workflowService: WorkflowService,
        private modalService: ModalService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            if (params.page && !location.hash) {
                this.pageNow = Number(params.page);
                window.location.hash = String(params.page);
            } else if (window.location.hash && window.location.hash !== '#') {
                this.pageNow = Number(window.location.hash.slice(1,));
            }
        });
    }

    ngOnInit() {
        this.getResultList(this.pageNow);
    }

    /**
     * 获取运行结果列表
     */
    getResultList (page: any) {
        this.pageNow = page;
        window.location.hash = String(page);
        this.workflowService.getResultList({
            page: this.pageNow,
            rows: this.pageSize,
            type: 'node',
            flowName: this.flowName
        }).then( d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                let obj = JSON.parse(d.data);
                obj.rows.forEach(item => {
                    item.expand = false;
                    item.childTask = false;
                    item.firstLevel = true;
                });
                this.resultList = obj.rows || [];
                this.totalcount = obj.total;
                this.noDataType = this.resultList.length ? false : true;
            } else {
                this.modalService.alert(d.data || d.message );
            }
        });
    }

    searchChange($event: MouseEvent) {
        this.getResultList(1);
    }

    /**
     * 页码切换
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getResultList(obj.page);
    }

    /**
     * 父级展开
     * @param task
     * @param {number} index
     */
    expandClick(task: any, index: number, e) {
        // 当前父级选项不是展开的
        if (!task.expand) {
            this.workflowService.getChildResultList({id: task.flowId, page: 1, rows: 5}).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                    let arr = d.data.rows;
                    task['length'] = d.data.rows.length;
                    this.resultList[index].length = arr.length + 1;
                    this.resultList.splice(index + 1, 0 , {
                        startTime: '开始时间',
                        endTime: '结束时间',
                        status: '状态',
                        duration: '运行时长',
                        totalCount: '总任务数',
                        successCount: '任务成功数',
                        failCount: '失败任务数',
                        childTask: true,
                        childTitle: true
                    });
                    arr.map((item, idx) => {
                        item.childTask = true;    // 当前为二级列表
                        item.checked = false;
                        item.runId = task.runId;  // 二级列表获取数据预览时需传入父级的runId
                        item.flowName = task.flowName;
                        item.flowId = task.flowId;
                        if (idx < 5) {
                            this.resultList.splice(index + 2 + idx, 0, item);
                        }
                    });
                }
            });
        } else if (task.expand) {
            let arrStart = this.resultList.slice(0, index);
            let arrEnd = this.resultList.slice(index + 1 + task['length']);
            let arr = arrStart.concat([task], arrEnd);
            this.resultList = arr;
        }
        task.expand = !task.expand;
    }

    /**
     * 跳转到任务流列表页
     */
    tdFirstClick(task: any) {
        console.log(task);
        if (task.firstLevel) {
            this.router.navigate([`/main/workflow/result/detail/list/${task.flowId}/${this.pageNow}`],
                {queryParams: {'name': encodeURI(task.flowName)}});
        } else {
            this.router.navigate([`/main/workflow/result/detail/${task.flowId}/${task.exeId}/${this.pageNow}`]);
        }

    }

    /**
     * 状态转换
     * @param status
     * @returns {string}
     */
    changeRunStatus(status: any) {
        let str = '';
        switch (status) {
            case 0: str = '新增'; break;
            case 1: str = '等待'; break;
            case 2: str = '成功'; break;
            case 3: str = '失败'; break;
            case 4: str = '暂停'; break;
            case 5: str = '运行中'; break;
            case 6: str = '调度异常'; break;
            case 7: str = '参数异常'; break;
            case 8: str = '发送请求异常'; break;
            case 10: str = '取消中'; break;
            case 11: str = '已取消'; break;
        }
        return str;
    }

    /**
     * 取消撤出工作流
     */
    changeWorkflow(type: any, flow: any) {
        if (type === 'cancle') {
            this.modalService.toolConfirm('您确认将该工作流从调度系统中撤出吗？', () => {
                this.workflowService.deleteWorkflow({
                    flowId: flow.flowId,
                    flowName: flow.flowName
                }).then( d => {
                    if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('已从调度系统中撤出');
                        this.getResultList(this.pageNow);
                    } else {
                        this.modalService.alert(d.data || d.rspdesc || d.message );
                    }
                });
            });
        }
    }


}
