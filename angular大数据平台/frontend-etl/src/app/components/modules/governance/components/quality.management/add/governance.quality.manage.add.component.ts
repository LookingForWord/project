import {Component, OnInit} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

@Component({
    selector: 'governance-quality-manage-add-component',
    templateUrl: './governance.quality.manage.add.component.html',
    styleUrls: ['./governance.quality.manage.add.component.scss']
})
export class GovernanceQualityManageAddComponent implements OnInit {
    rule: any;          // 运行规则
    fieldData = [];     // 规则配置集合
    ruleList: any;      // 规则集合
    ruleParams = [];    // 对应规则下的详细集合
    sourceType: any;    // 数据类型选中项
    sourceTypes: any;   // 数据类型集合
    sourceName: any;    // 数据源名称选中项
    sourceNames: any;   // 数据源名称集合
    sourceTable: any;   // 表当前选中项
    sourceTables: any;  // 表集合
    errorType: any;
    error: any;
    status: any;        // edit编辑，add新增
    present: any;       // 当前table列表项
    objectId: any;      // 配置Id
    constructor(private governanceService: GovernanceService,
                private modalService: ModalService) {

    }

    ngOnInit() {
        // 获取所有规则
        let sources = this.getAllRule();
        if (this.status === 'add') {
            // 获取数据源类型集合
            this.getSourceType();
        } else if (this.status === 'edit') {
            this.governanceService.getFormDetail({id: this.present.id}).then(d => {
               if (d.success && d.message) {
                   this.objectId = d.message.objectId;
                   if (d.message.checkConfigs) {
                       let arr = [];
                       d.message.checkConfigs.forEach(item => {
                           arr.push({
                               type: {
                                   name: item.ruleNamecn,
                                   id: item.id,
                                   ruleParams: (item.checkParams ? JSON.parse(item.checkParams) : []),
                                   funcId: item.funcId,
                                   funcName: item.funcName
                               },         // 检查规则当前选中项
                               errorType: -1,                  // 错误类型
                               ruleList: this.ruleList,        // 所有规则
                               index: -1,
                               id:  item.id,
                               error: ''
                           });
                           this.fieldData = arr;
                       });
                   }
               }
            });

        }

    }

    /**
     * 获取数据源类型
     */
    getSourceType() {
        this.governanceService.getSourcsType().then(d => {
            if (d.success) {
                let arr = [];
                d.message.forEach(item => {
                    arr.push({value: item.rowCode, name: item.rowName});
                });
                this.sourceTypes = arr;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 数据源类型  数据源选中
     */
    sourceAnalysis(value, type) {
        this[type] = value;
        if (type === 'sourceType') {
            this.sourceName = null;
            this.sourceTables = [];
            this.governanceService.getDataSourceMenus({dsType: this.sourceType.value}).then(d => {
                if (d.success) {
                    let arr = [];
                    d.message.forEach(item => {
                        arr.push({value: item.id, name: item.dsName});
                    });
                    this.sourceNames = arr;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (type === 'sourceName') {
            this.sourceTables = [];
            this.governanceService.getSourceTables({id: this.sourceName.value}).then(d => {
                if (d.success) {
                    let arr = [];
                    d.message && d.message.forEach(table => {
                       arr.push({
                           value: table.id,
                           name: table.tableName
                       });
                    });
                    this.sourceTables = arr;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
    }

    /**
     * 表选中
     */
    tableCheck (value) {
        this.sourceTable = value;
    }

    /**
     * 获取所有规则
     */
    async getAllRule() {
        let d = await this.governanceService.getAllRuleList({actOn: 'metadata'});
        if (d.success && d.message && d.message.length > 0) {
            let arr = [];
            d.message.forEach(item => {
                arr.push({
                    name: item.ruleNamecn,
                    ruleParams: (item.ruleParams ? JSON.parse(item.ruleParams) : []),
                    id: item.id,
                    funcId: item.funcId,
                    funcName: item.funcName
                });
            });
            this.ruleList = arr;
            return this.ruleList;
        }
    }

    /**
     * 添加规则
     */
    addField() {
        if (!this.ruleList || this.ruleList.length === 0) {
            this.modalService.alert('请先在规则库中添加规则');
            return;
        }
        this.fieldData.push({
            type: {name: ''},         // 检查规则当前选中项
            errorType: -1,                  // 错误类型
            ruleList: this.ruleList,        // 所有规则
            index: -1,                      // 错误的横向位置位置
            id: '',
            error: ''
        });
    }

    /**
     * 规则选中
     * @param value
     * @param index
     */
    fieldTypesChecked(present, index) {
        for (let i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].type.name === present.checked.name) {
                this.fieldData[index].errorType = 1;
                this.fieldData[index].error = '请勿重复选择规则';
                return;
            }
        }
        this.fieldData[index].type = present.checked;
        this.fieldData[index].errorType = -1;
        this.fieldData[index].error = '';
    }

    /**
     * 内部详细规则选择
     */
    choose(option, item) {
        let obj = JSON.parse(JSON.stringify(option));
        delete obj['checked'];
        item.inputValue = JSON.stringify(obj);
    }

    /**
     * 下拉框转换
     */
    changeValue(checked, options) {
        let present = {};
        options.forEach(option => {
            if (String(option.value) === String(JSON.parse(checked).value)) {
                present = option;
            }
        });
        return present;
    }

    /**
     *刪除规则
     */
    deleteField(i) {
        this.fieldData.splice(i, 1);
    }

    /**
     * 保存按钮
     */
    saveClick () {
        if (this.status === 'add') {
            if (!this.sourceType) {
                this.errorType = 1;
                return;
            }
            if (!this.sourceName) {
                this.errorType = 2;
                return;
            }
            if (!this.sourceTable) {
                this.errorType = 3;
                return;
            }
            this.errorType = -1;
        }
        let arr = [];
        let result = true;
        if (!this.fieldData || this.fieldData.length === 0) {
            this.modalService.alert('请添加规则');
            return;
        }
        this.fieldData.map(item => {
            if (!item.type || !item.type.name) {
                result = false;
                item.errorType = 1;
                item.error = '请选择规则';
                return;
            }
            item.type.ruleParams && item.type.ruleParams.forEach((param, index) => {
               if ((param.inputType === 'input' || !param.inputType) && param.inputParam === '') {
                   if (!RegExgConstant.positiveInterger.test(param.inputValue)) {
                       result = false;
                       item.index = index;
                       item.errorType = 2;
                   }
                   if (result && index < 1 && Number(item.type.ruleParams[index].inputValue) > Number(item.type.ruleParams[index + 1].inputValue)) {
                       result = false;
                       item.index = index;
                       item.errorType = 3;
                   }
               } else {
                   if (!param.inputValue) {
                       result = false;
                       item.index = index;
                       item.errorType = 4;
                   }
               }
            });
        });
        if (!result) {
            return;
        }
        // 调用接口入参 fieldData
        let params = [];
        this.fieldData.forEach(item => {
            item.errorType = -1;
            item.error = '';
            params.push({
                funcId: item.type.funcId,
                funcName: item.type.name,
                id: (this.status === 'edit' ? item.id : null),
                ruleNamecn: item.type.name,
                checkParams: item.type.ruleParams,
           });
        });
        if (this.status === 'add') {
            this.governanceService.buildCheck({
                objectId: (this.sourceTable ? this.sourceTable.value : this.objectId),
                checkConfigs: params
            }).then(d => {
                if (d.success) {
                    this.refreshList();
                    this.hideInstance();
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (this.status === 'edit') {
            this.governanceService.editCheck({
                objectId: (this.sourceTable ? this.sourceTable.value : this.objectId),
                checkConfigs: params
            }).then(d => {
                if (d.success) {
                    this.refreshList();
                    this.hideInstance();
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }

    }

    hideInstance: Function;
    refreshList: Function;
}
