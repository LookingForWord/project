/**
 * Created by LIHUA on 2017-09-18.
 * 数据清洗
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';

import {DataCleanEnum} from 'app/constants/data.clean.enum';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {TaskConfigContentDatasyncCleanKnowledgeComponent} from 'app/components/modules/task/components/config/content/datasync/clean/knowledge/task.config.content.datasync.clean.knowledge.component';
import {TaskConfigContentDatasyncCleanRuleComponent} from 'app/components/modules/task/components/config/content/datasync/clean/rule/task.config.content.datasync.clean.rule.component';

// 数据清洗的数据检查
export class CheckFieldData {
    oldMessage: any;   // 原字段信息
    checkRule: any;    // 检查规则
    checkValue: any;   // 检查规则值 固定值和正则检查的时候需要填写值
    errorType: number; // 单行错误类型
}

// 数据清洗的数据转换
export class ReplaceFieldData {
    oldMessage: any;   // 原字段信息
    replaceVal: any;   // 转换值
    replaceRule: any;  // 转换方式
    enums = [];        // 枚举类型转换值
    replaceValue: any; // 替换值 空值替换的时候需要
    errorType: number; // 单行错误类型
    outputField: any;  // 输出字段
}

// 编辑模式
export enum EditModeEnum {
    TABLE = 'table',
    TEXT = 'text'
}

@Component({
    selector: 'task-config-content-datasync-clean-component',
    templateUrl: './task.config.content.datasync.clean.component.html',
    styleUrls: ['./task.config.content.datasync.clean.component.scss']
})
export class TaskConfigContentDatasyncCleanComponent implements OnInit, OnDestroy {

    dataCleanType = DataCleanEnum.CHECK; // 数据清洗类型 check为数据过滤, change为数据转换
    inputs = [];                         // 原输入信息集合
    sourceFiles: any;                    // 原字段集合

    checkFieldData = Array<CheckFieldData>();     // 数据检查的字段信息
    replaceFieldData = Array<ReplaceFieldData>(); // 数据转换的字段信息

    // 检查类型
    checkTypes = [{name: '空值过滤', value: 'empty'},
                  {name: '非空过滤', value: 'noEmpty'},
                  {name: '固定值过滤', value: 'fixed'},
                  {name: '正则过滤', value: 'regExp'},
                  {name: '去重过滤', value: 'removeRepeat'}];
    // 数据替换规则
    replaceRules = [{name: '空值转换', value: 'replaceEmpty'},
                    {name: '固定值转换', value: 'fixed'},
                    {name: '随机值转换', value: 'random'},
                    {name: '拼接转换', value: 'merge'},
                    {name: 'Sql取模', value: 'modulo'},
                    {name: '大小写转换', value: 'toggleCase'},
                    {name: '逆序转换', value: 'reverse'},
                    {name: '多元计算', value: 'multi'},
                    {name: '三元表达式', value: 'express3'},
                    {name: '枚举转换', value: 'enum'}];
    // 大小写转换类型
    toggleCases = [
        {name: '小写转换', value: 'lower'},
        {name: '大写转换', value: 'upper'}
    ];

    parent: any;   // 父容器
    task: any;     // 任务信息
    dataCleanEnum = DataCleanEnum;                 // 数据清洗类型枚举
    @ViewChild('container') container: ElementRef; // 内容引用

    unsubscribes = [];                             // 订阅钩子函数集合
    collectDatabaseEnum = CollectDatabaseEnum;     // 采集库类型枚举

    uuid: string;                                  // 自己的画布项uuid
    moduleNumber: number;                          // 自己的画布项模块id
    editModeEnum = EditModeEnum;                   // 编辑模式
    editMode = EditModeEnum.TABLE;                 // 编辑模式 table 表格编辑， text 文本编辑
    editModeText: any;                             // text编辑模式对象

    impacts = [];                                  // 本组件属性改变的时候，需要通知受影响组件更新内容

    constructor(private modalService: ModalService,
                private datatransferService: DatatransferService,
                private toolService: ToolService) {}

    ngOnInit() {
        // 这里也进行初始化数据采集信息
        this.initCollection();
        if (this.task && this.task.cleanList && this.task.cleanList.length) {
            // 数据还原
            this.restoreData();
        }
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
    }

    /**
     * 数据还原
     */
    restoreData() {
        // 数据过滤
        let checkArr = this.task.cleanList.filter(s => s.jobId === this.uuid && s.moduleType === 'filter');
        if (checkArr.length) {
            checkArr.forEach(item => {
                let checkRule = null,
                    config = JSON.parse(item.configAttr) || {},
                    oldMessage = null;
                // 过滤类型
                switch (item.moduleNo) {
                    case 20001: checkRule = {name: '空值过滤', value: 'empty'}; break;
                    case 20002: checkRule = {name: '非空过滤', value: 'noEmpty'}; break;
                    case 20003: checkRule = {name: '固定值过滤', value: 'fixed'}; break;
                    case 20004: checkRule = {name: '正则过滤', value: 'regExp'}; break;
                    case 20005: checkRule = {name: '去重过滤', value: 'removeRepeat'}; break;
                }

                // 过滤字段
                if (item.moduleNo === 20005) {
                    // 去重过滤是数组形式
                    oldMessage = [];
                    let columns = config.sourceFieldName.split(',');
                    let types = config.sourceFieldType.split(',');
                    columns.forEach((column, index) => {
                        oldMessage.push({
                            fieldName: column,
                            dataType: types[index]
                        });
                    });
                } else {
                    oldMessage = {
                        fieldName: config.sourceFieldName,
                        dataType: config.sourceFieldType
                    };
                }

                this.checkFieldData.push({
                    oldMessage: oldMessage,
                    checkRule: checkRule,
                    checkValue: '',
                    errorType: -1
                });
            });

        }

        // 数据转换
        let replaceArr = this.task.cleanList.filter(s => s.jobId === this.uuid && s.moduleType === 'transfer');
        if (replaceArr.length) {
            replaceArr.forEach(item => {
                let config = JSON.parse(item.configAttr) || {};

                let temp = {
                    oldMessage: {
                        fieldName: config.sourceFieldName,
                        dataType: config.sourceFieldType
                    },
                    replaceRule: null,
                    replaceVal: null,
                    enums: [],
                    replaceValue: null,
                    errorType: -1,
                    outputField: config.targetFieldName
                };

                // 替换类型
                this.replaceRules.forEach(rule => {
                     if (rule.value === config.changeType) {
                         temp.replaceRule = rule;
                     }
                });

                if (this.toolService.contains(temp.replaceRule.value, ['fixed', 'merge', 'modulo', 'reverse', 'multi', 'express3'])) {
                    temp.replaceVal = config.changeValue;
                } else if (temp.replaceRule.value === 'enum') {
                    temp.enums.push({
                        id: config.changeValue,
                        menuName: config.changeName,
                    });
                } else if (temp.replaceRule.value === 'replaceEmpty') {
                    temp.replaceVal = config.changeValue;
                    temp.replaceValue = config.replaceValue;
                } else if (temp.replaceRule.value === 'random') {
                    temp.replaceVal = config.min;
                    temp.replaceValue = config.max;
                } else if (temp.replaceRule.value === 'toggleCase') {
                    this.toggleCases.forEach(t => {
                        if (t.value === config.type) {
                            temp.replaceVal = t;
                        }
                    });
                }

                this.replaceFieldData.push(temp);
            });
        }
    }
    /**
     * parent 组件自动调用，在该组件被切换显示出来的时候
     */
    onShow() {

    }

    /**
     * 初始化数据采集信息
     */
    initCollection() {
        // 确定数据清洗类型
        if (this.toolService.contains(this.moduleNumber, [20001, 20002, 20003, 20004, 20005])) {
            this.dataCleanType = DataCleanEnum.CHECK;
        } else if (this.toolService.contains(this.moduleNumber, [30001, 30002, 30003, 30005, 30006, 30007, 30008, 30009, 30010])) {
            this.dataCleanType = DataCleanEnum.CHANGE;
        }

        // 第一步 获取汇聚连线
        let datasync = this.parent.getContentByType('datasync');
        let connections = datasync.instance.dragTargetOption.connections;
        let sources = connections.filter(c => c.targetUuid === this.uuid);

        // 从连线里拿到组价信息并获取组件数据
        sources.forEach(s => {
            let component = this.parent.getContentByUuid(s.sourceUuid);
            if (component) {
                let temp = JSON.parse(JSON.stringify(component.instance.getOriginDatas())); // 调用上级组件的固定方法 返回上级组件原始信息
                this.inputs = temp.inputs;
                this.sourceFiles = temp.sourceFiles;
            }
        });
    }

    /**
     * 根据类型 添加新的行
     * @param {string} type 添加类型
     */
    addRowClick(type: string) {
        switch (type) {
            case DataCleanEnum.CHECK:
                let checkRule, oldMessage;
                if (this.moduleNumber === 20001) {
                    oldMessage = {fieldName: '', dataType: ''};
                    checkRule = {name: '空值过滤', value: 'empty'};
                } else if (this.moduleNumber === 20002) {
                    oldMessage = {fieldName: '', dataType: ''};
                    checkRule = {name: '非空过滤', value: 'noEmpty'};
                } else if (this.moduleNumber === 20003) {
                    oldMessage = {fieldName: '', dataType: ''};
                    checkRule = {name: '固定值过滤', value: 'fixed'};
                } else if (this.moduleNumber === 20004) {
                    oldMessage = {fieldName: '', dataType: ''};
                    checkRule = {name: '正则过滤', value: 'regExp'};
                } else if (this.moduleNumber === 20005) {
                    oldMessage = [];
                    checkRule = {name: '去重过滤', value: 'removeRepeat'};
                }

                this.checkFieldData.push({
                    oldMessage: oldMessage,
                    checkRule: checkRule,
                    checkValue: '',
                    errorType: -1
                });
                break;
            case DataCleanEnum.CHANGE:
                let replaceRule;
                if (this.moduleNumber === 30001) {
                    replaceRule = {name: '空值转换', value: 'replaceEmpty'};
                } else if (this.moduleNumber === 30002) {
                    replaceRule = {name: '固定值转换', value: 'fixed'};
                } else if (this.moduleNumber === 30003) {
                    replaceRule = {name: '随机值转换', value: 'random'};
                } else if (this.moduleNumber === 30004) {
                    replaceRule = {name: '拼接转换', value: 'merge'};
                } else if (this.moduleNumber === 30005) {
                    replaceRule = {name: 'Sql取模', value: 'modulo'};
                } else if (this.moduleNumber === 30006) {
                    replaceRule = {name: '大小写转换', value: 'toggleCase'};
                } else if (this.moduleNumber === 30007) {
                    replaceRule = {name: '逆序转换', value: 'reverse'};
                } else if (this.moduleNumber === 30008) {
                    replaceRule = {name: '多元计算', value: 'multi'};
                } else if (this.moduleNumber === 30009) {
                    replaceRule = {name: '三元表达式', value: 'express3'};
                } else if (this.moduleNumber === 30010) {
                    replaceRule = {name: '枚举转换', value: 'enum'};
                }
                this.replaceFieldData.push({
                    oldMessage: {fieldName: '', dataType: ''},
                    replaceVal: null,
                    replaceRule: replaceRule,
                    enums: [],
                    replaceValue: null,
                    outputField: null,
                    errorType: -1
                }) ;
                break;
        }

        this.markupUpdating();
    }

    /**
     * 原字段的选择
     */
    sourceFileChecked(file: any) {
        switch (file.type) {
            case 'checkFile':
                if (this.checkFieldData[file.index].checkRule.value !== 'removeRepeat') {
                    this.checkFieldData[file.index].oldMessage['fieldName'] = file.checked.fieldName;
                    this.checkFieldData[file.index].oldMessage['dataType'] = file.checked.dataType;
                }  else if (this.checkFieldData[file.index].checkRule.value === 'removeRepeat') {

                }
                break;
            case 'checkRule':
                this.checkFieldData[file.index].checkRule = file.checked;
                break;
            case 'changeField':
                this.replaceFieldData[file.index].oldMessage['fieldName'] = file.checked.fieldName;
                this.replaceFieldData[file.index].oldMessage['dataType'] = file.checked.dataType;
                break;
            case 'changeRule':
                this.replaceFieldData[file.index]['replaceRule'] = file.checked;
                break;
            case 'toggleCase':
                this.replaceFieldData[file.index]['replaceVal'] = file.checked;
                break;
        }

        this.markupUpdating();
    }

    /**
     * 删除各类型数据的指定行
     */
    deleteField(i, deleteType) {
        switch (deleteType) {
            case DataCleanEnum.CHECK:
                this.checkFieldData.splice(i, 1);
                break;
            case DataCleanEnum.CHANGE:
                this.replaceFieldData.splice(i, 1);
                break;
        }

        this.markupUpdating();
    }

    /**
     * 数据检查
     */
    dataCheck() {
        let i, success;

        // 过滤检查
        for (i = 0; i < this.checkFieldData.length; i++) {
            this.checkFieldData[i].errorType = -1;
            success = true;

            if (this.checkFieldData[i].checkRule.value !== 'removeRepeat') {
                // 非去重操作
                if (!this.checkFieldData[i].oldMessage || !this.checkFieldData[i].oldMessage.fieldName) {
                    this.checkFieldData[i].errorType = 1;
                    success = false;
                }
            } else {
                // 去重操作
                if (!this.checkFieldData[i].oldMessage.length) {
                    this.checkFieldData[i].errorType = 1;
                    success = false;
                }
            }

            if (!this.checkFieldData[i].checkRule || !this.checkFieldData[i].checkRule.name) {
                this.checkFieldData[i].errorType = 2;
                success = false;
            } else if (this.checkFieldData[i].checkRule.value === 'fixed' || this.checkFieldData[i].checkRule.value === 'regExp') {
                if (!this.checkFieldData[i].checkValue || this.checkFieldData[i].checkValue === '') {
                    this.checkFieldData[i].errorType = 3;
                    success = false;
                }
            } else if (this.checkFieldData[i].checkRule.value === 'replaceEmpty') {
                if (!this.checkFieldData[i].checkValue || this.checkFieldData[i].checkValue === '') {
                    this.checkFieldData[i].errorType = 4;
                    success = false;
                }
            }

            if (!success) {
                return;
            }
        }

        // 转换检查
        for (i = 0; i < this.replaceFieldData.length; i++) {
            this.replaceFieldData[i].errorType = -1;
            success = true;

            if (!this.replaceFieldData[i].oldMessage || !this.replaceFieldData[i].oldMessage.fieldName) {
                this.replaceFieldData[i].errorType = 1;
                success = false;
            } else if (!this.replaceFieldData[i].replaceRule) {
                this.replaceFieldData[i].errorType = 2;
                success = false;
            } else if (this.replaceFieldData[i].replaceRule.value === 'fixed' || this.replaceFieldData[i].replaceRule.value === 'express3') {
                if (!this.replaceFieldData[i].replaceVal) {
                    this.replaceFieldData[i].errorType = 3;
                    success = false;
                }
            } else if (this.replaceFieldData[i].replaceRule.value === 'enum') {
                if (!this.replaceFieldData[i].enums || this.replaceFieldData[i].enums.length <= 0) {
                    this.replaceFieldData[i].errorType = 4;
                    success = false;
                }
            } else if (this.replaceFieldData[i].replaceRule.value === 'replaceEmpty') {
                if (!this.replaceFieldData[i].replaceVal) {
                    this.replaceFieldData[i].errorType = 5;
                    success = false;
                }
                if (!this.replaceFieldData[i].replaceValue) {
                    this.replaceFieldData[i].errorType = 6;
                    success = false;
                }
            }

            if (!success) {
                return;
            }
        }

        return true;
    }

    /**
     * 标记画布被修改
     */
    markupUpdating() {
        this.task.updating = true;
    }

    /**
     * 显示知识库树形目录
     * @param fields
     */
    showKnowladgeTree(fields) {
        let [ins] = this.modalService.toolOpen({
            title: '选择知识库',
            component: TaskConfigContentDatasyncCleanKnowledgeComponent,
            datas: {
                enums: fields.enums
            },
            okCallback: () => {
                let tress = ins.okClick();
                fields.enums.length = 0;
                tress.forEach(t => {
                    fields.enums.push({
                        id: t.id,
                        menuName: t.menuName
                    });
                });

                ins.hideInstance();
                this.markupUpdating();
            }
        } as ToolOpenOptions);
    }

    /**
     * 获取枚举转换的显示值
     * @param fields
     * @returns {string}   static 静态属性 调用方法调用不到
     */
    getEnumValue(fields: any) {
        return fields.enums.map(e => e.menuName).join(',');
    }

    /**
     * 展开规则选择框
     * @param fields
     * @param {string} type
     */
    ruleClick(fields: any, type: string) {
        let [ins] = this.modalService.toolOpen({
            title: '选择规则',
            component: TaskConfigContentDatasyncCleanRuleComponent,
            okCallback: () => {
                let cons = ins.contents.filter(c => c.checked);
                if (cons && cons.length) {
                    if (type === DataCleanEnum.CHECK) {
                        fields.checkValue = cons[0].content;
                    }
                }

                ins.hideInstance();
                this.markupUpdating();
            }
        } as ToolOpenOptions);
    }

    /**
     * 由其他组件调用，当其他组件改变了输入源的时候
     */
    impactCallback() {
        this.checkFieldData.length = 0;
        this.replaceFieldData.length = 0;

        // 重载自己的输入数据
        this.initCollection();
        // 通知受自己影响的组件
        this.impactTrigger();
    }

    /**
     * 触发影响回调
     */
    impactTrigger() {
        this.impacts.forEach(uuid => {
            let component = this.parent.getContentByUuid(uuid);
            if (component) {
                component.instance.impactCallback && component.instance.impactCallback();
            }
        });
    }

    /**
     * 编辑模式切换
     * @param type
     * @param {EditModeEnum} mode
     */
    editModeClick(type: any, mode: EditModeEnum) {
        if (this.editMode !== mode) {
            this.editMode = mode;

            if (this.editMode === EditModeEnum.TEXT) {
                // 格式化
                if (this.dataCleanType === DataCleanEnum.CHECK) {
                    this.editModeText = this.encodeEditModeText(this.checkFieldData);
                } else if (this.dataCleanType === DataCleanEnum.CHANGE) {
                    this.editModeText = this.encodeEditModeText(this.replaceFieldData);
                }
            } else {
                // 还原
                if (this.dataCleanType === DataCleanEnum.CHECK) {
                    this.checkFieldData = this.decodeEditModeText(this.editModeText);
                } else if (this.dataCleanType === DataCleanEnum.CHANGE) {
                    this.replaceFieldData = this.decodeEditModeText(this.editModeText);
                }
            }
        }
    }

    /**
     * 格式化显示JSON对象
     * @param arr
     * @returns {number}
     */
    encodeEditModeText(arr: any) {
        let temp = ['[\n'];
        arr.forEach((a, i) => {
            temp.push('  ' + JSON.stringify(a));
            if (i !== arr.length - 1) {
                temp.push(',\n');
            }
        });
        temp.push('\n]');

        return temp.join('');
    }

    /**
     * 还原编辑模式
     * @param {string} str
     * @returns {any}
     */
    decodeEditModeText(str: string) {
        str = str.replace(/[\n]/g, '').replace(/\s+/g, '');

        let temp;
        try {
            temp = JSON.parse(str);
        } catch (e) {
            this.modalService.alert('JSON还原出错');
        }

        return temp;
    }

    /**
     * 返回画布页面
     */
    backClick() {
        this.parent.backDatasync();
    }

    /**
     * 获取输入源的nickname
     */
    getSourcesNickname() {
        let datasync = this.parent.getContentByType('datasync');
        let connections = datasync.instance.dragTargetOption.connections;
        let elements = datasync.instance.dragTargetOption.elements;
        let cons = connections.filter(c => c.targetUuid === this.uuid);

        let nickname = '', find = false;
        while (cons.length && !find) {
            let uuid = cons[0].sourceUuid;
            elements.forEach(e => {
                if (e.uuid === uuid && e.nickname) {
                    nickname = e.nickname;
                    find = true;
                }
            });
            if (!find) {
                cons = connections.filter(c => c.targetUuid === uuid);
            }
        }

        return nickname;
    }

    /**
     * 组合自定义输出字段 当前组件的自定义字段是下一个组件的输入字段
     */
    outputFilesBlur() {
        // 通知受自己影响的组件
        this.impactTrigger();
    }

    /**
     * 返回向下个组件传递的原始数据
     * @returns {{gatherBankType: any; gatherSource: any; gatherSourceTable: any; sourceFiles}}
     */
    getOriginDatas() {
        let sourceOutputFiles = [];
        // 转换类型的时候 需要判定新增输出字段
        if (this.toolService.contains(this.moduleNumber, [30001, 30002, 30003, 30005, 30006, 30007, 30008, 30009, 30010])) {
            this.replaceFieldData.forEach(field => {
                if (field.outputField) {
                    // 去重
                    let find = this.sourceFiles.filter(r => {
                        return r.fieldName === field.outputField;
                    });
                    if (!find.length) {
                        sourceOutputFiles.push({
                            fieldName: field.outputField,
                            dataType: 'string'
                        });
                    }
                }
            });
        }

        return {
            inputs: this.inputs,
            sourceFiles: this.sourceFiles.concat(sourceOutputFiles)
        };
    }

}



