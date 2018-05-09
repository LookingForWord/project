/**
 * Created by xxy on 2017-11-22.
 *  组织机构操作
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {AuthorityService} from 'app/services/authority.service';
import {ActionTypeEnum} from 'app/components/modules/governance/components/metadata/governance.metadata.component';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

export class FieldData {
    clName: string;             // 字段名称
    type: any;                  // 字段类型
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
    eidt: any;                 // 原来存在的数据
}
export class Partition {
    partionName: string; // 分区名称
    type: any;           // 分区类型
    errorType: number;   // 单行错误类型
}

@Component({
    selector: 'governance-metadata-aside-add-component',
    templateUrl: './governance.metadata.aside.add.component.html',
    styleUrls: ['./governance.metadata.aside.add.component.scss']
})
export class GovernanceMetadataAsideAddComponent implements OnInit, OnDestroy {
    error = '';                     // 错误提示
    errorType: number;              // 错误类型

    status: any;                    // 弹框类型(Sql建表  、 可视化建表...)
    tableName: string;              // 表名
    chineseName: string;            // 中文名
    remark: string;                 // 描述
    sqlLanguage: any;               // sql语句

    flows: any;                     // 目录树LIST
    modal = 'addsql';               // 是否是弹框中的目录树
    parentFlow: any;                // 树形选中项
    dircPath = '';                  // 目录

    parentId: any;                  // 父id
    editId: any;

    tags = [];                      // 标签当前选中项集合
    tagArrary = [];                 // 标签数组集合

    catalogType = 'menu';

    fieldData: Array<FieldData>;  // 字段信息集合
    fieldTypes: any;              // 字段类型

    nullValues = [{name: '允许', value: 'Y'}, {name: '不允许', value: 'N'}];       // 空值是否允许的集合
    keyValues = [{name: '有', value: 'Y'}, {name: '无', value: 'N'}];             // 是否主键id的集合

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

    list: any;                          // 影响分析列表
    noData: any;

    chekcSystemName: any;               // 系统集合
    systemNames = [];                   // 当前选中系统
    dsType: any;                        // 数据源类型
    dataSourceTypes: any;               // 数据源集合
    dataSourceType: any;                // 数据源类型选中项
    dataSourceNames = [];               // 数据源名称集合
    dataSourceName: any;                // 数据源名称选中项

    sourceType = 'mysql';
    // hive的类型时
    fieldDelimiter: any;                // 字段分隔符选中项
    fieldDelimiters = [{
        name: '\\u0001',
        value: '\\u0001'
    }, {
        name: '\\u0002',
        value: '\\u0002'
    }, {
        name: '\\u0003',
        value: '\\u0003'
    }];                                 // 字段分隔符集合
    storeAs: any;                       // 存储格式选中项
    storeAsArr = [{
        name: 'TEXTFILE',
        value: 'TEXTFILE'
    }, {
        name: 'ORC',
        value: 'ORC'
    }, {
        name: 'PARQUET ',
        value: 'PARQUET '
    }];

    isOutside = '0';                     // 是否是外部表
    location: any;                      // 存储路径    isOutside为false的时候禁用

    unsubscribes = [];
    constructor(
        private modalService: ModalService,
        private governanceService: GovernanceService,
        private datatransferService: DatatransferService,
        private toolService: ToolService,
        private validateService: ValidateService,
        private authorityService: AuthorityService
    ) {
        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.modal === 'addsql') {
                this.onCheckedEvent(data.flow, data.type);
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);
    }

    async ngOnInit() {
        if (this.status !== 'createSQL') {
            this.fieldData = [];
            this.partitions = [];
            this.getFieldType();
            this.fieldDelimiter = this.fieldDelimiters[0];
            this.storeAs = this.storeAsArr[0];
            let data = await this.getAllRule(0);
            if (data) {
                this.flows = data;
            }
            let dataSourceTypes = await this.governanceService.getSourcsType();
            if (dataSourceTypes.success) {
                this.dataSourceTypes = [];
                dataSourceTypes.message.forEach(item => {
                    this.dataSourceTypes.push({name: item.rowName, value: item.rowCode});
                });
            }
            // 获取系统集合
            let sys = await this.governanceService.getDataList();
            if (sys.success) {
                this.systemNames = sys.message || [];
            }
        }

        // 影响分析
        if (this.status === ActionTypeEnum.IMPACT) {
            this.governanceService.getInfluenceList({sourceId: this.editId}).then(d => {
               if (d.success) {
                    this.list = d.message;
                    if (d.message.length === 0 || !d.message) {
                        this.noData = true;
                    }
               } else {
                    this.modalService.alert(d.message);
               }
            });
        }
        // 编辑
        if (this.status === ActionTypeEnum.EDIT) {
            this.governanceService.getTableDetial({id: this.editId}).then(d => {
                if (d.success && d.message) {
                    this.remark = d.message.descr;
                    this.chineseName = d.message.tableComment;
                    this.tags = d.message.labels;
                    this.tableName = d.message.tableName;
                    this.fieldData = d.message.fields;
                    this.parentFlow = {id: d.message.dirId};
                    this.dircPath = (d.message.extra ? JSON.parse(d.message.extra).path : '');
                    let dsId = d.message.dsId;
                    let arr = [];
                    this.fieldData.forEach(item => {
                        let clName = '';
                        if (this.dsType === 'oracle') {
                            // 防止后端传回的数据带中引文引号的情况
                            clName = ('"' + item['fieldName'].replace(/\"|\“|\”/g, '') + '"');
                        } else {
                            clName = item['fieldName'];
                        }
                        let obj = {
                            clName: clName,                                          // 名称
                            type: {name: item['dataType'], value: item['dataType']},            // 字段类型
                            content: item['fieldComment'],                                      // 备注描述
                            length: item['length'],                                             // 字段长度
                            scale: (item['scale'] || ''),                                       // 精度
                            nullCheck: (item['isnullable'] === 'N' ? {name: '不允许', value: 'N'} : {name: '允许', value: 'Y'}),   // 是否允许空值选中
                            radio: (item['primaryKey'] === 'Y' ? true : false),
                            errorType: -1,
                            defValue: item['defValue'],
                            hasFieldLength: false,              // 是否有字段长度
                            hasFieldPrecision: false,           // 是否有字段精度
                            requiredLength: false,
                            edit: true
                        };
                        this.fieldTypesChecked('edit', obj, 'edit');
                        arr.push(obj);
                    });
                    this.fieldData = arr;
                    // 找到指定数据源类型
                    this.dataSourceTypes.forEach(type => {
                        if (type.value === this.dsType) {
                            this.dataSourceType = type;
                        }
                    });
                    // this.governanceService.getDataSourceMenus({dsType: this.dsType}).then(d => {
                    //    if (d.success && d.message) {
                    //        this.dataSourceNames = [];
                    //        d.message.forEach(item => {
                    //            if (dsId === item.id) {
                    //                this.dataSourceName = {dsName: item.dsName, id: item.id, dsType: item.dsType};
                    //                this.sourceType = item.dsType;
                    //                this.getFieldType();
                    //            }
                    //            this.dataSourceNames.push({dsName: item.dsName, id: item.id, dsType: item.dsType});
                    //        });
                    //    }
                    // });
                    this.systemNames.map(item => {
                        if (item.id === d.message.systemId) {
                            this.chekcSystemName = item;
                        }
                        item.metaDses && item.metaDses.map(ds => {
                            if (ds.dsId === dsId) {
                                this.dataSourceName = {dsName: ds.dsName, id: ds.dsId, dsType: ds.dsType};
                                this.sourceType = ds.dsType;
                                this.getFieldType();
                            }
                        });
                    });

                    // 如果是hive
                    if (d.message.extra && d.message.extra !== '{}') {
                        let obj = JSON.parse(d.message.extra);
                        this.fieldDelimiter = this.fieldDelimiters.filter(item => {
                            return item.value === obj.fieldDelimiter;
                        })[0] || {name: obj.fieldDelimiter, value: obj.fieldDelimiter} || this.fieldDelimiters[0];
                        this.storeAs = this.storeAsArr.filter(item => {
                            return item.value === obj.storeAs;
                        })[0] || this.storeAsArr[0];
                        this.isOutside = obj.isOutside || '0';
                        this.location = obj.location;
                    }
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 获取字段类型列表
     */
    getFieldType() {
        this.governanceService.getAllFileType()
            .then(d => {
                if (d.success) {
                    d.message.forEach( type => {
                            if (type.rowCode === this.sourceType) {
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
                        }
                    );
                } else {
                    this.modalService.alert(d.message);
                }
            });
    }

    /**
     * 基本信息检查
     */
    check() {
        this.error = null;
        this.errorType = 0;
        // 可视化
        if (this.status === ActionTypeEnum.ADDVISUAL || this.status === ActionTypeEnum.EDIT) {
            let validate = this.validateService.get(this, this.getValidateObject(), ['chekcSystemName', 'tableName']);
            if (validate) {
                this.error = validate.error;
                this.errorType = validate.errorType;
                return false;
            }
            const reg = /^[a-zA-Z][0-9a-zA-Z(-|_)]{0,}$/ ;
            if (!reg.test(this.tableName)) {
                this.error = '表名格式错误';
                this.errorType = 1;
                return false;
            }
            if (RegExgConstant.regEn.test(this.tableName) || RegExgConstant.regCn.test(this.tableName)) {
                this.error = '不能包含特殊字符';
                this.errorType = 1;
                return false;
            }
        }
        // sql建表 和可视化建表
        if (this.status === ActionTypeEnum.ADDSQL || this.status === ActionTypeEnum.ADDVISUAL) {
            let validate = this.validateService.get(this, this.getValidateObject(), ['dataSourceType', 'dataSourceName']);
            if (validate) {
                this.error = validate.error;
                this.errorType = validate.errorType;
                return false;
            }
        }
        // 存储路径的验证
        if (this.dataSourceType.value === 'hive' && this.isOutside === '1') {
            let validate = this.validateService.get(this, this.getValidateObject(), ['location']);
            if (validate) {
                this.error = validate.error;
                this.errorType = validate.errorType;
                return false;
            }
        }
        // sql建表 可视化建表   编辑表
        if (this.status !== ActionTypeEnum.IMPACT) {
            if (!this.parentFlow || !this.parentFlow.id) {
                this.errorType = 6;
                this.error = '请选择目录';
                return;
            }
        }
        // 可视化建表
        if (this.status === ActionTypeEnum.ADDVISUAL || this.status === ActionTypeEnum.EDIT) {
            if (!this.fieldData || this.fieldData.length === 0) {
                this.modalService.alert('未添加字段信息');
                return;
            }
            // 字段信息和分区信息的验证
            if (this.fieldData.length) {
                // 字段信息的验证
                for (let i = 0; i < this.fieldData.length; i++) {
                    this.fieldData[i].errorType = -1;
                    // 字段名校验
                    if (!this.fieldData[i].clName) {
                        this.fieldData[i].errorType = 5;
                        return;
                    }
                    // 字段名格式校验
                    // oracle 才校验是否有引号   带引号原样保存  没有的话大写
                    if (this.sourceType === 'oracle') {
                        const reg = /^(\"|\')([a-zA-Z][0-9a-zA-Z_]{0,})(\"|\')$/;
                        if (!RegExgConstant.numberAlphabet.test(this.fieldData[i].clName) && !reg.test(this.fieldData[i].clName)) {
                            this.fieldData[i].errorType = 1;
                            return;
                        }
                    } else {
                        if (!RegExgConstant.numberAlphabet.test(this.fieldData[i].clName)) {
                            this.fieldData[i].errorType = 1;
                            return;
                        }
                    }
                    // 字段类型校验
                    if (!this.fieldData[i].type || !this.fieldData[i].type.value) {
                        this.fieldData[i].errorType = 2;
                        return;
                    }
                    // 长度选填   填了长度的话校验字段长度
                    if (!this.fieldData[i].requiredLength && this.fieldData[i].hasFieldLength && this.fieldData[i].length && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                        this.fieldData[i].errorType = 3;
                        return;
                    }
                    // 填了精度  精度校验
                    if (this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                        this.fieldData[i].errorType = 4;
                        return;
                    }
                    // 填了精度就必须填长度    精度必须依赖于长度
                    if (this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                        this.fieldData[i].errorType = 3;
                        return;
                    }
                    // 长度必填的话
                    if (this.fieldData[i].requiredLength && !RegExgConstant.positiveInteger.test(this.fieldData[i].length)) {
                        this.fieldData[i].errorType = 3;
                        return;
                    }
                    // 精度校验
                    if (this.fieldData[i].requiredLength && this.fieldData[i].hasFieldPrecision && this.fieldData[i].scale && !RegExgConstant.positiveInteger.test(this.fieldData[i].scale)) {
                        this.fieldData[i].errorType = 4;
                        return;
                    }
                    if (this.sourceType !== 'hive') {
                        // 是否允许空值
                        if (!this.fieldData[i].nullCheck.value) {
                            this.fieldData[i].errorType = 6;
                            return;
                        }
                        // 主键
                        if (this.fieldData[i].radio && this.fieldData[i].nullCheck.value !== 'N') {
                            this.fieldData[i].errorType = 7;
                            return;
                        }
                    }
                    this.fieldData[i].errorType = -1;
                }
            }
        }
        // sql 建表
        if (this.status === ActionTypeEnum.ADDSQL) {
            let validate = this.validateService.get(this, this.getValidateObject(), ['sqlLanguage']);
            if (validate) {
                this.error = validate.error;
                this.errorType = validate.errorType;
                return false;
            }
        }
        if (this.status === ActionTypeEnum.ADDCATALOG) {
            if (!this.dircPath || this.dircPath === '') {
                this.error = '请选择目录';
                this.errorType = 5;
                return;
            }
        }
        this.errorType = 0;
        return true;
    }
    /**
     * 校验规则
     */
    getValidateObject() {
        return {
            tableName: {
                presence: {message: '^请填写表名', allowEmpty: false},
                length: {maximum: 20, message: '^表名最多20个字符', allowEmpty: false},
                // reg: {format: RegExgConstant.numberAlphabet, message: '^表名格式错误'},
                errorType: 1
            },
            chekcSystemName: {
                presence: {message: '^请选择所属系统', allowEmpty: false},
                errorType: 8
            },
            dataSourceType: {
                presence: { message: '^请选择数据源类型', allowEmpty: false},
                errorType: 3
            },
            dataSourceName: {
                presence: { message: '^请选择数据源', allowEmpty: false},
                errorType: 4
            },
            sqlLanguage: {
                presence: { message: '^请填写SQL语句', allowEmpty: false},
                errorType: 7
            },
            location: {
                presence: { message: '^请填写存储路径', allowEmpty: false},
                reg: {format: RegExgConstant.faultChinese, message: '^请正确填写存储路径'},
                errorType: 10
            }
        };
    }

    /**
     * 查询目录
     * @param parentId 父级目录id
     */
    async getAllRule(parentId, excludeId?: any) {
        let d = await this.governanceService.getCatalogList({
            id: parentId,
            excludeId: excludeId
        });
        if (d.success && d.message) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];
                msg.type = 'CatalogList';
            });
            return d.message;
        } else {
            return [];
        }

    }

    /**
     * 目录选中点击
     * @param flow
     * @param type
     * @returns {Promise<void>}
     */
    async onCheckedEvent(flow, type?: any) {
        if (!flow || !this.flows) {
            return;
        }
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = true;
        // 当节点是展开状态 且未查询子节点
        this.parentFlow = flow;
        // 查询子节点
        let data = await this.getAllRule(flow.id);
        flow.expand = !flow.expand;
        if (data) {
            flow.children = data;
        }
        flow.queryChild = true;
        this.dircPath = '/';
        let tempFlow = this.toolService.treesPositions(this.flows, flow);
        tempFlow && tempFlow.forEach(fl => {
            this.dircPath = this.dircPath + (fl.name + '/');
        });
    }

    /**
     * 取消
     */
    cancelClick() {
        this.hideInstance();
    }

    /**
     * 保存
     */
    saveClick() {
        if (!this.check()) {
            return;
        }
        // sql建表
        if (this.status === ActionTypeEnum.ADDSQL) {
            let tags = [];
            this.tags.forEach(item => {
                tags.push(item.id);
            });
            this.governanceService.addTableBySql({
                dsId: this.dataSourceName.id,            // 数据源id
                dirId: this.parentFlow.id,               // 目录id
                sql: this.sqlLanguage,                   // sql语句
                descr: this.remark,                      // 描述
                labelIds: tags,                          // 标签ids
                systemId: this.chekcSystemName.id,
                extra: JSON.stringify({path: this.dircPath})
            }).then(d => {
                if (d.success) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === ActionTypeEnum.ADDVISUAL || this.status === ActionTypeEnum.EDIT) {
            let metaLabels = [];
            this.tags.forEach(tag => {
                metaLabels.push(tag.id);
            });
            let fields = [];
            this.fieldData.forEach((item, index) => {
               fields.push({
                   fieldName: item.clName,                                              // 字段名 只支持英文及下划线
                   fieldComment: item.content,                                          // 字段备注说明
                   dataType: item.type.name,                                            // 字段类型
                   length: item.length ? Number(item.length) : null,                     // 字段长度 只针对mysql、oracle
                   isnullable: item.nullCheck.value,                                    // 允许空值 Y允许 N不允许 只针对mysql、oracle
                   primaryKey: (item.radio ? 'Y' : 'N'),                                // 是否主键 Y是 只针对mysql
                   precisionVal: item.length ? Number(item.length) : null,
                   ordinalPosition: (index + 1),                                        // 位置 第几行
                   defValue: item.defValue,                                              // 字段默认值  非hive时必传,
                   scale: item.scale ? Number(item.scale) : null                        // 精度 用于double等字段类型 只针对mysql、oracle
               });
            });
            let obj = this.dataSourceType.value === 'hive' ? {
                storeAs: this.storeAs.value,
                isOutside: this.isOutside,
                location: this.location,
                fieldDelimiter: this.fieldDelimiter.value
            } : {};

            // 新建可视化表
            if (this.status === ActionTypeEnum.ADDVISUAL) {
                const params = {
                    tableName: this.tableName,           // 表名
                    tableComment: this.chineseName,      // 中文名
                    descr: this.remark,                  // 描述
                    dsId: this.dataSourceName.id,        // 数据源id
                    dirId: this.parentFlow.id,           // 目录id
                    labelIds: metaLabels,                 // 标签集合
                    fields: fields,                       // 字段信息的List
                    systemId: this.chekcSystemName.id,
                    extra: JSON.stringify({path: this.dircPath, ...obj})
                };
                this.governanceService.addVisualizationTable(params).then(d => {
                    if (d.success) {
                        this.modalService.alert(d.message);
                        this.hideInstance();
                    } else {
                        this.modalService.alert(d.message || '保存失败');
                    }
                });
            } else {
                // 编辑保存
                const params = {
                    id: this.editId,
                    tableComment: this.chineseName,
                    descr: this.remark,
                    labelIds: metaLabels,
                    fields: fields,
                    dsId: this.dataSourceName.id,        // 数据源id
                    dirId: this.parentFlow.id,           // 目录id
                    systemId: this.chekcSystemName.id,
                    extra: JSON.stringify({path: this.dircPath, ...obj})
                };
                this.governanceService.eidtVisualizationTable(params).then(d => {
                    if (d.success) {
                        this.modalService.alert('更新成功');
                        this.hideInstance();
                    } else {
                        this.modalService.alert(d.message || '保存失败');
                    }
                });
            }
        }
    }

    /**
     * 添加字段
     */
    addField() {
        if (!this.dataSourceName && this.status === ActionTypeEnum.ADDVISUAL) {
            this.errorType = 4;
            this.error = '请选择数据源';
            return;
        }
        this.errorType = -1;
        this.fieldData.push({
            clName: '',                                     // 名称
            type: {name: '', value: ''},                    // 字段类型
            content: '',                                    // 备注描述
            length: '',                                     // 字段长度
            scale: '',                                      // 精度
            nullCheck: {name: '允许', value: 'Y'},           // 是否允许空值选中  默认允许
            radio: false,
            defValue: '',                                   // 非hive时字段默认值
            errorType: -1,
            hasFieldLength: false,                          // 是否有字段长度
            hasFieldPrecision: false,                       // 是否有字段精度
            requiredLength: false,                           // 长度是否必填
            eidt: false
        });
    }

    /**
     * 字段类型选择
     * @param config
     * @param fields
     * @param type
     */
    fieldTypesChecked(config: any, fields: any, type?: any) {
        // mysql无长度的字段类型
        let mysqlArr = ['datetime', 'date', 'text', 'tinytext', 'longtext', 'timestamp'];
        // hive无长度的字段类型
        let hiveArr = ['tinyint', 'smallint', 'int', 'bigint', 'boolean', 'float', 'double', 'string', 'timestamp', 'decimal', 'date'];
        // sqlserver无字段长度的类型
        let sqlserverArr = ['int', 'bigint', 'tinyint', 'smallint', 'datetime', 'date', 'text', 'real'];
        // oracle无长度的字段
        let oracleArr = ['integer', 'int', 'smallint', 'real', 'date', 'timestamp', 'clob'];
        if (!type) {
            fields.type['value'] = config.checked.value;
            fields.type['name'] = config.checked.name;
        }
        fields.hasFieldLength = false;
        fields.hasFieldPrecision = false;
        fields.requiredLength = false;
        // mysql 的情况
        if (this.sourceType === 'mysql') {
            // 无长度的字段
            if (mysqlArr.join(',').indexOf(fields.type['value']) !== -1) {
                fields.hasFieldLength = false;
                fields.hasFieldPrecision = false;
                fields.requiredLength = false;
                if (fields.type['value'] === 'text' || fields.type['value'] === 'longtext') {
                    fields.defValue = '';
                }
            } else if (fields.type['value'] === 'double' ||
                fields.type['value'] === 'float' ||
                fields.type['value'] === 'decimal' ||
                fields.type['value'] === 'real') {
                // 要求长度+精度  长度必填
                fields.hasFieldLength = true;
                fields.hasFieldPrecision = true;
            } else if (fields.type['value'] === 'char' || fields.type['value'] === 'varchar') {
                fields.hasFieldLength = true;
                fields.requiredLength = true;
            } else if (fields.type['value'] === 'bigint' ||
                fields.type['value'] === 'tinyint' ||
                fields.type['value'] === 'smallint' ||
                fields.type['value'] === 'mediumint' ||
                fields.type['value'] === 'int') {
                fields.hasFieldLength = true;
            } else {
                // 只有长度
                fields.hasFieldLength = true;
                fields.hasFieldPrecision = true;
            }
        } else if (this.sourceType === 'oracle') {
            if (oracleArr.join(',').indexOf(fields.type['value']) !== -1 || oracleArr.join(',').indexOf(fields.type['value'].toLowerCase()) !== -1) {
                fields.hasFieldLength = false;
                fields.hasFieldPrecision = false;
            } else if (fields.type['value'] === 'char' || fields.type['value'].toLowerCase() === 'char' ||
                fields.type['value'] === 'varchar2' || fields.type['value'].toLowerCase() === 'varchar2') {
                // 要求长度  长度必填
                fields.hasFieldLength = true;
                fields.requiredLength = true;
            } else if (fields.type['value'] === 'float' || fields.type['value'].toLowerCase() === 'float') {
                // 要求长度  长度可选
                fields.hasFieldLength = true;
            } else {
                // 长度精度均可选
                fields.hasFieldLength = true;
                fields.requiredLength = false;
                fields.hasFieldPrecision = true;
            }
        } else if (this.sourceType === 'hive') {
            if (hiveArr.join(',').indexOf(fields.type['value']) !== -1) {
                // 无长度、精度
                fields.hasFieldLength = false;
                fields.hasFieldPrecision = false;
            } else if (fields.type['value'] === 'char' || fields.type['value'] === 'varchar') {
                // 只有长度  必填
                fields.hasFieldLength = true;
                fields.requiredLength = true;
            } else {
                fields.hasFieldLength = true;
                fields.hasFieldPrecision = true;
            }
        } else if (this.sourceType === 'sqlserver') {
            if (sqlserverArr.join(',').indexOf(fields.type['value']) !== -1) {
                fields.hasFieldLength = false;
                fields.hasFieldPrecision = false;
            } else if (fields.type['value'] === 'char' || fields.type['value'] === 'varchar') {
                // 长度必须
                fields.hasFieldLength = true;
                fields.requiredLength = true;
            } else if (fields.type['value'] === 'float') {
                // 长度可选
                fields.hasFieldLength = true;
            } else {
                // 长度、精度可选
                fields.hasFieldLength = true;
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

    /**
     * 是否允许空值选中
     * @param value
     * @param item
     */
    nullValueCheck(value, item) {
        item.nullCheck = value.checked;
    }

    /**
     * 是否主键切换选中
     * @param fields
     * @param $event
     */
    checkedChange(fields: any, $event: any) {
        if (fields.edit) {
            $event.target.checked = fields.radio;
            return;
        }
        fields.radio = !fields.radio;
        if (fields.radio) {
            fields.nullCheck = this.nullValues[1];
        } else {
            fields.nullCheck = this.nullValues[0];
        }
    }

    /**
     * 刪除字段信息
     * @param {number} i
     * @param item
     */
    deleteField(i: number, item: any) {
        if (item.edit) {
            return;
        }
        this.fieldData.splice(i, 1);
    }

    /**
     * 下拉框选择
     * @param obj
     * @param type
     */
    selectChange (obj: any, type: any) {

        if (!this.chekcSystemName || !this.chekcSystemName.metaDses || this.chekcSystemName.metaDses.length === 0) {
            this.errorType = 3;
            this.error = '请先选择所属系统';
            return;
        }
        this.errorType = -1;
        this[type] = obj;
        // 数据源类型选中
        if (type === 'dataSourceType') {
            this.dataSourceNames = [];
            this.dataSourceName = null;
            this.getSourceList();
            this.fieldData = [];
            this.isOutside = '0';
            this.location = '';
        } else {
            if (obj.dsType !== this.sourceType) {
                this.fieldData = [];
            }
            this.sourceType = obj.dsType;
            this.getFieldType();
        }
    }

    /**
     * 分隔符输入回调
     * @param value
     */
    fieldDelimiterInput(value: any) {
        this.fieldDelimiter = {
            name: value,
            value: value
        };
    }

    /**
     * 获取数据源列表
     */
    getSourceList() {
        // this.governanceService.getDataSourceMenus({dsType: this.dataSourceType.value}).then( d => {
        //     if (d.success && d.message) {
        //         d.message.forEach(item => {
        //             this.dataSourceNames.push({dsName: item.dsName, id: item.id, dsType: item.dsType});
        //         });
        //     } else {
        //         this.modalService.alert(d.message);
        //     }
        // });
        let arr = [];
        this.chekcSystemName.metaDses.forEach(item => {
            if (item.dsType === this.dataSourceType.value) {
                arr.push({dsName: item.dsName, id: item.dsId, dsType: item.dsType});
            }
        });
        if (arr.length === 0) {
            this.errorType = 4;
            this.error = `当前角色此系统下无${this.dataSourceType.value}类型的数据源`;
            return;
        }
        this.errorType = -1;
        this.dataSourceNames = arr;
    }

    /**
     * 标签选择  返回的是选中的list集合
     * @param option
     */
    tagCheck(option: any) {
        this.tags = option;
    }

    /**
     * 清空外部表链接字段
     * @param type
     */
    clearStorageUrl(type: any) {
        if (this.status === 'editTable') {
            return;
        }
        if (type === '0') {
            this.location = '';
            if (this.errorType === 10) {
                this.errorType = -1;
            }
        }
        this.isOutside = type;
    }

    /**
     * 系统选择
     */
    systemChange(checkSystemName: any) {
        if (checkSystemName === this.chekcSystemName) {
            return;
        }
        this.chekcSystemName = checkSystemName;
    }

    hideInstance: Function;
}
