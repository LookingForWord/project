import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

/**
 * created by LIHUA on 2018/01/19/
 * 数据资产 数据治理 血缘(影响)分析
 */

declare let jsPlumb: any;
import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';

import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {GovernanceBloodAnalysisAddComponent} from 'app/components/modules/governance/components/blood.analysis/add/governance.blood.analysis.add.component';

import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ConnectOptions, EndpointOptions, JsplumbTool} from 'frontend-common/tools/jsplumb.tool';
import {GovernanceService} from 'app/services/governance.service';

@Component({
    selector: 'governance-blood-analysis-component',
    templateUrl: './governance.blood.analysis.component.html',
    styleUrls: ['./governance.blood.analysis.component.scss']
})
export class GovernanceBloodAnalysisComponent implements AfterViewInit {

    ins: any;               // 连线对象

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
        width: 4000,     // 画布长度
        height: 40000,   // 画布宽度
        x: 0,            // 画布x轴位置
        y: 0,            // 画布y轴位置
        scale: 1,        // 画布放大比例
        draging: false,  // 画布是否正在被拖动
        wheelEvents: [], // 鼠标滚动事件
        moveEvents: [],  // 鼠标移动事件
        elements: [],    // 子元素集合
        connections: [], // 手动连接集合
        deletes: []      // 原始连线删除集合 原始的连线在删除的时候把id先存起来
    };
    dragTargetPosition: SafeStyle;

    parent: any;         // 父组件
    task: any;           // 任务基础信息
    configs: any;        // 配置节点集合

    deleteButton = {                // 删除按钮对象事件集合
        dom: null,
        divEvent: null,
        docEvent: null,
        remove: null
    };

    relations = []; // 关系列表

    searchId: string; // 搜索表id

    constructor(private modalService: ModalService,
                private render: Renderer2,
                private sanitizer: DomSanitizer,
                private toolService: ToolService,
                private governanceService: GovernanceService) {}

    ngAfterViewInit() {
        this.initRelations();
        this.initDragTargetEvent();

        setTimeout(() => {
            this.initJsplumb();
        }, 100);
    }

    /**
     * 获取全部关系
     * @param params
     */
    initRelations(params?: any) {
        this.modalService.loadingShow();
        this.governanceService.getAllRelation(params).then(d => {
            if (d.success && d.message && Object.keys(d.message).length) {
                Object.keys(d.message).forEach(key => {
                    let lists = this.dataTransfer(JSON.parse(JSON.stringify(d.message[key])));
                    this.relations.push({
                        lists: lists,
                        relation: d.message[key]
                    });
                });
                console.log(this.relations);
                setTimeout(() => {
                    this.createEndPointAndConnections();
                    this.modalService.loadingHide();
                }, 300);
            } else {
                this.modalService.loadingHide();
                this.modalService.alert('暂无血缘关系');
            }
        }).catch( e => {
            console.log(e);
            this.modalService.loadingHide();
            this.modalService.alert('血缘关系查询失败');
        });
    }

    /**
     * 数据转换
     * @param arr
     * @returns {any[]}
     */
    dataTransfer(arr: any) {
        let lists = [],      // id集合 有id集合主要是为了查重方便
            tempLists = [],  // 数据集合
            before = false,
            next = false;

        while (arr.length) {
            let temp = arr.shift();
            before = false;
            next = false;

            // 按照sourceId正向查找
            lists.forEach((list, index) => {
                if (new Set(list).has(temp.sourceId)) {
                    next = true;

                    let find = false;
                    lists.forEach(l => {
                        if (new Set(l).has(temp.targetId)) {
                            find = true;
                        }
                    });

                    if (!find) {
                        if (lists[index + 1]) {
                            if (!new Set(lists[index + 1]).has(temp.targetId)) {
                                lists[index + 1].push(temp.targetId);
                                tempLists[index + 1].push({
                                    id: temp.targetId,
                                    name: temp.targetName,
                                    dsName: temp.targetDsName,
                                    dsType: temp.targetDsType
                                });
                            }
                        } else {
                            lists.push([temp.targetId]);
                            tempLists.push([{
                                id: temp.targetId,
                                name: temp.targetName,
                                dsName: temp.targetDsName,
                                dsType: temp.targetDsType
                            }]);
                        }
                    }
                }
            });

            // 按照targetId查找
            if (!next) {
                lists.forEach((list, index) => {
                    if (new Set(list).has(temp.targetId)) {
                        before = true;

                        let find = false;
                        lists.forEach(l => {
                            if (new Set(l).has(temp.sourceId)) {
                                find = true;
                            }
                        });

                        if (!find) {
                            if (lists[index - 1]) {
                                if (!new Set(lists[index - 1]).has(temp.sourceId)) {
                                    lists[index - 1].push(temp.sourceId);
                                    tempLists[index - 1].push({
                                        id: temp.sourceId,
                                        name: temp.sourceName,
                                        dsName: temp.sourceDsName,
                                        dsType: temp.sourceDsType
                                    });
                                }
                            } else {
                                lists.unshift([temp.sourceId]);
                                tempLists.unshift([{
                                    id: temp.sourceId,
                                    name: temp.sourceName,
                                    dsName: temp.sourceDsName,
                                    dsType: temp.sourceDsType
                                }]);
                            }
                        }
                    }
                });
            }

            if (!next && !before) {
                lists.push([temp.sourceId]);
                tempLists.push([{
                    id: temp.sourceId,
                    name: temp.sourceName,
                    dsName: temp.sourceDsName,
                    dsType: temp.sourceDsType
                }]);

                lists.push([temp.targetId]);
                tempLists.push([{
                    id: temp.targetId,
                    name: temp.targetName,
                    dsName: temp.targetDsName,
                    dsType: temp.targetDsType
                }]);
            }
        }

        return tempLists;
    }

    createEndPointAndConnections() {
        let items = document.querySelectorAll('.relation-item');
        let point = JsplumbTool.getEndpointOptions({
            scope: 'hand',
            stroke: 'transparent',
            hoverStroke: '#CCDDEE',
            endpointRadius: 4,
            strokeWidth: 3,
            maxConnections: -1,
            connectionsDetachable: true,
            connectorStrokeWidth: 0.7,
            connectorStroke: '#33CCDD',
            arrowWidth: 6
        } as EndpointOptions);
        let achs = ['TopCenter', 'BottomCenter', 'LeftMiddle', 'RightMiddle'];

        [].forEach.call(items, item => {
            achs.forEach(p => {
                let uuid = this.toolService.getUuid();
                this.ins.addEndpoint(item, { anchors: p, uuid: uuid }, point);
                item.setAttribute(p + 'Uuid', uuid);
            });

            // this.ins.draggable(item, {
            //     containment: container
            // });
        });

        this.relations.forEach(relation => {
            relation.relation.forEach((rela, index) => {
                let source = document.querySelector('.relation-item[id="' + rela.sourceId + '"]');
                let target = document.querySelector('.relation-item[id="' + rela.targetId + '"]');

                if (source && target) {
                    let find = false;
                    let uuids = [source.getAttribute('BottomCenterUuid'), target.getAttribute('TopCenterUuid')];
                    // 连线可能存在连接成环装，需要根据情况 重置连接点位置
                    relation.relation.forEach((r, i) => {
                        if (rela.sourceId === r.targetId && rela.targetId === r.sourceId) {
                            if (i < index) {
                                uuids = [source.getAttribute('LeftMiddleUuid'), target.getAttribute('LeftMiddleUuid')];
                            } else {
                                uuids = [source.getAttribute('RightMiddleUuid'), target.getAttribute('RightMiddleUuid')];
                            }
                        }
                    });
                    let op = {
                        parameters: {lineId: rela.id},
                        uuids: uuids
                    };
                    this.ins.connect(op);
                }
            });
        });
    }

    /**
     * 初始化连线组件
     */
    initJsplumb() {
        const that = this;

        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Connector: [ 'Bezier', { curviness: 150 } ],
                HoverPaintStyle: { stroke: 'orange' }
            });

            // 连线事件监听
            that.ins.bind('connection', function (data) {
                if (data.source === data.target) {
                    setTimeout(() => { that.ins.deleteConnection(data.connection); });
                    return;
                }

                if (!data.connection.getParameter('lineId')) { // 不存在lineId 表示是手动连接的
                    if (data.source.getAttribute('id') === data.target.getAttribute('tid') || data.source.getAttribute('cid') === data.target.getAttribute('id')) {
                        // 连线的两个表是同一张表
                        that.modalService.alert('同表不能连接');
                        setTimeout(() => { that.ins.deleteConnection(data.connection); });
                        return;
                    }

                    // 暂存 手动的连线关系
                    that.dragTargetOption.connections.push({
                        sourceId: data.source.getAttribute('id').indexOf('jsPlumb') !== -1 ? data.source.getAttribute('tid') : data.source.getAttribute('id'),
                        // sourceType: data.source.getAttribute('dsType'),
                        sourceType: 'table',
                        sourceUuid: data.source.getAttribute('uuid'),
                        targetId: data.target.getAttribute('tid') || data.target.getAttribute('id'),
                        // targetType: data.target.getAttribute('dsType'),
                        targetType: 'table',
                        targetUuid: data.target.getAttribute('uuid')
                    });
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
     * 生成新的item项
     * @param config
     */
    createItem(config: any) {
        let uuid = this.toolService.getUuid();
        let container = this.dragTarget.nativeElement;

        let div = document.createElement('div');
        div.setAttribute('uuid', uuid);
        div.setAttribute('tid', config.table.value); // 把表id存在dom节点上，连线的时候需要使用
        div.setAttribute('dsType', config.dataSourceType.name);
        div.classList.add('drag-item');
        div.classList.add('drag-item-blood-analysis');

        let t = document.createElement('div');
        t.classList.add('t');
        t.title = t.innerHTML = config.dataSourceType.name + '/' + config.dataSource.name;

        let n = document.createElement('div');
        n.classList.add('n');
        n.title = n.innerHTML = config.table.name;

        let i = document.createElement('i');
        i.classList.add('iconfont');
        i.classList.add('icon-ico_tab_close');
        i.classList.add('delete');
        i.setAttribute('uuid', uuid); // 这个id是节点id 用于删除的时候传递

        let parent = container.parentNode,
            x = parent.offsetWidth / 2 + Math.abs(this.dragTargetOption.x),
            y = parent.offsetHeight / 2;

        // 重复位置的话就往下面堆叠
        this.dragTargetOption.elements.forEach(e => {
            if (e.x === x && e.y === y) {
                y = y + 50;
            }
        });

        div.style.left = x + 'px';
        div.style.top = y + 'px';

        div.appendChild(t);
        div.appendChild(n);
        div.appendChild(i);
        container.appendChild(div);

        // 每一个节点的具体属性
        let element = {
            x: x,
            y: y,
            uuid: uuid,
            tableName: config.table.name,
            tableId: config.table.value
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

        let point = JsplumbTool.getEndpointOptions({
            scope: 'hand',
            stroke: 'transparent',
            hoverStroke: '#CCDDEE',
            endpointRadius: 4,
            strokeWidth: 3,
            maxConnections: -1,
            connectionsDetachable: true,
            connectorStrokeWidth: 0.5,
            connectorStroke: '#33CCDD'
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
            div.querySelectorAll('.delete')[0].classList.add('show');
        });
        // 鼠标移出 隐藏删除按钮
        this.render.listen(div, 'mouseleave', () => {
            div.querySelectorAll('.delete')[0].classList.remove('show');
        });

        // 双击事件 双击切换数据同步视图
        this.render.listen(div, 'dblclick', () => {
            this.dragTargetOption.elements.forEach(ele => {
                if (ele.uuid === div.getAttribute('uuid')) {
                    console.log(ele);
                    console.log(div);
                }
            });
        });

        // 删除点击
        this.render.listen(i, 'click', (e: MouseEvent) => {

            // 删除节点数据
            this.dragTargetOption.elements = this.dragTargetOption.elements.filter(ele => {
                return ele.uuid !== i.getAttribute('uuid');
            });

            // 删除连线数据
            this.dragTargetOption.connections = this.dragTargetOption.connections.filter(cons => {
                if (cons.sourceUuid === i.getAttribute('uuid') || cons.targetUuid === i.getAttribute('uuid')) {
                    // 删除连线
                    let connections = this.ins.getAllConnections();
                    connections.forEach(c => {
                        if (c.source === this.getDomByUuid(cons.sourceUuid) && c.target === this.getDomByUuid(cons.targetUuid)) {
                            this.ins.deleteConnection(c);
                        }
                    });
                }

                return !(cons.sourceUuid === i.getAttribute('uuid') || cons.targetUuid === i.getAttribute('uuid'));
            });

            // 删除节点
            this.ins.removeAllEndpoints(div);
            div.parentNode.removeChild(div);

            this.markupUpdating();

            e.stopPropagation();
        });
    }

    /**
     * 根据uuid找到对应的dom
     * @param {string} uuid
     */
    getDomByUuid(uuid: string) {
        let container = this.dragTarget.nativeElement;
        return container.querySelector('.drag-item-inner[uuid="' + uuid + '"]');
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
        div.style.borderColor = '#33CCDD';

        let dragTargetContainerPos = JsplumbTool.getElementAbsolutePosition(this.dragTarget.nativeElement.parentNode);
        // 这里删除按钮的定位要重新处理一下
        let absX = originalEvent.pageX - dragTargetContainerPos.x - this.dragTargetOption.x;
        let absY = originalEvent.pageY - dragTargetContainerPos.y - this.dragTargetOption.y;
        // absX = Math.abs(this.dragTargetOption.x) + absX;
        // absY = Math.abs(this.dragTargetOption.y) + absY;
        div.style.left = absX + 'px';
        div.style.top = absY + 'px';

        // 点击删除连线
        let divEvent = this.render.listen(div, 'click', (e: MouseEvent) => {
            // 删除连线记录
            if (connection.getParameter('lineId')) {
                // 删除的自动连线
                this.dragTargetOption.deletes.push(connection.getParameter('lineId'));
            } else {
                // 删除的手动连线
                this.dragTargetOption.connections = this.dragTargetOption.connections.filter(c => {
                    return !((c.sourceId === connection.source.getAttribute('id') || c.sourceId === connection.source.getAttribute('tid')) &&
                        (c.targetId === connection.target.getAttribute('id') || c.targetId === connection.target.getAttribute('tid')));
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

        this.dragTarget.nativeElement.appendChild(div);
    }

    /**
     * 操作区域事件定义
     */
    initDragTargetEvent() {
        this.render.listen(this.dragTarget.nativeElement, 'mouseenter', () => {
            // 滚轮事件 放大缩小
            let mousewheel = this.render.listen(this.dragTarget.nativeElement, 'mousewheel', (e) => {
                // this.mouseWheelFunc(e);
                // this.markupUpdating(); // 画布特别大 滚动一下画布可能缩小到屏幕之外了
            });

            let dOMMouseScroll = this.render.listen(this.dragTarget.nativeElement, 'DOMMouseScroll', (e) => {
                // this.mouseWheelFunc(e);
                // this.markupUpdating();
            });
            this.dragTargetOption.wheelEvents.push(mousewheel);
            this.dragTargetOption.wheelEvents.push(dOMMouseScroll);
        });
        this.render.listen(this.dragTarget.nativeElement, 'mouseleave', () => {
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
                // if (this.dragTargetOption.x + (mousemoveEvent.pageX - pageX) > 0 || this.dragTargetOption.y + (mousemoveEvent.pageY - pageY) > 0) {
                //     return;
                // }

                this.dragTargetOption.draging = true;

                this.dragTargetOption.x = this.dragTargetOption.x + (mousemoveEvent.pageX - pageX);
                this.dragTargetOption.y = this.dragTargetOption.y + (mousemoveEvent.pageY - pageY);

                pageX = mousemoveEvent.pageX;
                pageY = mousemoveEvent.pageY;

                this.getDragTargetPosition();

                this.markupUpdating();
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
     * 画布放大缩小点击
     */
    scaleClick(type: string) {
        JsplumbTool.doMouseclickScale(type, this.dragTargetOption);

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
     * 画布还原
     */
    positionClick() {
        this.dragTargetOption.y = this.dragTargetOption.x = 0;
        this.getDragTargetPosition();
    }

    /**
     * 保存配置
     * @returns {Promise<void>}
     */
    async saveTableClick() {
        if (!this.dragTargetOption.deletes.length && !this.dragTargetOption.connections.length) {
            this.modalService.alert('没有更新血缘连线操作，不能保存');
            return;
        }

        let msg = [];
        if (this.dragTargetOption.deletes.length) {
            let d = await this.governanceService.deleteRelations(this.dragTargetOption.deletes);
            if (d.success) {
                msg.push('保存成功');
            } else {
                this.modalService.alert(d.message || '删除原始关系失败');
            }
        }
        if (this.dragTargetOption.connections.length) {
            let d = await this.governanceService.saveRelations(this.dragTargetOption.connections);
            if (d.success && !msg.length) {
                msg.push('保存成功');
            } else {
                this.modalService.alert(d.message || '保存新增关系失败');
            }
        }

        // 提示保存成功
        if (msg.length) {
            this.modalService.alert(msg[0]);
            this.backTableClick();
        }
    }

    /**
     * 点击弹出 新增数据表
     */
    addTableClick() {
        let [ins] = this.modalService.toolOpen({
            title: '添加数据源表',
            component: GovernanceBloodAnalysisAddComponent,
            okCallback: () => {
                let config = ins.okClick();
                if (config) {
                    this.createItem(config);
                    ins.hideInstance();
                }
            }
        } as ToolOpenOptions);
    }

    /**
     * 点击弹出 搜索数据表
     */
    searchTableClick() {
        let [ins] = this.modalService.toolOpen({
            title: '搜索数据源表',
            component: GovernanceBloodAnalysisAddComponent,
            okCallback: () => {
                let config = ins.okClick();
                if (config) {
                    this.searchId = config.table.value;
                    this.clearRelations();
                    this.initRelations({sourceId: config.table.value});
                    ins.hideInstance();
                }
            }
        } as ToolOpenOptions);
    }

    /**
     * 返回点击 查询全部表
     */
    backTableClick() {
        this.searchId = null;
        this.clearRelations();
        this.initRelations();
    }

    /**
     * 清楚原始数据
     */
    clearRelations() {
        // 删除可能存在的原始连接数据
        this.dragTargetOption.elements.forEach(ele => {
            let e = document.querySelector('.drag-item[uuid="' + ele.uuid + '"]');
            e.parentNode.removeChild(e);
        });
        this.dragTargetOption.elements.length = 0;
        this.dragTargetOption.connections.length = 0;
        this.dragTargetOption.deletes.length = 0;
        // 删除原始连接点 连接线 原始数据
        this.ins.deleteEveryConnection();
        this.ins.deleteEveryEndpoint();
        this.relations.length = 0;
    }

    /**
     * 动态计算relation宽度
     * @param relation
     * @returns {number | number}
     */
    getRelationsWidth(relation: any) {
        let max = 0;
        relation.lists.forEach(list => {
            max = max > list.length ? max : list.length;
        });
        max = max * 160 + 100;
        return max > 399 ? max : 399;
    }

    markupUpdating() {}
}

