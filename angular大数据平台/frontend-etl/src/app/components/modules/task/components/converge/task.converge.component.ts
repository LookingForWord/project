/**
 * Created by lh on 2017/12/17.
 * 数据汇聚
 */
import {ConnectOptions, JsplumbTool} from '../../../../../../frontend-common/tools/jsplumb.tool';

declare var jsPlumb: any;

import { Component, ElementRef, Renderer2, ViewChild, OnInit} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {TaskService} from 'app/services/task.service';
import {RepositoryService} from 'app/services/repository.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';


@Component({
    selector: 'task-converge-component',
    templateUrl: './task.converge.component.html',
    styleUrls: ['./task.converge.component.scss']
})
export class TaskConvergeComponent implements OnInit {
    leftState: number;   // 根据导航栏宽度，修改自身left值
    error = 0 ;

    configName = '';     // 配置名称
    dbType: any;         // 仓库类型
    // 仓库类型集合
    dbTypes = [];

    // 目标数据库
    targetDbType: any;

    // 源数据源集合
    dbSourceArr = [];
    dbSource: any;

    // 目标数据源集合
    targetSourceArr = [];
    targetSource: any;

    // 源表集合
    tableArr = [];
    table: any;

    // 目标表集合
    targetTableArr = [];
    targetTable: any;

    tabId = 'source';

    // 汇聚类型
    convergeTypeArr = [
        {name: '多表合一', 'value': 'merge'},
        {name: '一表多拆', 'value': 'split'}
    ];
    convergeType = {
        name: '多表合一', 'value': 'merge'
    };

    @ViewChild('dragOrigin')
    dragOrigin: ElementRef;

    @ViewChild('dragTarget')
    dragTarget: ElementRef;

    ins: any;              // 连线对象
    drapPos: any;          // 拖动对象
    config = [];           // 可拖动的表集合
    saved = false;         // 已成功连线保存过

    tableMessageArr = [];  // 表字段信息

    // 拖动区域属性
    dragTargetOption = {
        width: 2000,       // 画布长度
        height: 2000,      // 画布宽度
        x: 0,              // 画布x轴位置
        y: 0,              // 画布y轴位置
        scale: 1,          // 画布放大比例
        draging: false,    // 画布是否正在被拖动
        wheelEvents: [],   // 鼠标滚动事件
        moveEvents: [],    // 鼠标移动事件
        elements: [],      // 子元素集合
        connections: []    // 连接集合
    };
    sourceOptions = [];
    dragTargetPosition: SafeStyle;
    deleteButton = {                // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    constructor(private datatransferService: DatatransferService,
                private taskService: TaskService,
                private repositoryService: RepositoryService,
                private render: Renderer2,
                private sanitizer: DomSanitizer,
                private toolService: ToolService,
                private modalService: ModalService,
                private validateService: ValidateService
    ) {
        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
    }

    ngOnInit () {
        this.repositoryService.getAllDict('w_warehouseType').then(d => {
            if (d.success && d.message) {
                let arr = [];
                d.message.forEach(item => {
                    arr.push({name: item.value, value: item.value});
                });
                this.dbTypes = arr;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 初始化计算拖动区域的位置
     */
    initDragTargetPosition() {
        let parent = this.dragTarget.nativeElement.parentNode;
        let parentWidth = parent.offsetWidth,
            parentHeight = parent.offsetHeight;

        // 拖动区域的中心在父容器的中心
        this.dragTargetOption.x = - (this.dragTargetOption.width - parentWidth) / 2;
        this.dragTargetOption.y = - (this.dragTargetOption.height - parentHeight) / 2;

        this.getDragTargetPosition();
    }

    /**
     * 操作区域事件定义
     */
    initDragTargetEvent() {
        this.render.listen(this.dragTarget.nativeElement, 'mouseenter', (event) => {
            // 滚轮事件 放大缩小
            let mousewheel = this.render.listen(this.dragTarget.nativeElement, 'mousewheel', (e) => {
                this.mouseWheelFunc(e);
            });
            let dOMMouseScroll = this.render.listen(this.dragTarget.nativeElement, 'DOMMouseScroll', (e) => {
                this.mouseWheelFunc(e);
            });
            this.dragTargetOption.wheelEvents.push(mousewheel);
            this.dragTargetOption.wheelEvents.push(dOMMouseScroll);
        });
        this.render.listen(this.dragTarget.nativeElement, 'mouseleave', (event) => {
            this.dragTargetOption.wheelEvents.forEach(e => e());
            this.dragTargetOption.wheelEvents.length = 0;
        });

        let pageX, pageY; // 位置暂存

        // 点击事件 拖拽
        this.render.listen(this.dragTarget.nativeElement, 'mousedown', (mousedownEvent) => {
            this.dragTargetOption.draging = true;

            pageX = mousedownEvent.pageX;
            pageY = mousedownEvent.pageY;

            let move = this.render.listen(document, 'mousemove', (mousemoveEvent) => {
                this.dragTargetOption.draging = true;

                this.dragTargetOption.x = this.dragTargetOption.x + (mousemoveEvent.pageX - pageX);
                this.dragTargetOption.y = this.dragTargetOption.y + (mousemoveEvent.pageY - pageY);

                pageX = mousemoveEvent.pageX;
                pageY = mousemoveEvent.pageY;

                this.getDragTargetPosition();

            });

            let up = this.render.listen(document, 'mouseup', (mouseupEvent) => {
                if (this.dragTargetOption.draging) {
                    this.dragTargetOption.draging = false;
                    this.dragTargetOption.moveEvents.forEach(e => e());
                    this.dragTargetOption.moveEvents.length = 0;
                }
            });

            this.dragTargetOption.moveEvents.push(move);
            this.dragTargetOption.moveEvents.push(up);

        });
    }

    /**
     * 计算鼠标滚动
     * @param event
     */
    mouseWheelFunc(event: any) {
        JsplumbTool.doMousewheelScale(event, this.dragTargetOption);
        this.getDragTargetPosition();
    }

    /**
     * 调整放大缩小
     */
    adjustRatio(type: string) {
        JsplumbTool.doMouseclickScale(type, this.dragTargetOption);
        this.getDragTargetPosition();
    }

    /**
     * 计算拖动容器位置
     */
    getDragTargetPosition() {
        this.dragTargetPosition = JsplumbTool.getDragTargetPosition(this.sanitizer, this.dragTargetOption);
    }

    /**
     * 初始化
     */
    initJsplumb() {
        const that = this;

        jsPlumb.ready(() => {
            // 连线初始化参数
            that.ins = jsPlumb.getInstance({
                Container: that.dragTarget.nativeElement,
                EndpointStyle: {radius: 3, fill: '#108EE9', stroke: '#CCDDEE', strokeWidth: 2},
                PaintStyle: {strokeWidth: 0.5, stroke: '#108ee9', outlineStroke: 'transparent', outlineWidth: 5},
                Connector: [ 'Bezier', { curviness: 65 } ],
                HoverPaintStyle: { stroke: 'orange' },
                ConnectionOverlays: [                                                   // 连接箭头
                    ['Arrow', {width: 6, length: 6, location: 0.5}]
                ]
            });

            // drag事件 拖拽
            that.ins.draggable(that.dragOrigin.nativeElement.querySelectorAll('.drag-item'), {
                clone: true,
                drag: function (event) {
                    that.drapPos = event.pos;
                }
            });

            // drop事件 释放
            that.ins.droppable(that.dragTarget.nativeElement, {
                drop: function (event) {
                    if (event.drag.el.classList.contains('drag-item')) {
                        let element = that.dragTargetOption.elements.filter(ele => {
                            event.drag.el.setAttribute('type', that.tabId);
                            return  (
                                ele.moduleNumber === event.drag.el.getAttribute('moduleNumber') &&
                                ele.type === event.drag.el.getAttribute('type')
                            );
                        });

                        let parentEle = event.e.target.parentNode;
                        if (element && element.length && !parentEle.classList.contains('drag-target') && !parentEle.classList.contains('drag-item')) {
                            that.modalService.alert('同一个表只能配置一次');
                            return;
                        } else if (!parentEle.classList.contains('drag-target') && !parentEle.classList.contains('drag-item')) {
                            // 判断多表合一、一表多拆
                            // 多表合一只能有一个目标表 一表多拆只能有一个源表
                            let source = 0;
                            let target = 0;
                            that.dragTargetOption.elements.forEach(item => {
                                if (that.convergeType.value === 'merge') {
                                    item.type === 'target' && target++;
                                } else if (that.convergeType.value === 'split') {
                                    item.type === 'source' && source ++;
                                }
                            });
                            if (that.convergeType.value === 'merge' && that.tabId === 'target' && target > 0) {
                                that.modalService.alert('多表合一只能有一个目标表');
                                return;
                            }
                            if (that.convergeType.value === 'split' && that.tabId === 'source' && source > 0) {
                                that.modalService.alert('一表多拆只能有一个源表');
                                return;
                            }
                            that.taskService.getTableField({
                                tableId: event.e.target.getAttribute('moduleId')
                            }).then( d => {

                                if (d.success) {
                                    if (d.message.length) {
                                        that.createItem(event, d.message, that.tabId);
                                    } else {
                                        that.modalService.alert('该表无任何信息');
                                    }
                                } else {
                                    that.modalService.alert(d.message);
                                }
                            });

                        }
                    }
                }
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {

                // console.log(data.source.attributes['uuid']['value'], data.target.attributes['uuid']['value']);
                // 用来存储连线的操作的对象，根据需要再加
                let connection = {
                    sourceType: data.source.getAttribute('type'),
                    sourceUuid: data.source.getAttribute('uuid'),
                    sourceParent: data.source.getAttribute('parentName'),   // 表名data.source.attributes['uuid']['value']
                    sourceFieldType: data.source.getAttribute('fieldType'), // 源表字段名
                    sourceFieldName: data.source.getAttribute('fieldName'), // 源表字段值
                    sourceIndex: data.source.getAttribute('index'),
                    sourceAnchor: data.sourceEndpoint.anchor.type,
                    targetType: data.target.getAttribute('type'),
                    targetUuid: data.target.getAttribute('uuid'),
                    targetParent: data.target.getAttribute('parentName'),   // 目标表名
                    targetFieldType: data.target.getAttribute('fieldType'), // 目标表字段名
                    targetFieldName: data.target.getAttribute('fieldName'), // 目标表字段值
                    targetIndex: data.target.getAttribute('index'),
                    targetAnchor: data.targetEndpoint.anchor.type
                };
                if (data.connection.scope === 'auto') {
                    that.dragTargetOption.connections.push(connection);
                } else {
                    // 不能自己表内相连
                    if (connection.sourceParent === connection.targetParent && connection.sourceType === connection.targetType) {
                        that.modalService.alert('同一个表内无法连线');
                        that.ins.deleteConnection(data.connection);
                        return;
                    }

                    // 目标表只能作为连线终点
                    if (connection.sourceType === 'target') {
                        that.modalService.alert('目标表只能作为连线终点');
                        that.ins.deleteConnection(data.connection);
                        return;
                    }
                    if (that.dragTargetOption.connections.length === 0) {
                        that.dragTargetOption.connections.push(connection);
                    } else {
                        let result = false;
                        that.dragTargetOption.connections.forEach(con => {
                            // 重复连线
                            if (
                                (con.sourceUuid === connection.sourceUuid && con.targetUuid === connection.targetUuid) ||
                                (con.sourceUuid === connection.targetUuid && con.targetUuid === connection.sourceUuid)
                            ) {
                                that.modalService.alert('请勿重复连线');
                                that.ins.deleteConnection(data.connection);
                                result = true;
                                return;
                            }
                            // 多表合一时目标表字段只能连一次
                            if (con.targetUuid === connection.targetUuid &&
                                con.targetType === 'target' &&
                                that.convergeType.value === 'merge'
                            ) {
                                that.modalService.alert('目标表字段只能连线一次');
                                that.ins.deleteConnection(data.connection);
                                result = true;
                                return;
                            }
                        });
                        !result && that.dragTargetOption.connections.push(connection);
                    }
                }
            });

            // 解除连线事件监听 这里没有必要监听是因为全部点击的删除按钮删除的连线 后续操作都定义在删除按钮那里
            // that.ins.bind('connectionDetached', function (data) {});

            // 右键点击 显示出删除连线按钮
            that.ins.bind('contextmenu', function (connection, originalEvent: MouseEvent) {
                // 判断是否存在删除按钮 存在就先删除
                if (that.deleteButton.dom) {
                    that.deleteButton.remove();
                }
                // 新增删除按钮
                that.createDeleteLineItem(connection, originalEvent);
                originalEvent.preventDefault();
            });
        });
    }

    /**
     * 确认删除连线按钮
     * @param connection
     * @param {MouseEvent} originalEvent
     */
    createDeleteLineItem(connection, originalEvent: MouseEvent) {
        let div = document.createElement('div');
        div.innerHTML = '删除连线？';
        div.classList.add('drag-delete-line');
        // 获取父元素的文本位置
        let dragTargetContainerPos = JsplumbTool.getElementAbsolutePosition(this.dragTarget.nativeElement.parentNode);

        // 获取鼠标的当前坐标
        let absX = originalEvent.pageX - dragTargetContainerPos.x;
        let absY = originalEvent.pageY - dragTargetContainerPos.y;
        absX = Math.abs(this.dragTargetOption.x) + absX;
        absY = Math.abs(this.dragTargetOption.y) + absY;
        // 确定删除按钮的文本位置
        div.style.left = absX + 'px';
        div.style.top = absY + 'px';

        // 点击删除连线
        let divEvent = this.render.listen(div, 'click', (e: MouseEvent) => {
            // 删除连线记录
            this.dragTargetOption.connections = this.dragTargetOption.connections.filter(c => {
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

        this.dragTarget.nativeElement.appendChild(div);
    }

    /**
     * 左侧拖动到目标区域 生成新的item
     * @param event
     */
    createItem(event: any, arr: any, tabId: any) {
        // 应调用对应接口，获取该表详细数据再创建DOM
        let uuid = this.toolService.getUuid();

        let moduleNumber = event.drag.el.getAttribute('moduleNumber');
        let moduleName = event.drag.el.getAttribute('moduleName');
        event.drag.el.setAttribute('tabId', this.tabId);

        // 创建DOM元素
        let container = this.dragTarget.nativeElement;

        let div = document.createElement('div');
        div.classList.add('converge-item');

        div.setAttribute('uuid', uuid);
        div.setAttribute('moduleNumber', moduleNumber);
        div.setAttribute('moduleName', moduleName);
        div.setAttribute('type', tabId);
        div.setAttribute('title', tabId === 'target' ? '目标表' : '源表');
        let messageArr = arr;
        div.innerHTML += ('<h4>' + event.e.target.innerHTML + '</h4><h5><span>字段名</span><span>类型</span></h5>');

        // 创建删除按钮DOM元素
        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('delete');
        i.classList.add('icon-ico_tab_close');
        i.setAttribute('uuid', uuid); // 这个uuid是表id 用于删除的时候传递
        div.appendChild(i);

        // 确定新增DOM元素的位置偏移
        let parentPosition = JsplumbTool.getElementAbsolutePosition(container);
        let x = this.drapPos[0] - parentPosition.x;
        let y = this.drapPos[1] - parentPosition.y;
        x  = x - this.dragTargetOption.x;
        y  = y - this.dragTargetOption.y;
        div.style.left = x + 'px';
        div.style.top = y + 'px';

        messageArr && messageArr.length && messageArr.forEach((item, index) => {
            let p = document.createElement('p');
            p.innerHTML = '<span title=' + item.fieldName + '>' + item.fieldName + '</span><span title=' + item.dataType + '>' + item.dataType + '</span>';

            p.setAttribute('parentName', moduleName);
            p.setAttribute('fieldType', item.dataType);
            p.setAttribute('fieldName', item.fieldName);
            p.setAttribute('index', index);
            p.setAttribute('uuid', uuid + '_' + index);
            p.setAttribute('type', tabId);
            p.style.borderTop = '1px solid #CCDDEE';
            div.appendChild(p);
            this.ins.makeSource(p, {
                anchor: ['Continuous', { faces: ['left', 'right'] } ],
                connectionsDetachable: false
            });
            this.ins.makeTarget(p, {
                anchor: ['Continuous', { faces: ['left'] } ],
                connectionsDetachable: false
            });
            this.createItemEvent(div, i, p);
        });

        container.appendChild(div);

        let element = {
            name: event.e.target.name,
            moduleNumber: moduleNumber,
            moduleName: moduleName,
            uuid: uuid,
            type: tabId,
            x: x,
            y: y
        };
        this.dragTargetOption.elements.push(element);
        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                // element.x = e.pos[0];
                // element.y = e.pos[1];
            }
        });

        // 同名字段自动连接
        let sourceArr = document.querySelectorAll('.converge-item.jtk-draggable[type="source"] p');
        let targetArr = document.querySelectorAll('.converge-item.jtk-draggable[type="target"] p');

        let that = this;
        if (sourceArr.length && targetArr.length && this.convergeType.value === 'merge') {
            // that.dragTargetOption.connections = [];
            for (let j = 0; j < targetArr.length; j++) {
                let source = document.querySelector('.converge-item.jtk-draggable[type="source"] p[fieldName="' + targetArr[j].getAttribute('fieldName').toLowerCase() + '"]') ||
                    document.querySelector('.converge-item.jtk-draggable[type="source"] p[fieldName="' + targetArr[j].getAttribute('fieldName').toUpperCase() + '"]');
                if (this.dragTargetOption.connections.length === 0 && source) {
                    // let op = JsplumbTool.getConnectOptions({
                    //     source: source,
                    //     target: targetArr[j],
                    //     anchors: ['Right', 'Left'],
                    //     arrowWidth: 6,
                    //     scope: 'auto'
                    // } as ConnectOptions);
                    let op = {
                        source: source,
                        target: targetArr[j],
                        anchors: ['Right', 'Left'],
                        scope: 'auto'
                    };

                    that.ins.connect(op);
                } else {
                    let result = true;
                    this.dragTargetOption.connections.forEach(connect => {
                        if (source && connect.sourceUuid === source.getAttribute('uuid')) {
                            result = false;
                        }
                    });
                    if (result && source) {
                        // let op = JsplumbTool.getConnectOptions({
                        //     source: source,
                        //     target: targetArr[j],
                        //     anchors: ['Right', 'Left'],
                        //     scope: 'auto'
                        // } as ConnectOptions);
                        let op = {
                            source: source,
                            target: targetArr[j],
                            anchors: ['Right', 'Left'],
                            scope: 'auto'
                        };
                        that.ins.connect(op);
                    }
                }
            }
        } else if (sourceArr.length && targetArr.length && this.convergeType.value === 'split') {
            // that.dragTargetOption.connections = [];
            for (let j = 0; j < sourceArr.length; j++) {
                let target = document.querySelector('.converge-item.jtk-draggable[type="target"] p[fieldName="' + sourceArr[j].getAttribute('fieldName').toLowerCase() + '"]') ||
                    document.querySelector('.converge-item.jtk-draggable[type="target"] p[fieldName="' + sourceArr[j].getAttribute('fieldName').toUpperCase() + '"]');
                if (this.dragTargetOption.connections.length === 0 && target) {
                    // let op = JsplumbTool.getConnectOptions({
                    //     source: sourceArr[j],
                    //     target: target,
                    //     anchors: ['Right', 'Left'],
                    //     arrowWidth: 6,
                    //     scope: 'auto'
                    // } as ConnectOptions);
                    let op = {
                        source: sourceArr[j],
                        target: target,
                        anchors: ['Right', 'Left'],
                        scope: 'auto'
                    };
                    that.ins.connect(op);
                } else {
                    let result = true;
                    this.dragTargetOption.connections.forEach(connect => {
                        if (target && connect.targetUuid === target.getAttribute('uuid')) {
                            result = false;
                        }
                    });
                    if (result && target) {
                        // let op = JsplumbTool.getConnectOptions({
                        //     source: sourceArr[j],
                        //     target: target,
                        //     anchors: ['Right', 'Left'],
                        //     arrowWidth: 6,
                        //     scope: 'auto'
                        // } as ConnectOptions);
                        let op = {
                            source: sourceArr[j],
                            target: target,
                            anchors: ['Right', 'Left'],
                            scope: 'auto'
                        };
                        that.ins.connect(op);
                    }
                }
            }
        }
    }

    /**
     * 给画布元素绑定事件
     * @param {Element} div
     * @param {Element} i
     */
    createItemEvent(div: Element, i: Element, p: Element) {
        // 鼠标移入 显示删除图标
        this.render.listen(div, 'mouseenter', (e: MouseEvent) => {
            div.querySelector('.delete').classList.add('show');
        });
        // 鼠标移出 隐藏删除图标
        this.render.listen(div, 'mouseleave', (e: MouseEvent) => {
            div.querySelector('.delete').classList.remove('show');
        });
        //
        // 点击删除  注意删除dragTargetOption里对应节
        this.render.listen(i, 'click',  (e: MouseEvent) => {
            this.ins.removeAllEndpoints(p);
            this.ins.deleteConnectionsForElement(div);
            div && div.parentNode && div.parentNode.removeChild(div);

            // 删除节点
            this.dragTargetOption.elements = this.dragTargetOption.elements.filter(ele => {
                return ele.uuid !== i.getAttribute('uuid');
            });

            // 删除连线对象
            const  uuid = String(i.getAttribute('uuid'));
            let newConnections = [];
            this.dragTargetOption.connections.forEach(item => {
                let result = item.sourceUuid.indexOf(uuid) === -1 && item.targetUuid.indexOf(uuid) === -1;
                if (result === true) {
                    newConnections.push(item);
                }
            });
            this.dragTargetOption.connections = newConnections;
            e.stopPropagation();
        });

    }

    /**
     * 格式化画布放大缩小倍数
     * @returns {string}
     */
    getScaleView() {
        return (this.dragTargetOption.scale * 100).toFixed(0) + '%';
    }

    /**
     * 重置画布
     */
    reset (name?: any) {
        document.querySelector('.field-message .drag-target').innerHTML = '';

        this.ins = null;            // 连线对象
        this.drapPos = null;        // 拖动对象
        // 拖动区域属性
        this.dragTargetOption = {
            width: 2000,            // 画布长度
            height: 2000,           // 画布宽度
            x: 0,                   // 画布x轴位置
            y: 0,                   // 画布y轴位置
            scale: 1,               // 画布放大比例
            draging: false,         // 画布是否正在被拖动
            wheelEvents: [],        // 鼠标滚动事件
            moveEvents: [],         // 鼠标移动事件
            elements: [],           // 子元素集合
            connections: []         // 连接集合
        };
        this.deleteButton = {       // 删除按钮对象事件集合
            dom: null,
            divEvent: null,
            docEvent: null,
            remove: null
        };
    }

    /**
     * 获取源数据源
     * @param type
     */
    dbTypesChecked(type: any) {
        this.dbSourceArr = [];
        this.tableArr = [];
        this.dbSource = '';
        this.table = '';
        this.dbType = type;
        this.reset();
        // 调取接口获取源表数据源(数据治理接口)
        this.repositoryService.getDataSource({dsType: type.value}).then(d => {
            if (d.success) {
                this.dbSourceArr = [];
                let arr = [];
                d.message && d.message.forEach(item => {
                    arr.push({name: item.dsName, value: item.id});
                });

                this.dbSourceArr = arr;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 源获取数据表
     */
    dbSourceChecked(type: any) {
        if (type.value !== this.dbSource.value) {
            this.tableArr = [];
            this.table = '';
            this.reset();
            this.config = [];
            if ( type.value) {
                // 调取接口获取数据表
                this.repositoryService.getSourceTableList({id: type.value}).then(d => {
                    if (d.success) {
                        this.tableArr = [];
                        let arr = [];
                        d.message && d.message.forEach(item => {
                            arr.push({name: item.tableName, value: item.tableName, parentId: type.value, id: item.id});
                        });
                        this.tableArr = arr;
                        this.initDragTargetPosition();
                        this.initDragTargetEvent();

                        setTimeout(() => {
                            this.initJsplumb();
                        });
                    } else {
                        this.modalService.alert(d.message);
                    }
                });
            }
        }
        this.dbSource = type;
    }

    /**
     * 获取目标数据源 、数据表
     */
    targetSourceCheckd(types, str) {
        this.reset();
        if (str === 'db') {
            this.targetTableArr = [];
            this.targetSourceArr = [];
            this.targetSource = '';
            this.targetDbType = types;
            // 调取接口获取数据源(数据治理接口)
            this.repositoryService.getDataSource({dsType: types.value}).then(d => {

                if (d.success) {
                    let arr = [];
                    d.message && d.message.forEach(item => {
                        arr.push({name: item.dsName, value: item.id});
                    });
                    this.targetSourceArr = arr;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (str === 'source') {
            // 获取目标数据源目标表(数据治理接口)
            this.targetTableArr = [];
            this.repositoryService.getSourceTableList({id: types.value}).then(d => {
                if (d.success) {
                    let arr = [];
                    d.message && d.message.forEach(item => {
                        arr.push({name: item.tableName, value: item.tableName, parentId: types.value, id: item.id});
                    });
                    this.targetTableArr = arr;
                    this.initDragTargetPosition();
                    this.initDragTargetEvent();

                    setTimeout(() => {
                        this.initJsplumb();
                    });
                } else {
                    this.modalService.alert(d.message);
                }
            });
            this.targetSource = types;
        }
    }

    /**
     * 拆分类型选择
     */
    convergeTypeCheck (type: any) {
        this.convergeType = type;
        this.resetCanvas();
    }

    /**
     * tab切换
     */
    toggleTab(tab: any) {
        this.tabId = tab;
    }

    /**
     * 保存执行操作
     */
    saveConvergence() {
        let connections = this.dragTargetOption.connections;
        let elements = this.dragTargetOption.elements;
        this.error = 0;
        let validate;
        validate = this.validateService.get(this, this.getValidateObject());
        if (validate) {
            this.error = validate['errorType'];
            return false;
        }

        if (!connections || !connections.length) {
            this.modalService.alert('请连线后再保存执行');
            return;
        }

        let sourceTableNames = [];
        let targetTableNames = [];

        elements.forEach(item => {
            item.type === 'source' ? sourceTableNames.push(item.moduleName) : targetTableNames.push(item.moduleName);
        });
        let attr = [];
        let hasTargetLine = 0;
        let hasJoin = 0;
        targetTableNames.forEach( table => {
            let join = [];
            let fileName = [];
            let targetTableName = '';
            connections.forEach(item => {
                if (table === item.targetParent && item.sourceFieldName) {
                    fileName.push(item.sourceParent + '.' + item.sourceFieldName + ' ' + item.targetFieldName);
                    targetTableName = table;
                }
                if (item.sourceType === item.targetType && item.sourceType && item.targetType) {
                    join.push(item.sourceParent + '.' + item.sourceFieldName + '=' + item.targetParent + '.' + item.targetFieldName);
                    hasJoin = hasJoin + 1;
                }
                item.targetType === 'target' && (hasTargetLine = hasTargetLine + 1);
            });

            fileName.length && attr.push({
                fieldName: fileName.join(','),
                join: join.join(','),
                sourceTableName: sourceTableNames,
                targetTableName: targetTableName
            });
        });
        if (this.convergeType.value === 'merge' && hasJoin === 0) {
            this.modalService.alert('请至少连线一条源表字段');
            return;
        }
        if (hasTargetLine === 0) {
            this.modalService.alert('请连接目标表');
            return;
        }
        const params = {
            configName: this.configName,
            dataAttr: attr,
            dataType: this.convergeType.value,
            sourceDataType: this.dbType.value,
            targetDataType: this.targetDbType.value,
            configPosition: JSON.stringify(this.dragTargetOption.elements),
            sourceDataId: this.dbSource.value,
            targetDataId: this.targetSource.value
        };

        this.repositoryService.saveDataConverge(params).then(d => {

            if (d.success) {
                // this.reset();
                this.error = 0;
                this.saved  = true;   // 说明已保存过
                this.modalService.alert('保存执行成功');
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            configName: {
                presence: {message: '^名称不能为空', allowEmpty: false},
                errorType: 1,
            },
            dbType: {
                presence: { message: '^请选择上级目录', allowEmpty: false},
                errorType: 2
            },
            dbSource: {
                presence: { message: '^请选择上级目录', allowEmpty: false},
                errorType: 3
            },
            targetDbType: {
                presence: { message: '^请选择上级目录', allowEmpty: false},
                errorType: 4
            },
            targetSource: {
                presence: { message: '^请选择上级目录', allowEmpty: false},
                errorType: 5
            }
        };
    }

    /**
     * 重置画布
     */
    resetCanvas() {
        if (!this.ins) {
            return;
        }
        this.reset();
        this.initDragTargetPosition();
        this.initDragTargetEvent();

        setTimeout(() => {
            this.initJsplumb();
        });
    }
}
