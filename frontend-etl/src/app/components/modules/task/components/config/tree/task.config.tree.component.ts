/**
 * Created by LIHUA on 2017-08-28.
 *  树形递归展示
 */

import {AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {TaskService} from 'app/services/task.service';
import {LoginService} from 'app/services/login.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {EtlService} from 'app/services/etl.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {TaskConfigAsideAddComponent} from 'app/components/modules/task/components/config/aside/add/task.config.aside.add.component';

@Component({
    selector: 'task-config-tree-component',
    templateUrl: './task.config.tree.component.html',
    styleUrls: ['./task.config.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class TaskConfigTreeComponent implements OnInit, AfterContentInit, OnDestroy {
    @Input()
    type: string;  // 类型 workList 工作流列表， nodeList 节点任务列表， workFlow 工作流新增目录， workTask 工作流新增任务
    @Input()
    flows: any;    // 仓前渲染层级的目录及其子目录
    @Input()
    index: number; // 层级
    @Input()
    parent: any;   // 父级目录

    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    deleteId: any;    // 删除的目录的ID
    editId: any;      // 删除的目录的ID
    projectName: any; // 目录名称
    token: any;        // url所需token

    flowEvents = [];  // title监听事件集合
    docEvents = [];   // document event
    scrollEvents = []; // 滚动监听（目录栏的滚动事件）

    showCatalogModal = false;  // 是否显示目录modal
    showTaskTModal = false;    // 是否显示任务modal
    modalX: number;            // modal x 位置
    modalY: number;            // modal y 位置
    modalFlow: any;            // 当前选中的flow

    constructor(private datatransferService: DatatransferService,
                private render: Renderer2,
                private modalService: ModalService,
                private taskService: TaskService,
                private httpServer: HttpService,
                private loginService: LoginService,
                private cookieService: CookieService,
                private etlService: EtlService) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }

    ngOnInit() {
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
    }

    ngAfterContentInit() {
        setTimeout(() => {
            this.initRightEvent();
        }, 100);
    }

    ngOnDestroy() {
        if (this.flowEvents.length) {
            this.flowEvents.forEach(e => e());
            this.flowEvents.length = 0;
        }
    }

    initRightEvent() {
        // 从点击事件里获取注册的dom，是根据子元素类型来查找的
        let getParent = (ev) => {
            let now = ev.toElement || ev.target;
            if (now.nodeName === 'I') {
                if (now.classList.contains('arrow')) {
                    return now.parentNode;
                } else if (now.classList.contains('fold')) {
                    return now.parentNode && now.parentNode.parentNode;
                }
            } else if (now.nodeName === 'SPAN') {
                return now.parentNode;
            } else {
                return now;
            }
        };

        let bind = (element) => {
            let mouseenter = this.render.listen(element, 'mouseenter', e => {
                let contextmenu = this.render.listen(document, 'contextmenu', event => {
                    // 当前点击的dom和已经显示的contextmenu不一致，就隐藏contextmenu
                    let dom = getParent(event);
                    if (dom === element) {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;

                        let index = Number(element.getAttribute('index'));
                        let flow = this.flows[index];
                        this.modalFlow = flow; // 当前选中的flow
                        if (flow.type === 'catalog') {
                            this.showCatalogModal = true;
                        } else if (flow.type === 'task') {
                            this.showTaskTModal = true;
                        }

                        this.modalX = event.pageX; // 这里直接采用的flex 定位
                        // Y轴考虑浏览器底部问题
                        this.modalY = event.pageY + 90 > document.documentElement.clientHeight ? document.documentElement.clientHeight - 90 : event.pageY;

                        this.checkedClick(flow, event); // 选中该目录

                        return false;
                    } else {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;
                    }
                });
                this.docEvents.push(contextmenu);

                let click = this.render.listen(document, 'click', ev => {
                    // firefox右键会触发这个方法，这里直接返回
                    if (ev.button === 2) {
                        return;
                    }

                    // 当前点击的dom和已经显示的contextmenu不一致，就隐藏contextmenu
                    let dom = getParent(ev);
                    if (dom !== element) {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;

                        if (this.docEvents.length) {
                            this.docEvents.forEach(evt => evt());
                            this.docEvents.length = 0;
                        }
                    }

                    // 删除目录滚轮事件
                    this.removeScrollEvent();
                });
                this.docEvents.push(click);

                // 初始化目录滚轮事件
                this.initScrollEvent();
            });
            this.flowEvents.push(mouseenter);

            let mouseleave = this.render.listen(element, 'mouseleave', (e) => {
                // 如果当前没有显示modal，就直接注销doc的监听
                if (!this.showTaskTModal && !this.showCatalogModal) {
                    if (this.docEvents.length) {
                        this.docEvents.forEach(ev => ev());
                        this.docEvents.length = 0;
                    }
                }
            });
            this.flowEvents.push(mouseleave);
        };

        let ul = this.titleContainer;
        let lis = ul.nativeElement.children;

        for (let i = 0; i < lis.length; i++) {
            bind(lis[i].children[0]);
        }
    }

    /**
     * 初始化目录栏的滚动监听事件
     */
    initScrollEvent() {
        this.scrollEvents.forEach(s => s());
        this.scrollEvents.length = 0;

        // 这里规定了目录id
        let container = document.getElementById('task-tree-container');

        let mousewheel = this.render.listen(container, 'mousewheel', () => {
            this.removeScrollEvent();
        });
        this.scrollEvents.push(mousewheel);

        let DOMMouseScroll = this.render.listen(container, 'DOMMouseScroll', () => {
            this.removeScrollEvent();
        });
        this.scrollEvents.push(DOMMouseScroll);
    }

    /**
     * 删除目录栏的滚动监听事件
     */
    removeScrollEvent() {
        if (this.showCatalogModal || this.showTaskTModal) {
            this.showCatalogModal = false;
            this.showTaskTModal = false;
        }
        this.scrollEvents.forEach(s => s());
        this.scrollEvents.length = 0;
    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        this.datatransferService.taskTreeCheckedSubject.next({
            flow: flow,
            type: this.type
        });

        // this.expandClick(flow, $event);
    }

    /**
     * 树形双击
     * @param flow
     * @param {MouseEvent} $event
     */
    dbCheckedClick(flow, $event: MouseEvent) {
        this.datatransferService.taskTreeCheckedSubject.next({
            flow: flow,
            type: this.type
        });
        this.datatransferService.taskTreeDbCheckedSubject.next({
            flow: flow,
            type: this.type
        });
        $event.stopPropagation();
    }

    /**
     * 展开点击
     * @param flow
     * @param {MouseEvent} $event
     */
    expandClick(flow, $event: MouseEvent) {
        this.datatransferService.taskTreeExpandSubject.next({
            flow: flow,
            type: this.type
        });

        this.checkedClick(flow, $event);

        $event.stopPropagation();
    }

    /**
     * 删除目录
     */
    deleteCatalog() {
        this.deleteId = this.modalFlow.projectId;
        this.modalService.toolConfirm('确认删除？', () => {
            if (this.modalFlow.type === 'catalog') {
                this.etlService.delFlowProject(this.deleteId)
                    .then(d => {
                        if (d.success) {
                            this.modalService.alert('删除成功');
                            this.datatransferService.addCatalogSubject.next(0);
                        } else {
                            this.modalService.alert(d.message || '删除失败');
                        }
                    });
            } else if (this.modalFlow.type === 'task') {
                this.etlService.delNodeTask(this.modalFlow.taskId)
                    .then(d => {
                        if (d.success) {
                            this.modalService.alert('删除成功');
                            this.datatransferService.addCatalogSubject.next(0);
                            this.datatransferService.removeCatalogSubject.next(this.deleteId);
                        } else {
                            this.modalService.alert(d.message || '删除失败');
                        }
                    });
            }
        });
    }

    /**
     * 编辑目录
     */
    editCatalog() {
        console.log(this.modalFlow);
        this.editId = this.modalFlow.taskId;
        this.projectName = this.modalFlow.taskName;

        let title, datas = {};
        datas['flowType'] = 'workFlow';
        datas['editID'] = this.editId;
        datas['dircName'] = this.projectName;

        if (this.modalFlow.type === 'task') {
            title = '编辑任务';
            datas['newType'] = 'editTask';
            datas['type'] = 'node';
            datas['taskDescription'] = this.modalFlow.remark;
            datas['nodeType'] = this.modalFlow.nodeType;
        } else if (this.modalFlow.type === 'catalog') {
            title = '编辑目录';
            datas['newType'] = 'editCatalog';
            datas['type'] = 'node';
        }

        let [ins] = this.modalService.toolOpen({
            title: title,
            component: TaskConfigAsideAddComponent,
            datas: datas,
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
    }

    /**
     * 修改任务的状态
     */
    updateStatus() {
        this.editId = this.modalFlow.id;

        let [ins] = this.modalService.toolOpen({
            title: '修改任务状态',
            component: TaskConfigAsideAddComponent,
            datas: {
                editID: this.editId,
                newType: 'updateStatus',
                taskStatus: this.modalFlow.flowStatus
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
    }

    /**
     * 导出点击
     */
    exportCatalog() {
        let url = this.httpServer.getServerUrl() + this.taskService.exportUrl + `?token=${this.token}`;
        url = url.replace('{id}', this.modalFlow.projectId).replace('{type}', this.modalFlow.type);
        let a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = 'filename';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            a.parentNode.removeChild(a);
        });
    }
    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        return this.loginService.findButtonAuthority(name);
    }
}
