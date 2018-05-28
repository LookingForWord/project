/**
 * Created by lh on 2017/12/18.
 * 运维中心 任务运维
 */

import {Component, OnInit, Renderer2, OnDestroy} from '@angular/core';

import { OperationService } from 'app/services/operation.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {Animations} from 'frontend-common/ts_modules/animations/animations';

import {TaskOperationMaintenancePreviewComponent} from 'app/components/modules/task/components/operation/maintenance/preview/task.operation.maintenance.preview.component';

@Component({
    selector: 'task-operation-maintenance-component',
    templateUrl: './task.operation.maintenance.component.html',
    styleUrls: ['./task.operation.maintenance.component.scss'],
    animations: [Animations.slideLeft, Animations.slideBottom, Animations.slideUpDwon]
})
export class TaskOperationMaintenanceComponent implements OnInit, OnDestroy {
    pageNow = 1;              // 当前页码
    pageSize = 10;            // 每页显示数据条数（不包含自己目录）
    totalcount = 0;           // 总的数据数
    noDataType = false;       // 没有列表数据 true为没有数据，false为有数据
    type = 1;                 // 任务类型  'node'为节点任务  'work'工作流任务（暂无）
    tasks = [];               // 当前页table中的数据
    taskType: any;            // 选中的位工作流还是节点流任务（暂不使用）
    tabId = '0';              // 弹出页中当前选中的tab项Id
    pannelId = -1;            // 当前点击的任务的runId
    taskTypes = [{name: '节点任务', value: 'node'}, {name: '工作流任务', value: 'work'}];
    isShowPanel = false;      // 是否显示右侧弹出层

    showBottomPanel = false;    // 显示下方弹框

    hidePanelEventHook: any;  // 事件监听的实例对象
    panelTabs = [
        {name: '属性', id: '0', checked: true},
        {name: '运行日志', id: '1', checked: false}
    ];                        // 弹出层tab选项卡数组
    runLog = [];              // 运行日志
    noLog = false;
    leftState = 2;            // 控制顶部容器的class值(left值)
    childTask: any;           // 是否显示操作日志
    keyWord = '';             // 关键字搜索  接口暂不支持
    checkTask: any;           // 数据检查当前项

    constructor(private render: Renderer2,
                private operationService: OperationService,
                private datatransferService: DatatransferService,
                private modalService: ModalService) {
        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
        this.taskType = this.taskTypes[0];
        this.getMissionList();
    }

    ngOnInit() {
        this.hidePanelEvent();
    }

    ngOnDestroy() {
        if (this.hidePanelEventHook) {
            this.hidePanelEventHook();
            this.hidePanelEventHook = null;
        }
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.getMissionList(1);
    }

    /**
     * 获取周期任务列表
     * @param pageNow
     */
    getMissionList(pageNow?: number) {
        if (pageNow) {
            this.pageNow = pageNow;
        }
        this.operationService.getMissionList({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            type: this.taskType.value,
            flowName: this.keyWord
        }).then(d => {
            if (d.success && d.message && d.message.content) {
                d.message.content.forEach(item => {
                    item.expand = false;
                    item.childTask = false;
                    item.checked = false;
                    item.firstLevel = true;
                });
                this.tasks = d.message.content;
                this.totalcount = d.message.totalElements;
            } else {
                this.noDataType = true;
            }
        });
    }
    /*
     * 页码切换
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getMissionList(obj.page);
    }
    /**
     * 父级展开
     * @param task
     * @param {number} index
     */
    expandClick(task: any, index: number, $event) {
        // 当前父级选项不是展开的
        if (!task.expand) {
            this.operationService.findChildListByPid({pid: task.runId}).then(d => {
                if ( d.success && d.message ) {
                    this.tasks[index].length = d.message.length;
                    d.message.forEach((item, idx) => {
                        item.childTask = true;    // 当前为二级列表
                        item.checked = false;
                        this.tasks.splice(index + 1 + idx, 0, item);
                    });
                }
            });
        } else if (task.expand) {
            let arrStart = this.tasks.slice(0, index);
            let arrEnd = this.tasks.slice(index + 1 + task.length);
            let arr = arrStart.concat([task], arrEnd);
            this.tasks = arr;
        }
        task.expand = !task.expand;
    }
    /**
     * 给document新增点击事件 点击隐藏panel
     */
    hidePanelEvent() {
        this.hidePanelEventHook = this.render.listen(document, 'click', (e: MouseEvent) => {
            if (this.isShowPanel) {
                this.isShowPanel = false;
            }
            if (this.showBottomPanel) {
                this.showBottomPanel = false;
            }
        });
    }

    /**
     * 阻止背景点击
     * @param {MouseEvent} $event
     */
    stopPanelClick($event: MouseEvent) {
        $event.stopPropagation();
    }

    /**
     * 隐藏弹出框
     */
    hideRightPannel(result?: any) {
        this.showBottomPanel = false;
        this.isShowPanel = false;
        this.checkTask = null;
    }

    /**
     * 展开panel 查看详情
     * @param {number} index
     * @param task
     * @param {MouseEvent} $event
     */
    showPanelClick(index: number, task: any, $event: MouseEvent) {
        if (!this.isShowPanel || (this.isShowPanel && this.pannelId !== index)) {
            this.isShowPanel = true;
            this.pannelId = index;
            this.childTask = task.childTask;
            !task['firstLevel'] && this.operationService.getRunLogByPid({runId: task.runId}).then(d => {
                if (d.success && d.message) {
                    let arr = d.message.split('\n') || [];
                    this.runLog = arr;
                    this.noLog = false;
                } else {
                    this.noLog = true;
                    this.modalService.alert(d.message);
                }
            });
        } else if (this.isShowPanel && this.pannelId === index) {
            this.isShowPanel = false;
        }
        this.resetTabs();
        this.showBottomPanel = false;
        $event.stopPropagation();
    }

    /**
     * 重置为初始状态
     */
    resetTabs() {
        this.panelTabs = [
            {name: '属性', id: '0', checked: true},
            {name: '运行日志', id: '1', checked: false}
        ];
        this.tabId = '0';
    }

    /**
     * panel 显示切换
     * @param tabId
     * @param {MouseEvent} $event
     */
    togglePanelTab(tabId: any, $event: MouseEvent) {
        if (this.tabId !== tabId) {
            this.tabId = tabId;
        }
        $event.stopPropagation();
    }

    /**
     * 显示数据预览
     */
    viewDetails(task: any, $event) {
        this.isShowPanel = false;
        let [ins] = this.modalService.open(TaskOperationMaintenancePreviewComponent, {
            title: `任务：${task.taskName}`,
            backdrop: 'static'
        });
        ins.dataSourceTitle = [];
        ins.targetSourceTitle = [];
        ins.dataSourceArr = [];
        ins.dataTargetArr = [];
        this.operationService.getDataPreviewList({runId: task.runId, limit: (100 || task.limit)}).then(d => {
            if (d && d.success && d.message) {
                let sourceObj = d.message.source && d.message.source[0];
                let targetObj = d.message.target && d.message.target[0];
                let dataSourceTitle = ['暂无数据...'];
                let targetSourceTitle = ['暂无数据...'];
                if (sourceObj) {
                    dataSourceTitle = Object.keys(sourceObj);
                }
                if (targetObj) {
                    targetSourceTitle = Object.keys(targetObj);
                }
                ins.dataSourceTitle = dataSourceTitle;
                ins.targetSourceTitle = targetSourceTitle;
                ins.dataSourceArr = d.message.source;
                ins.dataTargetArr = d.message.target;
            } else {
                this.modalService.alert(d.message);
            }
        });
        $event.stopPropagation();
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
     * 获取执行状态   taskStatus
     */
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
     * 任务类型切换
     */
    // taskTypeCheck(types) {
    //     this.taskType = types;
    // }

    /**
     * 显示下方panel
     */
    openBottomPanel(task: any, $event: MouseEvent) {
        this.checkTask = task;
        this.showBottomPanel = true;
        $event.stopPropagation();
    }
}
