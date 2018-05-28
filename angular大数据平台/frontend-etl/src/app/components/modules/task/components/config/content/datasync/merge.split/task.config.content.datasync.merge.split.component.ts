/**
 * Created by LIHUA on 2018-02-22.
 * 合并 拆分
 */

declare let jsPlumb: any;

import {AfterContentInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';

import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {DataCleanEnum} from 'app/constants/data.clean.enum';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';

export enum TaskConfigContentDatasyncMergeSplitEnum {
    MERGE = 'merge', // 合并
    SPLIT = 'split'  // 拆分
}

export enum TaskConfigContentDatasyncMergeSplitTypesEnum {
    TABLE = 'table', // 表格显示
    LINE = 'line'    // 连线显示
}

// 字段合并
export class MergeFieldData {
    oldMessage = [];
    combineSymbol: string; // 合并符
    targetField: any;      // 目标段信息
    targetFieldType: any;  // 目标段信息类型
    errorType: number;     // 单行错误类型
    uuid: string;          // uuid
    del: boolean;         // 是否显示删除标志 在连线状态下,
    nickname: any;
}

// 数据转换的字段拆分
export class SplitFieldData {
    oldMessage: any;      // 原字段信息
    targetField: any;     // 目标段信息
    targetFieldType: any; // 目标段信息类型
    splitType: any;       // 拆分类型
    splitSymbol: string;  // 拆分符
    splitBit: any;        // 拆分的取位
    substrStart: any;     // 截取开始位置
    substrEnd: any;       // 截取开始位置
    errorType: number;    // 单行错误类型
    uuid: string;         // uuid
    del: boolean;         // 是否显示删除标志 在连线状态下
    nickname: any;
}

@Component({
    selector: 'task-config-content-datasync-converge-component',
    templateUrl: './task.config.content.datasync.merge.split.component.html',
    styleUrls: ['./task.config.content.datasync.merge.split.component.scss']
})
export class TaskConfigContentDatasyncMergeSplitComponent implements OnInit, OnDestroy, AfterContentInit {

    status = TaskConfigContentDatasyncMergeSplitEnum.MERGE;     // 界面类型显示状态
    statusEnum = TaskConfigContentDatasyncMergeSplitEnum;

    types = TaskConfigContentDatasyncMergeSplitTypesEnum.TABLE; // 界面要素显示状态
    typesEnum = TaskConfigContentDatasyncMergeSplitTypesEnum;

    mergeFieldData = Array<MergeFieldData>();                   // 字段组合
    splitFieldData = Array<SplitFieldData>();                   // 字段拆分

    dataCleanEnum = DataCleanEnum;

    // 拆分类型
    splitTypes = [{name: '拆分', value: 'split'}, {name: '截取', value: 'substr'}];

    inputs = [];      // 输入数据 包括采集源信息
    sourceFiles = []; // 输入源字段

    moduleNumber: number; // 类型编号

    connections = [];          // 连线集合

    parent: any;               // 父容器引用
    task: any;                 // 任务引用
    uuid: any;                 // 自己的画布项uuid

    ins: any;                  // 连线对象

    @ViewChild('jsplumbContainer')
    jsplumbContainer: ElementRef;    // 操作容器

    collectDatabaseEnum = CollectDatabaseEnum;     // 采集库类型枚举

    deleteButton = {                 // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    unsubscribes = [];               // 订阅钩子函数集合

    resizeHook: any;                 // 窗口变化钩子
    nickname: any;

    constructor(private modalService: ModalService,
                private toolService: ToolService,
                private render: Renderer2) {
    }

    ngOnInit() {
        // 这里也初始化采集信息
        this.initMergeSplitDatas();
        if (this.task && this.task.cleanList && this.task.cleanList.length) {
            // 数据还原
            this.restoreData();
        }
        this.resizeHook = this.render.listen('window', 'resize', () => {
            this.ins.repaintEverything();
        });
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
        this.resizeHook && this.resizeHook();
    }

    ngAfterContentInit() {
        setTimeout(() => {
            this.initIns();
        });
    }

    /**
     * 当页面被切换为显示的时候
     */
    onShow() {

    }

    /**
     * 初始化汇聚数据
     */
    initMergeSplitDatas() {
        // 确定显示类型
        if (this.moduleNumber === 30004) {
            this.status = TaskConfigContentDatasyncMergeSplitEnum.MERGE;
        } else if (this.moduleNumber === 30011) {
            this.status = TaskConfigContentDatasyncMergeSplitEnum.SPLIT;
        }

        // 第一步 获取汇聚连线
        let datasync = this.parent.getContentByType('datasync');
        let connections = datasync.instance.dragTargetOption.connections;
        let sources = connections.filter(c => c.targetUuid === this.uuid);
        // 从连线里拿到组件信息并获取组件数据
        sources.forEach(s => {
            let component = this.parent.getContentByUuid(s.sourceUuid);
            if (component) {
                let temp = JSON.parse(JSON.stringify(component.instance.getOriginDatas()));
                temp.sourceFiles.forEach(s => {
                    s['uuid'] = this.toolService.getUuid();                  // 给每行原始表字段新增uuid
                });

                this.inputs = temp.inputs;
                this.sourceFiles = temp.sourceFiles;
            }
        });

        if (!this.inputs.length) {
            this.modalService.alert('请先选择数据源');
            return;
        }
    }

    /**
     * 数据还原
     */
    restoreData() {
        let dataArr = this.task.cleanList.filter(s => s.jobId === this.uuid && s.moduleType === 'transfer');

        if (dataArr.length) {
            dataArr.forEach(item => {
                let config = JSON.parse(item.configAttr) || {};

                if (item.moduleNo === 30004) {
                    // 拼接转换
                    let oldMessage = [],
                        columns = config.sourceFieldName.split(','),
                        types = config.sourceFieldType.split(',');

                    columns.forEach((column, index) => {
                        oldMessage.push({
                            fieldName: column,
                            dataType: types[index]
                        });
                    });

                    this.mergeFieldData.push({
                        oldMessage: oldMessage,
                        combineSymbol: config.delimiter,           // 合并符
                        targetField: config.targetFieldName,       // 目标段信息
                        targetFieldType: config.targetFieldType,   // 目标段信息类型
                        errorType: -1,                             // 单行错误类型
                        uuid: this.toolService.getUuid(),          // uuid
                        del: true,                                 // 是否显示删除标志 在连线状态下,
                        nickname: this.nickname
                    });
                } else {
                    // 拆分转换
                    this.splitFieldData.push({
                        oldMessage: {
                            fieldName: config.sourceFieldName,
                            dataType: config.sourceFieldType
                        },
                        targetField: config.targetFieldName,
                        targetFieldType: config.targetFieldType,
                        splitType: this.splitTypes.filter(s => s.value === config.type)[0],
                        splitSymbol: config.delimiter,
                        splitBit: config.index,
                        substrStart: config.startIndex,
                        substrEnd: config.endIndex,
                        uuid: this.toolService.getUuid(),
                        nickname: this.nickname,
                        errorType: -1,
                        del: false
                    });
                }
            });
        }
    }

    /**
     * 初始化连接点
     */
    initSourcePoint() {
        let container = this.jsplumbContainer.nativeElement;
        let dragLine = container.querySelectorAll('.drag-line');

        let point = TaskConfigContentDatasyncMergeSplitComponent.getEndpointOption();

        [].forEach.call(dragLine, line => {
            ['LeftMiddle', 'RightMiddle'].forEach(p => {
                let uuid = this.toolService.getUuid();
                this.ins.addEndpoint(line, { anchors: p, uuid: uuid }, point);
                line.setAttribute(p + 'Uuid', uuid);
            });
        });
    }

    /**
     * 初始化连线
     */
    initSourceConnection() {
        let container = this.jsplumbContainer.nativeElement;
        let sources = container.querySelectorAll('.drag-line.source');
        let targets = container.querySelectorAll('.drag-line.target');

        // 合并连线初始化
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.MERGE) {
            this.mergeFieldData.forEach(field => {
                if (field.oldMessage && field.oldMessage.length && field.targetField) {
                    let targetTemp = [].filter.call(targets, t => {
                        return t.querySelector('.target-field').value === field.targetField;
                    });

                    field.oldMessage.forEach(msg => {
                        let sourceTemp = [].filter.call(sources, s => {
                            return s.querySelector('.field-name').innerHTML === msg.fieldName;
                        });
                        if (sourceTemp && sourceTemp.length && targetTemp && targetTemp.length) {
                            this.ins.connect({
                                uuids: [sourceTemp[0].getAttribute('RightMiddleUuid'), targetTemp[0].getAttribute('LeftMiddleUuid')]
                            });
                        }
                    });
                }
            });
        }

        // 拆分连线初始化
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
            this.splitFieldData.forEach((field, index) => {
                if (field.oldMessage && field.oldMessage.fieldName) {
                    let targetTemp = targets[index];

                    let sourceTemp = [].filter.call(sources, s => {
                        return s.querySelector('.field-name').innerHTML === field.oldMessage.fieldName;
                    });

                    if (sourceTemp && sourceTemp.length && targetTemp) {
                        this.ins.connect({
                            uuids: [sourceTemp[0].getAttribute('RightMiddleUuid'), targetTemp.getAttribute('LeftMiddleUuid')]
                        });
                    }
                }
            });
        }
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

                // 字段拆分 目标点不能重复连接
                if (that.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
                    let splitConnection = that.connections.filter(c => {
                        return c.targetUuid === data.target.getAttribute('uuid');
                    });
                    if (splitConnection && splitConnection.length) {
                        error = true;
                        msg = '目标字段已存在连接';
                    }
                }

                if (error) {
                    that.modalService.alert(msg);
                    setTimeout(() => { that.ins.deleteConnection(data.connection); });
                } else {
                    that.connections.push({
                        sourceUuid: data.source.getAttribute('uuid'),
                        sourceName: data.source.getAttribute('fieldname'),
                        sourceAnchor: data.sourceEndpoint.anchor.type,
                        targetUuid: data.target.getAttribute('uuid'),
                        targetAnchor: data.targetEndpoint.anchor.type,
                        targetName: data.target.getAttribute('fieldname'),
                    });

                    // 合并连线 自动连接
                    if (that.status === TaskConfigContentDatasyncMergeSplitEnum.MERGE) {
                        let targetIndex = Number(data.target.getAttribute('index'));
                        let temp = that.mergeFieldData[ targetIndex ].oldMessage.filter(field => {
                            return field.fieldName === data.source.querySelector('.field-name').innerHTML;
                        });
                        if (!temp || !temp.length) {
                            that.inputs[0].sourceFiles.forEach(s => {
                                if (s.fieldName === data.source.querySelector('.field-name').innerHTML) {
                                    that.mergeFieldData[ targetIndex ].oldMessage.push(s);
                                }
                            });
                        }
                    }

                    // 拆分连线 自动连接
                    if (that.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
                        let targetIndex = Number(data.target.getAttribute('index'));
                        that.inputs[0].sourceFiles.forEach(s => {
                            if (s.fieldName === data.source.querySelector('.field-name').innerHTML) {
                                that.splitFieldData[ targetIndex ].oldMessage = s;
                            }
                        });
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

            // 合并删除
            if (this.status === TaskConfigContentDatasyncMergeSplitEnum.MERGE) {
                this.mergeFieldData.forEach(field => {
                    if (field.targetField === connection.target.querySelector('.target-field').value) {
                        field.oldMessage = field.oldMessage.filter(f => {
                            return !(f.fieldName === connection.source.querySelector('.field-name').getAttribute('title'));
                        });
                    }
                });
            }

            // 拆分删除
            if (this.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
                console.log(this.splitFieldData);
                this.splitFieldData.forEach(field => {
                    if (field.oldMessage.fieldName === connection.source.querySelector('.field-name').getAttribute('title')) {
                        field.oldMessage = {};
                    }
                });
            }

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
     * 标记画布被修改
     */
    markupUpdating() {
        this.task.updating = true;
    }

    /**
     * 是否显示 输出字段删除行按钮
     * @param {boolean} show
     * @param {number} index
     */
    showDel(show: boolean, index: number) {
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.MERGE) {
            this.mergeFieldData[index].del = show;
        }
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
            this.splitFieldData[index].del = show;
        }
    }

    /**
     * 点击输出字段删除
     * @param {number} index
     */
    delClick(index: number) {
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.MERGE) {
            this.mergeFieldData.splice(index, 1);
        }
        if (this.status === TaskConfigContentDatasyncMergeSplitEnum.SPLIT) {
            this.splitFieldData.splice(index, 1);
        }
        // 重新绘制点和连线
        this.updatePointAndConnection();
    }

    /**
     * 添加新的输出行
     */
    addOutputClick() {
        let uuid = this.toolService.getUuid();
        // 添加新的行
        this.addRowClick(this.status, uuid);

        setTimeout(() => {
            let container = this.jsplumbContainer.nativeElement;
            let dragLine = container.querySelector('.drag-line[uuid="' + uuid + '"]');
            let point = TaskConfigContentDatasyncMergeSplitComponent.getEndpointOption();

            ['LeftMiddle', 'RightMiddle'].forEach(p => {
                this.ins.addEndpoint(dragLine, { anchors: p }, point);
            });
        }, 300);
    }

    /**
     * 由其他组件调用，当其他组件改变了输入源的时候
     */
    impactCallback() {
        this.connections.length = 0;
        this.inputs.length = 0;
        this.ins.deleteEveryConnection();
        this.ins.deleteEveryEndpoint();

        this.initMergeSplitDatas();
    }

    /**
     * 显示类型切换
     * @param {TaskConfigContentDatasyncMergeSplitTypesEnum} types
     */
    changeTypes(types: TaskConfigContentDatasyncMergeSplitTypesEnum) {
        if (this.types !== types) {
            this.types = types;
            // 绘制点和连线
            if (this.types === TaskConfigContentDatasyncMergeSplitTypesEnum.LINE) {
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
     * 根据类型 添加新的行
     * @param {string} type 添加类型
     * @param {string} uuid 行uuid
     */
    addRowClick(type: string, uuid?: string) {
        switch (type) {
            case DataCleanEnum.MERGE:
                this.mergeFieldData.push({
                    oldMessage: [],
                    targetField: '',
                    targetFieldType: '',
                    combineSymbol: '',
                    errorType: -1,
                    uuid: uuid || this.toolService.getUuid(),
                    del: false,
                    nickname: this.nickname || ''
                }) ;
                break;
            case DataCleanEnum.SPLIT:
                this.splitFieldData.push({
                    oldMessage: {fieldName: '', dataType: ''},
                    targetField: '',
                    targetFieldType: '',
                    splitType: this.splitTypes[0],
                    splitSymbol: '',
                    splitBit: '',
                    substrStart: 0,
                    substrEnd: '',
                    errorType: -1,
                    uuid: uuid || this.toolService.getUuid(),
                    del: false,
                    nickname: this.nickname || ''
                }) ;
                break;
        }

        this.markupUpdating();
    }

    /**
     * 删除各类型数据的指定行
     * @param {number} i
     * @param {DataCleanEnum} deleteType
     */
    deleteField(i: number, deleteType: DataCleanEnum) {
        switch (deleteType) {
            case DataCleanEnum.MERGE:
                this.mergeFieldData.splice(i, 1);
                break;
            case DataCleanEnum.SPLIT:
                this.splitFieldData.splice(i, 1);
                break;
        }

        this.markupUpdating();
    }

    /**
     * 原字段的选择
     */
    sourceFileChecked(file: any) {
        switch (file.type) {
            case 'splitField':
                this.splitFieldData[file.index].oldMessage['fieldName'] = file.checked.fieldName;
                this.splitFieldData[file.index].oldMessage['dataType'] = file.checked.dataType;
                break;
            case 'splitType':
                this.splitFieldData[file.index]['splitType'] = file.checked;
                // 当选择拆分的时候 清除截取位置
                if (this.splitFieldData[file.index]['splitType'].value === 'split') {
                    this.splitFieldData[file.index].substrStart = '0';
                    this.splitFieldData[file.index].substrEnd = '';
                }
                // 当选择截取的时候 清除拆分符 取位值
                if (this.splitFieldData[file.index]['splitType'].value === 'substr') {
                    this.splitFieldData[file.index].splitSymbol = '';
                    this.splitFieldData[file.index].splitBit = '';
                }
                break;
            case 'mergeField':
                break;
        }

        this.markupUpdating();
    }

    /**
     * 连线状态下 切换拆分类型
     * @param {string} type
     * @param {number} index
     */
    splitTypeClick(type: string, index: number) {
        this.splitFieldData[index].splitType = {name: (type === 'split' ? '拆分' : '截取'), value: type};
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
     * 返回向下个组件传递的原始数据
     * @returns {{gatherBankType: any; gatherSource: any; gatherSourceTable: any; sourceFiles: any[]}}
     */
    getOriginDatas() {
        let sourceOutputFiles = [];
        let data = null;
        data = this.moduleNumber === 30004 ? this.mergeFieldData : this.splitFieldData;
        data.forEach(field => {
            if (field.targetField) {
                // 去重
                let find = this.sourceFiles.filter(r => {
                    return r.fieldName === field.targetField;
                });
                if (!find.length) {
                    sourceOutputFiles.push({
                        fieldName: field.targetField,
                        dataType: field.targetFieldType || 'string'
                    });
                }
            }
        });

        return {
            inputs: this.inputs,
            sourceFiles: this.sourceFiles.concat(sourceOutputFiles)
        };
    }

}
