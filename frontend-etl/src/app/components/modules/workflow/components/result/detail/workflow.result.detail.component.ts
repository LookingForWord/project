/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit, Renderer2, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WebSocketService} from 'app/services/websocket.service';
import {Cookie} from 'app/constants/cookie';
import {CookieService} from 'ngx-cookie';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {WorkflowResultDetailLogComponent} from 'app/components/modules/workflow/components/result/detail/log/workflow.result.detail.log';

declare var jsPlumb: any;

@Component({
    selector: 'workflow-result-detail-component',
    templateUrl: './workflow.result.detail.component.html',
    styleUrls: ['./workflow.result.detail.component.scss'],
    animations: [Animations.slideBottom]
})
export class WorkflowResultDetailComponent implements OnInit, OnDestroy {
    page = 1;               // 上个页面的当前页码  返回的时候跳回指定页码
    taskList: any;          // 右侧任务列表
    panelType: any;         // 控制显示哪种侧边栏
    id: any;                // 查询参数
    colorStatus = 0;        // 控制连线颜色变化的状态值
    presentList: any;
    present: any;           // 当前项
    singleTask = {          // 工作流下的单个详情
        flowName: null,
        startTime: null,
        endTime: null,
        status: null,
        duration: null,
        totalCount: null,
        successCount: null,
    };
    flowId: any;            // 工作流ID
    exeId: any;             // 执行Id
    jobId: any;             // 任务id 前端生成的uuid
    flowName: any;          // 工作流名称
    hidePanelEventHook: any;
    workflowInfo: any;

    updating = false;
    shellUpdate = false;
    ins: any;               // 连线对象
    @ViewChild('dragTarget')
    dragTarget: ElementRef;    // 画布容器
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

    noDataType = false;
    totalcount = 10;

    showTrigger = false;       // 是否显示触发器

    logs = [];                 // 立即运行的日志集合
    showRunLog: any;            // 是否显示立即运行的日志
    type = 'result';
    taskIds = [];
    newTaskIds = [];
    runHook: any;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private render: Renderer2,
        private modalService: ModalService,
        private workflowService: WorkflowService,
        private location: Location,
        private webSocketService: WebSocketService,
        private cookieService: CookieService,
        private sanitizer: DomSanitizer
    ) {
        this.activatedRoute.params.subscribe(params => {
            this.page = params.page;
            this.flowId = params.id;
            this.exeId = params.exeId;
        });
    }

    ngOnInit() {
        this.webSocketService.ws && this.webSocketService.close();
        this.getFlowRunHistory();
        this. getSingleFlow();
        // this.hidePanelEvent();
        this.initDragTargetEvent();
    }
    ngOnDestroy() {
        this.webSocketService.ws && this.webSocketService.close();
        clearInterval(this.runHook);
    }
    /**
     * 初始化连线组件
     */
    initJsplumb() {
        const that = this;

        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Connector: [ 'Bezier', { curviness: 150 } ],
                Anchors: [ 'TopCenter', 'BottomCenter' ],
                Container: document.querySelector('.rag-target-container')
            });
            // 连线事件监听
            that.ins.bind('connection', function (data) {
                let connection = {
                    sourceUuid: data.source.getAttribute('uuid'),
                    sourceAnchor: data.sourceEndpoint.anchor.type,
                    targetUuid: data.target.getAttribute('uuid'),
                    targetAnchor: data.targetEndpoint.anchor.type
                };
                if (data.connection.scope === 'auto') {
                    that.dragTargetOption.connections.push(connection);
                } else {
                    that.ins.deleteConnection(data.connection);
                    return;
                }

            });
        });
    }

    /**
     * 还原画布
     */
    initCanvasElement() {
        let container = this.dragTarget.nativeElement;
        let that = this;
        let dragItems = [];
        this.dragTargetOption.elements.forEach(element => {
            let status = 0;
            this.taskList.forEach((task, index) => {
                if (element.uuid === task.jobId) {
                    status = task.status;
                    this.colorStatus = task.status;
                }
            });
            // status控制背景色

            let div = document.createElement('div');
            div.classList.add('drag-item');
            div.classList.add('workflow-item');
            div.classList.add('workflow-result');
            div.innerHTML = element.innerHTML;
            div.setAttribute('uuid', element.uuid);
            div.setAttribute('pid', element.pid);
            div.setAttribute('cid', element.cid);
            div.setAttribute('title', div['textContent']);
            // 根据任务状态设置border颜色
            // div.style.borderColor = this.changeColor();
            div.style.borderColor = this.changeColor(element.uuid);

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
            let point = this.getEndPoint(element.uuid).firstPoint;
            this.ins.addEndpoint(div, { anchors: 'RightMiddle' }, point);
            this.ins.addEndpoint(div, { anchors: 'LeftMiddle' }, point);

            this.createItemEvent(div);
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
                paintStyle: { stroke: this.changeColor(connection.sourceUuid) || '#108EE9', strokeWidth: 0.5, outlineStroke: 'transparent', outlineWidth: 5},
                hoverPaintStyle: { stroke: 'orange' },
                endpoint: ['Dot', { radius: 3 }],
                endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                detachable: false,
                overlays: [['Arrow', {width: 8, length: 8, location: 0.5}]],
                scope: 'auto',
                connector: ['Bezier', { curviness: 65 } ],
            });
        });
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
            paintStyle: { fill: '#fff', stroke: this.changeColor(uuid) || '#CCDDEE', strokeWidth: 2 },     // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                      // 是否可以拖动（作为连线起点）
            scope: 'hand',                                                       // 连接点的标识符，hand 手动 auto 自动
            connectorStyle: { stroke: this.changeColor(uuid) || '#108EE9', strokeWidth: 1, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 65 } ],                           // 设置连线为贝塞尔曲线
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
     * 给document新增点击事件 点击隐藏panel
     */
    hidePanelEvent() {
        // this.hidePanelEventHook = this.render.listen(document, 'click', (e: MouseEvent) => {
        //     if (this.shellUpdate) {
        //         this.modalService.alert('请保存配置信息');
        //         return;
        //     }
        //     this.panelType = '';
        //     this.shellUpdate = false;
        //     // this.showTrigger = false;
        // });
    }

    /**
     * 阻止背景点击
     * @param {MouseEvent} $event
     */
    stopPanelClick($event: MouseEvent) {
        $event.stopPropagation();
    }

    /**
     * 返回上一个页面
     */
    goBack() {
        // this.router.navigateByUrl(`/main/workflow/result?page=${this.page}`);
        this.location.back();
    }


    /**
     * 顶部按钮立即执行
     */
    async runClick() {
        if (!this.taskList || this.taskList.length === 0) {
            this.modalService.alert('当前工作流无任务信息');
            return;
        }
        if (!this.dragTargetOption || this.dragTargetOption.elements.length === 0) {
            this.modalService.alert('当前工作流无画布信息');
            return;
        }
        if (this.shellUpdate) {
            this.modalService.alert('清先保存任务配置信息');
            return;
        }
        const params = {
            flowId: this.flowId,
            jobs: this.presentList,
            flow: {
                triggerType: 2,
                flowId: this.flowId,
                connections: JSON.stringify(this.dragTargetOption)
            }
        };

        this.workflowService.saveTasks(params).then(result => {
            if (result.rspcode === ServiceStatusEnum.SUCCESS) {
                this.workflowService.runNowWorkflow({
                    flowId: this.flowId,
                    name: this.flowName,
                    triggerType: 2
                }).then(d => {
                    if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('操作成功，正在运行');
                        this.panelType = 'update';
                        this.taskIds.forEach(item => { item.status = 1; });
                        let div = document.querySelector('.drag-target');
                        div.innerHTML = '';
                        this.initCanvasElement();
                        this.webSocketService.ws && this.webSocketService.close();
                        this.webSocketService.ws = null;
                        this.getRunStatus(d.data.exeId, d.data.flowId, this.taskIds[0].jobId);
                        this.showRunLog = true;
                    } else {
                        this.modalService.alert(d.data || d.rspdesc, {time: 2000});
                    }
                });
            } else {
                this.modalService.alert(result.data);
            }
        });
    }

    /**
     * 关闭右侧弹框
     */
    closePanel(value: any) {
        if (value) {
            this.shellUpdate = true;
            return;
        }
        this.panelType = value;
        this.shellUpdate = false;
        this.updating = true;
    }

    /**
     * 获取工作流运行历史
     */
    async  getFlowRunHistory(exeId?: any) {
        let d = await this.workflowService.getFlowRunHistory({
            flowId: this.flowId,
            exeId: exeId ? exeId : this.exeId
        });
        if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
            if (d.data.jobList !== '[]' && d.data.jobList.length !== 0) {
                this.taskList = d.data.jobList;
                this.taskIds = JSON.parse(JSON.stringify(d.data.jobList));
                this.presentList = JSON.parse(JSON.stringify(d.data.jobList));
                this.workflowInfo = d.data.flowInfo;
                this.flowName = d.data.flowInfo['name'];
                try {
                    this.dragTargetOption = {
                        ...JSON.parse(d.data.flowInfo.connections)
                    };
                } catch (e) {

                }
                this.noDataType = false;
                this.initDragTargetPosition();
                this.initJsplumb();
                this.initCanvasElement();
                setTimeout(() => {
                    this.positionClick();
                }, 500);

            } else {
                this.taskList = [];
                this.noDataType = true;
            }
        }
    }

    /**
     * 任务概览状态转换为图标
     */
    changeStatus(status) {
        let str = 'iconfont';
        switch (status) {
            case 0: str = str + ' icon-new'; break;
            case 1: str = str + ' icon-waiting'; break;         // 等待
            case 2: str = str + ' icon-done'; break;            // 运行成功
            case 3: str = str + ' icon-fail'; break;            // 失败
            case 4: str = str + ' icon-pause'; break;           // 暂停
            case 5: str = str + ' icon-play'; break;            // 运行中
            case 6: str = str + ' icon-dispatch'; break;            // 调度异常(非运行异常)
            case 7: str = str + ' icon-parameter'; break;           // 参数异常
            case 8: str = str + ' icon-send'; break;                // 发送请求异常
            case 9: str = str + ' icon-worker'; break;                // 调度异常(worker运行异常)
            case 10: str = str + ' icon-ico_block'; break;
            case 11: str = str + ' icon-ico_block'; break;
        }
        return str;
    }

    /**
     * 根据状态改变付给画板中方块不同的颜色，相应字段对应上一个函数
     */
    changeStatusBackground(status) {
        let str = '';
        switch (status) {
            case 0: str = '新增'; break;
            case 1: str = '等待'; break;
            case 2: str = '成功'; break;
            case 3: str = '失败'; break;
            case 4: str = '暂停'; break;
            case 5: str = '运行中'; break;
            case 6: str = '调度异常（非运行异常）'; break;
            case 7: str = '参数异常'; break;
            case 8: str = '发送请求异常'; break;
            case 9: str = '调度异常（worker运行异常）'; break;
            case 10: str = '取消中'; break;
            case 11: str = '已取消'; break;
        }
        return str;
    }

    /**
     * 任务概览根据状态给图标父元素添加class
     */
    showStatus(status) {
        let str = '';
        switch (status) {
            case 0: str = 'new-color'; break;
            case 1: str = 'waiting-color'; break;
            case 2: str = 'success-color'; break;
            case 3: str = 'fail-color'; break;
            case 4: str = 'pause-color'; break;
            case 5: str = 'running-color'; break;
            case 6: str = 'dispatch-error-color'; break;
            case 7: str = 'parameter-error-color'; break;
            case 8: str = 'send-error-color'; break;
            case 9: str = 'worker-error-color'; break;
            case 10: str = 'cancle-color'; break;
            case 11: str = 'cancle-color'; break;
        }
        return str;
    }


    /**
     * 获取工作流下面单个任务
     */
    getSingleFlow() {
        this.workflowService.getSingleFlow({
            flowId: this.flowId,
            exeId: this.exeId,
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.singleTask = d.data;
            }
        });
    }

    /**
     * 画布事件
     */
    createItemEvent(div: Element) {
        this.render.listen(div, 'dblclick', (e: MouseEvent) => {
            // 正在编辑的节点区别于其他节点
            this.presentList.forEach(task => {
                if (task.jobId === div.getAttribute('uuid')) {
                    this.present = task;
                    this.panelType = 'success';
                    this.shellUpdate = false;
                    this.jobId = task.jobId;
                    // switch (task.status) {
                    //     case 2: this.panelType = 'success'; break;
                    //     case 3: this.panelType = 'fail'; break;
                    // }
                }
            });
            e.stopPropagation();
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
            });
            let dOMMouseScroll = this.render.listen(this.dragTarget.nativeElement, 'DOMMouseScroll', (e) => {
                this.mouseWheelFunc(e);
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
     * 初始化计算拖动区域的位置
     */
    initDragTargetPosition() {
        // debugger
        let parent = this.dragTarget.nativeElement.parentNode;
        let parentWidth = parent.offsetWidth,
            parentHeight = parent.offsetHeight;
        // 拖动区域的中心在父容器的中心
        this.dragTargetOption.x = - (this.dragTargetOption.width - parentWidth) / 2;
        this.dragTargetOption.y = - (this.dragTargetOption.height - parentHeight) / 2;
        this.getDragTargetPosition();
        // 计算子元素位置，把子元素也固定在画布中央
        if (this.dragTargetOption.elements.length) {
            // 找到边界元素值
            let minX = this.dragTargetOption.elements[0].x,
                maxX = this.dragTargetOption.elements[0].x,
                minY = this.dragTargetOption.elements[0].y,
                maxY = this.dragTargetOption.elements[0].y;
            this.dragTargetOption.elements.forEach(e => {
                if (e.x < minX) {
                    minX = e.x;
                }
                if (e.x > maxX) {
                    maxX = e.x;
                }
                if (e.y < minY) {
                    minY = e.y;
                }
                if (e.y > maxY) {
                    maxY = e.y;
                }
            });

            // 中心点位置
            let middleX = (maxX - minX) / 2 + minX,
                middleY = (maxY - minY) / 2 + minY;
            // 相对于画布中心点偏移量
            let diffX = (this.dragTargetOption.width / 2) - middleX,
                diffY = (this.dragTargetOption.height / 2) - middleY;
            // 整体偏移
            this.dragTargetOption.elements.forEach(e => {
                e.x = e.x + diffX;
                e.y = e.y + diffY;
            });
        }
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
     * 查看日志
     */
    viewTaskLog(item: any) {
        if (item.status === 1 || item.status === 5) {
            this.modalService.alert('任务未完成运行，咱不能查看日志', {auto: true});
            return;
        }
        let [ins, pIns] = this.modalService.open(WorkflowResultDetailLogComponent, {
            title: '运行日志',
            backdrop: 'static'
        });
        ins.flowId = item.flowId;
        ins.exeId = item.exeId;
        ins.jobId = item.jobId;
        ins.status = item.status;
    }

    /**
     * 侧边栏点击
     */
    triggerPanelClick($event: MouseEvent) {
        // $event.stopPropagation();
    }

    /**
     * 关闭trigger
     */
    closeTrigger(data) {
        this.showTrigger = false;
        if (data) {
            this.workflowInfo.timing = data;
        }
    }

    /**
     * 保存
     */
    saveTaskClick () {
        if (!this.taskList || this.taskList.length === 0) {
            this.modalService.alert('当前工作流无任务信息');
            return;
        }
        if (!this.dragTargetOption || this.dragTargetOption.elements.length === 0) {
            this.modalService.alert('当前工作流无画布信息');
            return;
        }
        const params = {
            flowId: this.flowId,
            jobs: this.presentList,
            flow: {
                triggerType: 2,
                flowId: this.flowId,
                connections: JSON.stringify(this.dragTargetOption)
            }
        };

        this.workflowService.saveTasks(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.workflowService.runWorkflow({
                    flowId: this.flowId,
                    flowName: this.singleTask.flowName,
                    triggerType: 2
                }).then( result => {
                    if (result.rspcode === ServiceStatusEnum.SUCCESS) {
                        this.updating = false;
                        this.modalService.alert('保存成功');
                    }  else {
                        this.modalService.alert(result.data || result.message || '保存失败');
                    }
                });
            }  else {
                this.modalService.alert(d.data || d.message || '保存失败');
            }
        });
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
    }


    /**
     * 实时运行状态   exeId运行id    flowId 工作流id   当前任务id集合
     */
    async getRunStatus (exeId: any, flowId: any, taskId: any) {
        let presentTaskId = taskId;
        let status = 0;
        this.newTaskIds = [];

        this.taskList.forEach(item => {
            item.status = 1;
            item.startTime = '';
            item.endTime = '';
        });

        this.webSocketService.createObservableSocket().subscribe( (data) => {
            let d = JSON.parse(data).data;
            d.log && this.logs.push(d.log);
            let result = false;
            this.newTaskIds.forEach(item => {
                if (item.jobId === d.taskId) {
                    item.status = d.status;
                    result = true;
                }
            });
            !result && this.newTaskIds.push({jobId: d.taskId, status: d.status});

            this.taskList.filter(item => {
                if (item.jobId === d.taskId) {
                    item.status = d.status;
                    item.startTime = d.startTime;
                    item.endTime = d.endTime;
                }
            });

            if (d.taskId !== presentTaskId || d.status !== status) {
                this.taskIds.forEach(item => {
                    if (item.jobId === d.taskId) {
                        item.status = d.status;
                    }
                });
                presentTaskId = d.taskId;
                status = d.status;
                for (let i = 0; i < this.taskIds.length; i++) {
                    if (this.taskIds[i].jobId === presentTaskId && i <= this.taskIds.length - 1 && (d.status !== 1 && d.status !== 5)) {
                        if (i === this.taskIds.length - 1) {
                            break;
                        }
                        this.sendMessageToServer(exeId, flowId, this.taskIds[i + 1].jobId);
                        break;
                    }
                }
            }
            if (d.taskId === this.taskIds[0].jobId && !this.runHook) {
                this.runNowRedrawCanvas();
            }
        }, (err) => {
            console.log(err);
        }, () => {
            if (this.webSocketService.ws &&
                this.webSocketService.ws.readyState === 3 &&
                this.dragTargetOption.elements.length > this.newTaskIds.length
            ) {
                this.webSocketService.close();
                clearInterval(this.runHook);
                this.runHook = null;
                this.logs = [];
                setTimeout(() => {
                    this.getRunStatus(exeId, flowId, this.taskIds[0].jobId);
                });
            }
            console.log('onclose被触发断开了');
        });

        setTimeout(() => {
            this.sendMessageToServer(exeId, flowId, taskId);
        }, 500);
    }

    /**
     * 发送数据
     */
    sendMessageToServer(exeId: any, flowId: any, taskId: any) {
        const token = this.cookieService.get(Cookie.TOKEN);
        const params = {
            op: 'DYNAMIC_LOG',
            data: {
                exeId: exeId,
                flowId: flowId,
                taskIds: [taskId],
                token: token
            }
        };
        this.webSocketService.sendMessage(JSON.stringify(params));
    }


    /**
     * 关闭日志弹框
     */
    closeLogPanel() {
        this.webSocketService.close();
        this.webSocketService.ws = null;
        this.logs = [];
        this.showRunLog = false;
        clearInterval(this.runHook);
        this.runHook = null;
        document.querySelector('.drag-target').innerHTML = '';
        this.getFlowRunHistory();
        this. getSingleFlow();
        this.initDragTargetEvent();
    }


    /**
     * 任务概览根据状态给画布连线改变颜色
     */
    changeColor(uuid?: any) {
        let str = '';
        let that = this;
        if (!this.taskIds || this.taskIds.length === 0) {
            clearInterval(this.runHook);
            this.runHook = null;
            return;
        }
        let arr = this.taskIds.filter((task, index) => {
            return task.jobId === uuid;
        });
        if (arr.length === 0) {
            return;
        }

        if (this.newTaskIds.length === this.dragTargetOption.elements.length &&
            this.newTaskIds[this.newTaskIds.length - 1].status !== 1 &&
            this.newTaskIds[this.newTaskIds.length - 1].status !== 5) {
            // 清除定时器
            clearInterval(that.runHook);
            that.runHook = null;
            that.webSocketService.ws && that.webSocketService.close();
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
            case 10: str = '#2E97DE'; break;
            case 11: str = '#2E97DE'; break;
            // default: str = '#CCDDEE'
        }
        return str;
    }

    /**
     * 立即运行时要重绘
     */
    runNowRedrawCanvas() {
        if (!this.runHook) {
            this.runHook = setInterval(() => {
                let div = document.querySelector('.drag-target');
                if (div) {
                    div.innerHTML = '';
                }
                this.initCanvasElement();
            }, 1500);
        }
    }
}

