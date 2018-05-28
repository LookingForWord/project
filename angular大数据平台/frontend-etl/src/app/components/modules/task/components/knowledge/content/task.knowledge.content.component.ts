/**
 * Created by xxy on 2017-09-19.
 * 任务内容
 *
 * 日期组件 https://github.com/kekeh/ngx-mydatepicker#options-attribute
 */

import {Component, Input, OnDestroy, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {SafeStyle} from '@angular/platform-browser';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {SystemService} from 'app/services/system.service';

declare var jsPlumb: any;

export class KnowlegeList {
    contentId?: string;
    createTime?: number;
    createUser?: string;
    extContent?: string;
    id?: string;
    disabled?: boolean;     // true为不可修改，false为可修改
    errorType?: number;     // 错误类型
}

@Component({
    selector: 'task-knowledge-content-component',
    templateUrl: './task.knowledge.content.component.html',
    styleUrls: ['./task.knowledge.content.component.scss']
})
export class TaskKnowledgeContentComponent implements OnDestroy , AfterViewInit {
    @Input ()
    type: any;
    errorType = -1;                  // 错误类型

    knowledges = Array<KnowlegeList>(); // 知识内容扩展
    knowledgeId: any;                // 知识表id
    createUser: string;              // 创建人id
    knowledgeContent: string;        // 知识内容

    updating = false; // 是否是更新状态

    unsubscribes = [];               // 订阅事件钩子函数集合

    @ViewChild('canvas')
    canvas: ElementRef;    // 画布容器

    ins: any;              // 连线对象

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

    constructor (private modalService: ModalService,
                 private datatransferService: DatatransferService,
                 private userService: SystemService) {

        // 知识目录点击后查询知识扩展内容订阅
        let taskTreeExpandSubjectSubscribe = this.datatransferService.getKnowledgeTreeCheckedSubject.subscribe(data => {
            this.updating = false;

            if (data.deleteTree) {
                this.updating = false;
                this.knowledgeId = null;
                this.knowledges.length = 0;
                this.knowledgeContent = null;
                this.removeLines();
                return;
            }

            this.knowledges.length = 0;
            if (!data.knowledges || !data.knowledges.length) {
                this.updating = true;
                this.addContent();
            } else {
                data.knowledges.forEach(k => {
                    this.knowledges.push(k);
                });
            }

            this.knowledgeContent = data.content;
            // 每次重绘
            this.removeLines();
            this.initLines();
        });
        this.unsubscribes.push(taskTreeExpandSubjectSubscribe);

        // 知识目录点击订阅
        let addKnowledgesSubjectSubscribe = this.datatransferService.addKnowledgesTreeCheckedSubject.subscribe(data => {
            // 当新建的是目录时，把右边知识内容可知识扩展内容置为初始状态
            this.knowledgeId = data.id;
            this.createUser = data.createUser;

            if (data.addType === 'newButton') {
                // 上面针对没有知识内容的 都会新增一个默认的 所以这里就不再新增了
                // this.updating = true;
                // this.addContent();
                // 这时候有knowledgeId,再次调用方法不被return，创建了默认一条空的扩展内容
                if (!this.knowledges || this.knowledges.length === 0) {
                    this.addContent();
                }
            }
        });
        this.unsubscribes.push(addKnowledgesSubjectSubscribe);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initJsplumb();
        }, 100);
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
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
            // 连线事件监听   自动连接  直接push
            that.ins.bind('connection', function (data) {

            });

            // 解除连线事件监听 这里没有必要监听是因为全部点击的删除按钮删除的连线 后续操作都定义在删除按钮那里
            // that.ins.bind('connectionDetached', function (data) {
            //
            // });

            // 右键点击 显示出删除连线按钮
            that.ins.bind('contextmenu', function (connection, originalEvent: MouseEvent) {

            });
        });
    }

    initLines() {
        setTimeout(() => {
            let point = this.getEndPoint().firstPoint;

            let content = this.canvas.nativeElement.querySelector('.content');
            if (content) {
                this.ins.addEndpoint(content, { anchors: 'Right' }, point);

                let knowledges = this.canvas.nativeElement.querySelectorAll('.knowledge');
                [].forEach.call(knowledges, (know) => {
                    this.ins.addEndpoint(know, { anchors: 'Left' }, point);
                    this.ins.connect(this.getConnectionStyle({
                        source: know,
                        target: content,
                        stroke: '#108EE9',
                        location: 0.5
                    }));
                });
            }
        }, 200);
    }

    removeLines() {
        if (this.ins) {
            // 删除全部连接线
            this.ins.deleteEveryConnection();
            // 清空连接点
            this.ins.deleteEveryEndpoint();
        }
    }


    /**
     * 连接点基本设置
     * @returns points
     */
    getEndPoint() {
        let exampleDropOptions = {
            hoverClass: 'dropHover',                                             // 释放时指定鼠标停留在该元素上使用的css class
            activeClass: 'dragActive'                                            // 可拖动到的元素使用的css class
        };

        let firstPoint = {
            endpoint: ['Dot', { radius: 3 }],                                      // 设置连接点的形状为圆形
            paintStyle: { fill: '#fff', stroke: '#CCDDEE', strokeWidth: 2 },       // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                        // 是否可以拖动（作为连线起点）
            scope: 'auto',                                                         // 连接点的标识符，只有标识符相同的连接点才能连接
            connectorStyle: { stroke: '#2E3131', strokeWidth: 0.4, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 150 } ],                            // 设置连线为贝塞尔曲线
            maxConnections: 100,                                                   // 设置连接点最多可以连接几条线
            isTarget: true,                                                        // 是否可以放置（作为连线终点）
            dropOptions: exampleDropOptions,                                       // 设置放置相关的css
            connectionsDetachable: false,                                          // 连接过后可否分开
            connectorOverlays: [                                                   // 连接箭头
                ['Arrow', {width: 6, length: 6, location: 0.5}]
            ]
        };

        return {firstPoint};
    }

    /**
     * 获取连接线样式
     * @param option
     */
    getConnectionStyle(option: any) {
        return {
            source: option.source,
            target: option.target,
            anchors: ['Left', 'Right'],
            deleteEndpointsOnDetach: false,
            paintStyle: {stroke: option.stroke, strokeWidth: 0.5},
            hoverPaintStyle: { stroke: 'orange' },
            endpoint: ['Dot', {radius: 2}],
            endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
            connector: ['Bezier', {curviness: 150}],
            // overlays: [['Label', {label: '合并', location: 0.7, cssClass: 'jsplumb-overlay combine'}]],
            overlays: [['Arrow', {width: 6, length: 6, location: option.location}]],
            detachable: false,
            scope: option.scope, // 表示连线是组合
        };
    }

    /**
     * 新增知识
     */
    addContent() {
        if (!this.knowledgeId) {
            return;
        }

        this.knowledges.push({
            extContent: '',
            id: '',
            disabled: false,
            errorType: -1
        });

        this.removeLines();
        this.initLines();

        this.updating = true;
    }

    /**
     * 删除知识
     */
    deleteKnowledge(index) {
        if (this.knowledges.length > 1) {
            this.knowledges.splice(index, 1);
        } else {
            this.modalService.alert('知识扩展集合不能为空');
            return;
        }

        this.removeLines();
        this.initLines();
    }

    /**
     * 修改知识
     */
    available() {
        this.updating = true;
    }

    /**
     * 保存点击
     */
    saveTaskClick() {
        this.errorType = -1;
        if (!this.knowledgeId) {
            return;
        }
        if (!this.knowledges || !this.knowledges.length) {
            this.modalService.alert('知识扩展集合不能为空');
            return;
        }
        for (let i = 0; i < this.knowledges.length; i++) {
            this.knowledges[i].errorType = -1;
            if (!this.knowledges[i].extContent || this.knowledges[i].extContent === '') {
                this.modalService.alert('知识扩展值不能为空');
                this.knowledges[i].errorType = 1;
                return;
            }
            if (this.knowledges[i].extContent.length > 20) {
                this.modalService.alert('知识扩展值长度不能超过20个字符');
                this.knowledges[i].errorType = 1;
                return;
            }
        }
        if (!this.knowledgeContent || this.knowledgeContent === '') {
            this.errorType = 1;
            this.modalService.alert('知识内容不能为空');
            return;
        }
        if (this.knowledgeContent.length > 20) {
            this.errorType = 1;
            this.modalService.alert('知识内容长度不能超过20字符');
            return;
        }

        let contentExts = this.knowledges.map(content => {
            return {
                extContent: content.extContent,
                createUser: this.createUser
            };
        });

        this.userService.addKnowledgeContent({
            catalogId: this.knowledgeId,
            content: this.knowledgeContent,
            createUser: this.createUser,
            knowledgeContentExts: contentExts
        }).then(d => {

            if (d.success) {
                this.modalService.alert('保存成功');
                this.datatransferService.addKnowledgeSubject.next('refresh');
                this.updating = false;
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }
    /**
     * 格式化画布放大缩小倍数
     * @returns {string}
     */
    getScaleView() {
        return (this.dragTargetOption.scale * 100).toFixed(0) + '%';
    }
}
