/**
 * Created by lh on 2017/11/17.
 * 数据分析
 */

declare let jsPlumb: any;

import {Component, OnInit, Renderer2, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {JsplumbTool} from 'frontend-common/tools/jsplumb.tool';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'governance-metadata-sourceAnalysis-component',
    templateUrl: 'governance.metadata.sourceAnalysis.component.html',
    styleUrls: ['governance.metadata.sourceAnalysis.component.scss']
})

export class GovernanceMetadataSourceAnalysisComponent implements OnInit, AfterViewInit {
    dataSourceType: any;                    // 数据源类型选中项
    dataSourceTypes: any;                   // 数据源类型集合
    dataSourceName: any;                    // 数据源名称选中项
    dataSourceNames: any;                   // 数据源名称集合
    dataSourceTables = [];                  //
    @Output()
    back = new EventEmitter<any>();
    @Input ()
    tableId: any;
    @Input()
    tableName: any;

    ins: any;               // 连线对象
    drapPos: any;           // 拖动对象
    @ViewChild('dragTarget')
    dragTarget: ElementRef;    // 画布容器
    @ViewChild('dragOrigin')
    dragOrigin: ElementRef;
    // 拖动区域属性
    dragTargetOption = {
        pWidth: null,    // 画布父容器宽度
        pHeight: null,   // 画布父容器高度
        width: 2000,     // 画布长度
        height: 2000,    // 画布宽度
        x: 0,            // 画布x轴位置
        y: 0,            // 画布y轴位置
        scale: 1,        // 画布放大比例
        draging: false,  // 画布是否正在被拖动
        wheelEvents: [], // 鼠标滚动事件
        moveEvents: [],  // 鼠标移动事件
        elements: [],    // 子元素集合
        connections: []  // 连接集合
    };
    dragTargetPosition: SafeStyle;
    updating = false;

    deleteButton = {     // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };
    errorType: any;
    noRelation = false;         // 是否查到连线信息
    canvasMessage: any;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private render: Renderer2,
                private sanitizer: DomSanitizer,
                private toolService: ToolService) {

    }

    ngOnInit () {
        this.getSourceType();
    }

    ngAfterViewInit () {
        if (this.tableId) {
            this.governanceService.getSourceCanvas({tableId: this.tableId}).then(d => {
                if (d.success && d.message !== '') {
                    this.dragTargetOption = JSON.parse(d.message);
                    this.canvasMessage = JSON.parse(d.message);
                    this.noRelation = false;
                    this.initDragTargetEvent();
                    this.initDragTargetPosition();
                    setTimeout(() => {
                        this.initJsplumb();
                        this.initCanvasElement();
                    });
                } else {
                    this.noRelation = true;
                    this.modalService.alert('请手动添加');
                    this.initDragTargetEvent();
                    this.initDragTargetPosition();
                    setTimeout(() => {
                        this.initJsplumb();
                        this.createDefault();
                    }, 500);
                }
            });
        }
    }

    /**
     * 默认创建一个表
     */
    createDefault() {
        // 没有画布信息的话就默认绘制当前的表
        let uuid = this.toolService.getUuid();
        let innerHTML = this.tableName;
        let moduleId = this.tableId;
        let container = this.dragTarget.nativeElement;
        let div = document.createElement('div');
        div.classList.add('drag-item');
        div.classList.add('analysis-item');
        div.setAttribute('uuid', uuid);
        div.setAttribute('title', innerHTML);
        div.setAttribute('moduleId', moduleId);
        div.innerHTML = innerHTML;
        div.style.left = '745px';
        div.style.top = '827px';

        container.appendChild(div);
        // 每一个节点的具体属性
        let element = {
            innerHTML: innerHTML,
            x: 745,
            y: 827,
            uuid: uuid,
            moduleId: moduleId,
        };
        this.dragTargetOption.elements = [];
        this.dragTargetOption.connections = [];
        this.dragTargetOption.elements.push(element);
        let that = this;
        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                element.x = e.pos[0];
                element.y = e.pos[1];
            }
        });
        // 添加连接点
        let point = this.getEndPoint().firstPoint;
        this.ins.addEndpoint(div, { anchors: 'BottomCenter' }, point);
        this.ins.addEndpoint(div, { anchors: 'TopCenter' }, point);
        this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
        this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);
        this.createItemEvent(div);
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
                this.dataSourceTypes = arr;
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
        if (type === 'dataSourceType') {
            this.dataSourceName = null;
            this.dataSourceTables = [];
            this.governanceService.getDataSourceMenus({dsType: this.dataSourceType.value}).then(d => {
                if (d.success) {
                    let arr = [];
                    d.message.forEach(item => {
                        arr.push({value: item.id, name: item.dsName});
                    });
                    this.dataSourceNames = arr;
                } else {
                    this.modalService.alert(d.message);
                }
            });
        } else if (type === 'dataSourceName') {
            this.dataSourceTables = [];
            this.governanceService.getSourceTables({id: this.dataSourceName.value}).then(d => {
                if (d.success) {
                    this.dataSourceTables = d.message || [];
                    setTimeout(() => {
                        if (this.canvasMessage && this.dragTargetOption.elements.length !== 0) {
                            this.resetCanvas();
                            this.dragTargetOption = this.canvasMessage;
                            this.initDragTargetEvent();
                            this.initDragTargetPosition();
                            setTimeout(() => {
                                this.initJsplumb();
                                this.initCanvasElement();
                            }, 500);
                        } else {
                            this.resetCanvas();
                            this.initDragTargetEvent();
                            this.initDragTargetPosition();
                            setTimeout(() => {
                                this.initJsplumb();
                                this.createDefault();
                            }, 500);
                        }
                    });

                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
    }

    /**
     * 还原画布
     */
    initCanvasElement() {
        let container = this.dragTarget.nativeElement;
        let that = this;
        let dragItems = [];
        this.dragTargetOption.elements.forEach(element => {
            let div = document.createElement('div');
            div.classList.add('drag-item');
            div.classList.add('analysis-item');
            div.innerHTML = element.innerHTML;
            div.setAttribute('uuid', element.uuid);
            div.setAttribute('title', element.innerHTML);
            div.setAttribute('moduleId', element.moduleId);

            let i = document.createElement('i');
            if (element.moduleId !== that.tableId) {
                i.classList.add('iconfont');
                i.classList.add('icon-ico_tab_close');
                i.classList.add('delete');
                i.setAttribute('uuid', element.uuid);
                i.style.top = '-3px';
                div.appendChild(i);
            }

            div.style.left = element.x + 'px';
            div.style.top = element.y + 'px';

            container.appendChild(div);
            dragItems.push(div);

            // 绑定拖拽动作
            this.ins.draggable(div, {
                containment: container,
                drag: function (e) {
                    element.x = e.pos[0];
                    element.y = e.pos[1];
                }
            });

            // 添加连接点
            let point = this.getEndPoint().firstPoint;
            this.ins.addEndpoint(div, { anchors: 'TopCenter' }, point);
            this.ins.addEndpoint(div, { anchors: 'BottomCenter' }, point);
            this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
            this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);
            if (element.moduleId === this.tableId) {
                this.createItemEvent(div);
            } else {
                this.createItemEvent(div, i);
            }

        });

        let getDragItemByUuid = (uuid) => {
            let t = null;
            dragItems.forEach(item => {
                if (item.getAttribute('uuid') === uuid) {
                    t = item;
                }
            });
            return t;
        };

        // 创建连接
        let connections = JSON.parse(JSON.stringify(this.dragTargetOption.connections));
        this.dragTargetOption.connections = [];
        connections.forEach(connection => {
            this.ins.connect({
                source: getDragItemByUuid(connection.sourceUuid),
                target: getDragItemByUuid(connection.targetUuid),
                anchors: [connection.sourceAnchor, connection.targetAnchor],
                deleteEndpointsOnDetach: false,
                paintStyle: { stroke: '#108EE9', strokeWidth: 0.5, outlineStroke: 'transparent', outlineWidth: 5},
                hoverPaintStyle: { stroke: 'orange' },
                endpoint: ['Dot', { radius: 3 }],
                endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                detachable: false,
                overlays: [['Arrow', {width: 8, length: 8, location: 0.5}]],
                maxConnections: 10,
                scope: 'auto'
            });
        });
    }

    /**
     * 操作区域事件定义
     */
    initDragTargetEvent() {
        // 初始采集画布父容器宽度高度
        // this.dragTargetOption.pHeight = this.dragTarget.nativeElement.parentNode.offsetHeight;
        // this.dragTargetOption.pWidth = this.dragTarget.nativeElement.parentNode.offsetWidth;

        this.render.listen(this.dragTarget.nativeElement, 'mouseenter', () => {
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
        this.render.listen(this.dragTarget.nativeElement, 'mouseleave', () => {
            this.dragTargetOption.wheelEvents.forEach(e => {
                if (e) {
                    e();
                }
            });
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

            let up = this.render.listen(document, 'mouseup', () => {
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
        let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        if (delta > 0) {
            // 向上滚动
            this.dragTargetOption.scale = this.dragTargetOption.scale + 0.1;
        } else if (delta < 0) {
            // 向下滚动
            if (this.dragTargetOption.scale > 0.5) {
                this.dragTargetOption.scale = this.dragTargetOption.scale - 0.1;
            }
        }

        this.getDragTargetPosition();
    }

    /**
     * 计算拖动容器位置
     */
    getDragTargetPosition() {
        this.dragTargetPosition = this.sanitizer.bypassSecurityTrustStyle(`translate(${this.dragTargetOption.x}px, ${this.dragTargetOption.y}px) scale(${this.dragTargetOption.scale})`);

        // translate值变为整数值，才不会导致自容器字体边框虚化
        let x = parseInt(this.dragTargetOption.x + '', 10);
        let y = parseInt(this.dragTargetOption.y + '', 10);
        this.dragTargetPosition = this.sanitizer.bypassSecurityTrustStyle(`translate(${x}px, ${y}px) scale(${this.dragTargetOption.scale})`);
    }

    /**
     * 初始化计算拖动区域的位置
     */
    initDragTargetPosition() {
        // 重新计算拖动元素和子元素位置
        JsplumbTool.doInitDragTargetPosition(this.dragTarget, this.dragTargetOption);
        this.getDragTargetPosition();
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
                HoverPaintStyle: { stroke: 'orange' },
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
                            return  ele.moduleId === event.drag.el.getAttribute('moduleId');
                        });
                        let parentEle = event.e.target.parentNode;
                        if (element && element.length &&
                            !parentEle.classList.contains('drag-target') && !parentEle.classList.contains('drag-item')
                        ) {
                            that.modalService.alert('同一个表只能配置一次');
                            return;
                        } else if (!parentEle.classList.contains('drag-target') && !parentEle.classList.contains('drag-item')) {
                            that.createItem(event);
                        }
                    }
                }
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {
                // 用来存储连线的操作的对象
                let connection = {
                    sourceUuid: data.source.getAttribute('uuid'),
                    sourceId: data.source.getAttribute('moduleId'),
                    sourceParent: data.source.getAttribute('title'),   // 表名data.source.attributes['uuid']['value']
                    sourceAnchor: data.sourceEndpoint.anchor.type,
                    targetUuid: data.target.getAttribute('uuid'),
                    targetId: data.target.getAttribute('moduleId'),
                    targetParent: data.target.getAttribute('title'),   // 目标表名
                    targetAnchor: data.targetEndpoint.anchor.type
                };

                // 不能自己表内相连
                if (connection.sourceParent === connection.targetParent && connection.sourceUuid === connection.targetUuid) {
                    that.modalService.alert('同一个表内无法连线');
                    that.ins.deleteConnection(data.connection);
                    return;
                }
                let result = false;
                that.dragTargetOption.connections.forEach(con => {
                    // 重复连线
                    if (
                        (con.sourceUuid === connection.sourceUuid && con.targetUuid === connection.targetUuid) ||
                        (con.sourceUuid === connection.targetUuid && con.targetUuid === connection.sourceUuid)
                    ) {
                        data.connection.scope !== 'auto' && that.modalService.alert('请勿重复连线');
                        that.ins.deleteConnection(data.connection);
                        result = true;
                        return;
                    }
                });
                if (!result) {
                    if (data.connection.scope === 'auto') {
                        that.dragTargetOption.connections.push(connection);
                    } else {
                        that.ins.connect({
                            source: data.source,
                            target: data.target,
                            anchors: [connection.sourceAnchor, connection.targetAnchor],
                            deleteEndpointsOnDetach: false,
                            paintStyle: { stroke: '#108EE9', strokeWidth: 0.5, outlineStroke: 'transparent', outlineWidth: 5},
                            hoverPaintStyle: { stroke: 'orange' },
                            endpoint: ['Dot', { radius: 3 }],
                            endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                            detachable: false,
                            overlays: [['Arrow', {width: 8, length: 8, location: 0.5}]],
                            scope: 'auto',
                        });
                        that.updating = true;
                        setTimeout(() => {
                            that.ins.deleteConnection(data.connection);
                        });
                    }
                }
            });

            // 解除连线事件监听 这里没有必要监听是因为全部点击的删除按钮删除的连线 后续操作都定义在删除按钮那里
            that.ins.bind('connectionDetached', function (data) {

            });

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
     * 左侧拖动到目标区域 生成新的item
     * @param event
     */
    createItem(event: any) {
        let uuid = this.toolService.getUuid();
        let innerHTML = event.drag.el.innerHTML;
        let moduleId = event.drag.el.getAttribute('moduleId');
        if (moduleId === this.tableId) {
            return;
        }

        let container = this.dragTarget.nativeElement;
        let div = document.createElement('div');
        div.classList.add('drag-item');
        div.classList.add('analysis-item');
        div.setAttribute('uuid', uuid);
        div.setAttribute('title', innerHTML);
        div.setAttribute('moduleId', moduleId);
        div.innerHTML = innerHTML;

        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('icon-ico_tab_close');
        i.classList.add('delete');
        i.setAttribute('uuid', uuid); // 这个id是节点id 用于删除的时候传递
        i.style.top = '-3px';
        div.appendChild(i);

        let parentPosition = this.getAbsPoint(container);
        let x = this.drapPos[0] - parentPosition.x;
        let y = this.drapPos[1] - parentPosition.y;
        x  = x - this.dragTargetOption.x;
        y  = y - this.dragTargetOption.y;
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        container.appendChild(div);

        // 每一个节点的具体属性
        let element = {
            innerHTML: innerHTML,
            x: x,
            y: y,
            uuid: uuid,
            moduleId: moduleId,
        };

        this.dragTargetOption.elements.push(element);

        let that = this;

        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                element.x = e.pos[0];
                element.y = e.pos[1];
            }
        });

        // 添加连接点
        let point = this.getEndPoint().firstPoint;
        this.ins.addEndpoint(div, { anchors: 'TopCenter' }, point);
        this.ins.addEndpoint(div, { anchors: 'BottomCenter' }, point);
        this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
        this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);

        this.createItemEvent(div, i);
    }

    /**
     * 新增 确认删除连线按钮
     * @param connection
     * @param {MouseEvent} originalEvent
     */
    createDeleteLineItem(connection, originalEvent: MouseEvent) {
        let div = document.createElement('div');
        div.innerHTML = '删除连线？';
        div.classList.add('drag-delete-line');

        let dragTargetContainerPos = this.getAbsPoint(this.dragTarget.nativeElement.parentNode);
        let absX = originalEvent.pageX - dragTargetContainerPos.x;
        let absY = originalEvent.pageY - dragTargetContainerPos.y;
        absX = Math.abs(this.dragTargetOption.x) + absX;
        absY = Math.abs(this.dragTargetOption.y) + absY;
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
            this.updating = true;
            e.stopPropagation();
        });

        // 给document 添加点击事件 删除显示的 删除连线按钮
        let docEvent = this.render.listen(document, 'click', (e: MouseEvent) => {
            if (this.deleteButton.dom) {
                this.updating = true;
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
     * 给画布元素绑定事件
     * @param {Element} div
     * @param {Element} i
     */
    createItemEvent(div: Element, i?: Element) {
        // 鼠标移入 显示删除按钮
        i && this.render.listen(div, 'mouseenter', (e: MouseEvent) => {
            div.querySelector('.delete').classList.add('show');
        });
        // 鼠标移出 隐藏删除按钮
        i && this.render.listen(div, 'mouseleave', (e: MouseEvent) => {
            div.querySelector('.delete').classList.remove('show');
        });

        // 删除点击
        i && this.render.listen(i, 'click', (e: MouseEvent) => {
            // 清除已存在的清洗数据

            this.ins.removeAllEndpoints(div);
            div.parentNode.removeChild(div);

            // 删除节点
            this.dragTargetOption.elements = this.dragTargetOption.elements.filter(ele => {
                return ele.uuid !== i.getAttribute('uuid');
            });
            // 删除连线
            this.dragTargetOption.connections = this.dragTargetOption.connections.filter(item => {
                return item.sourceUuid !== i.getAttribute('uuid') && item.targetUuid !== i.getAttribute('uuid');
            });

            e.stopPropagation();
        });
    }

    /**
     * 连接点基本设置
     * @returns points
     */
    getEndPoint() {
        let exampleDropOptions = {
            hoverClass: 'dropHover',                                            // 释放时指定鼠标停留在该元素上使用的css class
            activeClass: 'dragActive'                                           // 可拖动到的元素使用的css class
        };

        let firstPoint = {
            endpoint: ['Dot', { radius: 4 }],                                    // 设置连接点的形状为圆形
            paintStyle: { fill: '#fff', stroke: '#CCDDEE', strokeWidth: 2 },     // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                      // 是否可以拖动（作为连线起点）
            scope: 'hand',                                                       // 连接点的标识符，hand 手动 auto 自动
            connectorStyle: { stroke: '#108EE9', strokeWidth: 1, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 65 } ],                           // 设置连线为贝塞尔曲线
            maxConnections: 1,                                                   // 设置连接点最多可以连接几条线
            isTarget: true,                                                      // 是否可以放置（作为连线终点）
            dropOptions: exampleDropOptions,                                     // 设置放置相关的css
            connectionsDetachable: false,                                        // 连接过后可否分开
            connectorOverlays: [
                ['Arrow', {width: 8, length: 8, location: 0.5}]
            ],
            detachable: false,
        };

        return {firstPoint};
    }

    /**
     * 获取元素文档位置
     * @param element
     * @returns {{x: any; y: any}}
     */
    getAbsPoint(element: any) {
        let x = element.offsetLeft,
            y = element.offsetTop;
        while (element = element.offsetParent) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        return {x, y};
    }

    /**
     * 格式化画布放大缩小倍数
     * @returns {string}
     */
    getScaleView() {
        return (this.dragTargetOption.scale * 100).toFixed(0) + '%';
    }

    /**
     * 画布放大缩小点击
     */
    scaleClick(type: string) {
        if (type === '+') {
            this.dragTargetOption.scale = this.dragTargetOption.scale + 0.1;
        } else {
            if (this.dragTargetOption.scale >= 0.5) {
                this.dragTargetOption.scale = this.dragTargetOption.scale - 0.1;
            }
        }
        this.getDragTargetPosition();
    }

    /**
     * 清空画布
     */
    resetCanvas() {
        if (!this.ins) {
            return;
        }
        document.querySelector('.field-message .drag-target').innerHTML = '';
        this.ins = null;            // 连线对象
        this.drapPos = null;        // 拖动对象
        // 拖动区域属性
        this.dragTargetOption = {
            pWidth: null,    // 画布父容器宽度
            pHeight: null,   // 画布父容器高度
            width: 2000,     // 画布长度
            height: 2000,    // 画布宽度
            x: 0,            // 画布x轴位置
            y: 0,            // 画布y轴位置
            scale: 1,        // 画布放大比例
            draging: false,  // 画布是否正在被拖动
            wheelEvents: [], // 鼠标滚动事件
            moveEvents: [],  // 鼠标移动事件
            elements: [],    // 子元素集合
            connections: []  // 连接集合
        };
        this.deleteButton = {       // 删除按钮对象事件集合
            dom: null,
            divEvent: null,
            docEvent: null,
            remove: null
        };
    }

    /**
     * 保存
     * @param type
     * @returns {Promise<void>}
     */
    async save(type?: any) {
        let connections = this.dragTargetOption.connections;
        let elements = this.dragTargetOption.elements;

        if (!connections || !connections.length) {
            this.modalService.alert('请连线后再保存执行');
            return;
        }
        let result = 0;
        elements.forEach(item => {
           if (item.uuid === this.tableId) {
               result = result + 1;
           }
        });
        if (result > 1 ) {
            this.modalService.alert('画布出错，请清空重连');
            return;
        }
       await this.governanceService.saveSourceCanvas({
            tableId: this.tableId,
            relationCanvas: JSON.stringify(this.dragTargetOption)
        }).then(d => {
            if (d.success) {
                this.updating = false;
                this.modalService.alert(d.message);
                if (type) {
                    this.resetCanvas();
                    this.canvasMessage = null;
                    this.noRelation = false;
                    this.tableId = '';
                    this.tableName = '';
                    this.back.emit();
                }
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 返回
     */
    gobBck() {
        if (this.updating) {
            let that = this;
            this.modalService.toolConfirm('当前画布未保存，确认是否保存？', () => {
                this.save();
            }, () => {
                this.resetCanvas();
                this.canvasMessage = null;
                this.noRelation = false;
                this.tableId = '';
                this.tableName = '';
                this.updating = false;
                this.back.emit();
            });
        } else {
            this.resetCanvas();
            this.canvasMessage = null;
            this.noRelation = false;
            this.tableId = '';
            this.tableName = '';
            this.back.emit();
        }
    }
}
