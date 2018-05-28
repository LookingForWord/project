/**
 * Created by LIHUA on 2018-02-06.
 * 汇聚转换
 */

declare let jsPlumb: any;

import {AfterContentInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';

@Component({
    selector: 'task-config-content-datasync-converge-component',
    templateUrl: './task.config.content.datasync.converge.component.html',
    styleUrls: ['./task.config.content.datasync.converge.component.scss']
})
export class TaskConfigContentDatasyncConvergeComponent implements OnInit, OnDestroy, AfterContentInit {

    inputs = [];      // 输入数据 包括采集源信息
    inputFiles = []; // 输入字段信息
    outputs = [];     // 输出数据 包括输出字段信息

    dataTypes = [
        {name: 'string', value: 'string'},
        {name: 'int', value: 'int'},
        {name: 'bigint', value: 'bigint'},
        {name: 'boolean', value: 'boolean'}
    ];

    connections = [];  // 连线集合

    parent: any;       // 父容器引用
    task: any;         // 任务引用
    uuid: any;         // 自己的画布项uuid
    nickname: any;     // 别名
    ins: any;          // 连线对象

    @ViewChild('jsplumbContainer') jsplumbContainer: ElementRef; // 操作容器
    collectDatabaseEnum = CollectDatabaseEnum;                   // 采集库类型枚举
    deleteButton = {                                             // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    unsubscribes = [];  // 订阅钩子函数集合
    resizeHook: any;    // 窗口变化钩子

    constructor(private modalService: ModalService,
                private toolService: ToolService,
                private render: Renderer2) {
    }

    ngOnInit() {
        // 这里也初始化采集信息 清洗信息
        this.initConvergeDatas();

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
     * 界面还原
     */
    restoreData() {
        if (this.task && this.task.cleanList && this.task.cleanList.length) {
            let dataArr = this.task.cleanList.filter(s => s.jobId === this.uuid);

            if (dataArr.length) {
                // 根据输入字段名字和别名获取字段uuid
                let getSourceUuidByFieldName = (nickname, fieldName) => {
                    let uuid = '';
                    this.inputFiles.forEach(input => {
                        if (input.nickname === nickname) {
                            input.sourceFiles.forEach(field => {
                                if (field.fieldName === fieldName) {
                                    uuid = field.uuid;
                                }
                            });
                        }
                    });
                    return uuid;
                };

                // 根据输出字段名字获取字段uuid
                let getOutputUuidByFieldName = (fieldName) => {
                    let uuid = '';
                    this.outputs.forEach(output => {
                        if (output.fieldName === fieldName) {
                            uuid = output.uuid;
                        }
                    });
                    return uuid;
                };

                dataArr.forEach(item => {
                    let config = JSON.parse(item.configAttr) || {};

                    if (config.outputs) {
                        // config.outputs.forEach(output => {
                        //     output['uuid'] = this.toolService.getUuid();
                        //     this.outputs.push(output);
                        // });
                        this.outputs = config.outputs;
                    }

                    let map = config.map,
                        join = config.join.split(',');

                    map.forEach(m => {
                        let temp = m.split('=');
                        let target = temp[0].split('.'),
                            source = temp[1].split('.');
                        let targetFieldName = target[1],
                            sourceNickName = source[0],
                            sourceFieldName = source[1];

                        setTimeout(() => {
                            // outputs赋值后 需要渲染到界面上 所以这里用一个延迟
                            let sourceUuid = getSourceUuidByFieldName(sourceNickName, sourceFieldName),
                                sourceElement = this.jsplumbContainer.nativeElement.querySelector('.drag-line[uuid="' + sourceUuid + '"]'),
                                targetUuid = getOutputUuidByFieldName(targetFieldName),
                                targetElement = this.jsplumbContainer.nativeElement.querySelector('.drag-line[uuid="' + targetUuid + '"]');

                            // 输出字段新增连接点
                            let point = TaskConfigContentDatasyncConvergeComponent.getEndpointOption();
                            ['LeftMiddle', 'RightMiddle'].forEach(p => {
                                let uuid = this.toolService.getUuid();
                                this.ins.addEndpoint(targetElement, { anchors: p, uuid: uuid }, point);
                                targetElement.setAttribute(p + 'Uuid', uuid);
                            });
                            // 产生连接
                            this.ins.connect({
                                uuids: [sourceElement.getAttribute('rightMiddleUuid'), targetElement.getAttribute('leftMiddleUuid')]
                            });
                        });
                    });

                    join.forEach(j => {
                        let temp = j.split('=');
                        let target = temp[0].split('.'),
                            source = temp[1].split('.');
                        let targetNickName = target[0],
                            targetFieldName = target[1],
                            sourceNickName = source[0],
                            sourceFieldName = source[1];

                        setTimeout(() => {
                            let sourceUuid = getSourceUuidByFieldName(sourceNickName, sourceFieldName),
                                sourceElement = this.jsplumbContainer.nativeElement.querySelector('.drag-line[uuid="' + sourceUuid + '"]'),
                                targetUuid = getSourceUuidByFieldName(targetNickName, targetFieldName),
                                targetElement = this.jsplumbContainer.nativeElement.querySelector('.drag-line[uuid="' + targetUuid + '"]');

                            // 产生连接
                            this.ins.connect({
                                uuids: [sourceElement.getAttribute('leftMiddleUuid'), targetElement.getAttribute('leftMiddleUuid')]
                            });
                        });
                    });

                });
            }
        }
    }

    /**
     * 当页面被切换为显示的时候
     */
    onShow() {

    }

    /**
     * 初始化汇聚数据
     */
    initConvergeDatas() {
        // 第一步 获取汇聚连线
        let datasync = this.parent.getContentByType('datasync');
        let connections = datasync.instance.dragTargetOption.connections;
        let sources = connections.filter(c => c.targetUuid === this.uuid);

        let index = 0;
        // 从连线里拿到组件信息并获取组件数据
        sources.forEach(s => {
            let component = this.parent.getContentByUuid(s.sourceUuid);
            if (component) {
                let temp = JSON.parse(JSON.stringify(component.instance.getOriginDatas()));
                temp.sourceFiles.forEach(s => {
                    s['uuid'] = this.toolService.getUuid();
                });

                this.inputs = this.inputs.concat(temp.inputs);
                this.inputFiles.push({
                    sourceFiles: temp.sourceFiles,
                    nickname: temp.nickname
                });
                index++;
            }
        });

        if (index !== 2) {
            this.modalService.alert('汇聚转换的必须接受两个输入源');
        } else {
            setTimeout(() => {
                this.initMakeSourceConetnt();
                this.restoreData();
            }, 300);
        }
    }

    /**
     * 初始化连线点
     */
    initMakeSourceConetnt() {
        let container = this.jsplumbContainer.nativeElement;
        let dragLine = container.querySelectorAll('.drag-line');

        let point = TaskConfigContentDatasyncConvergeComponent.getEndpointOption();

        [].forEach.call(dragLine, line => {
            ['LeftMiddle', 'RightMiddle'].forEach(p => {
                let uuid = this.toolService.getUuid();
                this.ins.addEndpoint(line, { anchors: p, uuid: uuid }, point);
                line.setAttribute(p + 'Uuid', uuid);
            });
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
                    msg = '两个连接项已存在连线关系，请勿重复连线';
                }

                if (error) {
                    that.modalService.alert(msg);
                    setTimeout(() => { that.ins.deleteConnection(data.connection); });
                } else {
                    that.connections.push({
                        sourceUuid: data.source.getAttribute('uuid'),
                        sourceAnchor: data.sourceEndpoint.anchor.type,
                        sourceNickname: data.source.getAttribute('nickname'), // 别名
                        sourceKey: data.source.getAttribute('source'),        // 是否是输入
                        targetUuid: data.target.getAttribute('uuid'),
                        targetAnchor: data.targetEndpoint.anchor.type,
                        targetNickname: data.target.getAttribute('nickname'),
                        targetKey: data.target.getAttribute('source'),
                    });
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
        this.outputs[index].del = show;
    }

    /**
     * 点击输出字段删除
     * @param {number} index
     */
    delClick(index: number) {
        let del = this.outputs[index];
        // 删除连线和连接点 参数为dom节点
        this.ins.remove(this.jsplumbContainer.nativeElement.querySelector('.drag-line[uuid="' + del.uuid + '"]'));
        // 删除连线记录
        this.connections = this.connections.filter(connection => connection.targetUuid !== del.uuid);
        // 删除原始数据
        this.outputs.splice(index, 1);

        this.markupUpdating();
    }

    /**
     * 添加新的输出行
     */
    addOutputClick() {
        let uuid = this.toolService.getUuid();
        this.outputs.push({
            fieldName: '',
            dataType: this.dataTypes[0],
            uuid: uuid,
            del: false // 是否显示删除
        });

        setTimeout(() => {
            let container = this.jsplumbContainer.nativeElement;
            let dragLine = container.querySelector('.drag-line[uuid="' + uuid + '"]');
            let point = TaskConfigContentDatasyncConvergeComponent.getEndpointOption();

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

        this.initConvergeDatas();
    }

    /**
     * 返回画布首页
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

        let temp = [];
        elements.forEach(e => {
            cons.forEach(c => {
                if (e.uuid === c.sourceUuid) {
                    temp.push(e.nickname);
                }
            });
        });

        return temp.join(',');
    }

    /**
     * 返回向下个组件传递的原始数据
     * @returns {{inputs: any[]; sourceFiles: any[]}}
     */
    getOriginDatas() {
        let sourceFiles = [];
        this.outputs.forEach(output => {
            sourceFiles.push({
                fieldName: output.fieldName,
                dataType: 'string'
            });
        });

        return {
            inputs: this.inputs,
            sourceFiles: sourceFiles,
            nickname: this.nickname
        };
    }

    /**
     * 数据检查
     */
    dataCheck() {
        let success = true;

        let temp = this.connections.filter(connection => connection.sourceKey === 'true' && connection.targetKey === 'true');
        if (temp.length <= 0) {
            this.modalService.alert('数据汇聚必须存在join关系');
            success = false;
        }
        temp = this.connections.filter(connection => connection.sourceKey === 'true' && connection.targetKey === 'false');
        if (temp.length <= 0) {
            this.modalService.alert('数据汇聚必须存在map关系');
            success = false;
        }

        if (!success) {
            return;
        }

        return true;
    }

}
