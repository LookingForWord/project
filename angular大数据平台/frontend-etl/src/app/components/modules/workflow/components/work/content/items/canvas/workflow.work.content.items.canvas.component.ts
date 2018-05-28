/**
 * Created by lh on 2017/11/9.
 */

import {AfterContentInit, Component, ElementRef, Renderer2, ViewChild, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {WorkflowWorkContentRunPluginTreeComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/tree/workflow.work.content.run.plugin.tree.component';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {WebSocketService} from 'app/services/websocket.service';
import {WorkflowService} from 'app/services/workflow.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
declare var jsPlumb: any;

@Component({
    selector: 'workflow-work-content-items-canvas-component',
    templateUrl: './workflow.work.content.items.canvas.component.html',
    styleUrls: ['./workflow.work.content.items.canvas.component.scss'],
    animations: [Animations.slideLeft, Animations.slideUpDwon]
})
export class WorkflowWorkContentItemsCanvasComponent implements AfterContentInit, OnDestroy {
    configs = [
        {
            name: 'Shell',
            cid: 41,
            id: 4,
            icon: 'ic_shell_plugin',
            treeUrl: ''
        }, {
            name: 'Hive',
            cid: 42,
            id: 4,
            icon: 'ic_hive',
            treeUrl: ''
        }, {
            name: 'Jar',
            cid: 43,
            id: 4,
            icon: 'ic_jar_plugin',
            treeUrl: ''
        }, {
            name: 'Scala',
            cid: 44,
            id: 4,
            icon: 'ic_scala_plugin',
            treeUrl: ''
        }, {
            name: 'Spark',
            cid: 45,
            id: 4,
            icon: 'ic_shell_plugin',
            treeUrl: ''
        }, {
            name: '外部任务',
            cid: 46,
            id: 4,
            icon: 'ic_et_plugin',
            treeUrl: ''
        }
    ];

    ins: any;               // 连线对象
    drapPos: any;           // 拖动对象

    @ViewChild('dragOrigin')
    dragOrigin: ElementRef;

    @ViewChild('dragTarget')
    dragTarget: ElementRef;  // 操作区域

    @ViewChild('dataConfig')
    dataConfig: ElementRef;
    checkedTreeTasks: any;      // etl任务树
    checkedTreeTask: any;       // etl任务数选中
    taskDirth = '';             // etl任务树选中的路径


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

    deleteButton = {     // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    taskIds = [];     // 立即运行时用
    runHook: any;

    constructor(private render: Renderer2,
                private sanitizer: DomSanitizer,
                private modalService: ModalService,
                private toolService: ToolService,
                private webSocketService: WebSocketService,
                private workflowService: WorkflowService,
                private router: Router,
                private datatransferService: DatatransferService) {
        this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            this.checkedTreeTask = data.flow;
        });
    }

    ngAfterContentInit() {
        // 获取系统
        this.getSystem();
        this.initDragTargetEvent();
        this.initDragTargetPosition();
        setTimeout(() => {
            this.initJsplumb();
        }, 100);
    }

    ngOnDestroy () {
        clearInterval(this.runHook);
        this.webSocketService.ws && this.webSocketService.close();
    }

    /**
     * 获取系统
     */
    async getSystem() {
        let d = await this.workflowService.getExteriorsystemNames();
        if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
            d.data.forEach((item, index) => {
                this.configs.push({
                   name: item.externalSystemName,
                   cid: Number('5' + item.id),
                   id: 5,
                   treeUrl: item.treeUrl,
                   icon: index === 0 ? 'ic_etl_plugin' : (index === 1 ? 'ic_datamining_plugin' : 'ic_datamanage_plugin')
                });
            });
        }
    }

    /**
     * 打开弹窗  获取etl任务
     */
    openModal(treeUrl: any, id: any) {
        this.workflowService.getExteriorsystemTasks({treeUrl: treeUrl, id: id, flowId: this.task.flowInfo.flow.flowId}).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                let data = d.data || [];
                this.checkedTreeTasks = this.retrustToTree(data);
                let that = this;
                let [ins, pIns] = this.modalService.open(WorkflowWorkContentRunPluginTreeComponent, {
                    title: '选择任务',
                    backdrop: 'static'
                });

                pIns.setBtns([{
                    name: '关闭',
                    class: 'btn',
                    click: () => {
                        ins.destroy();
                    }
                }, {
                    name: '确定',
                    class: 'btn primary',
                    click: () => {
                        ins.saveClick();
                    }
                }]);
                ins.treeUrl = treeUrl;
                ins.systemId = id;
                ins.checkedFlow = this.checkedTreeTask;
                ins.tasks = this.checkedTreeTasks;
                ins.dircPath = this.taskDirth;
                if (this.checkedTreeTask) {
                    ins.dircPath = '';
                    ins.checkData(ins.tasks , this.checkedTreeTask.parentId);
                    ins.findParentNode(ins.tasks, this.checkedTreeTask);
                    ins.onCheckedEvent(this.checkedTreeTask);
                }

                ins.saveClick = () => {
                    if (!ins.checkedFlow || !ins.dircPath || !ins.checkedFlow.isTask) {
                        ins.errorType = 1;
                        return;
                    }
                    ins.errorType = -1;
                    that.checkedTreeTask = ins.checkedFlow;
                    that.taskDirth = ins.dircPath;
                    this.task.flowInfo.flow.connections = this.dragTargetOption;
                    this.task.flowInfo.jobs = this.parent.sidesArr;
                    // 存入本地在任务配置完成保存后跳转回调度中心要使用
                    let sessionObj = JSON.stringify({
                        task: {
                            flowInfo: this.task.flowInfo,
                            jobs: this.task.flowInfo.jobs,
                            checked: this.task.checked,
                            sidesArr: this.task.sidesArr,
                        },
                        checkedTreeTask: this.checkedTreeTask,
                        checkedTreeTasks: this.checkedTreeTasks
                    });
                    sessionStorage.setItem('outWorkFlow', sessionObj);

                    that.markupUpdating();
                    ins.destroy();
                    this.router.navigate([`/main/task/config`, ]);
                };
            } else {
                this.modalService.alert(d.rspdesc);
            }
        });

    }
    // javascript  树形结构
    retrustToTree(data: any) {
        // 删除 所有 children,以防止多次调用
        data.forEach( (item) => {
            delete item.children;
        });

        // 将数据存储为 以 externalJobId 为 KEY 的 map 索引数据列
        let map = {};
        data.forEach( (item) => {
            item.type = 'run.shell';
            map[item.externalJobId] = item;
        });
        let val = [];
        data.forEach((item, index) => {
            // 以当前遍历项，的pid,去map对象中找到索引的id
            let parent = map[item.parentId];

            // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
            if (parent) {
                (parent.children || ( parent.children = [] )).push(item);
            } else {
                // 如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
                item.expand = true;
                val.push(item);
            }
        });

        return val;
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
        if (this.task && this.task.flowInfo && this.task.flowInfo.flow && this.task.flowInfo.flow.connections) {
            this.dragTargetOption = JSON.parse(this.task.flowInfo.flow.connections);

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
            div.classList.add('workflow-item');
            div.innerHTML = element.innerHTML;
            div.setAttribute('uuid', element.uuid);
            div.setAttribute('pid', element.pid);
            div.setAttribute('cid', element.cid);
            div.style.borderColor = this.changeColor(element.uuid);

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
                    // 元素拖动暂不更新
                    // that.markupUpdating();
                }
            });

            // 添加连接点
            let point = this.getEndPoint(element.uuid).firstPoint;
            this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);
            this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);

            this.createItemEvent(div, i);
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
                // anchors: [connection.sourceAnchor, connection.targetAnchor],
                anchors: ['RightMiddle', 'LeftMiddle'],
                deleteEndpointsOnDetach: false,
                paintStyle: { stroke: (this.changeColor(connection.sourceUuid) || '#108EE9'), strokeWidth: 0.5, outlineStroke: 'transparent', outlineWidth: 5},
                hoverPaintStyle: { stroke: 'orange' },
                endpoint: ['Dot', { radius: 3 }],
                endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                detachable: false,
                overlays: [['Arrow', {width: 8, length: 8, location: 0.5}]],
                scope: 'auto',
                connector: ['Bezier', { curviness: 65 }],
            });
        });
    }

    /**
     * 显示类型
     * @param config
     */
    configClick(config: any) {
        // if (!config.checked) {
        //     this.configs.forEach(c => c.checked = false);
        //     config.checked = true;
        // }
        // this.configs.forEach(item => {
        //     if (item.id !== config.id) {
        //         item.expand = false;
        //     }
        // });
        // config.expand = !config.expand;
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
                // 画布拖动暂不提示保存
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
        let parent = this.dragTarget.nativeElement.parentNode;
        let parentWidth = parent.offsetWidth,
            parentHeight = parent.offsetHeight;

        // 拖动区域的中心在父容器的中心
        this.dragTargetOption.x = - (this.dragTargetOption.width - parentWidth) / 2;
        this.dragTargetOption.y = - (this.dragTargetOption.height - parentHeight) / 2;

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
                Anchors: [ 'TopCenter', 'BottomCenter' ]
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
                            connector: ['Bezier', { curviness: 65 } ],
                            // connector: ['Flowchart', {stub: [40, 60], /*gap: 10,*/cornerRadius: 5, alwaysRespectStubs: true} ], // 连线的弯曲度
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
        let text = event.drag.el['textContent'].replace(/\s/g, '');
        let innerHTML = event.drag.el.innerHTML;
        let pid = event.drag.el.getAttribute('pid');
        let cid = event.drag.el.getAttribute('cid');
        let treeUrl = event.drag.el.getAttribute('treeUrl');

        let arr = document.getElementsByClassName('workflow-now');
        arr && arr.length && arr[0].classList.remove('workflow-now');

        let container = this.dragTarget.nativeElement;
        let div = document.createElement('div');
        div.classList.add('drag-item');
        div.classList.add('workflow-item');
        div.classList.add('workflow-now');
        div.setAttribute('uuid', uuid);
        div.setAttribute('pid', pid);
        div.setAttribute('cid', cid);
        div.setAttribute('title', text);
        div.setAttribute('treeUrl', treeUrl);
        div.innerHTML = innerHTML;

        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('icon-ico_tab_close');
        i.classList.add('delete');
        i.setAttribute('uuid', uuid); // 这个id是节点id 用于删除的时候传递
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
            pid: pid,
            cid: cid,
            x: x,
            y: y,
            uuid: uuid,
            treeUrl: treeUrl
        };

        this.dragTargetOption.elements.push(element);
        // 默认每个任务展开侧边栏
        this.dragTargetOption.elements.forEach(ele => {
            if (ele.uuid === div.getAttribute('uuid')) {
                if (ele.pid !== '5') {
                    // 往侧边栏添加组件
                    this.parent.addContent({
                        type: 'run.plugin.shell',
                        instance: null,
                        checked: true,
                        uuid: ele.uuid,
                        cid: ele.cid
                    }, 'asides');
                    // 展开侧边栏
                    this.parent.showAsides = false;
                    this.parent.expandAsidesPanel();
                    this.parent.uuid = div.getAttribute('uuid');
                } else {
                    this.openModal(ele.treeUrl, String(ele.cid).slice(1, ));
                }
            }
        });

        let that = this;

        // 绑定拖拽动作
        this.ins.draggable(div, {
            containment: container,
            drag: function (e) {
                element.x = e.pos[0];
                element.y = e.pos[1];
                // 暂不更新  拖动元素
                // that.markupUpdating();
            }
        });

        // 添加连接点
        let point = this.getEndPoint(uuid).firstPoint;
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
            // 正在编辑的节点区别于其他节点
            let arr = document.getElementsByClassName('workflow-now');
            arr && arr.length && arr[0].classList.remove('workflow-now');
            div.classList.add('workflow-now');

            this.dragTargetOption.elements.forEach(ele => {
                if (ele.uuid === div.getAttribute('uuid')) {
                    if (ele.pid !== '5') {
                        // 往侧边栏添加组件
                        this.parent.addContent({
                            type: 'run.plugin.shell',
                            instance: null,
                            checked: true,
                            uuid: ele.uuid,
                            cid: ele.cid
                        }, 'asides');
                        // 展开侧边栏
                        !this.parent.showAsides && this.parent.expandAsidesPanel();
                    } else {
                        this.openModal(ele.treeUrl, String(ele.cid).slice(1, ));
                    }
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
                return item.jobId !== i.getAttribute('uuid');
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
            paintStyle: { fill: '#fff', stroke: (this.changeColor(uuid) || '#CCDDEE'), strokeWidth: 2},     // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                      // 是否可以拖动（作为连线起点）
            scope: 'hand',                                                       // 连接点的标识符，hand 手动 auto 自动
            connectorStyle: { stroke: (this.changeColor(uuid) || '#108EE9'), strokeWidth: 1, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 65 } ],                           // 设置连线为贝塞尔曲线
            // connector: ['Flowchart', {stub: [40, 60], /*gap: 10,*/cornerRadius: 5, alwaysRespectStubs: true} ], // 连线的弯曲度
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
     * 任务概览根据状态给画布连线改变颜色
     */
    changeColor(uuid?: any) {
        let str = '';
        let arr = [];
        let that = this;
        if (!this.taskIds || this.taskIds.length === 0) {
            clearInterval(this.runHook);
            this.runHook = null;
            return;
        }
        console.log(this.taskIds);
        this.taskIds.forEach((task, index) => {
            if (task.taskId === uuid) {
                arr.push(task);
                if ((task.status !== 1 || task.status !== 5) && index === this.dragTargetOption.elements.length - 1) {
                    // 清除定时器
                    clearInterval(that.runHook);
                    that.runHook = null;
                    // 关闭socket
                    console.log('任务完成,手动关闭了');
                    that.webSocketService.close();
                }
            }
        });
        if (arr.length === 0) {
            return;
        }
        switch (arr[0].status) {
            case 0: str = '#F2C500'; break;
            case 1: str = '#2E97DE'; break;
            case 2: str = '#1DCE6C'; break;
            case 3: str = '#E94C36'; break;
            case 4: str = '#9B56B7'; break;
            case 5: str = '#00BD9C'; break;
            case 6: str = '#E94C36'; break;
            case 7: str = '#E94C36'; break;
            case 8: str = '#E94C36'; break;
            case 9: str = '#E94C36'; break;
            // default: str = '#CCDDEE'
        }
        return str;
    }

}
