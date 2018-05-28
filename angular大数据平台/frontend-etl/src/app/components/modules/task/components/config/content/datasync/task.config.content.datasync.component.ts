/**
 * Created by LIHUA on 2017-08-29.
 * 数据同步
 */

declare let jsPlumb: any;

import {AfterContentInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {ConnectOptions, EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';

import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {fadeIn, fadeOut} from 'frontend-common/ts_modules/animations/sim-anim';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {NodeConfigEnum} from 'app/constants/node.config.enum';
import {TaskConfigService} from 'app/services/task.config.service';

@Component({
    selector: 'task-config-content-datasync-component',
    templateUrl: './task.config.content.datasync.component.html',
    styleUrls: ['./task.config.content.datasync.component.scss'],
    animations: [fadeIn, fadeOut, Animations.slideUpDwon]
})
export class TaskConfigContentDatasyncComponent implements AfterContentInit, OnInit {

    modules: any;          // 拖拽模块

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

    @Output()
    backEvent: EventEmitter<any> = new EventEmitter(); // 返回

    parent: any;         // 父组件
    task: any;           // 任务基础信息

    deleteButton = {     // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    isRestore = false;   // 是否正在还原界面

    constructor(private render: Renderer2,
                private sanitizer: DomSanitizer,
                private modalService: ModalService,
                private toolService: ToolService,
                private tsc: TaskConfigService) {
    }

    ngOnInit() {}

    ngAfterContentInit() {
        this.initDragTargetEvent();
        this.initDragTargetPosition();

        setTimeout(() => {
            this.initJsplumb();
        }, 100);
    }

    /**
     * 初始化画布 这个方法是在tab组件里调用的
     */
    initCanvas() {
        if (this.task && this.task.task && this.task.task.flowPosition) {
            this.dragTargetOption = JSON.parse(this.task.task.flowPosition);
            this.toolService.run(() => {
                return this.ins;
            }, () => {
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
            div.classList.add('drag-item-datasync');
            div.classList.add(element.color);
            div.innerHTML = element.moduleName + (element.nickname ? '(' + element.nickname + ')' : '');
            div.setAttribute('uuid', element.uuid);
            div.setAttribute('moduleName', element.moduleName);
            div.setAttribute('moduleNumber', element.moduleNumber);
            div.setAttribute('moduleType', element.moduleType);

            let header = document.createElement('div');
            header.classList.add('drag-item-header');
            header.innerHTML = element.moduleParentName;
            div.appendChild(header);

            let i = document.createElement('i');
            i.classList.add('iconfont');
            i.classList.add('icon-ico_tab_close');
            i.classList.add('delete');
            i.setAttribute('uuid', element.uuid);
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

                    that.markupUpdating();
                }
            });

            // 添加连接点
            let point = JsplumbTool.getEndpointOptions({
                scope: 'hand',
                stroke: 'transparent',
                hoverStroke: '#CCDDEE',
                endpointRadius: 4,
                strokeWidth: 3,
                maxConnections: -1,
                connectionsDetachable: true,
                connectorStrokeWidth: 1,
                connectorStroke: '#CCCCCC'
            } as EndpointOptions);
            ['TopCenter', 'BottomCenter', 'LeftMiddle', 'RightMiddle'].forEach(p => {
                let uuid = this.toolService.getUuid();
                this.ins.addEndpoint(div, { anchors: p, uuid: uuid }, point);
                div.setAttribute(p + 'Uuid', uuid);
            });

            this.createItemEvent(div, i);
        });

        // 创建连接
        let connections = JSON.parse(JSON.stringify(this.dragTargetOption.connections));
        this.dragTargetOption.connections = [];
        connections.forEach(connection => {
            this.ins.connect({
                uuids: [
                    dragItems.filter(item => item.getAttribute('uuid') === connection.sourceUuid)[0].getAttribute(connection.sourceAnchor + 'Uuid'),
                    dragItems.filter(item => item.getAttribute('uuid') === connection.targetUuid)[0].getAttribute(connection.targetAnchor + 'uuid')
                ]
            });
        });

        let time = 0;
        this.isRestore = true; // 表名当前正在还原，还原的时候新增的tab不会立即显示
        this.dragTargetOption.elements.forEach((element) => {
            setTimeout(() => {
                let ele = container.querySelector('.drag-item[uuid="' + element.uuid + '"]');
                if (ele) {
                    let event = document.createEvent('HTMLEvents');
                    event.initEvent('dblclick', true, true);
                    ele.dispatchEvent(event);
                }
                if (element === that.dragTargetOption.elements[that.dragTargetOption.elements.length - 1]) {
                    that.isRestore = false;
                    that.modalService.loadingHide();
                }
            }, time);
             time = time + 500;
        });
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

                this.markupUpdating();
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
     * 初始化连线组件
     */
    initJsplumb() {
        const that = this;

        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Connector: [ 'Bezier', { curviness: 150 } ],
                // Anchors: [ 'TopCenter', 'BottomCenter' ],
                HoverPaintStyle: { stroke: 'orange' }
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
                        // 检测kafka
                        let moduleNumber = Number(event.drag.el.getAttribute('moduleNumber'));
                        if (moduleNumber === 10006) {
                            // kafka输入源 配置了kafka输入节点不能配置其它数据源，且有且只有一个输入源节点
                            let others = that.dragTargetOption.elements.filter(element => {
                                return that.toolService.contains(element.moduleNumber, [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008]);
                            });
                            if (others && others.length) {
                                // 已配置其他输入源
                                that.modalService.alert('已配置输入源，kafka输入源只支持单一输入源配置', {auto: true});
                                return;
                            }
                        }

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

                let error = false, msg = '';
                // 单个节点不能自我连接
                if (data.target === data.source) {
                    error = true;
                    msg = '单个节点不能自连接';
                }

                // 两个节点不能互联
                let repeatConnect = that.dragTargetOption.connections.filter(con => {
                    return ((con.sourceUuid === connection.sourceUuid && con.targetUuid === connection.targetUuid) ||
                        (con.sourceUuid === connection.targetUuid && con.targetUuid === connection.sourceUuid));
                });
                if (repeatConnect && repeatConnect.length) {
                    error = true;
                    msg = '相同两个节点不能互联';
                }

                // 数据源节点只能作为首节点
                if (that.toolService.contains(Number(data.target.getAttribute('moduleNumber')), [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008])) {
                    error = true;
                    msg = '数据输入只能作为初始节点';
                }

                // 数据输出节点只能是尾节点
                if (that.toolService.contains(Number(data.source.getAttribute('moduleNumber')), [40001, 40002, 40003, 40004, 40005, 40006, 40007])) {
                    error = true;
                    msg = '数据输出只能作为尾节点';
                }

                if (error) {
                    // 错误提示
                    that.modalService.alert(msg);
                    setTimeout(() => that.ins.deleteConnection(data.connection));
                } else {
                    // 暂存连线关系
                    that.dragTargetOption.connections.push(connection);

                    // 把上下文受影响组件的uuid存到相应的组件里。组件数据变化的时候，根据uuid找到受影响的组件 调用组件更新方法
                    let sourceUuids = [];
                    that.dragTargetOption.connections.forEach(c => {
                        if (c.targetUuid === connection.targetUuid) {
                            sourceUuids.push(c.sourceUuid);
                        }
                    });

                    if (sourceUuids && sourceUuids.length) {
                        sourceUuids.forEach(uuid => {
                            let component = that.parent.getContentByUuid(uuid);
                            if (component && component.instance.impacts && !that.toolService.contains(connection.targetUuid, component.instance.impacts)) {
                                component.instance.impacts.push(connection.targetUuid);
                            }
                        });
                    }

                    // 触发target impactCallback
                    let targetComponent = that.parent.getContentByUuid(connection.targetUuid);
                    if (targetComponent && targetComponent.instance.impactCallback) {
                        targetComponent.instance.impactCallback();
                    }
                }
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
     * 新增 确认删除连线按钮
     * @param connection
     * @param {MouseEvent} originalEvent
     */
    createDeleteLineItem(connection, originalEvent: MouseEvent) {
        let div = document.createElement('div');
        div.innerHTML = '删除连线？';
        div.classList.add('drag-delete-line');

        // let dragTargetContainerPos = this.getAbsPoint(this.dragTarget.nativeElement.parentNode);
        let dragTargetContainerPos = JsplumbTool.getElementAbsolutePosition(this.dragTarget.nativeElement.parentNode);
        let absX = originalEvent.pageX - dragTargetContainerPos.x;
        let absY = originalEvent.pageY - dragTargetContainerPos.y;
        absX = Math.abs(this.dragTargetOption.x) + absX;
        absY = Math.abs(this.dragTargetOption.y) + absY;
        div.style.left = absX + 'px';
        div.style.top = absY + 'px';

        // 点击删除连线
        let divEvent = this.render.listen(div, 'click', (e: MouseEvent) => {
            // 删除source impacts字段里的target uuid
            let source = this.parent.getContentByUuid(connection.source.getAttribute('uuid'));
            if (source && source.instance && source.instance.impacts) {
                source.instance.impacts = source.instance.impacts.filter(impact => impact !== connection.target.getAttribute('uuid'));
            }

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
     * 左侧拖动到目标区域 生成新的item
     * @param event
     */
    createItem(event: any) {
        let uuid = this.toolService.getUuid();
        let moduleName = event.drag.el.getAttribute('moduleName');
        let moduleNumber = event.drag.el.getAttribute('moduleNumber');
        let moduleType = event.drag.el.getAttribute('moduleType');
        let moduleParentName = event.drag.el.getAttribute('moduleParentName');
        let [nickname, nicknamePosition] = this.getNickname(Number(moduleNumber));

        let container = this.dragTarget.nativeElement;
        let div = document.createElement('div');
        div.classList.add('drag-item');
        div.classList.add('drag-item-datasync');
        div.setAttribute('uuid', uuid);
        div.setAttribute('moduleName', moduleName);
        div.setAttribute('moduleNumber', moduleNumber);
        div.setAttribute('moduleType', moduleType);
        div.innerHTML = moduleName + (nickname ? '(' + nickname + ')' : '');
        let color = '';
        ['first', 'second', 'third', 'forth'].forEach(c => {
            if (event.drag.el.classList.contains(c)) {
                div.classList.add(c);
                color = c;
            }
        });

        let header = document.createElement('div');
        header.classList.add('drag-item-header');
        header.innerHTML = moduleParentName;
        div.appendChild(header);

        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('icon-ico_tab_close');
        i.classList.add('delete');
        i.setAttribute('uuid', uuid); // 这个id是节点id 用于删除的时候传递
        div.appendChild(i);

        let parentPosition = JsplumbTool.getElementAbsolutePosition(container);
        let x = this.drapPos[0] - parentPosition.x;
        let y = this.drapPos[1] - parentPosition.y;
        x  = x - this.dragTargetOption.x;
        y  = y - this.dragTargetOption.y;
        div.style.left = x + 'px';
        div.style.top = y + 'px';

        container.appendChild(div);

        // 每一个节点的具体属性
        let element = {
            moduleName: moduleName,
            moduleNumber: Number(moduleNumber),
            moduleType: moduleType,
            innerHTML: moduleName,
            x: x,
            y: y,
            uuid: uuid,
            nickname: nickname,
            nicknamePosition: nicknamePosition,
            color: color,
            moduleParentName: moduleParentName
        };

        this.dragTargetOption.elements.push(element);

        let that = this;

        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                element.x = e.pos[0];
                element.y = e.pos[1];

                that.markupUpdating();
            }
        });

        // 添加连接点
        let point = JsplumbTool.getEndpointOptions({
            scope: 'hand',
            stroke: 'transparent',
            hoverStroke: '#CCDDEE',
            endpointRadius: 4,
            strokeWidth: 3,
            maxConnections: -1,
            connectionsDetachable: true,
            connectorStrokeWidth: 1,
            connectorStroke: '#CCCCCC'
        } as EndpointOptions);
        ['TopCenter', 'BottomCenter', 'LeftMiddle', 'RightMiddle'].forEach(p => {
            this.ins.addEndpoint(div, { anchors: p }, point);
        });

        this.createItemEvent(div, i);
        this.markupUpdating();
    }

    /**
     * 给画布元素绑定事件
     * @param {Element} div
     * @param {Element} i
     */
    createItemEvent(div: Element, i: Element) {
        // 鼠标移入 显示删除按钮
        this.render.listen(div, 'mouseenter', () => {
            div.querySelector('.delete').classList.add('show');
        });
        // 鼠标移出 隐藏删除按钮
        this.render.listen(div, 'mouseleave', () => {
            div.querySelector('.delete').classList.remove('show');
        });

        // 双击事件 双击切换数据同步视图
        this.render.listen(div, 'dblclick', () => {
            this.dragTargetOption.elements.forEach(ele => {
                if (ele.uuid === div.getAttribute('uuid')) {
                    // 把上下文受影响组件的uuid存到相应的组件里。组件数据变化的时候，根据uuid找到受影响的组件 调用组件更新方法
                    // 当前组件是target
                    let sourceUuids = [];
                    this.dragTargetOption.connections.forEach(c => {
                        if (c.targetUuid === ele.uuid) {
                            sourceUuids.push(c.sourceUuid);
                        }
                    });
                    if (sourceUuids && sourceUuids.length) {
                        sourceUuids.forEach(uuid => {
                            let component = this.parent.getContentByUuid(uuid);
                            if (component && component.instance.impacts && !this.toolService.contains(ele.uuid, component.instance.impacts)) {
                                component.instance.impacts.push(ele.uuid);
                            }
                        });
                    }

                    // 当前组件是source
                    let targetUuids = this.dragTargetOption.connections.filter(c => {
                        if (c.sourceUuid === ele.uuid) {
                            return c.targetUuid;
                        }
                    });
                    targetUuids.forEach(uuid => {
                        let component = this.parent.getContentByUuid(ele.uuid);
                        if (component && component.instance.impacts && !this.toolService.contains(uuid, component.instance.impacts)) {
                            component.instance.impacts.push(uuid);
                        }
                    });

                    let type;
                    if (this.toolService.contains(ele.moduleNumber, [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008])) {
                        type = 'datasync.collection';
                    } else if (this.toolService.contains(ele.moduleNumber, [20001, 20002, 20003, 20004, 20005, 30001, 30002, 30003, 30005, 30006, 30007, 30008, 30009, 30010])) {
                        type = 'datasync.clean';
                    } else if (this.toolService.contains(ele.moduleNumber, [30004, 30011])) {
                        type = 'datasync.merge.split';
                    } else if (this.toolService.contains(ele.moduleNumber, [30012])) {
                        type = 'datasync.converge';
                    }  else if (this.toolService.contains(ele.moduleNumber, [40001, 40002, 40003, 40004, 40005, 40006, 40007])) {
                        type = 'datasync.output';
                    }

                    this.parent.addContent({
                        title: ele.moduleName + (ele.nickname ? '(' + ele.nickname + ')' : ''),
                        nickname: ele.nickname || '',
                        moduleNumber: ele.moduleNumber,
                        uuid: ele.uuid,
                        checked: true,
                        host: null,
                        instance: null,
                        type: type,
                        notShow: this.isRestore
                    });
                }
            });
        });

        // 删除点击
        this.render.listen(i, 'click', (e: MouseEvent) => {
            let iUuid = i.getAttribute('uuid');

            // 删除source component里 impacts字段的target uuid
            let sourceUuids = this.dragTargetOption.connections.map(c => {
                if (c.targetUuid === iUuid) {
                    return c.sourceUuid;
                }
            });
            sourceUuids.forEach(sourceUuid => {
                let component = this.parent.getContentByUuid(sourceUuid);
                if (component && component.instance && component.instance.impacts) {
                    component.instance.impacts = component.instance.impacts.filter(impact => impact !== iUuid);
                }
            });

            // 删除tab内容
            this.parent.removeContentByUuid(iUuid);
            // 删除连接点 线
            this.ins.removeAllEndpoints(div);
            // 删除按钮dom
            div.parentNode.removeChild(div);

            // 删除节点记录
            this.dragTargetOption.elements = this.dragTargetOption.elements.filter(ele => {
                return ele.uuid !== iUuid;
            });
            // 删除连线记录
            this.dragTargetOption.connections = this.dragTargetOption.connections.filter(c => {
                return !(c.sourceUuid === iUuid || c.targetUuid === iUuid);
            });

            this.markupUpdating();

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
     * 标记画布被修改
     */
    markupUpdating() {
        this.task.updating = true;
    }

    /**
     * 返回点击
     */
    backNodeset() {
        this.backEvent.next(1);
    }

    /**
     * 画布放大缩小点击
     */
    scaleClick(type: string) {
        JsplumbTool.doMouseclickScale(type, this.dragTargetOption);

        this.getDragTargetPosition();
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

        this.initDragTargetPosition();
        this.ins.repaintEverything();

        this.markupUpdating();
    }


    /**
     * 根据类型删除节点 这个方法是父容器的tab点击在调用
     * @param {string} uuid
     */
    deleteItemByUuid(uuid: string) {
        let container = this.dragTarget.nativeElement;
        [].forEach.call(container.querySelectorAll('.drag-item'), (item) => {
            if (item.getAttribute('uuid') === uuid) {
                let i = item.querySelector('i');
                i.click();
            }
        });
    }

    /**
     * 显示类型
     * @param module
     */
    moduleClick(module: any) {
        if (!module.checked) {
            this.modules.forEach(c => c.checked = false);
            module.checked = true;
        }

        let expand = module.expand;
        this.modules.forEach(c => c.expand = false);
        module.expand = !expand;
    }

    /**
     * 获取别名
     * @param {number} moduleNumber
     * @returns {any}
     */
    getNickname(moduleNumber: number) {
        // 数据输入、汇聚转换、数据输出需要新建别名
        let needs = [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 30004, 30011, 30012, 40001, 40002, 40003, 40004, 40004, 40005, 40006, 40007];
        if (this.toolService.contains(moduleNumber, needs)) {
            let pos = 0;
            this.dragTargetOption.elements.forEach(e => {
                if (this.toolService.contains(e.moduleNumber, needs)) {
                    pos = e.nicknamePosition > pos ? e.nicknamePosition : pos;
                    pos ++;
                }
            });
            let mul = Math.floor(pos / 26), // 需要循环的次数
                rem = pos % 26;                // 循环元素位置
            let arrs = [];
            for (let i = 65; i < 91; i++) {    // 可以生成 ['A', 'B', ... 'Z'] 的数组
                arrs.push(String.fromCharCode(i));
            }

            let arr = arrs[rem];
            let t = arr;
            while (mul > 0) {
                t = t + arr;
                mul --;
            }

            return [t, pos];
        }

        return [null, null];
    }

    /**
     * 根据moduleNumber返回icon
     * @param {number} moduleNumber
     * @returns {string}
     */
    getIconfont(moduleNumber: number) {
        let icon = '';
        switch (moduleNumber) {
            case 10001: icon = 'icon-ic_mysql'; break;
            case 10002: icon = 'icon-ic_oracle'; break;
            case 10003: icon = 'icon-ic_sqlserver'; break;
            case 10004: icon = 'icon-ic_hive'; break;
            case 10005: icon = 'icon-ic_ftp'; break;
            case 10006: icon = 'icon-ic_kafka'; break;
            case 10007: icon = 'icon-ic_hdfs'; break;
            case 10008: icon = 'icon-ic_file'; break;
            case 20001: icon = 'icon-ic_evfilter'; break;
            case 20002: icon = 'icon-ic_nonevfilter'; break;
            case 20003: icon = 'icon-ic_fvfilter'; break;
            case 20004: icon = 'icon-ic_refilter'; break;
            case 20005: icon = 'icon-ic_drfilter'; break;
            case 30001: icon = 'icon-ic_evconversion'; break;
            case 30002: icon = 'icon-ic_fvconversion'; break;
            case 30003: icon = 'icon-ic_rvconversion'; break;
            case 30004: icon = 'icon-ic_sjconversion'; break;
            case 30005: icon = 'icon-ic_sqlmodulo'; break;
            case 30006: icon = 'icon-ic_ulconversion'; break;
            case 30007: icon = 'icon-ic_rconversion'; break;
            case 30008: icon = 'icon-ic_multivariatecalcu'; break;
            case 30009: icon = 'icon-ic_threeelementexpre'; break;
            case 30010: icon = 'icon-ic_econversion'; break;
            case 30011: icon = 'icon-ic_splitconversion'; break;
            case 30012: icon = 'icon-ic_convergeconversio'; break;
            case 40001: icon = 'icon-ic_mysql'; break;
            case 40002: icon = 'icon-ic_oracle'; break;
            case 40003: icon = 'icon-ic_sqlserver'; break;
            case 40004: icon = 'icon-ic_hive'; break;
            case 40005: icon = 'icon-ic_hbase'; break;
            case 40006: icon = 'icon-ic_hdfs'; break;
            case 40007: icon = 'icon-ic_file'; break;
        }

        return 'iconfont icon ' + icon;
    }

}
