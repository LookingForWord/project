import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';

import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare var moment: any;

@Component({
    selector: 'workflow-result-detai-list-component',
    templateUrl: './workflow.result.detail.list.component.html',
    styleUrls: ['./workflow.result.detail.list.component.scss']
})

export class WorkflowResultDetailListComponent implements OnInit {

    page: any;              // 运行结果主界面页码
    flowId: any;            // 工作流id
    exeId: any;             // 运行id
    pageNow = 1;            // 当前页码
    pageSize = 10;          // 当前页显示的条码
    totalcount = 10;        // 总条数
    keyWord: any;           // 关键字搜索
    noDataType = false;     // 有无数据
    detailList = [];        // 数据list集合
    flowName: any;               // 工作流名称

    startTime: any;         // 开始时间
    endTime: any;           // 结束时间
    flowStatus: any;        // 运行状态
    flowStatusArr = [
        {value: '', name: '全部'},
        {value: 1, name: '等待'},
        {value: 2, name: '成功'},
        {value: 3, name: '失败'},
        {value: 4, name: '暂停'},
        {value: 5, name: '运行中'},
        {value: 6, name: '调度异常（非运行异常）'},
        {value: 7, name: '参数异常'},
        {value: 8, name: '发送请求异常'},
        {value: 9, name: '调度异常（worker运行异常）'},
        {value: 10, name: '取消中'},
        {value: 11, name: '已取消'}
    ];

    errorType = -1;

    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss'
    };

    constructor( private router: Router,
                 private activatedRoute: ActivatedRoute,
                 private workflowService: WorkflowService
    ) {
        this.activatedRoute.params.subscribe(params => {
            this.page = params.page;
            this.flowId = params.id;
        });
        this.activatedRoute.queryParams.subscribe(params => {
            this.flowName = decodeURI(params['name']);
        });
        this.flowStatus = this.flowStatusArr[0];
    }

    ngOnInit() {
        this.getDetailList();
    }

    /**
     * 获取列表数据
     * @param page
     */
    getDetailList(page?: any) {
        if (page) {
            this.pageNow = page;
        }
        if (this.startTime && this.endTime) {
            if (new Date(this.startTime.date['_d']).getTime() > new Date(this.endTime.date['_d']).getTime()) {
                this.errorType = 1;
                return;
            }
        }
        this.errorType = -1;
        this.workflowService.getChildResultList({
            id: this.flowId,
            page: this.pageNow,
            rows: this.pageSize,
            startTime: this.startTime ? this.startTime.value : '',
            endTime: this.endTime ? this.endTime.value : '',
            status: this.flowStatus.value || null
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.detailList = d.data.rows || [];
                this.totalcount = d.data.total;
                this.noDataType = this.detailList.length ? false : true;
            }
        });
    }

    /**
     * 切换页码
     * @param page
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getDetailList(obj.page);
    }

    /**
     * 运行状态转换
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
            case 6: str = '调度异常(非运行异常)'; break;
            case 7: str = '参数异常'; break;
            case 8: str = '发送请求异常'; break;
            case 9: str = 'worker运行异常'; break;
            case 10: str = '取消中'; break;
            case 11: str = '已取消'; break;
        }
        return str;
    }

    /**
     * 返回运行结果管理主界面   page: 运行结果主界面当前页码
     */
    goBack() {
        this.router.navigateByUrl(`/main/workflow/result?page=${this.page}`);
    }

    /**
     * 运行结果详情
     * @param task   flowId 工作流id  exeId  运行id
     */
    bannerClick(task: any) {
        this.exeId = task.exeId;
        this.router.navigate([`/main/workflow/result/detail/${this.flowId}/${this.exeId}/${this.pageNow}`]);
    }

    /**
     * 状态选中
     */
    flowStatusChange(checked: any) {
        if (checked.value === this.flowStatus.value) {
            return;
        }
        this.flowStatus = checked;
    }

    /**
     * 触发器状态
     */
    getTriggerType(type: any) {
        let str = '';
        if (!type) {
            return str;
        }

        switch (type) {
            case 1: str = '工作流管理立即运行触发'; break;
            case 2: str = '运行结果中立即运行触发'; break;
            case 3: str = '触发器自动运行'; break;
        }
        return str;
    }
}
