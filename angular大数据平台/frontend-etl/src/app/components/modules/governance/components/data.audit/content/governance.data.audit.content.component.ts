/**
 * Created by lh on 2017/11/9.
 */
import {ConnectOptions, EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';
declare let jsPlumb: any;
import {Component, OnInit, AfterContentInit, OnDestroy, ViewChild, ElementRef, Renderer2} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
declare var moment: any;

@Component({
    selector: 'governance-data-audit-content-component',
    templateUrl: './governance.data.audit.content.component.html',
    styleUrls: ['./governance.data.audit.content.component.scss'],
    animations: [Animations.slideBottom]
})
export class GovernanceDataAuditContentComponent implements OnInit, AfterContentInit, OnDestroy {
    showContent: any;
    checkedTask: any;
    showRunLog: any;        // 是否显示日志
    logs = [];              // 日志列表
    noLog: any;             // 无日志
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;

    runTypes = [
        {name: '单次执行', value: '0'},
        {name: '周期执行', value: '1'}
    ];
    runType: any;
    checkedSourceType: any;         // 数据源类型选中项
    sourceTypeList: any;            // 数据源类型集合
    dataSourceList: any;            // 数据源集合
    checkedSource: any;             // 数据源选择
    checkedTable: any;              // 表选择
    tableList: any;                 // 表集合

    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss'
    };
    runTime: any;

    ins: any;                  // 连线对象
    updating: any;
    @ViewChild('jsplumbContainer')
    jsplumbContainer: ElementRef;    // 操作容器
    deleteButton = {                 // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };
    mappingFieldData = [];           // 字段映射数据
    sourceFieldList: any;           // 源字段集合
    tagetRulls = [];

    // 调度日期
    dispatchs = [
        { name: '天', value: 'day', checked: false },
        {name: '周', value: 'week', checked: false },
        {name: '月', value: 'month', checked: false },
        { name: '小时', value: 'hour', checked: false }
    ];
    checkedDispatch: any;               // 选中的调度日期

    weeks = [
        {name: '星期日', value: 'SUN'},
        {name: '星期一', value: 'MON'},
        {name: '星期二', value: 'TUE'},
        {name: '星期三', value: 'WED'},
        {name: '星期四', value: 'THU'},
        {name: '星期五', value: 'FRI'},
        {name: '星期六', value: 'SAT'}
    ];                                  // 星期数
    checkedWeek = [];                   // 选中的星期数
    months = [];                        // 月份
    checkedMonth = [];                  // 选中的月份
    hours = [];                         // 具体时间 小时
    checkedHour: any;                   // 选中的小时
    minutes = [];                       // 具体时间 分钟
    checkedMinute: any;                 // 选中的分钟


    startHours = [];             // 开始时间 小时
    checkedStartHour: any;       // 开始时间 选中小时
    startMinutes = [];           // 开始时间 分钟
    checkedStartMinute: any;     // 开始时间 选中小时
    intervalHours = [];          // 间隔 小时
    checkedIntervalHour: any;    // 间隔 选中小时
    intervalMinutes = [];        // 间隔 分钟
    checkedIntervalMinute: any;  // 间隔 选中分钟
    endHours = [];               // 结束时间 小时
    checkedEndHour: any;         // 结束时间 选中小时
    endMinutes = [];             // 结束时间 分钟
    checkedEndMinute: any;       // 结束时间 选中分钟

    errorType: any;
    error: any;
    unsubscribes = [];
    resizeHook: any;

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private governanceService: GovernanceService,
                private toolService: ToolService,
                private render: Renderer2) {
        this.initTime();

        let doubleClickSubject = this.datatransferService.dataAuditTreeDbCheckedSubject.subscribe( data => {
            if (data.method === 'dbClick') {
                this.showContent = true;
                this.showRunLog = false;
                this.checkedTask = data.flow;
                this.reset(data.flow);
                this.initTask(data.flow);
            }
        });
        this.unsubscribes.push(doubleClickSubject);
        // 树形工作流编辑订阅
        let workflowTreeUpdateSubjext = this.datatransferService.dataAuditUpdateTreeSubject.subscribe(data => {
           if (data.action === 'edit' && data.flow && data.flow.newName) {

           }
        });
        this.unsubscribes.push(workflowTreeUpdateSubjext);
        // 树形删除操作  若画布存在对应的flowId则也删除
        let updateCanvasTabSubject = this.datatransferService.dataAuditUpdateCanvasTabsSubject.subscribe(data => {
            if (data.flow) {

            }
        });
        this.unsubscribes.push(updateCanvasTabSubject);
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(u => u.unsubscribe());
    }
    ngAfterContentInit() {
        setTimeout(() => {
            this.initIns();
            this.initPonit();
        });
    }
    ngOnInit() {
        this.mappingFieldData = [];
        this.tagetRulls = [];
        this.getRuleList();
        this.resizeHook = this.render.listen('window', 'resize', () => {
            this.ins.repaintEverything();
        });
    }
    reset(data: any) {
        this.mappingFieldData = [];
        this.sourceTypeList = [];
        this.checkedSourceType = null;
        this.checkedSource = null;
        this.dataSourceList = [];
        this.tableList = [];
        this.sourceFieldList = [];
        this.checkedTable = null;
        this.runType = null;
        this.runTime = null;
        this.checkedWeek = [];                      // 选中的星期数
        this.checkedMonth = [];                     // 选中的月份
        this.checkedHour = null;                   // 选中的小时
        this.checkedMinute = null;
        this.checkedStartHour = null;       // 开始时间 选中小时
        this.intervalHours = [];          // 间隔 小时
        this.checkedIntervalHour = null;    // 间隔 选中小时
        this.checkedEndHour = null;         // 结束时间 选中小时
        if (!data.taskPosition) {
            setTimeout(() => {
                this.removeMappingConnections();
                this.removeEndPoints();
            }, 300);
        }
    }
    /**
     * 初始化weeks, hours, minutes
     */
    initTime() {
        let i, temp;
        for (i = 0; i < 31; i++) {
            this.months.push({
                name: '每月' + (i + 1) + '号',
                value: i + 1
            });
        }
        for (i = 0; i < 24; i++) {
            temp = {
                name: i > 9 ? i + '' : '0' + i,
                value: i
            };
            this.hours.push(JSON.parse(JSON.stringify(temp)));
            this.startHours.push(JSON.parse(JSON.stringify(temp)));
            this.endHours.push(JSON.parse(JSON.stringify(temp)));
        }
        for (i = 0; i < 60; i++) {
            temp = {
                name: i > 9 ? i + '' : '0' + i,
                value: i
            };
            this.minutes.push(JSON.parse(JSON.stringify(temp)));
            this.startMinutes.push(JSON.parse(JSON.stringify(temp)));
            this.endMinutes.push(JSON.parse(JSON.stringify(temp)));
        }

        for (i = 1; i < 12; i++) {
            temp = i * 5;
            this.intervalMinutes.push({
                name: temp + '分钟',
                value: temp
            });
        }
        for (i = 1; i < 24; i++) {
            this.intervalHours.push({
                name: i + '小时',
                value: i
            });
        }

        this.checkedDispatch = this.dispatchs[0];
        this.checkedStartMinute = this.startMinutes[0];
        this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];

    }
    /**
     * 初始化任务
     * @param data
     */
    initTask(data: any) {
        // 执行类型
        this.runTypes.forEach(item => {
            if (item.value === data.projectCycle) {
                this.runType = item;
            }
        });
        let configInfo = data.configInfo ? JSON.parse(data.configInfo) : '';
        if (configInfo) {
            if (configInfo.dsType) {
                this.getDataTypes(configInfo.dsType, configInfo.dsId, configInfo.tableId);
            }
        } else {
            this.getDataTypes();
        }
        let taskPosition = data.taskPosition ? JSON.parse(data.taskPosition) : '';
        if (taskPosition) {
            this.mappingFieldData = taskPosition.mappingFieldData || [];
            let cronTimeCn = JSON.parse(data.cronTimeCn);
            if (cronTimeCn.givenTime) {
                this.runTime = {
                    date: moment(cronTimeCn.givenTime).format('YYYY-MM-DD HH:mm:ss'),
                    value: moment(cronTimeCn.givenTime).format('YYYY-MM-DD HH:mm:ss')
                }
                return;
            }
            this.dispatchs.forEach(item => {
               if (taskPosition.checkedDispatch && item.value === taskPosition.checkedDispatch.value && !cronTimeCn.givenTime) {
                    this.checkedDispatch = item;
               }
            });
            if (this.checkedDispatch) {
                switch (this.checkedDispatch.value) {
                    case 'week':
                        let weeks = cronTimeCn.weeks.join(',');
                        this.weeks.forEach(item => {
                            if (weeks.indexOf(item.value) !== -1) {
                                this.checkedWeek.push(item);
                            }
                        });
                        this.checkedHour = this.hours[Number(cronTimeCn.hour)];
                        this.checkedMinute = this.minutes[Number(cronTimeCn.minute)];
                        break;
                    case 'day':
                        this.checkedHour = this.hours[Number(cronTimeCn.hour)];
                        this.checkedMinute = this.minutes[Number(cronTimeCn.minute)];
                        break;
                    case 'month':
                        let months = cronTimeCn.months.join(',');
                        this.months.forEach(item => {
                            if (weeks.indexOf(item.value) !== -1) {
                                this.checkedMonth.push(item);
                            }
                        });

                        this.checkedHour = this.hours[Number(cronTimeCn.hour)];
                        this.checkedMinute = this.minutes[Number(cronTimeCn.minute)];
                        break;
                    case 'hour':
                        this.checkedStartHour = this.hours[Number(cronTimeCn.startHour)];
                        this.checkedEndHour = this.hours[Number(cronTimeCn.endHour)];
                        this.intervalHours.forEach(idx => {
                            if (idx.value === cronTimeCn.intervalHour) {
                                this.checkedIntervalHour = idx;
                            }
                        });
                        break;
                }
            }
        }

    }

    /**
     * 获取规则库
     */
    getRuleList() {
        this.governanceService.getAllRuleList({actOn: 'data'}).then(d => {
            if (d.success) {
                let arr = d.message || [];
                arr.forEach(item => {
                    this.tagetRulls.push({
                        name: item.ruleName,
                        ruleId: item.funcId
                    });
                });
            } else {
                this.modalService.alert(d.message || d.data);
            }
        });
    }
    /**
     * 获取数据源类型
     */
    async getDataTypes(checked?: any, dsId?: any, tableId?: any) {
        let d = await this.governanceService.searchSourceType();
        if (d.success) {
            let arr = d.message || [];
            this.sourceTypeList = [];
            arr.forEach(item => {
                if (checked && checked === item.rowCode) {
                    this.checkedSourceType = {
                        name: item.rowName,
                        value: item.rowCode
                    }
                    this.getAllSource(item.rowCode, dsId, tableId);
                }
                this.sourceTypeList.push({
                    name: item.rowName,
                    value: item.rowCode
                });
            });
        } else {
            this.modalService.alert(d.message || d.data);
        }
    }

    /**
     * 获取数据源
     */
    async getAllSource(checked?: any, dsId?: any, tableId?: any) {
        if (!this.checkedSourceType) {
            return;
        }
        let d = await this.governanceService.getDataSourceByType(this.checkedSourceType.value);
        if (d.success) {
            this.dataSourceList = [];
            let arr = d.message || [];
            arr.forEach(item => {
                if (checked && dsId && dsId === item.id) {
                    this.checkedSource = {
                        name: item.dsName,
                        value: item.id,
                        dsType: item.dsType
                    };
                    this.getTableList(item.id, tableId);
                }
               this.dataSourceList.push({
                   name: item.dsName,
                   value: item.id,
                   dsType: item.dsType
               });
            });
        } else {
            this.modalService.alert(d.message || d.data);
        }
    }

    /**
     * 获取表
     */
    async getTableList(checked?: any, tableId?: any) {
        if (!this.checkedSourceType || !this.checkedSource) {
            return;
        }
        let d = await this.governanceService.getSourceTables({id: this.checkedSource.value});
        if (d.success) {
            this.tableList = [];
            let arr = d.message || [];
            arr.forEach(item => {
                if (checked && tableId === item.id) {
                    this.checkedTable = {
                        name: item.tableName,
                        value: item.id
                    }
                    this.getFieldList();
                }
                this.tableList.push({
                    name: item.tableName,
                    value: item.id
                }) ;
            });
        } else {
            this.modalService.alert(d.message || d.data);
        }
    }

    /**
     * 获取表下的字段集合
     * @returns {Promise<void>}
     */
    async getFieldList() {
        if (!this.checkedSourceType || !this.checkedSource || !this.checkedTable) {
            return;
        }
        let d = await this.governanceService.getTableFields(this.checkedTable.value);
        if (d.success) {
            this.sourceFieldList = d.message || [];
            setTimeout(() => {
                this.initPonit();
                this.ins.repaintEverything();
            }, 200);

        } else {
            this.modalService.alert(d.message || d.data);
        }
    }

    /**
     * 数据源类型   数据源   表下拉框选择
     */
    selectChange(checked: any, type: any) {
        if (this[type] && this[type].value === checked.value) {
            return;
        }
        this[type] = checked;
        if (type === 'checkedSourceType') {
            this.dataSourceList = [];
            this.checkedSource = null;
            this.sourceFieldList = [];
            this.getAllSource();
        } else if (type === 'checkedSource') {
            this.tableList = [];
            this.checkedTable = null;
            this.sourceFieldList = [];
            this.getTableList();
        } else if (type === 'checkedTable') {
            this.sourceFieldList = [];
            this.getFieldList();
        }
    }

    /**
     * 保存
     */
    saveTaskClick($event: MouseEvent) {
        if (!this.checkedTask) {
            return;
        }
        if (!this.check()) {
            return;
        }
        this.errorType = -1;
        this.error = '';
        let arr = [];
        this.mappingFieldData.forEach(item => {
            arr.push({
                ruleId: item.targetMessage.ruleId,
                fieldName: item.oldMessage.fieldName
            });
        });
        const params = {
            projectCycle: this.runType.value,
            task_position: JSON.stringify({mappingFieldData: this.mappingFieldData, checkedDispatch: this.checkedDispatch.value}),
            taskType: 'DATACHACK',
            cronTimeCn:  {
                hour: this.checkedHour ? this.checkedHour.value : '',
                minute: this.checkedMinute ? this.checkedMinute.value : '',
                months: this.checkedMonth ? this.checkedMonth.map(item => item.value) : [],
                weeks: this.checkedWeek ? this.checkedWeek.map(item => item.value) : [],
                startHour: this.checkedStartHour ? this.checkedStartHour : '',
                startMinute: 0,
                intervalMinute: '',
                intervalHour: this.checkedIntervalHour ? this.checkedIntervalHour.value : '',
                endHour: this.checkedEndHour ? this.checkedEndHour.value : '',
                endMinute: 59,
                givenTime: this.runTime ? new Date(this.runTime.value).getTime() : ''
            },
            configInfo: JSON.stringify({
                dsId: this.checkedSource.value,
                dsType: this.checkedSourceType.value,
                tableId: this.checkedTable.value,
                ruleMap: arr
            }),
            id: this.checkedTask.id
        }
        // console.log(params);
        this.governanceService.saveDataAudit(params).then(d => {
            if (d.success) {
                this.updating = false;
                this.checkedTask = {
                    ...this.checkedTask,
                    ...params
                }
                this.modalService.alert('保存成功');
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }

    /**
     * 立即运行
     */
    async runWorkflow() {
        if (!this.checkedTask) {
            this.modalService.alert('左侧未选中任务,无法提交', {auto: true});
            return;
        }
        if (!this.check()) {
            return;
        }
        this.errorType = -1;
        this.error = '';
        this.governanceService.auditRunNow({
            id: this.checkedTask.id
        }).then(d => {
            this.modalService.alert(d.message);
        });
    }

    /**
     * 校验
     */
    check() {
        if (!this.runType) {
            this.errorType = 1;
            this.error = '请选择执行类型';
            return;
        }
        if (this.runType.value === '0') {
            if (!this.runTime || !this.runTime.value) {
                this.errorType = 2;
                this.error = '请选择执行时间';
                return;
            }
        } else if (this.runType.value === '1') {
            if (this.checkedDispatch.value === 'week') {
                if (!this.checkedWeek || this.checkedWeek.length === 0) {
                    this.errorType = 3;
                    return;
                }
            } else if (this.checkedDispatch.value === 'month') {
                if (!this.checkedMonth || this.checkedMonth.length ===  0) {
                    this.errorType = 4;
                    return;
                }
            } else if (this.checkedDispatch.value === 'week' || this.checkedDispatch.value === 'day' || this.checkedDispatch.value === 'month') {
                if (!this.checkedHour) {
                    this.errorType = 5;
                    return;
                }
                if (!this.checkedMinute) {
                    this.errorType = 6;
                    return;
                }
            } else if (this.checkedDispatch.value === 'hour') {
                if (!this.checkedStartHour) {
                    this.errorType = 7;
                    return;
                }
                if (!this.checkedEndHour) {
                    this.errorType = 8;
                    return;
                }
                if (this.checkedStartHour.value > this.checkedEndHour.value) {
                    this.errorType = 9;
                    return;
                }
                // 计算开始时间和结束时间的先后大小
                if (!this.checkedIntervalHour) {
                    this.errorType = 10;
                    return;
                }
            }
        }

        if (!this.checkedSourceType) {
            this.errorType = 11;
            this.error = '请选择数据源类型';
            return;
        }
        if (!this.checkedSource) {
            this.errorType = 12;
            this.error = '请选择数据源';
            return;
        }
        if (!this.checkedTable) {
            this.errorType = 13;
            this.error = '请选择数据表';
            return;
        }
        if (!this.mappingFieldData || this.mappingFieldData.length === 0) {
            this.modalService.alert('请至少连线一个字段和规则');
            return;
        }
        return true;
    }

    /**
     * 关闭日志弹框
     */
    closeLogPanel() {
        this.noLog = false;
        this.logs = [];
        this.showRunLog = false;
    }

    /**
     * 运行历史
     */
    getRunHistory() {
        if (!this.checkedTask || this.checkedTask.type === 'catalog') {
            this.modalService.alert('左侧未选中任务,无法执行', {auto: true});
            return;
        }
        this.governanceService.getAuditRunHistoryList({
            configId: this.checkedTask.id,
            pageNum: this.pageNum,
            pageSize: this.pageSize
        }).then(d => {
            if (d.success && d.message) {
                let arr = d.message.content || [];
                this.totalCount = d.message.totalElements;
                this.logs = arr;
                this.showRunLog = true;
                this.noLog = this.logs.length ? false : true;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 运行历史翻页
     * @param page
     */
    doPageChange(page: any) {
        this.pageNum = page;
        this.getRunHistory();
    }

    /**
     * 任务运行状态(运行历史)
     */
    getRunStatus(status: any) {
        let str = '';
        switch (status) {
            case 'RUNNING': str = '运行中'; break;
            case 'AWAIT': str = '等待中'; break;
            case 'NORMAL': str = '正常'; break;
            case 'SUCCESS': str = '成功'; break;
            case 'ABNORMAL': str = '异常终止'; break;
            case 'FAIL': str = '失败'; break;
            case 'NOTICE': str = '警告'; break;
            case 'JSEXCEPTION': str = '脚本异常'; break;
        }
        return str;
    }

    /**
     * 删除运行记录
     */
    deleteRunHistory(id: any) {
        this.modalService.toolConfirm('您确认删除吗？', () => {
            this.governanceService.deleteAuditRunHistory({id: id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getRunHistory();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
    }

    /**
     * 执行类型选择
     */
    checkRunType(checked: any) {
        if (!this.runType || checked.value !== this.runType.value) {
            this.runType = checked;
            this.runTime = null;
            this.checkedWeek = [];                      // 选中的星期数
            this.checkedMonth = [];                     // 选中的月份
            this.checkedHour = null;                   // 选中的小时
            this.checkedMinute = null;
            this.checkedStartHour = null;       // 开始时间 选中小时
            this.intervalHours = [];          // 间隔 小时
            this.checkedIntervalHour = null;    // 间隔 选中小时
            this.checkedEndHour = null;         // 结束时间 选中小时
        }
    }

    /**
     * 初始化ins
     */
    initIns() {
        const that = this;
        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Overlays: [],
                HoverPaintStyle: { stroke: 'orange' },
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {
                // 如果连接是手动产生映射 就需要判定
                // connection.scope 的值有四种 combine 组合，split 拆分，mapping 映射（数据恢复产生的），auto 映射（通过鼠标连接产生的）
                if (data.connection.scope === 'auto') {
                    if (data.target.getAttribute('connectionType') === 'mapping') {
                        that.modalService.alert('已存在连线关系');
                    } else if ((data.source.classList.contains('source') && data.target.classList.contains('source')) ||
                        (data.source.classList.contains('target') && data.target.classList.contains('target'))) {
                        that.modalService.alert('同类型的连接点不能连接');
                    } else if (data.source.classList.contains('target')) {
                        that.modalService.alert('连接只支持从源表到规则库');
                    } else {
                        // 手动连接的 为了修改样式 采用自定连接
                        that.ins.connect(that.getConnectionStyle({
                            source: data.source,
                            target: data.target,
                            stroke: '#2E3131',
                            location: 0.5,
                            scope: 'mapping'
                        }));

                        // 记录已经连线的标志
                        data.source.setAttribute('connectionType', 'mapping');
                        data.target.setAttribute('connectionType', 'mapping');
                        // 新增映射关系
                        that.addMappingFieldData(data.source, data.target);
                    }

                    // 删除当前连线
                    setTimeout(() => {
                        that.ins.deleteConnection(data.connection);
                    });

                    that.markupUpdating();
                }
            });

            // 解除连线事件监听
            // that.ins.bind('connectionDetached', function (data) {});

            // 右键点击 显示出删除连线按钮
            that.ins.bind('contextmenu', function (connection, originalEvent: MouseEvent) {
                // 判断是否存在删除按钮 存在就先删除
                if (that.deleteButton.dom) {
                    that.deleteButton.remove();
                }
                // 新增连线删除按钮
                that.createDeleteLineItem(connection, originalEvent);
                // 阻止浏览器右键事件
                originalEvent.preventDefault();
            });

            // 鼠标移入的时候显示出来文字类型 功能暂且
            // mouseover line
            // that.ins.bind('mouseover', function (connection, originalEvent) {});

            // mouseout line
            // that.ins.bind('mouseout', function (connection, originalEvent) {});
        });
    }

    /**
     * 初始化连接点
     */
    initPonit() {
        // 删除原有的数据点
        this.removeEndPoints();

        let point = JsplumbTool.getEndpointOptions({
            endpointRadius: 3,
            connectorStrokeWidth: 0.4,
            arrowWidth: 6,
            location: 0.5,
            scope: 'auto'
        } as EndpointOptions);

        // 源表连接点
        let sourceTds = this.jsplumbContainer.nativeElement.querySelectorAll('.source.point');
        [].forEach.call(sourceTds, (td) => {
            this.ins.addEndpoint(td, { anchors: 'Right' }, point);
        });

        // 目标表连接点
        let targetTds = this.jsplumbContainer.nativeElement.querySelectorAll('.target.point');
        [].forEach.call(targetTds, (td) => {
            this.ins.addEndpoint(td, { anchors: 'Left' }, point);
        });

        // 连线
        this.initConnection();
    }

    /**
     * 获取连接线样式
     * @param option
     */
    getConnectionStyle(option: any) {
        option = Object.assign({
            anchors: ['Right', 'Left'],
            paintStyle: {strokeWidth: 0.5, stroke: '#108ee9', outlineStroke: 'transparent', outlineWidth: 5},
            strokeWidth: 0.4,
            arrowWidth: 6,
            endpointRadius: 2,
            endpointFill: '#108EE9',
            curviness: 150,
            connectorStyle: { stroke: '#2E3131', strokeWidth: 0.4, fill: 'none' }, // 连线颜色、粗细
        } as ConnectOptions, option);

        return JsplumbTool.getConnectOptions(option);
    }

    /**
     * 初始化线条
     */
    initConnection() {
        let sourceTds = this.jsplumbContainer.nativeElement.querySelectorAll('.source.point');
        let targetTds = this.jsplumbContainer.nativeElement.querySelectorAll('.target.point');

        // 根据名字获取source div
        let getSourceDivByName = (name: string) => {
            let temp;
            [].forEach.call(sourceTds, (td) => {
                if (td.querySelector('.name').getAttribute('title') === name) {
                    temp = td;
                }
            });
            return temp;
        };
        // 根据名字获取target div
        let getTargetDivByName = (name: string) => {
            let temp;
            [].forEach.call(targetTds, (td) => {
                if (td.querySelector('.name').getAttribute('title') === name) {
                    temp = td;
                }
            });
            return temp;
        };

        let sourceDiv, targetDiv;
        this.mappingFieldData && this.mappingFieldData.forEach(mapping => {
            sourceDiv = getSourceDivByName(mapping.oldMessage.fieldName);
            targetDiv = getTargetDivByName(mapping.targetMessage.name);
            if (sourceDiv && targetDiv) {
                sourceDiv.setAttribute('connectionType', 'mapping');
                targetDiv.setAttribute('connectionType', 'mapping');

                this.ins.connect(this.getConnectionStyle({
                    source: sourceDiv,
                    target: targetDiv,
                    stroke: '#2E3131',
                    location: 0.5,
                    scope: 'mapping'
                }));
            }
        });
    }

    /**
     * 新增连线删除按钮
     * @param connection
     * @param {MouseEvent} originalEvent
     */
    createDeleteLineItem(connection: any, originalEvent: MouseEvent) {
        let container = this.jsplumbContainer.nativeElement;
        let pContainer = container.parentNode.parentNode.parentNode;

        let div = document.createElement('div');
        div.innerHTML = '删除连线？';
        div.classList.add('drag-delete-line');

        let containerPos = this.toolService.getElementPositionPoint(container);
        let absX = originalEvent.pageX - containerPos.x;
        let absY = originalEvent.pageY - containerPos.y + pContainer.scrollTop; // 这里注意加上父父父容器的滚动高度
        div.style.left = absX + 'px';
        div.style.top = absY + 'px';

        // 点击删除连线
        let divEvent = this.render.listen(div, 'click', (e: MouseEvent) => {
            // 删除映射关系
            if (connection.scope === 'mapping') {
                let find = -1;
                this.mappingFieldData.forEach((mapping, index) => {
                    if (mapping.oldMessage.fieldName === connection.source.querySelector('.name').getAttribute('title') &&
                        mapping.targetMessage.name === connection.target.querySelector('.name').getAttribute('title')) {
                        find = index;
                    }
                });
                if (find !== -1) {
                    // 删除连线记录
                    this.mappingFieldData.splice(find, 1);
                }

                // 删除连线
                this.ins.getAllConnections().filter(c => {
                    return c.sourceId === connection.sourceId && c.targetId ===  connection.targetId;
                }).forEach(c => {
                    // 删除连线标志
                    c.source.removeAttribute('connectionType');
                    c.target.removeAttribute('connectionType');
                    // 删除连线
                    this.ins.deleteConnection(c);
                });
            }

            let sourceTds = this.jsplumbContainer.nativeElement.querySelectorAll('.source.point');
            let targetTds = this.jsplumbContainer.nativeElement.querySelectorAll('.target.point');

            if (this.deleteButton.dom) {
                this.deleteButton.remove();
            }
            this.markupUpdating();
            e.stopPropagation();
        });

        // 给document 添加点击事件 删除显示的 删除连线按钮
        let docEvent = this.render.listen(document, 'click', (e: MouseEvent) => {
            if (this.deleteButton.dom) {
                this.deleteButton.remove();
            }
        });

        // 把按钮信息暂存 便于点下一个按钮的时候删除可能存在的前一个按钮
        this.deleteButton = {
            dom: div,
            divEvent: divEvent,
            docEvent: docEvent,
            remove: () => {
                divEvent();
                docEvent();
                div.parentNode.removeChild(div);

                this.deleteButton = {
                    dom: null,
                    divEvent: null,
                    docEvent: null,
                    remove: null
                };
            }
        };
        container.appendChild(div);
    }

    /**
     * 添加映射数据
     * @param {ElementRef} source
     * @param {ElementRef} target
     */
    addMappingFieldData(source: HTMLElement, target: HTMLElement) {
        this.mappingFieldData.push({
            oldMessage: {
                fieldName: source.querySelector('.name').getAttribute('title'), // 真实的值放在title属性里，显示值是被截取了的
                dataType: source.querySelector('.type').getAttribute('title')
            },
            targetMessage: {
                name: target.querySelector('.name').getAttribute('title'),
                ruleId: target.querySelector('.name').getAttribute('ruleId')
            }
        });
    }
    /**
     * 删除全部连接点
     */
    removeEndPoints() {
        if (this.ins) {
            // 删除全部连接线
            this.ins.deleteEveryConnection();
            // 清空连接点
            this.ins.deleteEveryEndpoint();

            // 清空所有连接状态
            let sourceTds = this.jsplumbContainer.nativeElement.querySelectorAll('.source.point');
            let targetTds = this.jsplumbContainer.nativeElement.querySelectorAll('.target.point');
            [].forEach.call(sourceTds, sourceTd => {
                sourceTd.removeAttribute('connectionType');
            });
            [].forEach.call(targetTds, targetId => {
                targetId.removeAttribute('connectionType');
            });
        }
    }

    /**
     * 删除连接
     */
    removeMappingConnections() {
        if (this.ins) {
            // 删除连线数据
            let connections = this.ins.getAllConnections();
            connections.filter(connection => {
                return  connection.scope === 'mapping';
            }).forEach(connection => {
                connection.source.removeAttribute('connectionType');
                connection.target.removeAttribute('connectionType');
                this.ins.deleteConnection(connection);
            });
        }
    }

    /**
     * 获取连线框的高度
     */
    getJsplumbContainerHeight() {
        if (this.sourceFieldList) {
            return (Math.max((this.sourceFieldList.length, this.sourceFieldList.length) + 1) * 30 + 100);
        }
    }

    /**
     * 频率选择
     */
    checkedDispatchCallback(frequency: any) {
        if (!this.checkedDispatch || !this.checkedDispatch.value !== frequency.value) {
            this.checkedDispatch = frequency;
            this.checkedWeek = [];                      // 选中的星期数
            this.checkedMonth = [];                     // 选中的月份
            this.checkedHour = null;                   // 选中的小时
            this.checkedMinute = null;
            this.checkedStartHour = null;       // 开始时间 选中小时
            this.intervalHours = [];          // 间隔 小时
            this.checkedIntervalHour = null;    // 间隔 选中小时
            this.checkedEndHour = null;         // 结束时间 选中小时
        }
    }

    /**
     * 时间间隔
     */
    checkedIntervalCallback(value, type) {
        this[`${type}`] = value;
    }
    /**
     * 开始时间 小时
     * @param hour
     */
    checkedStartHourCallback(hour: any) {
        this.checkedStartHour = hour;
    }
    /**
     * 结束时间 小时
     * @param hour
     */
    checkedEndHourCallback(hour: any) {
        this.checkedEndHour = hour;
    }

    /**
     * 时间  月、周、时、分选择
     */
    checkedTimeCallback(value, type) {
        this[`${type}`] = value;
    }

    markupUpdating() {
        this.updating = true;
    }
}
