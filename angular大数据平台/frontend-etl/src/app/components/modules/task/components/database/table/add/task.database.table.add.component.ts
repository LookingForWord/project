/**
 * Created by lh on 2017/12/16.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {RepositoryService} from 'app/services/repository.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {ActivatedRoute, Router} from '@angular/router';
import {TaskDatabaseTableAddFieldComponent} from 'app/components/modules/task/components/database/table/add/field/task.database.table.add.field.component';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

export class FieldData {
    clName: string;             // 字段名称
    dataType: any;                  // 字段类型
    content: string;            // 字段描述
    length: any;                // 字段长度
    scale: any;           // 字段精度
    errorType: number;          // 单行错误类型
    hasFieldLength: boolean;    // 是否有字段长度
    hasFieldPrecision: boolean; // 是否有字段精度
    nullCheck: any;             // 是否允许空值选中
    radio: any;                 // 当前行单选按钮是否选中,
    defValue: any;              // 非hive时的字段默认值，
    requiredLength: any;        // 长度是否必填
}
export class Partition {
    partionName: string; // 分区名称
    type: any;           // 分区类型
    errorType: number;   // 单行错误类型
}

@Component({
    selector: 'task-database-table-add-component',
    templateUrl: './task.database.table.add.component.html',
    styleUrls: ['./task.database.table.add.component.scss']
})
export class TaskDatabaseTableAddComponent implements OnInit, OnDestroy {
    error: string;
    errorType: number;

    action: any;                // 页面前的操作 add为 表添加 ，info为查看表详情
    page: any;                  // 查看详情前的页面
    tableId: string;            // 要查看详情的表格的id

    databaseType: string;     // 数据表所属的数据仓库类型
    databaseName: string;     // 数据表所属的数据仓库类型
    dbID: string;             // 数据仓库ID
    isHive = false;           //
    companyName: string;      // 公司简称
    systemName = '';          // 系统名称
    originalTable = '';       // 原始表名称
    tableName: string;        // 表名
    chineseName: string;

    tableBlongTag: any;       // 表所属标签
    basicInformation = true;  // 基础信息显示控制
    fieldInformation = false; // 字段信息和分区信息显示控制
    successWeb = false;       // 成功提示页显示控制
    tableBlongTags = [{        // 表所属标签列表
        name: 'hive',
        value: 'hive'
    }, {
        name: 'odps',
        value: 'odps'
    }, {
        name: 'oracle',
        value: 'oracle'
    }];

    externalTableIs =  '';        // 是否为外部表
    storageUrl: any;           // 存储路径
    tableDescription: string;     // Hive表描述
    extra: any;

    fieldData: Array<FieldData>;  // 字段信息集合
    fieldTypes: any;              // 字段类型
    hasFieldLength = false;       // 是否有字段长度
    hasFieldPrecision = false;    // 是否有字段精度
    nullValues = [{name: '允许', value: 'Y'}, {name: '不允许', value: 'N'}];

    partitions: Array<Partition>; // 分区信息集合
    partitionTypes = [            // 分区类型列表
        {
            name: 'float',
            value: 'float'
        }, {
            name: 'double',
            value: 'double'
        }, {
            name: 'string',
            value: 'string'
        }, {
            name: 'int',
            value: 'int'
        }, {
            name: 'tinyint',
            value: 'tinyint'
        }, {
            name: 'smallint',
            value: 'smallint'
        }, {
            name: 'bigint',
            value: 'bigint'
        }, {
            name: 'boolean',
            value: 'boolean'
        }];
    pIns: any;       // 父模态框引用

    Delimiter: any;  // 分隔符
    Delimiters = [{
        name: '\\u0001',
        value: '\\u0001'
    }, {
        name: '\\u0002',
        value: '\\u0002'
    }, {
        name: '\\u0003',
        value: '\\u0003'
    }];

    // 存储格式
    storedFormat: any;  // 存储格式
    storedFormats = [
        {
            name: 'TEXTFILE',
            value: 'TEXTFILE'
        }, {
            name: 'ORC',
            value: 'ORC'
        }, {
            name: 'PARQUET ',
            value: 'PARQUET '
        }
    ];
    sub: any;
    databaseId: string;
    pageNow: any;
    fields: any;
    unsubscribes = [];

    constructor(private repositoryService: RepositoryService,
                private modalService: ModalService,
                private datatransferService: DatatransferService,
                private  router: Router,
                private  route: ActivatedRoute,
                private validateService: ValidateService) {
        this.route.queryParams.subscribe(params => {
            if (params && params['id']) {
                this.databaseId = params['id'];
                this.pageNow = params['pageNow'] || 1 ;
                this.databaseType = params['type'];
                this.databaseName = params['dsName'];
                this.action = params['action'];
                this.page = params['pageNow'];
                this.tableId = params['tableid'];
            }
        });

        // 选中表名获取字段信息
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.databaseCreateTableGetFields.subscribe(data => {
            // this.fieldData = data;
            let fieldData = [];
            data.forEach( item => {
                let obj = {
                    clName: item['fieldName'],                                     // 名称
                    dataType: {name: item['dataType'], value: item['dataType']},           // 字段类型
                    content: item['fieldComment'],                                        // 备注描述
                    length: item['length'],                                        // 字段长度
                    scale: (item['scale'] || ''),                    // 精度
                    nullCheck: (item['isnullable'] === 'N' ? {name: '不允许', value: 'N'} : {name: '允许', value: 'Y'}),   // 是否允许空值选中
                    radio: (item['primaryKey'] === 'Y' ? true : false),
                    errorType: -1,
                    defValue: item['defValue'],
                    hasFieldLength: false,              // 是否有字段长度
                    hasFieldPrecision: false,           // 是否有字段精度
                    requiredLength: false,
                    ordinalPosition: item.ordinalPosition
                };
                this.fieldTypesChecked({type: 'field'}, obj , 'import');
                fieldData.push(obj);
            });
            fieldData.sort(this.compare('ordinalPosition'));
            this.fieldData = fieldData;
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
        }
    }

    ngOnInit() {
        this.fieldData = [];
        this.partitions = [];
        this.getFieldType();
        this.checkHive();
        if (this.action === 'info') {
            this.repositoryService.getTableDetial({id: this.tableId}).then(d => {
                if (d.success && d.message) {
                    this.chineseName = d.message.tableComment;
                    this.tableName = d.message.tableName;
                    this.fieldData = d.message.fields;

                    if (d.message.extra && d.message.extra !== '{}') {
                        let obj = JSON.parse(d.message.extra);
                        this.Delimiter = this.Delimiters.filter(item => {
                            return item.value === obj.fieldDelimiter;
                        })[0]  || {name: obj.fieldDelimiter, value: obj.fieldDelimiter} || this.Delimiters[0];

                        this.storedFormat = this.storedFormats.filter(item => {
                            return item.value === obj.storeAs;
                        })[0] || this.storedFormats[0];

                    } else {
                        this.tableBlongTag = this.tableBlongTags[0];
                        this.Delimiter = this.Delimiters[0];
                        this.storedFormat = this.storedFormats[0];
                    }

                    let fieldData = [];
                    this.fieldData.forEach(item => {
                        let clName = '';
                        if (this.databaseType === 'oracle') {
                            // 防止后端传回的数据带中引文引号的情况
                            clName = ('"' + item['fieldName'].replace(/\"|\“|\”/g, '') + '"');
                        } else {
                            clName = item['fieldName'];
                        }
                        let obj = {
                            clName: clName,                                     // 名称
                            dataType: {name: item['dataType'], value: item['dataType']},           // 字段类型
                            content: item['fieldComment'],                                        // 备注描述
                            length: item['length'],                                        // 字段长度
                            scale: (item['scale'] || ''),                    // 精度
                            nullCheck: (item['isnullable'] === 'N' ? {name: '不允许', value: 'N'} : {name: '允许', value: 'Y'}),   // 是否允许空值选中
                            radio: (item['primaryKey'] === 'Y'),
                            errorType: -1,
                            defValue: item['defValue'],
                            hasFieldLength: (item['length']),              // 是否有字段长度
                            hasFieldPrecision: (item['scale']),           // 是否有字段精度
                        };
                        this.fieldTypesChecked({type: 'field'}, obj , 'info');
                        fieldData.push(obj);
                    });
                    this.fieldData = fieldData;
                }
            });
        } else {
            this.tableBlongTag = this.tableBlongTags[0];
            this.Delimiter = this.Delimiters[0];
            this.storedFormat = this.storedFormats[0];
        }
    }

    /**
     *  导入字段按position排序
     */
     compare (property: any) {
        return function(a, b) {
            let value1 = a[property];
            let  value2 = b[property];
            return value1 - value2;
        };
    }

    /**
     * 获取字段类型列表
     */
    getFieldType() {
        this.repositoryService.getAllFileType()
            .then(d => {
                if (d.success) {
                    d.message.forEach( type => {
                        if (type.rowCode === this.databaseType) {
                            let types = type.extParams.split(',');
                            let fieldType = [];
                            if (types) {
                                types.forEach( name => {
                                    fieldType.push({
                                        name: name,
                                        value: name,
                                    });
                                } );
                                this.fieldTypes = fieldType;
                            }
                        }
                    });
                } else {
                    this.modalService.alert(d.message);
                }
            });
    }

    /**
     * 判断数据表所属的数据仓库类型是否属于hive
     */
    checkHive() {
        this.isHive = this.databaseType === 'hive';
    }

    /**
     * 清空外部表链接字段
     */
    clearStorageUrl(type) {
        if (type === 0) {
            this.storageUrl = '';
        }
    }


    // /**
    //  * 获取字段类型列表
    //  */
    // getFieldType() {
    //     this.repositoryService.getAllDict('w_mysql_column_type')
    //         .then(d => {
    //         if (d.success) {
    //             this.fieldTypes = d.message;
    //         } else {
    //             this.modalService.alert(d.message);
    //         }
    //     });
    // }

    getTables() {
        let [ins, pIns] = this.modalService.open(TaskDatabaseTableAddFieldComponent, {
            title: '导入字段',
            backdrop : 'static'
        });

        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                ins.cancelClick();
            }
        }]);
        ins.databaseType = this.databaseType;
        ins.cancelClick = () => {
            ins.destroy();
        };

        ins.hideInstance = () => {
            ins.destroy();
        };
    }

    /**
     * 添加字段
     */
    addField() {
        this.fieldData.push({
            clName: '',
            dataType: {value: '', id: ''},
            content: '',
            length: '',
            scale: '',
            nullCheck: {name: '允许', value: 'Y'},           // 是否允许空值选中  默认允许
            radio: false,
            defValue: '',
            errorType: -1,
            hasFieldLength: false,      // 是否有字段长度
            hasFieldPrecision: false,
            requiredLength: false
        });
    }

    /**
     * 添加分区
     */
    addPartition() {
        this.partitions.push({
            partionName: '',
            type: null,
            errorType: -1
        });
    }

    /**
     *刪除字段信息
     */
    deleteField(i) {
        this.fieldData.splice(i, 1);
    }

    /**
     *刪除分区信息
     */
    deletePartition(i) {
        this.partitions.splice(i, 1);
    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;
        let i, success;
        let validate;
        if (RegExgConstant.regEn.test(this.tableName) || RegExgConstant.regCn.test(this.tableName)) {
            this.errorType = 1;
            this.error = '表名不能包含特殊字符';
            return;
        }
        validate = this.validateService.get(this, this.getValidateObject(),
            ['tableName']);
        // 存储路径的验证

        if (this.isHive) {
            if (this.externalTableIs !== '') {
                validate = this.validateService.get(this, this.getValidateObject(),
                    ['tableName', 'storageUrl']);
            }
        }
        if (validate) {
            this.error = validate['error'];
            this.errorType = validate['errorType'];
            return false;
        }
        // 字段信息和分区信息的验证
        if (this.fieldData) {

            // 字段信息的验证
            for (i = 0; i < this.fieldData.length; i++) {
                this.fieldData[i].errorType = -1;
                success = true;
                // 字段名校验
                if (!this.fieldData[i].clName || this.fieldData[i].clName === '') {
                    this.fieldData[i].errorType = 5;
                    success = false;
                    return;
                }
                // 字段名格式校验
                if (!RegExgConstant.numberAlphabet.test(this.fieldData[i].clName)) {

                    this.fieldData[i].errorType = 1;
                    success = false;
                    return;
                }
                // 字段类型校验
                if (!this.fieldData[i].dataType || this.fieldData[i].dataType.value === '') {
                    this.fieldData[i].errorType = 2;
                    success = false;
                    return;
                }

                // // 长度必填的话
                // if (this.fieldData[i].requiredLength && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                //     this.fieldData[i].errorType = 3;
                //     return;
                // }
                // // 精度校验
                // if (this.fieldData[i].requiredLength && this.fieldData[i].hasFieldPrecision && this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                //     this.fieldData[i].errorType = 4;
                //     return;
                // }

                // 长度选填   填了长度的话校验字段长度
                if (!this.fieldData[i].requiredLength && this.fieldData[i].hasFieldLength && this.fieldData[i].length && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                    this.fieldData[i].errorType = 3;
                    success = false;
                    return;
                }
                // 填了精度  精度校验
                if (this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                    this.fieldData[i].errorType = 4;
                    success = false;
                    return;
                }
                // 填了精度就必须填长度    精度必须依赖于长度
                if (this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                    this.fieldData[i].errorType = 3;
                    success = false;
                    return;
                }

                // 长度必填的话
                if (this.fieldData[i].requiredLength && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                    this.fieldData[i].errorType = 3;
                    success = false;
                    return;
                }
                // 精度校验
                if (this.fieldData[i].requiredLength && this.fieldData[i].hasFieldPrecision && this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                    this.fieldData[i].errorType = 4;
                    success = false;
                    return;
                }
                if ( this.fieldData[i].length < this.fieldData[i].scale) {
                    this.fieldData[i].errorType = 8;
                    success = false;
                    return;
                }

                // 当数据仓库类型不为hive时才需要验证字段长度和精度
                if (this.databaseType !== 'hive') {
                    // 长度必填的话
                    if (this.fieldData[i].requiredLength && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                        this.fieldData[i].errorType = 3;
                        success = false;
                        return;
                    }
                    // if (this.fieldData[i].hasFieldLength) {
                    //     if (!this.fieldData[i].length || this.fieldData[i].length === '' || !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                    //         this.fieldData[i].errorType = 6;
                    //         success = false;
                    //         return;
                    //     } else  {
                    //         if (this.fieldData[i].hasFieldPrecision) {
                    //             if (!this.fieldData[i].scale || this.fieldData[i].scale === '' || !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                    //                 this.fieldData[i].errorType = 7;
                    //                 success = false;
                    //                 return;
                    //             }
                    //         }
                    //     }
                    // }
                    // else {
                    //     if (this.fieldData[i].hasFieldPrecision) {
                    //         if (!this.fieldData[i].scale || this.fieldData[i].scale === '' || !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                    //             this.fieldData[i].errorType = 4;
                    //             success = false;
                    //             return;
                    //         }
                    //     }
                    // }
                    // 是否允许空值
                    if (!this.fieldData[i].nullCheck.value) {
                        this.fieldData[i].errorType = 6;
                        success = false;
                        return;
                    }
                    // 主键
                    if (this.fieldData[i].radio && this.fieldData[i].nullCheck.value !== 'N') {
                        this.fieldData[i].errorType = 7;
                        success = false;
                        return;
                    }

                }

                if (!success) {
                    return;
                }
            }

            // 分区信息的验证
            // for (i = 0; i < this.partitions.length; i++) {
            //     this.partitions[i].errorType = -1;
            //     success = true;
            //     if (!this.partitions[i].partionName || this.partitions[i].partionName === '' ) {
            //         this.partitions[i].errorType = 1;
            //         success = false;
            //     } else if (!this.partitions[i].type || this.partitions[i].type.value === '') {
            //         this.partitions[i].errorType = 2;
            //         success = false;
            //     }
            //
            //     if (!success) {
            //
            //         return;
            //     }
            // }
        }
        return true;
    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            tableName: {
                presence: { message: '^表名不能为空', allowEmpty: false},
                length: {maximum: 40, message: '^表名长度最大为40个字符', allowEmpty: false},
                reg: {format: RegExgConstant.numberAlphabet, message: '^请输入正确的表名'},
                errorType: 1
            },
            storageUrl: {
                presence: { message: '^请填写存储路径', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^请正确填写存储路径'},
                errorType: 2
            }
        };
    }

    /**
     * 创建Hive表
     */
    addTable() {
        if (!this.check()) {
            return;
        }
        if (this.fieldData.length) {
            let fields = [];
            this.fieldData.forEach((item, index) => {
                fields.push({
                    fieldName: item.clName,                                              // 字段名 只支持英文及下划线
                    fieldComment: item.content,                                          // 字段备注说明
                    dataType: item.dataType.value,                                            // 字段类型
                    length: item.length ? Number(item.length) : null,                     // 字段长度 只针对mysql、oracle
                    isnullable: item.nullCheck.value,                                    // 允许空值 Y允许 N不允许 只针对mysql、oracle
                    primaryKey: (item.radio ? 'Y' : 'N'),                                // 是否主键 Y是 只针对mysql
                    precisionVal: item.length ? Number(item.length) : null,    // 精度 用于double等字段类型 只针对mysql、oracle
                    scale: item.scale ? Number(item.scale) : null,
                    ordinalPosition: (index + 1),                                        // 位置 第几行
                    defValue: item.defValue                                              // 字段默认值  非hive时必传
                });
            });

            if (this.isHive) {
                this.extra = {};
                this.extra = {
                    fieldDelimiter : this.Delimiter.name,
                    storeAs : this.storedFormat ? this.storedFormat.name : null,
                    isOutside:  this.storageUrl,
                    location : this.storageUrl,
                };
            }

            const params = {
                tableName: this.tableName,           // 表名
                tableComment: this.chineseName,      // 中文名
                dsId: this.databaseId,        // 数据源id
                fields: fields,                       // 字段信息的List
                extra: JSON.stringify(this.extra)
            };

            this.repositoryService.addVisualizationTable(params).then(d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                    this.back();
                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });


            // // 表名暂时不拆分
            // // this.tableName = this.companyName + '_' + this.systemName + '_' + this.originalTable;
            // this.repositoryService.addHiveTable({
            //     dbId: this.dbID,
            //     tableName: this.tableName,
            //     // 现在是mysql，hive才需要故先注释
            //     isOutside: this.externalTableIs,
            //     fieldsDelimiter: this.Delimiter ? this.Delimiter.value : '',
            //     storedPath: this.storageUrl,
            //     storedFormat: this.storedFormat ? this.storedFormat.value : '',
            //     content: this.tableDescription,
            //     columns: this.fieldData.map(field => {
            //         return {
            //             clName: field.clName,
            //             type: field.type ? field.type.value : '',
            //             content: field.content,
            //             length: field.length,
            //             scale: field.scale
            //         };
            //     })
            //     // 暂时不要,
            //     // partions: this.partitions.map(partition => {
            //     //     return {
            //     //         partionName: partition.partionName,
            //     //         type: partition.type ? partition.type.value : ''
            //     //     };
            //     // })
            // }).then(d => {
            //     if (d.success) {
            //         this.basicInformation = false;
            //         this.fieldInformation = false;
            //         this.successWeb = true;
            //         this.modalService.alert('创建成功');
            //         this.back();
            //     } else {
            //         this.modalService.alert(d.message || '保存失败');
            //     }
            // });
        } else {
            this.modalService.alert('请至少添加一条字段信息');
        }
    }

    /**
     * 单选按钮回调
     * @param config
     */
    fieldTypesChecked(config: any, fields: any, type?: any) {


        if (config.type === 'field') {
            if (!type) {
                fields.dataType['value'] = config.checked.value;
                fields.dataType['name'] = config.checked.name;
            }
            // let mysqlArr = ['int','char','mediumint','date','longtext','tinytext', 'double', 'blob', 'smallint', 'decimal', 'float', 'text', 'bigint', 'datetime', 'varchar', 'string'];
            // mysql无长度的字段类型
            let mysqlArr = ['datetime', 'date', 'text', 'tinytext', 'longtext', 'timestamp'];
            // hive无长度的字段类型
            let hiveArr = ['tinyint', 'smallint', 'int', 'bigint', 'boolean', 'float', 'double', 'string', 'timestamp', 'decimal', 'date'];
            // sqlserver无字段长度的类型
            let sqlserverArr = ['int', 'bigint', 'tinyint', 'smallint', 'datetime', 'date', 'text', 'real'];
            // oracle无长度的字段
            let oracleArr = ['integer', 'int', 'smallint', 'real', 'date', 'timestamp', 'clob'];

            fields.hasFieldLength = false;
            fields.hasFieldPrecision = false;
            fields.requiredLength = false;
            // fields.type['value'] = config.checked.value;
            // fields.type['name'] = config.checked.name;
            // mysql 的情况
            if (this.databaseType === 'mysql') {
                // 当字段类型为longtext时把默认值置空
                if (fields.dataType['value'] === 'longtext' || fields.dataType['value'] === 'text') {
                    fields.defValue = '';
                }
                if (mysqlArr.join(',').indexOf(fields.dataType['value']) !== -1) {
                    // 无长度的字段+精度
                    fields.hasFieldLength = false;
                    fields.hasFieldPrecision = false;
                    fields.requiredLength = false;
                } else if (fields.dataType['value'] === 'double' ||
                    fields.dataType['value'] === 'float' ||
                    fields.dataType['value'] === 'decimal' ||
                    fields.dataType['value'] === 'real') {
                    // 要求长度+精度  长度不必填
                    fields.hasFieldLength = true;
                    fields.hasFieldPrecision = true;
                } else if (fields.dataType['value'] === 'char' || fields.dataType['value'] === 'varchar') {
                    // 只有长度且长度为必填的
                    fields.hasFieldLength = true;
                    fields.requiredLength = true;
                } else if (fields.dataType['value'] === 'bigint' ||
                    fields.dataType['value'] === 'tinyint' ||
                    fields.dataType['value'] === 'smallint' ||
                    fields.dataType['value'] === 'mediumint' ||
                    fields.dataType['value'] === 'int') {
                    // 只有长度 长度不必填
                    fields.hasFieldLength = true;
                } else {

                    fields.hasFieldLength = true;
                    fields.hasFieldPrecision = true;
                }
            } else if (this.databaseType === 'oracle') {
                if (oracleArr.join(',').indexOf( fields.dataType['value']) !== -1 || oracleArr.join(',').indexOf(fields.dataType['value'].toLowerCase()) !== -1) {
                    fields.hasFieldLength = false;
                    fields.hasFieldPrecision = false;
                    fields.length = '';
                    fields.scale = '';
                } else if ( fields.dataType['value']  || fields.dataType['value'].toLowerCase() === 'char' ||
                    fields.dataType['value']  || fields.dataType['value'].toLowerCase() === 'varchar2') {
                    // 要求长度  长度必填
                    fields.hasFieldLength = true;
                    fields.requiredLength = true;
                    fields.hasFieldPrecision = false;
                } else if (fields.dataType['value']  || fields.dataType['value'].toLowerCase() === 'float') {
                    // 要求长度  长度可选
                    fields.hasFieldLength = true;
                    fields.requiredLength = false;
                    fields.hasFieldPrecision = false;
                } else if ( fields.dataType['value']  || fields.dataType['value'].toLowerCase() === 'decimal' ||
                    fields.dataType['value']  || fields.dataType['value'].toLowerCase() === 'number') {
                    // 长度精度均可选
                    fields.hasFieldLength = true;
                    fields.requiredLength = false;
                    fields.hasFieldPrecision = true;
                }
            } else if (this.databaseType === 'hive') {
                if (hiveArr.join(',').indexOf( fields.dataType['value']) !== -1) {
                    // 无长度、精度
                    fields.hasFieldLength = false;
                    fields.hasFieldPrecision = false;
                    fields.length = '';
                    fields.scale = '';
                } else if ( fields.dataType['value'] === 'char' ||
                    fields.dataType['value'] === 'varchar') {
                    // 只有长度  必填
                    fields.hasFieldLength = true;
                    fields.requiredLength = true;
                    fields.hasFieldPrecision = false;
                }
            } else if (this.databaseType === 'sqlserver') {
                if (sqlserverArr.join(',').indexOf( fields.dataType['value']) !== -1) {
                    // 无长度和精度
                    fields.hasFieldLength = false;
                    fields.hasFieldPrecision = false;
                } else if ( fields.dataType['value'] === 'char' ||  fields.dataType['value'] === 'varchar') {
                    // 只有长度且必须
                    fields.hasFieldLength = true;
                    fields.requiredLength = true;
                    fields.hasFieldPrecision = false;
                } else if ( fields.dataType['value'] === 'float') {
                    // 只有长度且可选
                    fields.hasFieldLength = true;
                    fields.requiredLength = false;
                    fields.hasFieldPrecision = false;
                } else if ( fields.dataType['value'] === 'decimal') {
                    // 长度+精度且都可选
                    fields.hasFieldLength = true;
                    fields.requiredLength = false;
                    fields.hasFieldPrecision = true;
                }
            }

            // 当没有数据长度时把数据长度的值置为空
            if (!fields.hasFieldLength) {
                fields.length = '';
            }
            // 当没有精度时把精度的值置为空
            if (!fields.hasFieldPrecision) {
                fields.scale = '';
            }
        }
    }

    partionTypesChecked(config: any) {
        this.partitions[config.index].type = config.checked;
    }

    DelimiterChecked(type: any) {
        this.Delimiter = type;
    }

    storedFormatChecked(type: any) {
        this.storedFormat = type;
    }

    /**
     * 是否主键切换选中
     */
    checkedChange(fields) {
        fields.radio = !fields.radio;
        if (fields.radio) {
            fields.nullCheck = this.nullValues[1];
        } else {
            fields.nullCheck = this.nullValues[0];
        }
    }


    /**
     * 是否允许空值选中
     */
    nullValueCheck(value, item) {
        item.nullCheck = value.checked;
    }

    /**
     *  分隔符输入回调
     */
    fieldDelimiterInput(value: any) {
        this.Delimiter = {
            name: value,
            value: value
        };
    }

    /**
     * 返回
     */
    back() {
        if (this.action === 'add') {
            this.page = 1;
        }

        this.router.navigate(['/main/task/database/table'], {
            queryParams: {
                id: this.databaseId,
                pageNow: this.page,
                type: this.databaseType,
                dsName: this.databaseName
            }
        });
    }

    hideInstance: Function;
}
