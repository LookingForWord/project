/**
 * Created by lh on 2017/12/18.
 *  运维中心 任务列表
 */

import {Component, OnInit, Renderer2, OnDestroy} from '@angular/core';
import {CookieService} from 'ngx-cookie';

import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {Cookie} from 'app/constants/cookie';
import {LoginService} from 'app/services/login.service';
import {OperationService} from 'app/services/operation.service';


@Component({
    selector: 'task-operation-instance-component',
    templateUrl: './task.operation.instance.component.html',
    styleUrls: ['./task.operation.instance.component.scss'],
    animations: [Animations.slideLeft, Animations.slideBottom, Animations.slideUpDwon]
})
export class TaskOperationInstanceComponent implements OnInit, OnDestroy {
    pageNow = 1;                    // 当前页
    pageSize = 10;                  // 每页显示条数
    totalcount = 0;                 // 总数据数
    noDataType = false;             // 列表有无数据
    tabType = 'node';
    instanceList = [];
    keyWord = '';             // 关键字搜索

    workPage = 1;
    workSize = 10;
    workList = [];
    workTotal = 0;
    workflowKeyWord = '';
    noWorkData = false;

    isShowPanel = false;
    checkTask: any;
    hidePanelEventHook: any;

    constructor(private operationService: OperationService,
                private cookieService: CookieService,
                private modalservice: ModalService,
                private loginService: LoginService,
                private render: Renderer2) {
    }

    ngOnInit() {
        this.getInstanceList();
        this.hidePanelEvent();
        this.getworkflowList();
    }

    ngOnDestroy() {
        this.hidePanelEventHook = null;
    }

    /**
     * 周期任务搜索
     * @param {MouseEvent} event
     */
    searchInstanceChange(event: MouseEvent) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        this.getInstanceList(1);
    }

    /**
     * 流式任务搜索
     * @param {MouseEvent} event
     */
    searchFlowChange(event: MouseEvent) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        this.getworkflowList(1);
    }

    /**
     * 获取周期任务列表
     * @param pageNow
     */
    getInstanceList(pageNow?: number) {
        if (pageNow) {
            this.pageNow = pageNow;
        }
        this.operationService.getInstanceList({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            type: 'node',
            flowName: this.keyWord
        }).then(d => {
            if (d.success && d.message) {
                this.instanceList = d.message.content || [];
                this.totalcount = d.message.totalElements;
                this.noDataType = this.instanceList.length ? false : true;
            } else {
                this.modalservice.alert(d.message);
            }
        });
    }

    /*
     * 页码切换
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getInstanceList(obj.page);
    }

    /**
     * 任务类型  @param taskType
     */
    getTaskType (taskType: any) {
        let type = '';
        switch (taskType) {
            case 'node': type = '节点任务'; break;
            case 'work': type = '工作流任务'; break;
            case 'extract': type = '数据采集'; break;
            case 'clean': type = '数据清洗'; break;
            case 'load': type = '数据装载'; break;
            case 'etl': type = '数据同步'; break;
            case 'mining': type = ' 机器学习'; break;
            case 'bi': type = 'BI'; break;
        }
        return type;
    }

    /**
     * 任务类型选中切换
     */
    tabClick(value: any) {
        if (this.tabType === value) {
            return;
        }
        this.tabType = value;
    }

    /**
     * 打开关闭
     */
    openOrClose(item: any, type: any) {
        let title = item.flowStatus === 'open' ? '您确定关闭该任务吗？' : '您确定开启该任务吗？';
        this.modalservice.toolConfirm(title, () => {
            const userId = this.cookieService.get(Cookie.USERID);
            const status = item.flowStatus === 'open' ? 'close' : 'open';
            const param = {
                userId: userId,
                status: status,
                id: item.id
            };
            this.operationService.changeInstance(param).then(d => {
                if (d.success) {
                    let str = item.flowStatus === 'open' ? '关闭成功' : '开启成功';
                    this.modalservice.alert(str);
                    type === 'node' ? this.getInstanceList() : this.getworkflowList();
                } else {
                    this.modalservice.alert(d.message);
                }
            });
        });
    }


    /**
     * 流式任务侧边栏打开
     */
    showPanelClick(task: any, $event: MouseEvent) {
        this.checkTask = task;
        this.isShowPanel = true;
        $event.stopPropagation();
    }

    /**
     * 给document新增点击事件 点击隐藏panel
     */
    hidePanelEvent(result?: any) {
        if (!result) {
            this.hidePanelEventHook = this.render.listen(document, 'click', (e: MouseEvent) => {
                if (this.isShowPanel) {
                    this.isShowPanel = false;
                }
            });
        } else {
            this.hidePanelEventHook = null;
            this.isShowPanel = false;
        }
    }

    /**
     *  点击侧边栏默认不隐藏
     */
    stopPanelClick($event: MouseEvent) {
        $event.stopPropagation();
    }

    /**
     * 获取流式任务(只针对数据源为kafka的任务)
     */
    getworkflowList(page?: any) {
        if (page) {
            this.workPage = page;
        }
        this.operationService.getWorkflowList({
            pageNum: this.workPage,
            pageSize: this.workSize,
            flowName: this.workflowKeyWord || '',
        }).then(d => {
           if (d.success && d.message) {
                this.workList = d.message.items || [];
                this.workTotal = d.message.totalCount;
                this.noWorkData = this.workList.length ? false : true;
           }
        });
    }

    /**
     * 流式任务切换页码
     * @param page
     */
    workPageChange(page: any) {
        this.workPage = page;
        this.getworkflowList();
    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
