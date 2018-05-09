/**
 * Created by lh on 2017/11/9.
 */
declare var jsPlumb: any;

import {AfterContentInit, Component, ElementRef, Renderer2, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {ConnectOptions, EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';


@Component({
    selector: 'governance-norm-audit-content-items-canvas-component',
    templateUrl: './governance.norm.audit.content.items.canvas.component.html',
    styleUrls: ['./governance.norm.audit.content.items.canvas.component.scss'],
    animations: [Animations.slideLeft, Animations.slideUpDwon]
})
export class GovernanceNormAuditContentItemsCanvasComponent implements OnInit, AfterContentInit, OnDestroy {
    configs = [];

    ins: any;               // 连线对象
    drapPos: any;           // 拖动对象

    @ViewChild('dragOrigin')
    dragOrigin: ElementRef;

    @ViewChild('dragTarget')
    dragTarget: ElementRef;  // 操作区域

    @ViewChild('dataConfig')
    dataConfig: ElementRef;

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

    parent: any;         // 父组件
    task: any;           // 任务基础信息
    updating = false;
    checkedNorm: any;

    deleteButton = {     // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    runHook: any;

    constructor(private render: Renderer2,
                private sanitizer: DomSanitizer,
                private modalService: ModalService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                private governanceService: GovernanceService) {
    }
    ngOnInit () {
        this.getDataType();
    }
    ngAfterContentInit() {
        this.initDragTargetEvent();
        this.initDragTargetPosition();
        setTimeout(() => {
            this.initJsplumb();
        }, 100);
    }

    ngOnDestroy () {
        clearInterval(this.runHook);
    }

    /**
     * 获取数据源类型
     */
    async getDataType() {
        let d = await this.governanceService.getSourcsType();
        if (d.success) {
            let arr = [];
            d.message && d.message.forEach( item => {
                arr.push({
                    checked: false,
                    expand: false,
                    type: 'catalog',
                    level: 0,
                    dsType: item.rowCode,
                    children: [],
                    name: item.rowName,
                    id: item.rowCode
                });
                this.configs = arr;
            });
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        if (!flow.expand) {
            if (flow.type === 'catalog' && flow.level === 0) {
                // 获取数据源类型
                this.getDataSourceList(flow);
            } else {
                // 获取指标
                this.getNormList(flow);
            }
        }
        this.onCheckedEvent(flow);
        flow.expand = !flow.expand;
        $event.stopPropagation();
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow: any) {
        let arr = this.checkData(this.configs);
        flow.checked = !flow.checked;
        this.checkedNorm = flow;
    }

    /**
     * 选中遍历
     */
    checkData(data: any) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 获取数据源列表
     */
    getDataSourceList(flow: any) {
        this.governanceService.getDataSourceMenus({dsType: flow.dsType}).then(d => {
            if (d.success) {
                let arr = d.message || [];
                flow.children = [];
                arr.forEach(item => {
                    delete item['dsConfigs'];
                    flow.children.push({
                       checked: false,
                       expand: false,
                       name: item.dsName,
                       level: 1,
                       type: 'catalog',
                       ...item,
                    });
                });
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 获取对应数据源下的指标
     */
    getNormList(flow: any, index?: any) {
        this.governanceService.getNormListByDsId({
            dsId: flow.id
        }).then(d => {
            if (d.success) {
                flow.children = [];
                d.message.forEach(item => {
                    flow.children.push({
                        name: item.checkName,
                        type: 'task',
                        level: 2,
                        ...item
                    });
                });
                // this.initDragTargetEvent();
                // this.initDragTargetPosition();
                setTimeout(() => {
                    this.initJsplumb();
                }, 1000);
            }
        });
    }
    /**
     * 立即运行时要重绘
     */
    runNowRedrawCanvas() {
        if (!this.runHook) {
            this.runHook = setInterval(() => {
                let div = document.querySelector('.drag-target-container .drag-target');
                if (div) {
                    div.innerHTML = '';
                }
                this.initCanvasElement();
            }, 1500);
        }
    }

    /**
     * 初始化画布 这个方法是在tab组件里调用的
     */
    initCanvas() {
        if (this.task && this.task.flowInfo && this.task.flowInfo.taskPosition) {
            this.dragTargetOption = JSON.parse(this.task.flowInfo.taskPosition);
            this.toolService.run(() => {
                return this.ins;
            }, () => {
                this.initJsplumb();
                this.getDragTargetPosition();
                this.initCanvasElement();
            }, 100);
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
            div.innerHTML = element.innerHTML;
            div.setAttribute('uuid', element.uuid);
            div.setAttribute('title', element.innerHTML);

            let i = document.createElement('i');
            i.classList.add('iconfont');
            i.classList.add('icon-ico_tab_close');
            i.classList.add('delete');
            i.setAttribute('uuid', element.uuid);
            i.style.top = '0';
            div.appendChild(i);

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
                    // that.markupUpdating();
                }
            });

            // 添加连接点
            let point = JsplumbTool.getEndpointOptions({scope: 'hand'} as EndpointOptions);
            this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
            this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);

            this.createItemEvent(div, i);
        });
        // 创建连接
        let connections = JSON.parse(JSON.stringify(this.dragTargetOption.connections));
        this.dragTargetOption.connections = [];
        connections.forEach(connection => {
            let op = JsplumbTool.getConnectOptions({
                source: dragItems.filter(item => item.getAttribute('uuid') === connection.sourceUuid)[0],
                target: dragItems.filter(item => item.getAttribute('uuid') === connection.targetUuid)[0],
                anchors: [connection.sourceAnchor, connection.targetAnchor],
                scope: 'auto'
            } as ConnectOptions);

            this.ins.connect(op);
        });
    }

    /**
     * 操作区域事件定义
     */
    initDragTargetEvent() {
        // 初始采集画布父容器宽度高度
        // this.dragTargetOption.pHeight = this.dragTarget.nativeElement.parentNode.offsetHeight;
        // this.dragTargetOption.pWidth = this.dragTarget.nativeElement.parentNode.offsetWidth;

        this.render.listen(this.dragTarget.nativeElement, 'mouseenter', (event) => {
            // 滚轮事件 放大缩小
            let mousewheel = this.render.listen(this.dragTarget.nativeElement, 'mousewheel', (e) => {
                this.mouseWheelFunc(e);

                this.markupUpdating();
            });
            let dOMMouseScroll = this.render.listen(this.dragTarget.nativeElement, 'DOMMouseScroll', (e) => {
                this.mouseWheelFunc(e);

                this.markupUpdating();
            });
            this.dragTargetOption.wheelEvents.push(mousewheel);
            this.dragTargetOption.wheelEvents.push(dOMMouseScroll);
        });
        this.render.listen(this.dragTarget.nativeElement, 'mouseleave', (event) => {
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

                // this.markupUpdating();
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
        // 计算scale值的
        JsplumbTool.doMousewheelScale(event, this.dragTargetOption);

        this.getDragTargetPosition();
    }

    /**
     * 计算拖动容器位置
     */
    getDragTargetPosition() {
        this.dragTargetPosition = JsplumbTool.getDragTargetPosition(this.sanitizer, this.dragTargetOption);
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
     * 初始化连线组件
     */
    initJsplumb() {
        const that = this;
        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Connector: [ 'Bezier', { curviness: 150 } ],
                Anchors: [ 'LeftMiddle', 'RightMiddle' ]
            });
            that.ins.draggable(that.dragOrigin.nativeElement.querySelectorAll('.drag-item'), {
                clone: true,
                drag: function (event) {
                    that.drapPos = event.pos;
                }
            });

            that.ins.droppable(that.dragTarget.nativeElement, {
                drop: function (event) {
                    if (event.drag.el.classList.contains('origin')) {
                        // 清空画布,目前只有一个
                        that.resetCanvas();
                        that.task.itemsInstance.asides = [];
                        that.createItem(event);
                    }
                }
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {

                let connection = {
                    sourceUuid: data.source.getAttribute('uuid'),
                    sourceAnchor: data.sourceEndpoint.anchor.type,
                    targetUuid: data.target.getAttribute('uuid'),
                    targetAnchor: data.targetEndpoint.anchor.type
                };

                if (connection.sourceUuid === connection.targetUuid) {
                    that.modalService.alert('连线方式不被允许');
                    that.ins.deleteConnection(data.connection);
                    return;
                }

                // 两个节点不能串联
                let repeatConnect = that.dragTargetOption.connections.filter(con => {
                    return ((con.sourceUuid === connection.sourceUuid && con.targetUuid === connection.targetUuid) ||
                        (con.sourceUuid === connection.targetUuid && con.targetUuid === connection.sourceUuid));
                });

                if (repeatConnect && repeatConnect.length) {
                    that.modalService.alert('两个相同节点只允许一根连线');
                    that.ins.deleteConnection(data.connection);
                    return;
                } else {

                    // 这里 如果不是自动就是手动连接 手动连接需要先取消 然后自动连，自动连接的时候可以重新赋样式
                    if (data.connection.scope !== 'auto') {
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
                            connector: ['Bezier', { curviness: 150 } ], // 连线的弯曲度
                        });
                        setTimeout(() => {
                            that.ins.deleteConnection(data.connection);
                        });
                    } else {
                        that.dragTargetOption.connections.push(connection);
                    }
                }
            });

            // 解除连线事件监听 这里没有必要监听是因为全部点击的删除按钮删除的连线 后续操作都定义在删除按钮那里
            that.ins.bind('connectionDetached', function (data) {

            });

            // 右键点击 显示出删除连线按钮
            // that.ins.bind('contextmenu', function (connection, originalEvent: MouseEvent) {
            //     // 判断是否存在删除按钮 存在就先删除
            //     if (that.deleteButton.dom) {
            //         that.deleteButton.remove();
            //     }
            //     // 新增删除按钮
            //     that.createDeleteLineItem(connection, originalEvent);
            //     originalEvent.preventDefault();
            // });
        });
    }

    /**
     * 左侧拖动到目标区域 生成新的item
     * @param event
     */
    createItem(event: any) {
        let uuid = this.toolService.getUuid();
        let innerHTML = event.drag.el['textContent'].replace(/\s/g, '');

        let container = this.dragTarget.nativeElement;
        let div = document.createElement('div');
        div.classList.add('drag-item');
        div.setAttribute('uuid', uuid);
        div.setAttribute('title', innerHTML);
        div.innerHTML = innerHTML;

        this.findSameNorm(this.configs, event.drag.el.getAttribute('normId'));

        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('icon-ico_tab_close');
        i.classList.add('delete');
        i.setAttribute('uuid', uuid); // 这个id是节点id 用于删除的时候传递
        i.style.top = '0';
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
            uuid: uuid
        };

        this.dragTargetOption.elements.push(element);
        // 默认每个任务展开侧边栏
        this.dragTargetOption.elements.forEach(ele => {
            if (ele.uuid === div.getAttribute('uuid')) {
                // 往侧边栏添加组件
                this.parent.addContent({
                    type: 'run.plugin.shell',
                    instance: null,
                    uuid: ele.uuid,
                    checked: true,
                }, 'asides');
                // 展开侧边栏
                this.parent.showAsides = false;
                this.parent.checkedNorm = this.checkedNorm;
                this.parent.expandAsidesPanel();
                this.parent.uuid = div.getAttribute('uuid');
            }
        });

        let that = this;
        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                element.x = e.pos[0];
                element.y = e.pos[1];
                // that.markupUpdating();
            }
        });

        // 添加连接点
        let point = JsplumbTool.getEndpointOptions({scope: 'hand'} as EndpointOptions);
        this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
        this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);

        this.createItemEvent(div, i);
        this.markupUpdating();
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
        let dragTargetContainerPos = JsplumbTool.getElementAbsolutePosition(this.dragTarget.nativeElement.parentNode);
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

            this.markupUpdating();

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
     * 给画布元素绑定事件
     * @param {Element} div
     * @param {Element} i
     */
    createItemEvent(div: Element, i: Element) {
        // 鼠标移入 显示删除按钮
        this.render.listen(div, 'mouseenter', (e: MouseEvent) => {
            div.querySelector('.delete').classList.add('show');
        });
        // 鼠标移出 隐藏删除按钮
        this.render.listen(div, 'mouseleave', (e: MouseEvent) => {
            div.querySelector('.delete').classList.remove('show');
        });

        // 双击事件 双击切换数据同步视图
        this.render.listen(div, 'dblclick', (e: MouseEvent) => {
            this.dragTargetOption.elements.forEach(ele => {
                if (ele.uuid === div.getAttribute('uuid')) {
                    // 往侧边栏添加组件
                    this.parent.addContent({
                        type: 'run.plugin.shell',
                        instance: null,
                        checked: true,
                        uuid: ele.uuid
                    }, 'asides');
                    this.parent.uuid = ele.uuid;
                    // 展开侧边栏
                    !this.parent.showAsides && this.parent.expandAsidesPanel();
                }
            });
        });

        // 删除点击
        this.render.listen(i, 'click', (e: MouseEvent) => {
            // 清除已存在的清洗数据
            this.ins.removeAllEndpoints(div);
            div.parentNode.removeChild(div);

            this.dragTargetOption.connections = this.dragTargetOption.connections.filter(c => {
                return (c.sourceUuid !== i.getAttribute('uuid') && c.targetUuid !== i.getAttribute('uuid'));
            });

            // 删除节点
            this.dragTargetOption.elements = this.dragTargetOption.elements.filter(ele => {
                return ele.uuid !== i.getAttribute('uuid');
            });
            this.parent.showAsides = false;
            this.parent.sidesArr = this.parent.sidesArr.filter(item => {
                return item.uuid !== i.getAttribute('uuid');
            });

            this.markupUpdating();

            e.stopPropagation();
        });
    }

    /**
     * 连接点基本设置
     * @returns points
     */
    getEndPoint(uuid?: any) {
        let exampleDropOptions = {
            hoverClass: 'dropHover',                                            // 释放时指定鼠标停留在该元素上使用的css class
            activeClass: 'dragActive'                                           // 可拖动到的元素使用的css class
        };

        let firstPoint = {
            endpoint: ['Dot', { radius: 4 }],                                    // 设置连接点的形状为圆形
            paintStyle: { fill: '#fff', stroke: '#CCDDEE', strokeWidth: 2},     // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                      // 是否可以拖动（作为连线起点）
            scope: 'hand',                                                       // 连接点的标识符，hand 手动 auto 自动
            connectorStyle: { stroke: '#108EE9', strokeWidth: 1, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 150 } ],                           // 设置连线为贝塞尔曲线
            maxConnections: 1,                                                   // 设置连接点最多可以连接几条线
            isTarget: true,                                                      // 是否可以放置（作为连线终点）
            dropOptions: exampleDropOptions,                                     // 设置放置相关的css
            connectionsDetachable: false,                                        // 连接过后可否分开
            connectorOverlays: [
                ['Arrow', {width: 8, length: 8, location: 0.5}]
            ]
        };

        return {firstPoint};
    }

    /**
     * 获取元素文档位置
     * @param element
     * @returns {{x: number; y: number}}
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
        JsplumbTool.doMouseclickScale(type, this.dragTargetOption);

        this.getDragTargetPosition();
    }

    /**
     * 标记画布被修改
     */
    markupUpdating() {
        this.task.updating = true;
    }

    /**
     * 自动位置调整
     */
    positionClick() {
        let parent = this.dragTarget.nativeElement.parentNode;
        let parentWidth = parent.offsetWidth,
            parentHeight = parent.offsetHeight;
        // 拖动区域的中心在父容器的中心
        let x =  (this.dragTargetOption.width - parentWidth) / 2;
        let y =  (this.dragTargetOption.height - parentHeight) / 2;

        this.dragTargetOption.x = -x;
        this.dragTargetOption.y = -y;

        let index = 0,
            dragItems = this.dragTarget.nativeElement.querySelectorAll('.drag-item');
        this.dragTargetOption.elements.forEach(element => {
            element.x = (x + parentWidth / 2 - 200) + index * 100;
            element.y = (y + 100) + index * 100;
            index++;
            [].forEach.call(dragItems, item => {
                if (Number(item.getAttribute('moduleNumber')) === element.moduleNumber) {
                    item.style.left = element.x + 'px';
                    item.style.top = element.y + 'px';
                }
            });
        });

        this.getDragTargetPosition();
        this.ins.repaintEverything();

        this.markupUpdating();
    }

    /**
     * 清空画布
     */
    resetCanvas() {
        document.querySelector('.drag-target-container .drag-target').innerHTML = '';
        this.dragTargetOption = {
            ...this.dragTargetOption,
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
     * 找到对应的指标
     */
    findSameNorm(data: any, id: any) {
        for (let i in data) {
            if (data[i].id === id) {
                this.checkedNorm = data[i];
                data[i].checked = true;
            } else {
                data[i].checked = false;
                this.findSameNorm(data[i].children, id);
            }
        }
    }

}
