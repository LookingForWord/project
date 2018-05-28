import {Component, OnInit, Renderer2} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceMetadataTableAnalysisAddComponent} from 'app/components/modules/governance/components/metadata/table.analysis/add/governance.metadata.table.analysis.add.component';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
declare var moment: any;

export class FieldData {
    checkedField: any;          // 选中的字段
    checkedRule: any;           // 选中的字段规则
    fieldRules: any;
    fieldValue: any;            // 字段规则的具体值,
    minValue: any;              // between的较小值
    maxValue: any;
    errorType: number;          // 单行错误类型
    error: any;                 // 当行错误提示
}

@Component({
    selector: 'governance-metadata-table-analysis-component',
    templateUrl: './governance.metadata.table.analysis.component.html',
    styleUrls: ['./governance.metadata.table.analysis.component.scss']
})

export class GovernanceMetadataTableAnalysisComponent implements OnInit {
    page: any;                          // 上一个页面的当前页
    dsType: any;                        // 上一个页面的数据源类型
    tableId: any;                       // 表id
    dsId: any;
    tableName: any;
    showHistory: any;
    historyList: any;
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;
    noHistroy = false;
    hidePanelEventHook: any;

    reportList = [];                    // 侧边栏报告列表
    checkedItem: any;                   // 侧边选中项
    analyseResultExtList = [];          // 表分析的字段相关列表
    jobId: any;

    noData = true;
    resultName: any;                    // 报告名称
    createTime: any;                    // 执行时间
    countResult: any;                   // 行数统计
    fieldFilter = [];                   // 字段过滤
    disabled = true;
    showType: any;

    fieldData: Array<FieldData>;
    fieldList = [];
    fieldRules = [
        {name: '>', value: '>'},
        {name: '>=', value: '>='},
        {name: '<', value: '<'},
        {name: '<=', value: '<='},
        {name: '=', value: '='},
        {name: '!=', value: '!='},
        {name: 'between and', value: 'between and'}
    ];        // 字段规则集合

    isCount = true;

    analyseJobExtList = [];      // 字段集合
    runTypes = [
        {name: '单次执行', value: '1'},
        {name: '周期执行', value: '2'}
    ];
    checkedRunType = {name: '单次执行', value: '1'};
    taskName: any;
    startTime: any;
    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss'
    };

    // 任务日期
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

    error: any;
    errorType: any;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private governanceService: GovernanceService,
                private modalService: ModalService,
                private render: Renderer2) {
        this.activatedRoute.params.subscribe(params => {
            this.page = params.page;
            this.tableId = params.id;
            this.dsType = params.dsType;
            this.tableName = params.tableName;
            this.dsId = params.dsId;
        });
        this.initTime();
    }


    ngOnInit() {
        this.getReportList();
        this.hidePanelEvent();
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
        this.checkedStartMinute = this.startMinutes[0];
        this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];
        // this.checkedDispatch = this.dispatchs[0];
    }

    /**
     * 补零操作
     */
    addZero(str: any) {
        let newStr = '';
        if (str.length === 1 || str < 10) {
            newStr = '0' + str;
        } else {
            newStr = str;
        }
        return newStr;
    }
    /**
     * 获取报告列表
     */
    getReportList() {
        // tableId上一个页面传入应该为this.tableId但是现在写死一个有数据的'402880fa60fee82201611c7e517500ec'
        this.governanceService.getTableAnalysis({tableId: this.tableId}).then(d => {
            if (d.success) {
                this.reportList = d.message || [];
                if (this.jobId) {
                    for (let i = 0; i < this.reportList.length; i++) {
                        if (this.reportList[i].id === this.jobId) {
                            this.reportList[i].check = true;
                            return;
                        }
                    }
                }
                this.disabled = false;
            } else {
                this.disabled = true;
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 侧边栏选中
     * @param item
     */
    chekReport(item: any) {
        if (this.checkedItem && item.id === this.checkedItem.id) {
            return;
        }
        this.reportList.forEach(r => r.check = false);
        item.check = true;
        this.checkedItem = item;
        this.getAnalysisDetail(item.id);
        this.showType = true;
    }

    /**
     * 新建分析
     */
    addReport() {
        if (this.disabled) {
            this.modalService.alert('该数据源类型暂不支持');
            return;
        }
        this.reportList.forEach(idx => {
            idx.check = false;
        });
        // 新增先清空
        this.jobId = '';
        this.checkedItem = null;
        this.taskName = '';
        this.checkedRunType = this.runTypes[0];
        this.startTime = null;
        this.checkedIntervalHour = null;
        this.checkedEndHour = null;
        this.checkedMonth = [];
        this.checkedWeek = [];
        this.checkedStartHour = null;
        this.checkedHour = null;
        this.checkedMinute = null;

        this.fieldData = [];
        this.fieldData = [{
            checkedField: {name: '', value: ''},            // 选中的字段
            checkedRule: {name: '', value: ''},             // 选中的字段规则
            fieldRules: this.fieldRules,
            minValue: '',
            maxValue: '',
            fieldValue: '',                                 // 字段规则的具体值
            errorType: 0,                                   // 单行错误类型
            error: ''                                       // 当行错误提示
        }];
        // 获取表字段信息
        this.getTableField(this.tableId);
        this.showType = true;
    }

    /**
     * 左侧点击操作获取作业详情
     */
    async getAnalysisDetail(jobId: any) {
        let d = await this.governanceService.getAnalysisDetail({jobId: jobId});
        if (d.success && d.message) {
            this.fieldList = [];
            this.analyseJobExtList = [];
            this.fieldData = [];
            this.taskName = d.message.jobName;
            this.isCount = d.message.isCount === 'Y' ? true : false;
            let obj = typeof(d.message.cronTimeCn) === 'string' ? JSON.parse(d.message.cronTimeCn) : d.message.cronTimeCn;

            if (d.message.jobType === '1') {
                this.checkedRunType = this.runTypes[0];
                let num = new Date(obj.givenTime);
                const year = this.addZero(num.getFullYear());
                const month = this.addZero(num.getMonth() + 1);
                const day = this.addZero(num.getDate());
                const hour = this.addZero(num.getHours());
                const minute = this.addZero(num.getMinutes());
                const second = this.addZero(num.getSeconds());
                // this.startTime = moment(obj.givenTime).format('YYYY-MM-DD HH:mm:ss');
                this.startTime = {
                    date: year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second,
                    value: moment(obj.givenTime).format('YYYY-MM-DD HH:mm:ss')
                }
            } else if (d.message.jobType === '2') {
                this.checkedRunType = this.runTypes[1];
                switch (d.message.projectCycle) {
                    case 'day':
                        this.checkedDispatch = this.dispatchs[0];
                        this.checkedHour = this.hours[obj.hour];
                        this.checkedMinute = this.minutes[obj.minute] || this.minutes[0];
                        break;
                    case 'week':
                        this.checkedDispatch = this.dispatchs[1];
                        let weekStr = obj.weeks.join(',');
                        this.checkedWeek = this.weeks.filter(idx => {
                            return weekStr.indexOf(idx.value) !== -1;
                        });
                        this.checkedHour = this.hours[obj.hour];
                        this.checkedMinute = this.minutes[obj.minute] || this.minutes[0];
                        break;
                    case 'month':
                        this.checkedDispatch = this.dispatchs[2];
                        let monthStr = obj.months.join(',');
                        this.checkedMonth = this.weeks.filter(idx => {
                            return monthStr.indexOf(idx.value) !== -1;
                        });
                        this.checkedHour = this.hours[obj.hour];
                        this.checkedMinute = this.minutes[obj.minute] || this.minutes[0];
                        break;
                    case 'hour':
                        this.checkedDispatch = this.dispatchs[3];
                        this.checkedStartHour = this.startHours[obj.startHour];
                        this.checkedStartMinute = this.startMinutes[obj.startMinute] || this.startMinutes[0];
                        this.checkedEndHour = this.endHours[obj.ednHour];
                        this.checkedEndMinute = this.endMinutes[obj.endMinute] || this.endMinutes[this.endMinutes.length - 1];
                        this.checkedIntervalHour = this.intervalHours[obj.intervalHour - 1];
                        break;
                }
            }
            let list = d.message.analyseJobExtList || [];
            list.forEach(item => {
                this.fieldList.push({
                    fieldName: item.fieldName,
                    fieldType: item.fieldType,
                });
                let newObj = [
                    {Cname: '基数', Ename: 'base', value:  item.fieldParams && item.fieldParams.indexOf('base') !== -1 ? true : false},
                    {Cname: '计数', Ename: 'count', value:  item.fieldParams && item.fieldParams.indexOf('count') !== -1 ? true : false}
                ];
                let arr = this.checkField(item.fieldType, item.fieldParams || '');
                newObj = newObj.concat(arr);
                this.analyseJobExtList.push({
                    fieldName: item.fieldName,
                    fieldType: item.fieldType,
                    fieldParams: newObj,
                    minValue: item.fieldRange ? item.fieldRange.split(',')[0] : '',
                    maxValue: item.fieldRange ? item.fieldRange.split(',')[1] : '',
                    errorType: -1,
                    error: '',
                    showRange: this.showRange(item.fieldType)
                });
            });
            let filterArr = JSON.parse(d.message.fieldFilter) || [];
            filterArr.forEach(idx => {
                let checkedField = {fieldName: '', value: ''}, checkedRule = {name: '', value: ''};
                for (let i = 0; i < this.fieldList.length; i++) {
                    if (this.fieldList[i].fieldName === idx.fieldName) {
                        checkedField = this.fieldList[i];
                        break;
                    }
                }
                for (let i = 0; i < this.fieldRules.length; i++) {
                    if (this.fieldRules[i].name === idx.func) {
                        checkedRule = this.fieldRules[i];
                        break;
                    }
                }
                this.fieldData.push({
                    checkedField: checkedField,            // 选中的字段
                    checkedRule: checkedRule,             // 选中的字段规则
                    fieldRules: this.fieldRules,
                    minValue: idx.value.split('-')[0] || '',
                    maxValue: idx.value.split('-')[1] || '',
                    fieldValue: idx.value.split('-')[0] || '',                                 // 字段规则的具体值
                    errorType: 0,                                   // 单行错误类型
                    error: ''                                       // 当行错误提示
                });
            });
        } else {
            this.modalService.alert(d.message);
        }
    }
    /**
     * 获取表字段信息
     */
    getTableField(tableId: any) {
        this.governanceService.getTableField({tableId: tableId}).then(d => {
            if (d.success) {
                this.fieldList = d.message || [];
                this.fieldList.forEach(idx => {idx.fieldType = idx.dataType; });
                this.analyseJobExtList = [];
                d.message.forEach(item => {
                    let newObj = [
                        {Cname: '基数', Ename: 'base', value: false},
                        {Cname: '计数', Ename: 'count', value: false}
                    ];
                    let arr = this.checkField(item.dataType, '');
                    newObj = newObj.concat(arr);
                    this.analyseJobExtList.push({
                        fieldName: item.fieldName,
                        fieldType: item.dataType,
                        fieldParams: newObj,
                        minValue: '',
                        maxValue: '',
                        errorType: -1,
                        error: '',
                        showRange: this.showRange(item.dataType)
                    });
                });
            } else {
                this.modalService.alert(d.message);
            }
        });
    }
    /**
     * 确认字段类型  根据字段类型 需要显示不同的规则
     */
    checkField(field: any, fieldParams: any) {
        if (field === 'int' ||
            field === 'double' ||
            field === 'bigint' ||
            field === 'tinyint' ||
            field === 'smallint' ||
            field === 'mediumint' ||
            field === 'float') {
            // 最大值，最小值，平均值，求和，标准差，方差，范围
            return [
                {Cname: '最小值', Ename: 'min', value: fieldParams.indexOf('min') !== -1 ? true : false},
                {Cname: '最大值', Ename: 'max', value: fieldParams.indexOf('max') !== -1 ? true : false},
                {Cname: '求和', Ename: 'sum', value: fieldParams.indexOf('sum') !== -1 ? true : false},
                {Cname: '平均值', Ename: 'average', value: fieldParams.indexOf('average') !== -1 ? true : false},
                {Cname: '标准差', Ename: 'stddev', value: fieldParams.indexOf('stddev') !== -1 ? true : false},
                {Cname: '方差', Ename: 'varpop', value: fieldParams.indexOf('varpop') !== -1 ? true : false}
            ];
        } else if (field === 'varchar' ||
            field === 'char' ||
            field === 'text' ||
            field === 'tinytext' ||
            field === 'longtext') {
            return [
                    {Cname: '平均长度', Ename: 'aveLength', value: fieldParams.indexOf('aveLength') !== -1 ? true : false}
                ];
        } else {
            return [];
        }
    }

    /**
     * 字段是否展示范围
     * @param fieldType
     * @returns {boolean}
     */
    showRange(fieldType: any) {
        let arr = ['int', 'double', 'bigint', 'tinyint', 'smallint', 'mediumint', 'float'];
        if (arr.join(',').indexOf(fieldType) !== -1) {
            return true;
        }
        return false;
    }
    /**
     * 返回
     */
    goBack() {
        this.router.navigateByUrl(`/main/governance/metadata?page=${this.page}&meta=1`);
    }

    /**
     * 删除左侧作业
     */
    deleteReport(id: any) {
        this.modalService.toolConfirm('您确认删除吗?', () => {
            this.governanceService.deleteReport({jobId: id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.reportList = [];
                    this.getReportList();
                    this.showType = false;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
    }

    /**
     * 给document新增点击事件 点击隐藏panel
     */
    hidePanelEvent(result?: any) {
        if (!result) {
            this.hidePanelEventHook = this.render.listen(document, 'click', (e: MouseEvent) => {
                if (this.showHistory) {
                    this.showHistory = false;
                }
            });
        } else {
            this.hidePanelEventHook = null;
            this.showHistory = false;
        }
    }

    /**
     *  点击侧边栏默认不隐藏
     */
    stopPanelClick($event: MouseEvent) {
        $event.stopPropagation();
    }

    /**
     * 新建过滤
     */
    addField() {
        this.fieldData.push({
            checkedField: {fieldName: '', fieldType: ''},            // 选中的字段
            checkedRule: {name: '', value: ''},             // 选中的字段规则
            fieldRules: this.fieldRules,
            fieldValue: '',                                 // 字段规则的具体值
            minValue: '',
            maxValue: '',
            errorType: 0,                                   // 单行错误类型
            error: ''                                       // 当行错误提示
        });
    }
    /**
     * 删除行
     * @param {number} i
     * @param fieldData
     */
    deleteField(i: number, fieldData: any) {
        if (!fieldData || fieldData.length < 2) {
            return;
        }
        this.fieldData.splice(i, 1);
    }
    /**
     * 执行类型选中
     */
    taskTypeChecked(type: any) {
        if (type.value !== this.checkedRunType.value) {
            this.checkedRunType = type;
            this.checkedDispatch = this.dispatchs[0];
            this.checkedStartMinute = this.startMinutes[0];
            this.checkedEndMinute = this.endMinutes[this.endMinutes.length - 1];
            if (type.value ===  '2') {
                this.checkedIntervalHour = null;
                this.checkedEndHour = null;
                this.checkedMonth = [];
                this.checkedWeek = [];
                this.checkedStartHour = null;
                this.checkedHour = null;
                this.checkedMinute = null;
            } else {
                this.startTime = null;
            }

        }
    }

    /**
     * 频率选择
     */
    checkedDispatchCallback(frequency: any) {
        if (this.checkedDispatch.value !== frequency.value) {
            this.checkedDispatch = frequency;
            this.checkedIntervalHour = null;
            this.checkedEndHour = null;
            this.checkedMonth = [];
            this.checkedWeek = [];
            this.checkedStartHour = null;
            this.checkedHour = null;
            this.checkedMinute = null;
            this.startTime = null;
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
    /**
     * 过滤条件内字段下拉框选中
     * @param checked
     * @param type
     * @param item
     */
    chooseOption(checked: any, type: any, item: any, index: any) {
        if (item[type] === checked) {
            return;
        }
        console.log(checked)
        let fileds = ['int', 'double', 'bigint', 'tinyint', 'smallint', 'mediumint', 'float'];
        if (type === 'checkedField') {
            if (fileds.join(',').indexOf(checked.fieldType) === -1) {
                item.fieldRules = [
                    {name: '=', value: '='},
                    {name: '!=', value: '!='}
                ];
                item.checkedField = null;
            } else {
                item.fieldRules = this.fieldRules;
                item.checkedField = null;
            }
            let arr = this.fieldData.filter(idx => {
                if (idx[type] && idx[type].fieldName) {
                    return idx[type].fieldName === checked.fieldName;
                }
            });

            if (arr.length > 0) {
                this.fieldData[index].errorType = 1;
                this.fieldData[index].error = '请勿添加重复字段';
                return;
            } else {
                this.fieldData[index].errorType = -1;
                this.fieldData[index].error = '';
            }
        }
        item[type] = checked;
        if (type === 'checkedField' && checked.fieldType === 'string') {
            item.fieldRules = [
                {name: '=', value: '='},
                {name: '!=', value: '!='}
            ];
            item.minValue = '';
            item.maxValue = '';
            item.fieldValue = '';
            item.checkedRule = {name: '', value: ''};
        }
    }

    /**
     * 校验字段
     */
    check() {
        if (!this.taskName) {
            this.errorType = 1;
            this.error = '请输入作业名称';
            return;
        }

        if (this.checkedRunType.value === '1') {
            if (!this.startTime || !this.startTime.value) {
                this.errorType = 3;
                this.error = '请选择执行时间';
                return;
            }
            const now = new Date().getTime();
            const checkedNum = new Date(this.startTime.value).getTime();
            if (checkedNum < now) {
                this.errorType = 3;
                this.error = '过期时间,请重新选择';
                return;
            }
        } else {
            if (this.checkedDispatch.value === 'day' || this.checkedDispatch.value === 'week' || this.checkedDispatch.value === 'month') {
                if (this.checkedDispatch.value === 'week' && (!this.checkedWeek || this.checkedWeek.length === 0 )) {
                    this.errorType = 4;
                    return;
                }
                if (this.checkedDispatch.value === 'month' && !this.checkedMonth) {
                    this.errorType = 5;
                    return;
                }
                if (!this.checkedHour) {
                    this.errorType = 6;
                    return;
                }
                if (!this.checkedMinute) {
                    this.errorType = 7;
                    return;
                }
            }
            if (this.checkedDispatch.value === 'hour') {
                if (!this.checkedStartHour) {
                    this.errorType = 8;
                    return;
                }
                if (!this.checkedEndHour) {
                    this.errorType = 9;
                    return;
                }

                if (this.checkedEndHour.value < this.checkedStartHour.value) {
                    this.errorType = 10;
                    return;
                }
                if (!this.checkedIntervalHour) {
                    this.errorType = 12;
                    return;
                }
            }
        }

        if (this.fieldData && this.fieldData.length) {
            for (let i = 0; i < this.fieldData.length; i++) {
                if (this.fieldData[i].checkedField.fieldType || this.fieldData[i].checkedRule.value || this.fieldData[i].fieldValue) {
                    if (!this.fieldData[i].checkedField.fieldType) {
                        this.fieldData[i].errorType = 1;
                        this.fieldData[i].error = '请选择过滤字段';
                        return;
                    }

                    if (!this.fieldData[i].checkedRule.value) {
                        this.fieldData[i].errorType = 2;
                        this.fieldData[i].error = '请选择过滤条件';
                        return;
                    }
                    if (this.fieldData[i].checkedRule.value !== 'between and') {
                        if (this.fieldData[i].checkedField.fieldType !== 'varchar' &&
                            this.fieldData[i].checkedField.fieldType !== 'char' &&
                            this.fieldData[i].checkedField.fieldType !== 'string'
                        ) {
                            if (!RegExgConstant.integer.test(this.fieldData[i].fieldValue)) {
                                this.fieldData[i].errorType = 3;
                                this.fieldData[i].error = '请输入数字';
                                return;
                            }

                        } else {
                            if (!this.fieldData[i].fieldValue) {
                                this.fieldData[i].errorType = 3;
                                this.fieldData[i].error = '请输入';
                                return;
                            }
                        }
                    } else if (this.fieldData[i].checkedRule.value === 'between and') {
                        if (!RegExgConstant.integer.test(this.fieldData[i].minValue)) {
                            this.fieldData[i].errorType = 4;
                            this.fieldData[i].error = '请输入数字';
                            return;
                        }

                        if (!RegExgConstant.integer.test(this.fieldData[i].maxValue)) {
                            this.fieldData[i].errorType = 5;
                            this.fieldData[i].error = '请输入数字';
                            return;
                        }
                        if (Number(this.fieldData[i].maxValue) < Number(this.fieldData[i].minValue)) {
                            this.fieldData[i].errorType = 5;
                            this.fieldData[i].error = '不能小于较小值';
                            return;
                        }
                    }

                    this.fieldData[i].errorType = -1;
                    this.fieldData[i].error = '';
                }
            }
        }
        // 校验字段
        if (!this.analyseJobExtList || !this.analyseJobExtList.length) {
            this.modalService.alert('请加载作业');
            return;
        }
        const num = this.analyseJobExtList.length;
        for (let i = 0; i < num; i++) {
            if (this.analyseJobExtList[i].minValue && !RegExgConstant.integer.test(this.analyseJobExtList[i].minValue)) {
                this.analyseJobExtList[i].errorType = 1;
                this.analyseJobExtList[i].error = '请输入数字';
                return;
            }
            if (this.analyseJobExtList[i].maxValue && !RegExgConstant.integer.test(this.analyseJobExtList[i].maxValue)) {
                this.analyseJobExtList[i].errorType = 2;
                this.analyseJobExtList[i].error = '请输入数字';
                return;
            }
            if (Number(this.analyseJobExtList[i].maxValue) < Number(this.analyseJobExtList[i].minValue)) {
                this.analyseJobExtList[i].errorType = 2;
                this.analyseJobExtList[i].error = '小于较小值';
                return;
            }
            this.analyseJobExtList[i].errorType = -1;
            this.analyseJobExtList[i].error = '';
        }

        let fieldFilter = [];
        // 过滤
        this.fieldData.forEach(item => {
            fieldFilter.push({
                fieldName: item.checkedField.fieldName,
                func: item.checkedRule.value,
                value: item.minValue && item.maxValue ? `${item.minValue}-${item.maxValue}` : item.fieldValue
            });
        });
        let analyseJobExtList = [];
        this.analyseJobExtList.forEach(item => {
            let fieldParams = [];
            item.fieldParams.forEach(n => {
                if (n.value) {
                    fieldParams.push(n.Ename);
                }
            });
            analyseJobExtList.push({
                fieldName: item.fieldName,
                fieldType: item.fieldType,
                fieldParams: fieldParams.length ? fieldParams.join(',') : null,
                fieldRange: item.minValue && item.maxValue ? `${item.minValue},${item.maxValue}` : null
            });
        });
        return [fieldFilter, analyseJobExtList];
    }

    /**
     * 保存作业
     */
    saveTask() {
        let result = this.check();
        if (!result) {
            return;
        }
        this.errorType = -1;
        this.error = '';
        let [fieldFilter, analyseJobExtList] = result;
        const params = {
            id : this.checkedItem ? this.checkedItem.id : (this.jobId || ''),
            jobName: this.taskName,
            dsType: this.dsType,
            dsId: this.dsId,
            tableId: this.tableId,
            isCount: this.isCount ? 'Y' : 'N',
            jobType: this.checkedRunType.value,
            projectCycle: this.checkedRunType.value === '2' ? this.checkedDispatch.value : 'moment',
            cronTimeCn: {
                intervalHour: this.checkedDispatch && this.checkedDispatch.value === 'hour' ? this.checkedIntervalHour.value : '',
                endHour: this.checkedDispatch && this.checkedDispatch.value === 'hour' ? this.checkedEndHour.value : '',
                months: this.checkedDispatch && this.checkedDispatch.value === 'month' ? this.checkedMonth.map(idx => idx.value) : [],
                weeks: this.checkedDispatch && this.checkedDispatch.value === 'week' ? this.checkedWeek.map(idx => idx.value) : [],
                hour: this.checkedHour ? this.checkedHour.value : '',
                startHour: this.checkedDispatch && this.checkedDispatch.value === 'hour' ? this.checkedStartHour.value : '',
                intervalMinute: '',
                startMinute:  0,
                minute: this.checkedMinute ? this.checkedMinute.value : '',
                endMinute: 59,
                givenTime: this.checkedRunType.value === '1' ? new Date(this.startTime.value).getTime() : ''
            },
            fieldFilter: fieldFilter,
            analyseJobExtList: analyseJobExtList
        }
        this.governanceService.saveTableAnalysis(params).then(d => {
            if (d.success) {
                this.modalService.alert('保存成功');
                this.jobId = d.message;
                this.getReportList();
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 提交作业
     */
    submitTask() {
        if (!this.checkedItem && !this.jobId) {
            return;
        }
        this.governanceService.submitAnalysis({jobId: this.checkedItem ? this.checkedItem.id : this.jobId}).then(d => {
            this.modalService.alert(d.message);
        });
    }
    /**
     * 显示运行历史
     */
    showHistoryModal($event: MouseEvent) {
        if (!this.checkedItem) {
            return;
        }
        this.pageNum = 1;
        this.getHistory();
        this.showHistory = true;
        $event.stopPropagation();
    }

    /**
     * 获取运行历史
     */
    getHistory() {
        this.governanceService.getHistoryList({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            jobId: this.checkedItem ? this.checkedItem.id : this.jobId
        }).then(d => {
            if (d.success && d.message) {
                this.historyList = d.message.content || [];
                this.noHistroy = this.historyList.length ? false : true;
                this.totalCount = d.message.totalElements;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 运行历史页码切换
     * @param page
     */
    doPageChange(page: any) {
        this.pageNum = page;
        this.getHistory();
    }
    /**
     * 获取运行历史详情
     */
    detailClick(item: any) {
        let [ins] = this.modalService.open(GovernanceMetadataTableAnalysisAddComponent, {
            title: '运行历史详情',
            backdrop: 'static'
        });
        ins.type = 'detail';
        ins.checkItem = item;
    }
}
