import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {OperationService} from 'app/services/operation.service';

@Component({
    selector: 'task-operation-maintenance-data-check-component',
    templateUrl: 'task.operation.maintenance.data.check.component.html',
    styleUrls: ['./task.operation.maintenance.data.check.component.scss']
})
export class TaskOperationMaintenanceDataCheckComponent implements OnInit, OnChanges {

    @Input()
    checkTask: any;
    @Output() closeBottomPanel = new EventEmitter<any>();

    pageNow = 1;
    pageSize = 1;
    list = [];              // 整个list列表所有条记录

    sourceList = {
        tableName: null,
        data: []
    };

    targetList = {
        tableName: null,
        data: []
    };

    checkName = [];         // 选中的字段的来源字段集合(小写)
    CheckName = [];         // 选中的字段的来源字段集合(大写)

    steps: any;             // 所有步骤信息
    presentStep = [];       // 当前字段的流程集合
    presentTarget = '';     // 当前项选中目标字段
    checkEtl: any;          // 没有字段信息的展示

    constructor (private operationService: OperationService) {

    }


    ngOnInit() {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['checkTask'].currentValue) {
            this.pageNow = 1;
            this.pageSize = 1;
            this.list = [];              // 整个list列表所有条记录
            this.sourceList = {
                tableName: null,
                data: []
            };
            this.targetList = {
                tableName: null,
                data: []
            };
            this.checkName = [];         // 选中的字段的来源字段集合(小写)
            this.CheckName = [];         // 选中的字段的来源字段集合(大写)
            this.steps = null;             // 所有步骤信息
            this.presentStep = [];       // 当前字段的流程集合
            this.presentTarget = '';     // 当前项选中目标字段
            this.checkEtl = null;          // 没有字段信息的展示
            this.operationService.getTaskProcessData({
                flowId: this.checkTask.flowId
            }).then(d => {
                if (d.success && d.message && d.message.data && d.message.data.length) {
                    this.list = d.message.data;
                    this.doPageChange(1);
                    this.steps = d.message.fieldEtl;
                    this.checkEtl = d.message.checkEtl;
                }
            });
        }
    }

    /**
     * 关闭弹框
     */
    hideRightPannel($event: MouseEvent) {
        this.closeBottomPanel.emit(true);
        $event.stopPropagation();
    }

    /**
     * 切换流程图
     */
    openProcess(name: any) {
        if (!name) {
            return;
        }
        this.presentStep = this.steps[name];
        this.presentTarget = name;
        this.checkName = [];
        this.CheckName = [];
        this.presentStep.forEach(item => {
            if (this.checkName.join(',').indexOf(item.sourceField.toLowerCase()) === -1 || this.CheckName.join(',').indexOf(item.sourceField.toUpperCase()) === -1) {
                this.checkName.push(item.sourceField.toLowerCase());
                this.CheckName.push(item.sourceField.toUpperCase());
            }
        });
    }

    /**
     * 组装数据切换页码
     */
    doPageChange(page?: any) {
        if (!page) {
            this.pageNow = 1;
        }
        this.sourceList = {
            tableName: null,
            data: []
        };
        this.targetList = {
            tableName: null,
            data: []
        };
        this.checkName = [];
        this.CheckName = [];
        this.presentStep = [];
        this.presentTarget = '';
        let item = this.list[page - 1];
        if (JSON.stringify(item.sourceRow) !== '{}') {
            this.sourceList.tableName = item.sourceRow.tableName;
            let arr = Object.keys(item.sourceRow.data);
            arr.forEach(now => {
                this.sourceList.data.push({
                    name: now, value: item.sourceRow.data[now]
                });
            });
        }
        if (JSON.stringify(item.targetRow) !== '{}') {
            this.targetList.tableName = item.targetRow.tableName;
            let arr = Object.keys(item.targetRow.data);
            arr.forEach(now => {
                this.targetList.data.push({
                    name: now, value: item.targetRow.data[now]
                });
            });
        }
        if (JSON.stringify(item.targetRow) === '{}' || JSON.stringify(item.sourceRow) === '{}') {
            this.presentStep = this.checkEtl;
        }
    }

    /**
     * 上一条
     */
    previousPage() {
        if (this.pageNow <= 1) {
            return;
        }
        this.pageNow = this.pageNow - 1;
        this.doPageChange(this.pageNow);
    }

    /**
     * 下一条
     */
    nextPage() {
        if (this.pageNow >= this.list.length) {
            return;
        }
        this.pageNow = this.pageNow + 1;
        this.doPageChange(this.pageNow);
    }

    /**
     * 换一批数据
     */
    reload() {
        this.sourceList = {
            tableName: null,
            data: []
        };
        this.targetList = {
            tableName: null,
            data: []
        };
        this.checkName = [];
        this.CheckName = [];
        this.presentStep = [];
        this.presentTarget = '';
        this.pageNow = 1;
        this.operationService.getTaskProcessData({
            flowId: this.checkTask.flowId
        }).then(d => {
            if (d.success && d.message && d.message.data && d.message.data.length) {
                this.list = d.message.data;
                this.doPageChange(1);
                this.steps = d.message.fieldEtl;
            }
        });
    }
}
