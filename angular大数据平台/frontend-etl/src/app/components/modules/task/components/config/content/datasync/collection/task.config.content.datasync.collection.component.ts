/**
 * Created by LIHUA on 2017-09-18.
 * 数据采集
 */

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';

import {TaskService} from 'app/services/task.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {GovernanceService} from 'app/services/governance.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {TaskConfigContentDatasyncCollectionHeaderComponent} from 'app/components/modules/task/components/config/content/datasync/collection/header/task.config.content.datasync.collection.header.component';
import {TaskConfigContentDatasyncCollectionSqlComponent} from 'app/components/modules/task/components/config/content/datasync/collection/sql/task.config.content.datasync.collection.sql.component';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
import {EtlService} from 'app/services/etl.service';

/**
 * 采集类型枚举
 */
export enum GatherTypesEnum {
    ALL = 'all',
    APPEND = 'append'
}

/**
 * 增量类型枚举
 */
export enum  AppendTypesEnum {
    REALTIME = 'realTime',
    POLLLING = 'polling'
}

@Component({
    selector: 'task-config-content-datasync-collection-component',
    templateUrl: './task.config.content.datasync.collection.component.html',
    styleUrls: ['./task.config.content.datasync.collection.component.scss']
})
export class TaskConfigContentDatasyncCollectionComponent implements OnInit {
    moduleNumber: number; // 拖动模块 moduleNumber

    error: string;
    errorType: number;

    gatherBankType: any;      // 采集库类型
    gatherBankTypes = [       // 采集库类型集合
        {name: 'mysql', type: CollectDatabaseEnum.MYSQL, moduleNumber: 10001},
        {name: 'oracle', type: CollectDatabaseEnum.ORACLE, moduleNumber: 10002},
        {name: 'sqlserver', type: CollectDatabaseEnum.SQLSERVER, moduleNumber: 10003},
        {name: 'hive', type: CollectDatabaseEnum.HIVE, moduleNumber: 10004},
        {name: 'ftp', type: CollectDatabaseEnum.FTP, moduleNumber: 10005},
        {name: 'kafka', type: CollectDatabaseEnum.KAFKA, moduleNumber: 10006},
        {name: 'hdfs', type: CollectDatabaseEnum.HDFS, moduleNumber: 10007},
        {name: 'file', type: CollectDatabaseEnum.FILE, moduleNumber: 10008}
        // {name: 'spider', type: CollectDatabaseEnum.SPIDER, moduleNumber: 108}
    ];

    gatherSource: any;        // 采集源
    gatherSources = [];       // 采集源集合

    gatherSourceTable: any;   // 源表
    gatherSourceTables = [];  // 源表集合

    sourceFiles = [];         // 原字段集合
    splitByFields = [];       // 拆分字段集合

    gatherTypesEnum = GatherTypesEnum; // 采集类型枚举
    gatherType: any;          // 采集类型
    gatherTypes = [           // 采集类型集合
        {name: '全量', value: GatherTypesEnum.ALL},
        {name: '增量', value: GatherTypesEnum.APPEND}
    ];
    appendTypesEnum = AppendTypesEnum; // 增量类型枚举
    appendType: any;          // 增量类型值
    appendTypes = [           // 增量类型
        {name: '实时', value: AppendTypesEnum.REALTIME},
        {name: '轮询', value: AppendTypesEnum.POLLLING}
    ];
    appendMode: any;          // 增量方式值
    appendModes = [           // 增量方式类型
        {name: 'canal', value: 'canal'},
        {name: 'ogg', value: 'ogg'},
        {name: 'incrByColumn', value: 'incrByColumn'}
    ];
    incrementColumn: any;     // 增量字段
    extractMark: any;         // 增量起始值

    splitByField: string;     // 拆分依赖
    incrementField: string;   // 增量字段

    parent: any;              // 父容器引用
    task: any;                // 任务信息

    header = false;          // 第一行是否为header
    sourceFile: string;      // ftp源文件
    fieldDelimiter: string;  // ftp分隔符
    identify = false;        // 是否对word 图片 做识别提取

    topic: string;           // kafka topic
    bodyFormat: any;         // kafka/hdfs 消息体格式
    kafkaBodyFormats = [{name: 'csv', value: 'csv'}, {name: 'json', value: 'json'}]; // 消息体格式
    hdfsBodyFormats = [/*{name: 'csv', value: 'csv'},*/ {name: 'json', value: 'json'}]; // 消息体格式

    collectDatabaseEnum = CollectDatabaseEnum; // 数据采集库类型枚举

    @ViewChild('uploaderRef')
    uploaderRef: ElementRef;
    uploader: any; // hdfs上传对象

    extractMarkEnabled = false; // 增量起始值 日期选择配置

    splitPartitionNum: any;     // 拆分分区数

    customOptions: DatepickerOptions = {
        format: 'YYYY/MM/DD HH:mm:ss'
    };

    impacts = [];               // 本组件属性改变的时候，需要通知受影响组件更新内容
    uuid: string;               // 组件uuid
    nickname: any;              // 别名

    constructor(private taskService: TaskService,
                private modalService: ModalService,
                private datatransferService: DatatransferService,
                private governanceService: GovernanceService,
                private cookieService: CookieService,
                private toolService: ToolService,
                private etlService: EtlService) {}

    async ngOnInit() {
        if (!this.task || !this.task.task || !this.task.task.flowPosition) {
            // 初始化数据
            await this.initDatas();
        } else {
            let source = this.task.sourceList.filter(s => s.jobId === this.uuid)[0];
            if (!source) {
                // 初始化数据
                await this.initDatas();
            } else {
                // 恢复数据
                setTimeout(async () => {
                    await this.restoreDatas(source);
                }, 100);
            }
        }
    }

    /**
     * 初始化基础数据
     */
    async initDatas() {
        this.gatherBankTypes.forEach(g => {
            if (g.moduleNumber === this.moduleNumber) {
                this.gatherBankType = g; // 采集库类型
            }
        });
        this.gatherType = this.gatherTypes[0];         // 采集类型
        this.appendMode = this.appendModes[0];         // 增量类型

        // 采集库初始化
        let d = await this.getDataSource(this.gatherBankType.type);
        if (d.success) {
            d.message.forEach(dd => {
                this.gatherSources.push(dd);
            });

            // hdfs类型 就初始化上传控件
            if (this.gatherBankType.type === CollectDatabaseEnum.HDFS) {
                setTimeout(() => {
                    this.initUploader();
                });
            }
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 恢复数据
     */
    async restoreDatas(source: any) {
        let configAttr = JSON.parse(source.configAttr);
        // 采集库类型
        this.gatherBankTypes.forEach(g => {
            if (g.type === source.sourceDataType) {
                this.gatherBankType = g;
            }
        });

        let sourceFiles = null; // 源字段 fieldType 还原为 dataType
        if (configAttr.sourceFields && configAttr.sourceFields.length) {
            sourceFiles = configAttr.sourceFields.map(sourceField => {
                return {
                    fieldName: sourceField.fieldName,
                    dataType: sourceField.fieldType
                };
            });
        }

        switch (source.moduleName) {
            case CollectDatabaseEnum.MYSQL || CollectDatabaseEnum.ORACLE || CollectDatabaseEnum.HIVE || CollectDatabaseEnum.SQLSERVER || CollectDatabaseEnum.DB2:
                break;
            case CollectDatabaseEnum.FTP:
                this.header = configAttr.header;
                this.sourceFile = configAttr.sourceFile;
                this.fieldDelimiter = configAttr.fieldDelimiter;
                this.sourceFiles = sourceFiles;
                this.identify = configAttr.identify;
                break;
            case CollectDatabaseEnum.KAFKA:
                this.topic = configAttr.topic;
                this.kafkaBodyFormats.forEach(format => {
                    if (format.value === configAttr.bodyFormat) {
                        this.bodyFormat = format;
                    }
                });
                this.sourceFiles = sourceFiles;
                if (this.bodyFormat && this.bodyFormat.value === 'csv') {
                    this.header = configAttr.header;
                    this.fieldDelimiter = configAttr.fieldDelimiter;
                }
                break;
            case CollectDatabaseEnum.HDFS:
                this.sourceFile = configAttr.sourceFile;
                this.hdfsBodyFormats.forEach(format => {
                    if (format.value === configAttr.bodyFormat) {
                        this.bodyFormat = format;
                    }
                });
                this.sourceFiles = sourceFiles;
                setTimeout(() => {
                    this.initUploader();
                });
                break;
            case CollectDatabaseEnum.FILE:
                this.sourceFile = configAttr.sourceFile;
                this.getUnstructuredDataFiled();
                break;
            case CollectDatabaseEnum.SPIDER:
                this.sourceFile = configAttr.sourceFile;
                this.sourceFiles = sourceFiles;
                this.header = configAttr.header;
                break;
        }

        // 采集源
        source.gatherSources && source.gatherSources.length && source.gatherSources.forEach(g => {
            this.gatherSources.push(g);
            if (g.id === configAttr.sourceId) {
                this.gatherSource = g;
            }
        });

        // 源表
        source.gatherSourceTables && source.gatherSourceTables.length && source.gatherSourceTables.forEach(g => {
            this.gatherSourceTables.push(g);
            if (g.tableName === configAttr.tableName) {
                this.gatherSourceTable = g;
            }
        });
        if (!this.gatherSourceTable) {
            // 源表不存在，表示是sql查询的
            this.gatherSourceTable = {
                tableName: configAttr.tableName,
                isSql: true // 表明是sql语句
            };
        }

        // 源字段
        source.sourceFiles && source.sourceFiles.length && source.sourceFiles.forEach(g => this.sourceFiles.push(g));
        // 拆分依赖字段
        source.splitByFields && source.splitByFields.forEach(k => {
            k.nickname = this.nickname || '';
            this.splitByFields.push(k);
            if (k.fieldName === configAttr.splitBy) {
                this.splitByField = k;
            }
        });
        // 拆分分区数
        this.splitPartitionNum = configAttr.opMaps;
        // 采集类型
        this.gatherTypes.forEach(item => {
            if (item.name === source.extractType) {
                this.gatherType = item;
            }
        });
        // 增量类型
        source.appendType && this.appendTypes.forEach(item => {
            if (source.appendType === item.name) {
                this.appendType = item;
            }
        });
        // 增量方式
        source.appendMode && this.appendModes.forEach(item => {
            if (item.name === source.appendMode) {
                this.appendMode = item;
            }
        });
        // 增量字段
        source.incrementColumn && this.splitByFields.forEach(item => {
            if (source.incrementColumn === item.fieldName) {
                this.incrementColumn = item;
            }
        });
        // 起始值
        this.extractMark = source.extractMark;

    }

    /**
     * 获取采集源数据 目标库数据
     * @param {string} type
     * @returns {Promise<any>}
     */
    async getDataSource(type: string) {
        return await this.governanceService.getDataSourceByType(type);
    }

    /**
     * 采集源选择
     * @param gatherSource
     * @returns {Promise<void>}
     */
    async gatherSourceChecked(gatherSource: any) {

        if (this.gatherSource && this.gatherSource.id === gatherSource.id) {
            this.gatherSource = gatherSource;
        } else {
            this.gatherSource = gatherSource;

            // 切换采集源 源表 源字段集合 拆分字段集合 拆分 增量 增量类型 增量起始值 都要重置
            this.gatherSourceTable = null;
            this.gatherSourceTables = [];
            this.sourceFiles = [];
            this.splitByFields = [];
            this.splitByField = null;
            this.incrementField = null;
            this.incrementColumn = null;
            this.extractMark = null;

            // ftp kafka 属性重置
            this.sourceFile = null;
            this.fieldDelimiter = null;
            this.topic = null;
            this.bodyFormat = null;

            // 这四种采集库类型才查询源表
            if (this.gatherBankType.type === CollectDatabaseEnum.MYSQL || this.gatherBankType.type === CollectDatabaseEnum.ORACLE || this.gatherBankType.type === CollectDatabaseEnum.HIVE || this.gatherBankType.type === CollectDatabaseEnum.SQLSERVER) {
                let table = await this.getTable(this.gatherSource.id);
                table && table.forEach(dd => {
                    this.gatherSourceTables.push(dd);
                });
            }
            // 文件类型 查询header
            if (this.gatherBankType.type === CollectDatabaseEnum.FILE) {
                this.getUnstructuredDataFiled();
            }

            this.markupUpdating();  // 标记修改
            this.impactTrigger();   // 通知受影响组件更新数据源
        }
    }

    /**
     * 根据库类型id查找表集合的内容
     */
    async getTable(id: string) {
        let d = await this.governanceService.getSourceTables({id});

        if (d.success) {
            return d.message;
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 采集源表选择
     * @param gatherSourceTable
     * @returns {Promise<void>}
     */
    async gatherSourceTableChecked(gatherSourceTable: any) {
        if (this.gatherSourceTable && this.gatherSourceTable.tableName === gatherSourceTable.tableName) {
            this.gatherSourceTable = gatherSourceTable;
        } else {
            this.gatherSourceTable = gatherSourceTable;

            // 切换源表 源字段集合 拆分字段集合 拆分 增量 增量字段 增量起始值 都要重置
            this.sourceFiles = [];
            this.splitByFields = [];
            this.splitByField = null;
            this.incrementField = null;
            this.incrementColumn = null;
            this.extractMark = null;

            // 源字段集合
            let sourceFiles = await this.getFiles(this.gatherSourceTable.id);
            sourceFiles && sourceFiles.forEach(dd => {
                this.sourceFiles.push(dd);
            });

            // 拆分依赖集合
            let splitByFields = await this.getSplitByFields({id: this.gatherSourceTable.id});
            splitByFields && splitByFields.forEach(dd => {
                this.splitByFields.push(dd);
            });

            this.markupUpdating();     // 标记修改
            this.impactTrigger();      // 通知受影响组件更新数据源
        }
    }

    /**
     * 获取表字段信息
     * @param id
     * @returns {Promise<void>}
     */
    async getFiles(id: any) {
        let d = await this.governanceService.getTableFields(id);

        if (d.success && d.message) {
            return d.message;
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 获取拆分依赖字段
     * @param param
     * @returns {Promise<void>}
     */
    async getSplitByFields(param: any) {
        let d = await this.governanceService.getSplitBy(param);

        if (d.success) {
            return d.message;
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 采集类型 选择回调
     * @param gatherType
     */
    gatherTypeChecked(gatherType: any) {
        this.gatherType = gatherType;

        if (this.gatherType.value === GatherTypesEnum.APPEND) {
            // mysql和oracle有两种增量类型
            if (this.gatherBankType && (this.gatherBankType.type === CollectDatabaseEnum.MYSQL || this.gatherBankType.type === CollectDatabaseEnum.ORACLE)) {
                this.appendTypes = [
                    {name: '实时', value: AppendTypesEnum.REALTIME},
                    {name: '轮询', value: AppendTypesEnum.POLLLING}
                ];
                this.appendType = null;

                if (this.gatherBankType.type === CollectDatabaseEnum.MYSQL) {
                    this.appendMode = this.appendModes[0];
                } else if (this.gatherBankType.type === CollectDatabaseEnum.ORACLE) {
                    this.appendMode = this.appendModes[1];
                }
            }
            // hive只有一种增量类型
            if (this.gatherBankType && (this.gatherBankType.type === CollectDatabaseEnum.HIVE || this.gatherBankType.type === CollectDatabaseEnum.SQLSERVER || this.gatherBankType.type === CollectDatabaseEnum.DB2)) {
                this.appendTypes = [
                    {name: '轮询', value: AppendTypesEnum.POLLLING}
                ];
                this.appendType = this.appendTypes[0]; // hive 增量，增量类型只有轮询

                this.appendMode = this.appendModes[2]; // hive 增量，增量方式只有字段增量
            }
        }

        this.markupUpdating();
    }

    /**
     * 增量类型选择回调
     * @param appendType
     */
    appendTypeChecked(appendType: any) {
        this.appendType = appendType;

        if (this.appendType.value === AppendTypesEnum.REALTIME) {
            // 根据采集库类型 选择增量类型
            if (this.gatherBankType && this.gatherBankType.type === CollectDatabaseEnum.MYSQL) {
                this.appendMode = this.appendModes[0];
            } else if (this.gatherBankType && this.gatherBankType.type === CollectDatabaseEnum.ORACLE) {
                this.appendMode = this.appendModes[1];
            }
        }
        if (this.appendType.value === AppendTypesEnum.POLLLING) {
            this.appendMode = this.appendModes[2];
        }

        this.markupUpdating();
    }

    /**
     * 拆分依赖回调
     * @param splitBy
     */
    splitByFieldChecked(splitBy: any) {
        this.splitByField = splitBy;

        this.markupUpdating();
    }

    /**
     * 增量字段 点击回调
     * @param incrementColumn
     */
    incrementColumnChecked(incrementColumn: any) {
        this.incrementColumn = incrementColumn;
        this.extractMarkEnabled = this.toolService.contains(this.incrementColumn.fieldType.toLowerCase(), ['datetime', 'date']); // 增量字段类型是日期类型
        this.extractMark = null;

        this.markupUpdating();
    }

    /**
     * 增量起始值 datepicker选择确定回调
     * @param msg
     */
    extractMarkDatepickerCallback(msg: any) {
        this.markupUpdating();
    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    dataCheck() {
        this.error = null;
        this.errorType = 0;

        if (!this.gatherSource || this.gatherSource === '') {
            this.error = '请填写采集源';
            this.errorType = 1;
            return;
        }
        // 根据不同的采集库类型做判断
        if (this.toolService.contains(this.gatherBankType.type, [CollectDatabaseEnum.MYSQL, CollectDatabaseEnum.ORACLE, CollectDatabaseEnum.SQLSERVER, CollectDatabaseEnum.HIVE])) {
            if (!this.gatherSourceTable) {
                this.error = '请选择源表';
                this.errorType = 2;
                return;
            }
            if (!this.gatherType) {
                this.error = '请选择采集类型';
                this.errorType = 3;
                return;
            }

            if (this.gatherType && this.gatherType.value === GatherTypesEnum.APPEND) {
                if (!this.appendType) {
                    this.error = '请选择增量类型';
                    this.errorType = 14;
                    return;
                }
                // 如果是轮询的话   增量字段必选    xmw
                if (this.appendType.value === AppendTypesEnum.POLLLING && !this.incrementColumn) {
                 this.error = '请选择增量字段';
                 this.errorType = 17;
                 return;
                }
            }
        } else if (this.gatherBankType.type === CollectDatabaseEnum.FTP) {
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请填写ftp源文件';
                this.errorType = 7;
                return;
            }
            if (!this.fieldDelimiter || this.fieldDelimiter === '') {
                this.error = '请填写ftp分隔符';
                this.errorType = 8;
                return;
            }
            if (!this.sourceFiles || !this.sourceFiles.length) {
                this.error = '请填写ftp header';
                this.errorType = 11;
                return;
            }
        } else if (this.gatherBankType.type === CollectDatabaseEnum.KAFKA) {
            if (!this.topic || this.topic === '') {
                this.error = '请填写kafka topic';
                this.errorType = 9;
                return;
            }
            if (!this.bodyFormat) {
                this.error = '请选择kafka 消息体格式';
                this.errorType = 10;
                return;
            }
            if (!this.sourceFiles || !this.sourceFiles.length) {
                this.error = '请填写kafka header';
                this.errorType = 11;
                return;
            }
            if (this.bodyFormat.value === 'csv' && (!this.fieldDelimiter || this.fieldDelimiter === '')) {
                this.error = '请填写kafka 分隔符';
                this.errorType = 8;
                return;
            }
        } else if (this.gatherBankType.type === CollectDatabaseEnum.HDFS) {
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请上传源文件';
                this.errorType = 12;
                return;
            }
            if (!this.bodyFormat) {
                this.error = '请选择hdfs 文件内容格式';
                this.errorType = 13;
                return;
            }
            if (!this.sourceFiles || !this.sourceFiles.length) {
                this.error = '请填写hdfs header';
                this.errorType = 11;
                return;
            }
        } else if (this.gatherBankType.type === CollectDatabaseEnum.FILE) {
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请填写file源文件';
                this.errorType = 7;
                return;
            }
        } else if (this.gatherBankType.type === CollectDatabaseEnum.SPIDER) {
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请填写spider源文件';
                this.errorType = 7;
                return;
            }
            if (!this.sourceFiles || !this.sourceFiles.length) {
                this.error = '请填写spider header';
                this.errorType = 11;
                return;
            }
        }

        // 拆分分区数校验
        if (this.splitByField) {
            const reg = /^[1-9][0-9]{0,}$/;
            if (!reg.test(this.splitPartitionNum)) {
                this.error = '拆分分区数为整数';
                this.errorType = 15;
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
     * 消息体格式
     * @param body
     */
    bodyFormatChecked(body: any) {
        this.bodyFormat = body;

        // 类型是hdfs的时候查询header信息
        if (this.gatherBankType.type === CollectDatabaseEnum.HDFS) {
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请上传源文件';
                this.errorType = 12;
                return;
            }
            if (!this.bodyFormat) {
                this.error = '请选择hdfs 文件内容格式';
                this.errorType = 13;
                return;
            }
            this.taskService.getSourceFields({
                'dbType': this.gatherBankType.type,
                'bodyFormat': 'json',
                'sourceId': this.gatherSource.id,
                'sourceFile': this.sourceFile,
                'fieldDelimiter': ''
            }).then(d => {

                if (d.success && d.message && d.message.length) {
                    this.sourceFiles.length = 0;
                    d.message.forEach(m => {
                        this.sourceFiles.push({
                            fieldName: m.fieldName,
                            fieldType: m.fieldType,
                            fieldNum: m.fieldNum
                        });
                    });
                }

                this.header = true;
            });
        }

        this.markupUpdating();
    }

    /**
     * 显示header选择
     */
    headerClick() {
        let [ins] = this.modalService.toolOpen({
            title: '表头字段',
            component: TaskConfigContentDatasyncCollectionHeaderComponent,
            datas: {
                type: this.gatherBankType.type
            },
            okCallback: () => {
                let headers = ins.saveClick();
                if (headers) {
                    this.sourceFiles = headers;

                    this.markupUpdating();
                    this.impactTrigger();

                    ins.hideInstance();
                }
            }
        } as ToolOpenOptions);

        ins.initHeaders(this.sourceFiles);
    }

    /**
     * 非结构化数据字段信息获取
     * 采集库类型是文件的时候需要动态查询展示 并不能修改
     */
    getUnstructuredDataFiled() {
        this.etlService.getUnstructuredDataFiled()
            .then(d => {
                if (d.message) {
                    this.sourceFiles = [];
                    d.message.forEach(file => {
                        this.sourceFiles.push({
                            fieldName: file.fieldName,
                            dataType: file.fieldType
                        });
                    });
                }
            });
    }

    /**
     * 获取显示的header值
     * @returns {string}
     */
    getHeadersValue() {
        if (this.sourceFiles && this.sourceFiles.length) {
            return this.sourceFiles.map(s => s.fieldName).join(' , ');
        } else {
            return '';
        }
    }

    /**
     * ftp header首行切换回调
     * 当选择是的时候，查询后台获取header信息
     * @param data
     */
    ftpHeaderCallback(data: any) {
        if (data.type === 'yes') {
            this.error = '';
            this.errorType = -1;
            if (!this.gatherSource || this.gatherSource === '') {
                this.error = '请填写采集源';
                this.errorType = 1;
                return;
            }
            if (!this.sourceFile || this.sourceFile === '') {
                this.error = '请填写ftp源文件';
                this.errorType = 7;
                return;
            }
            if (!this.fieldDelimiter || this.fieldDelimiter === '') {
                this.error = '请填写ftp分隔符';
                this.errorType = 8;
                return;
            }

            this.taskService.getSourceFields({
                'dbType': this.gatherBankType.type,
                'bodyFormat': 'csv',
                'sourceId': this.gatherSource.id,
                'sourceFile': this.sourceFile,
                'fieldDelimiter': this.fieldDelimiter
            }).then(d => {

                if (d.success && d.message && d.message.length) {
                    this.sourceFiles.length = 0;
                    d.message.forEach(m => {
                        this.sourceFiles.push({
                            fieldName: m.fieldName,
                            dataType: m.fieldType
                        });
                    });
                }

                this.header = true;
            });

        } else {
            this.header = false;
        }

        this.markupUpdating();
    }

    /**
     * spider header首行切换回调
     * @param data
     */
    spiderHeaderCallback(data: any) {
        this.header = data.type === 'yes';


    }

    /**
     * 识别提取
     * @param data
     */
    identifyCallback(data: any) {
        this.identify = data.type === 'yes';

        this.markupUpdating();
    }

    /**
     * 初始化上传对象
     */
    initUploader() {
        let token = this.cookieService.get(Cookie.TOKEN);
        const option: FileUploaderOptions = {
            url: '',
            itemAlias: 'file',
            method: 'POST',
            autoUpload: false
        };
        this.uploader = new FileUploader(option);

        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);

            if (res.success) {
                this.sourceFile = res.message.filePath;
            } else {
                this.modalService.alert(res.message);
            }

            this.uploader.queue[0].remove();                // 清除上传队列
            this.uploader.progress = 0;                     // 重置上传进度
            this.uploaderRef.nativeElement.value = '';    // 重置file输入框
        };

        this.uploader.onAfterAddingFile = (item: FileItem) => {
            this.error = '';
            this.errorType = -1;

            // 保证上传队列只有一个文件
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
            }

            let name = item.file.name;
            // 名字长度小于6 且不是.json结尾 就判定为不是json文件
            if ((name.length < 6) || !(name.substr(name.length - 5) === '.json')) {
                this.error = '请上传.json格式文件';
                this.errorType = 12;
                this.uploader.queue[0].remove();            // 清除上传队列
                this.uploaderRef.nativeElement.value = '';  // 重置file输入框
                this.uploader.cancelAll();
            } else if (!this.gatherSource) {
                this.error = '请选择采集源';
                this.errorType = 1;
                this.uploader.queue[0].remove();            // 清除上传队列
                this.uploaderRef.nativeElement.value = '';  // 重置file输入框
                this.uploader.cancelAll();
            } else if (this.uploader.queue.length) {
                // 大小限制
                if (item.file.size > 2048 * 1024 * 1024) {
                    this.uploader.removeFromQueue(this.uploader.queue[0]);
                    this.error = '文件最大为2G';
                    this.errorType = 12;
                    return;
                }

                let url = '';
                this.gatherSource.dsConfigs.forEach(config => {
                    if (config.label === 'url') {
                        url = encodeURIComponent(config.value);
                    }
                });

                this.uploader.setOptions({
                    url: this.etlService.uploadFileToHDFSUrl.replace('{taskId}', this.task.task.taskId).replace('{url}', url) + `&token=${token}`
                });
                this.uploader.uploadAll();
            }
        };
    }

    /**
     * sql输入建表
     */
    sqlClick() {
        if (!this.gatherSource) {
            this.errorType = 1;
            this.error = '请选择采集源';
            return;
        }

        let [ins] = this.modalService.toolOpen({
            title: 'sql查询',
            component: TaskConfigContentDatasyncCollectionSqlComponent,
            datas: {
                sql: (this.gatherSourceTable && this.gatherSourceTable.isSql) ? this.gatherSourceTable.tableName : ''
            },
            okCallback: async () => {
                let sql = ins.queryClick();
                if (sql) {
                    await this.getFieldsBySql(sql, () => {
                        ins.hideInstance();
                    });
                }
            }
        } as ToolOpenOptions);
    }

    /**
     * 根据sql查询表字段信息 拆分依赖信息
     * @param {string} sql
     * @param callback
     */
    async getFieldsBySql(sql: string, callback?: Function) {
        let d = await this.taskService.getFieldsBySql({
            sql: sql,
            sourceId: this.gatherSource.id
        });

        if (d.success) {
            // 源字段 拆分依赖 重置
            this.sourceFiles.length = 0;
            this.splitByFields.length = 0;

            d.message.forEach(d => {
                // 源字段
                this.sourceFiles.push({
                    fieldName: d.fieldName,
                    dataType: d.fieldType,
                    fieldType: d.fieldType
                });
                if (d.isSplit) {
                    // 拆分依赖
                    this.splitByFields.push({
                        fieldName: d.fieldName,
                        dataType: d.fieldType,
                        fieldType: d.fieldType
                    });
                }
            });

            // 在保存完成后 直接把sql显示出来
            this.gatherSourceTable = {
                tableName: sql,
                isSql: true // 表明是sql语句
            };

            this.impactTrigger();  // 通知受影响组件修改数据

            // sql验证正确才关闭弹框
            if (callback) {
                callback();
                this.markupUpdating();     // 标记修改
            }
        } else {
            this.modalService.alert(d.message);
        }
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
     * 返回画布页面
     */
    backClick() {
        this.parent.backDatasync();
    }

    /**
     * 返回向下个组件传递的原始数据
     * @returns {{gatherBankType: any; gatherSource: any; gatherSourceTable: any; sourceFiles: any[]}}
     */
    getOriginDatas() {
        return {
            inputs: [{
                gatherBankType: this.gatherBankType,
                gatherSource: this.gatherSource,
                gatherSourceTable: this.gatherSourceTable,
                nickname: this.nickname
            }],
            sourceFiles: this.sourceFiles,
            nickname: this.nickname
        };
    }

}
