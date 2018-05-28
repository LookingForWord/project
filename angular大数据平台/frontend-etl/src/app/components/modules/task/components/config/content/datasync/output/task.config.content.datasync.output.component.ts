import {EndpointOptions, JsplumbTool} from '../../../../../../../../../frontend-common/tools/jsplumb.tool';

/**
 * Created by LIHUA on 2018-2-24.
 * 数据输出
 */


declare let jsPlumb: any;

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';

import {TaskService} from 'app/services/task.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {CookieService} from 'ngx-cookie';
import {GovernanceService} from 'app/services/governance.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

export enum TaskConfigContentDatasyncOutputTypesEnum {
    TABLE = 'table', // 表格显示
    LINE = 'line'    // 连线显示
}

// 输出对象
export class OutputFieldData {
    oldMessage: any;       // 原始字段信息
    targetMessage: any;    // 目标字段信息
    errorType: number;     // 单行错误类型
    uuid: string;          // uuid,
    nickname: any;
}

@Component({
    selector: 'task-config-content-datasync-output-component',
    templateUrl: './task.config.content.datasync.output.component.html',
    styleUrls: ['./task.config.content.datasync.output.component.scss']
})
export class TaskConfigContentDatasyncOutputComponent implements OnInit, OnDestroy, AfterViewInit {
    error: string;
    errorType: number;

    targetType: any;          // 目标库类型
    targetBankTypes = [       // 目标库类型集合
        {name: 'mysql', value: CollectDatabaseEnum.MYSQL},
        {name: 'oracle', value: CollectDatabaseEnum.ORACLE},
        {name: 'hive', value: CollectDatabaseEnum.HIVE},
        // {name: 'odps', value: CollectDatabaseEnum.ODPS} 暂不支持odps
    ];
    targetObject: any;        // 目标库
    targetObjects = [];       // 目标库集合
    targetTable: any;         // 目标表
    targetTables = [];        // 目标表集合
    targetFiles = [];         // 目标字段集合
    isCover = false;          // 是否覆盖源字段

    parent: any;              // 父容器引用
    task: any;                // 任务信息

    targetFieldDelimiter: string; // 字段分隔符 当目标库类型为hive/odps的时候
    partitionFields = [];         // 分区字段集合 当目标库类型为hive/odps的时候

    status: any;                      // 界面显示类型
    statusEnum = CollectDatabaseEnum; // 界面显示类型枚举
    moduleNumber: number;             // 界面模块id

    types = TaskConfigContentDatasyncOutputTypesEnum.TABLE; // 界面要素显示状态
    typesEnum = TaskConfigContentDatasyncOutputTypesEnum;

    outputFieldDatas = Array<OutputFieldData>(); // 信息输出列表

    uuid: string;     // 模块uuid
    inputs = [];      // 输入数据 包括采集源信息
    sourceFiles = []; // 输入字段

    @ViewChild('jsplumbContainer')
    jsplumbContainer: ElementRef;    // 操作容器

    connections = [];                // 连线集合
    ins: any;                        // 连线对象
    deleteButton = {                 // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };
    unsubscribes = [];               // 订阅钩子函数集合

    resizeHook: any;                 // 窗口变化钩子
    nickname: any;

    constructor(private taskService: TaskService,
                private modalService: ModalService,
                private datatransferService: DatatransferService,
                private governanceService: GovernanceService,
                private cookieService: CookieService,
                private toolService: ToolService,
                private render: Renderer2) {}

    async ngOnInit() {
        await this.initOutputDatas();

        // 数据还原
        if (this.task && this.task.sourceList && this.task.sourceList) {
            await this.restoreData();
        }

        this.resizeHook = this.render.listen('window', 'resize', () => {
            this.ins.repaintEverything();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initIns();
        });
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
        this.resizeHook && this.resizeHook();
    }

    /**
     * 数据还原
     * @returns {Promise<void>}
     */
    async restoreData() {
        let dataArr = this.task.sourceList.filter(item => item.jobId === this.uuid);
        if (dataArr.length) {
            dataArr.forEach(async item => {
                switch (item.moduleNo) {
                    case 40001: this.status = CollectDatabaseEnum.MYSQL; break;
                    case 40002: this.status = CollectDatabaseEnum.ORACLE; break;
                    case 40003: this.status = CollectDatabaseEnum.SQLSERVER; break;
                    case 40004: this.status = CollectDatabaseEnum.HIVE; break;
                    case 40005: this.status = CollectDatabaseEnum.HBASE; break;
                    case 40006: this.status = CollectDatabaseEnum.HDFS; break;
                    case 40007: this.status = CollectDatabaseEnum.FILE; break;
                }

                let config = JSON.parse(item.configAttr) || {};

                // 覆盖原有字段
                this.isCover = config.overwrite;
                // 目标表
                let table = await this.getTable(config.sourceId);

                // 目标库
                this.targetObjects.forEach(item => {
                    if (item.id === config.sourceId) {
                        this.targetObject = item;
                    }
                });
                // 目标表
                table && table.forEach(d => {
                    this.targetTables.push(d);
                    if (d.tableName === config.tableName) {
                        this.targetTable = d;
                    }
                });
                // 目标字段
                let targetFiles = this.targetTable && await this.getFiles(this.targetTable.id);
                targetFiles && targetFiles.forEach(d => {
                    d.uuid = this.toolService.getUuid();
                    d.nickname = this.nickname || '';
                    this.targetFiles.push(d);
                });

                // 连线字段信息
                let outputFieldDatas = this.task.cleanList.filter(item => item.jobId === this.uuid);
                if (outputFieldDatas.length) {
                    outputFieldDatas.forEach(output => {
                        let cfg = JSON.parse(output.configAttr) || {};
                        this.outputFieldDatas.push({
                            oldMessage: {
                                fieldName: cfg.sourceFieldName,
                                dataType: cfg.sourceFieldType,
                            },
                            targetMessage: {
                                fieldName: cfg.targetFieldName,
                                dataType: cfg.targetFieldType
                            },
                            uuid: this.toolService.getUuid(),
                            nickname: this.nickname,
                            errorType: -1
                        });
                    });
                }
            });
        }
    }


    async initOutputDatas() {
        switch (this.moduleNumber) {
            case 40001: this.status = CollectDatabaseEnum.MYSQL; break;
            case 40002: this.status = CollectDatabaseEnum.ORACLE; break;
            case 40003: this.status = CollectDatabaseEnum.SQLSERVER; break;
            case 40004: this.status = CollectDatabaseEnum.HIVE; break;
            case 40005: this.status = CollectDatabaseEnum.HBASE; break;
            case 40006: this.status = CollectDatabaseEnum.HDFS; break;
            case 40007: this.status = CollectDatabaseEnum.FILE; break;
        }

        let data = await this.getBank(this.status);
        data.forEach(d => {
            this.targetObjects.push(d);
        });

        // 第一步 获取汇聚连线
        let datasync = this.parent.getContentByType('datasync');
        let connections = datasync.instance.dragTargetOption.connections;
        let sources = connections.filter(c => c.targetUuid === this.uuid);
        // 从连线里拿到组件信息并获取组件数据
        sources.forEach(s => {
            let component = this.parent.getContentByUuid(s.sourceUuid);
            if (component) {
                let temp = JSON.parse(JSON.stringify(component.instance.getOriginDatas())); // 调用上级组件的固定方法 返回上级组件原始信息
                this.inputs = temp.inputs;
                this.sourceFiles = temp.sourceFiles;
            }
        });
        if (!this.inputs.length) {
            this.modalService.alert('请先选择数据源');
        }
    }


    /**
     * 根据库类型查找库的集合
     */
    async getBank(bank) {
        let d = await this.governanceService.getDataSourceByType(bank);

        if (d.success) {
            return d.message;
        } else {
            this.modalService.alert(d.message);
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
     * 目标库类型切换
     * @param targetType
     * @returns {Promise<void>}
     */
    async targetTypeChecked(targetType: any) {
        if (this.targetType && this.targetType.name === targetType.name) {
            this.targetType = targetType;
        } else {
            this.targetType = targetType;

            // 切换目标库类型 目标库 目标表 目标表字段 分区信息等都要重置
            this.targetObject = null;
            this.targetObjects = [];
            this.targetTable = null;
            this.targetTables = [];
            this.targetFiles = [];
            this.partitionFields = [];

            let data = await this.getBank(this.targetType.value);
            data.forEach(d => {
                this.targetObjects.push(d);
            });

            this.markupUpdating();     // 标记修改

            // 数据信息和画布信息都重置
            this.outputFieldDatas.length = 0;
            this.updatePointAndConnection();
        }
    }

    /**
     * 目标库选择
     */
    async targetObjectChecked(targetObject: any) {
        if (this.targetObject && this.targetObject.id === targetObject.id) {
            this.targetObject = targetObject;
        } else {
            this.targetObject = targetObject;

            // 切换目标库 目标表 目标表字段等都要重置
            this.targetTable = null;
            this.targetTables = [];
            this.targetFiles = [];
            this.partitionFields = [];

            let table = await this.getTable(this.targetObject.id);
            table && table.forEach(d => {
                this.targetTables.push(d);
            });

            this.markupUpdating();     // 标记修改

            // 数据信息和画布信息都重置
            this.outputFieldDatas.length = 0;
            this.updatePointAndConnection();
        }
    }

    /**
     * 目标表选择
     * @param targetTable
     * @returns {Promise<void>}
     */
    async targetTableChecked(targetTable: any) {
        if (this.targetTable && this.targetTable.tableName === targetTable.tableName) {
            this.targetTable = targetTable;
        } else {
            this.targetTable = targetTable;

            this.targetFiles = [];
            this.partitionFields = [];

            let targetFiles = await this.getFiles(this.targetTable.id);
            targetFiles && targetFiles.forEach(d => {
                d.uuid = this.toolService.getUuid();
                d.nickname = this.nickname || '';
                this.targetFiles.push(d);
            });

            this.markupUpdating();     // 标记修改

            // 数据信息和画布信息都重置
            this.outputFieldDatas.length = 0;
            this.updatePointAndConnection();
        }
    }

    /**
     * 标记画布被修改
     */
    markupUpdating() {
        this.task.updating = true;
    }

    /**
     * 显示类型切换
     * @param {TaskConfigContentDatasyncOutputTypesEnum} types
     */
    changeTypes(types: TaskConfigContentDatasyncOutputTypesEnum) {
        if (this.types !== types) {
            this.types = types;

            // 绘制点和连线
            if (this.types === TaskConfigContentDatasyncOutputTypesEnum.LINE) {
                this.updatePointAndConnection();
            }
        }
    }

    /**
     * 连接点和线 重绘
     */
    updatePointAndConnection() {
        setTimeout(() => {
            this.connections.length = 0;
            this.ins.deleteEveryConnection();
            this.ins.deleteEveryEndpoint();

            this.initSourcePoint();
            this.initSourceConnection();
        }, 300);
    }

    /**
     * 初始化连接点
     */
    initSourcePoint() {
        let container = this.jsplumbContainer.nativeElement;
        let dragLine = container.querySelectorAll('.drag-line');

        let point = TaskConfigContentDatasyncOutputComponent.getEndpointOption();

        [].forEach.call(dragLine, line => {
            ['LeftMiddle', 'RightMiddle'].forEach(p => {
                let uuid = this.toolService.getUuid();
                this.ins.addEndpoint(line, { anchors: p, uuid: uuid }, point);
                line.setAttribute(p + 'Uuid', uuid);
            });
        });
    }

    /**
     * 初始化连接线
     */
    initSourceConnection() {
        let container = this.jsplumbContainer.nativeElement;
        let sources = container.querySelectorAll('.drag-line.source');
        let targets = container.querySelectorAll('.drag-line.target');

        this.outputFieldDatas.forEach(field => {
            if (field.oldMessage && field.oldMessage.fieldName && field.targetMessage && field.targetMessage.fieldName) {
                let sourceTemp = [].filter.call(sources, s => {
                    return s.querySelector('.field-name').getAttribute('title') === field.oldMessage.fieldName;
                });
                let targetTemp = [].filter.call(targets, t => {
                    return t.querySelector('.target-field').getAttribute('title') === field.targetMessage.fieldName;
                });
                if (sourceTemp && sourceTemp.length && targetTemp && targetTemp.length) {
                    this.ins.connect({
                        uuids: [sourceTemp[0].getAttribute('RightMiddleUuid'), targetTemp[0].getAttribute('LeftMiddleUuid')]
                    });
                }
            }
        });
    }

    /**
     * 获取连接点样式
     */
    static getEndpointOption() {
        return JsplumbTool.getEndpointOptions({
            scope: 'hand',
            stroke: 'transparent',
            hoverStroke: '#CCDDEE',
            endpointRadius: 3,
            strokeWidth: 2,
            maxConnections: -1,
            connectionsDetachable: true,
            connectorStrokeWidth: 0.5,
            connectorStroke: '#CCCCCC',
            arrowWidth: 6
        } as EndpointOptions);
    }

    /**
     * 原字段的选择
     */
    sourceFileChecked(file: any) {
        switch (file.type) {
            case 'sourceField':
                this.outputFieldDatas[file.index].oldMessage['fieldName'] = file.checked.fieldName;
                this.outputFieldDatas[file.index].oldMessage['dataType'] = file.checked.dataType;
                this.outputFieldDatas[file.index].oldMessage.join = file.checked.join;
                break;
            case 'targetField':
                this.outputFieldDatas[file.index].targetMessage['fieldName'] = file.checked.fieldName;
                this.outputFieldDatas[file.index].targetMessage['dataType'] = file.checked.dataType;
                this.outputFieldDatas[file.index].targetMessage.join = this.nickname ? (this.nickname + '.' + file.checked.fieldName) : '';
                break;
        }

        this.markupUpdating();
    }

    /**
     * 删除行
     * @param {number} i
     */
    deleteField(i: number) {
        this.outputFieldDatas.splice(i, 1);
    }

    /**
     * 添加行
     */
    addRowClick() {
        if (this.inputs.length <= 0) {
            this.modalService.alert('请先选择并连接数据源');
            return;
        }
        this.outputFieldDatas.push({
            oldMessage: {fieldName: '', dataType: ''},
            targetMessage: {fieldName: '', dataType: ''},
            nickname: this.nickname || '',
            errorType: -1,
            uuid: this.toolService.getUuid()
        }) ;
    }

    /**
     * 初始化ins
     */
    initIns() {
        const that = this;
        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Container: that.jsplumbContainer.nativeElement,
                Connector: [ 'Bezier', { curviness: 150 } ],
                HoverPaintStyle: { stroke: 'orange' }
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {
                // 连接判定
                let error = false, msg = '';
                // 不能表内连接
                if (data.source.parentNode === data.target.parentNode) {
                    error = true;
                    msg = '同表内不能连接';
                }

                // 不能重复连接
                let reConnection = that.connections.filter(c => {
                    return (c.sourceUuid === data.source.getAttribute('uuid') && c.targetUuid === data.target.getAttribute('uuid')) ||
                        (c.sourceUuid === data.target.getAttribute('uuid') && c.targetUuid === data.source.getAttribute('uuid'));
                });
                if (reConnection && reConnection.length) {
                    error = true;
                    msg = '已存在连线关系，请勿重复连线';
                }

                // 不能逆向连接
                if (data.source.classList.contains('target')) {
                    error = true;
                    msg = '连线不能逆向连接';
                }

                if (error) {
                    that.modalService.alert(msg);
                    setTimeout(() => { that.ins.deleteConnection(data.connection); });
                } else {
                    that.connections.push({
                        sourceUuid: data.source.getAttribute('uuid'),
                        sourceAnchor: data.sourceEndpoint.anchor.type,
                        targetUuid: data.target.getAttribute('uuid'),
                        targetAnchor: data.targetEndpoint.anchor.type
                    });

                    // 手动连线的时候 把连线数据还原成行数据
                    let temp = that.outputFieldDatas.filter(field => {
                        return field.oldMessage.fieldName === data.source.querySelector('.field-name').getAttribute('title') &&
                            field.targetMessage.fieldName === data.target.querySelector('.target-field').getAttribute('title');
                    });
                    if (temp.length <= 0) {
                        that.outputFieldDatas.push({
                            oldMessage: {
                                fieldName: data.source.querySelector('.field-name').getAttribute('title'),
                                dataType: data.source.querySelector('.field-type').getAttribute('title')
                            },
                            targetMessage: {
                                fieldName: data.target.querySelector('.target-field').getAttribute('title'),
                                dataType: data.target.querySelector('.target-type').getAttribute('title')
                            },
                            nickname: this.nickname || '',
                            errorType: -1,
                            uuid: that.toolService.getUuid()
                        }) ;
                    }
                }
            });

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
            // 删除连线记录
            this.connections = this.connections.filter(c => {
                return !(c.sourceUuid === connection.source.getAttribute('uuid') && c.targetUuid === connection.target.getAttribute('uuid'));
            });

            // 删除数据
            this.outputFieldDatas = this.outputFieldDatas.filter(field => {
                return !(field.oldMessage.fieldName === connection.source.querySelector('.field-name').getAttribute('title') &&
                         field.targetMessage.fieldName === connection.target.querySelector('.target-field').getAttribute('title'));
            });

            // 删除连线
            let con = this.ins.getConnections({
                source: connection.sourceId,
                target: connection.targetId
            });
            if (con && con.length) {
                con.forEach(c => { this.ins.deleteConnection(c); });
            } else {
                this.ins.deleteConnection(connection);
            }

            if (this.deleteButton.dom) {
                this.deleteButton.remove();
            }

            this.markupUpdating();

            e.stopPropagation();
        });

        // 给document 添加点击事件 删除显示的 删除连线按钮
        let docEvent = this.render.listen(document, 'click', () => {
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
     * 同行加载点击
     */
    rowMappingClick() {
        this.outputFieldDatas.length = 0;

        this.sourceFiles.forEach((source, index) => {
            if (this.targetFiles && this.targetFiles[index]) {
                this.outputFieldDatas.push({
                    oldMessage: {
                        fieldName: source.fieldName,
                        dataType: source.dataType,
                        join: source.join
                    },
                    targetMessage: {
                        fieldName: this.targetFiles[index].fieldName,
                        dataType: this.targetFiles[index].dataType,
                        join: this.nickname ? (this.nickname + '.' + this.targetFiles[index].fieldName) : ''
                    },
                    nickname: this.nickname,
                    errorType: -1,
                    uuid: this.toolService.getUuid()
                });
            }
        });

        this.updatePointAndConnection();
    }

    /**
     * 同名加载点击
     */
    nameMappingClick() {
        this.outputFieldDatas.length = 0;

        this.sourceFiles.forEach(source => {
            this.targetFiles.forEach(target => {
                if (source.fieldName.toLowerCase() === target.fieldName.toLowerCase()) {
                    this.outputFieldDatas.push({
                        oldMessage: {
                            fieldName: source.fieldName,
                            dataType: source.dataType,
                            join: source.join
                        },
                        targetMessage: {
                            fieldName: target.fieldName,
                            dataType: target.dataType,
                            join: this.nickname ? (this.nickname + '.' + target.fieldName) : ''
                        },
                        nickname: this.nickname || '',
                        errorType: -1,
                        uuid: this.toolService.getUuid()
                    });
                }
            });
        });

        this.updatePointAndConnection();
    }

    /**
     * 返回画布页面
     */
    backClick() {
        this.parent.backDatasync();
    }

    /**
     * 由其他组件调用，当其他组件改变了输入源的时候
     */
    async impactCallback() {
        await this.initOutputDatas();
        this.outputFieldDatas.length = 0;
        this.updatePointAndConnection();
    }

    dataCheck() {
        if (!this.targetObject || this.targetObject === '') {
            this.error = '请填写目标库';
            this.errorType = 1;
            return;
        }
        if (!this.targetTable || this.targetTable === '') {
            this.error = '请填写目标表';
            this.errorType = 2;
            return;
        }

        // hive需要分隔符
        if (this.status === CollectDatabaseEnum.HIVE) {
            if (!this.targetFieldDelimiter || this.targetFieldDelimiter === '') {
                this.error = '请填写字段分隔符';
                this.errorType = 3;
                return;
            }
        }

        if (this.outputFieldDatas.length <= 0) {
            this.modalService.alert('请配置输出映射关系');
            return;
        }

        return true;
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

}
