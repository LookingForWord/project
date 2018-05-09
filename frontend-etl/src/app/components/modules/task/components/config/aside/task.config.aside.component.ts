/**
 * Created by LIHUA on 2017-08-21.
 * 任务配置导航栏界面
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import 'rxjs/Rx';

import {TaskConfigAsideAddComponent} from 'app/components/modules/task/components/config/aside/add/task.config.aside.add.component';

import {TaskService} from 'app/services/task.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {EtlService} from '../../../../../../services/etl.service';

@Component({
    selector: 'task-config-aside-component',
    templateUrl: './task.config.aside.component.html',
    styleUrls: ['./task.config.aside.component.scss']
})
export class TaskConfigAsideComponent implements  OnInit, OnDestroy {
    projectId = '0';     // 父id
    search: string;      // 搜索关键词
    showSearch = false;  // 是否显示搜索框

    flows: any;          // 目录树
    flowType: string;    // 目录树类型 workList 工作流列表， nodeList 节点任务列表， workFlow 工作流新增目录， workTask 工作流新增任务

    unsubscribes = [];

    constructor(private modalService: ModalService,
                private taskService: TaskService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                private etlService: EtlService) {

        // 树形目录展开订阅
        let taskTreeExpandSubjectSubscribe = this.datatransferService.taskTreeExpandSubject.subscribe(data => {
            if (data.type === 'workList' || data.type === 'nodeList') {
                 this.onExpandEvent(data.flow);
             }
        });
        this.unsubscribes.push(taskTreeExpandSubjectSubscribe);

        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.type === 'workList' || data.type === 'nodeList') {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);

        // 刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe( projectId => {
            this.projectId = projectId;
            this.getFlowInfo(this.projectId);
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
    }

    ngOnInit() {
        this.flowType = 'nodeList';
        this.getFlowInfo(this.projectId); // 获取目录树
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    searchDebunce = this.toolService.debounce(this.getSearchFlowInfo, 300, {leading: false});

    /**
     * 查询目录
     * @param projectId
     * @param flow
     * @returns {Promise<void>}
     */
    async getFlowInfo(projectId, flow?: any) {
        let d = await this.etlService.getQueryAllFlowProject(projectId);

        let temps = [];
        if (d.success) {
            d.message.flowProject.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.type = 'catalog';
                msg.children = [];
                temps.push(msg);
            });
            d.message.task.forEach( msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.projectName = msg.flowName;
                msg.children = [];
                msg.type = 'task';
                temps.push(msg);
            });
        }

        // 如果传递了flow，就代表是子数据
        if (flow) {
            flow.children = flow.children.concat(temps);
        } else {
            this.flows = temps;
            // 这里多一个操作把第一级目录直接展开
            this.flows.forEach(f => {
                this.datatransferService.taskTreeExpandSubject.next({
                    flow: f,
                    type: this.flowType
                });
            });
        }
    }

    /**
     * 把目录解析为树形结构
     * @param data
     * @param {string} id
     * @param {string} pid
     * @returns {Array}
     */
    initFlow(data, id = 'id', pid = 'pid') {
        let d = JSON.parse(JSON.stringify(data));
        let list = [], temp, tem, te;
        while (d.length) {
            temp = d.shift();
            temp.expand = false;     // 节点是否展开
            temp.checked = false;    // 节点是否选中
            temp.queryChild = false; // 节点是否查询了子节点

            if (temp[pid] === '0') {
                list.push(temp);
            } else {
                tem = [].concat(list);
                while (tem.length) {
                    te = tem.shift();
                    te.children = te.children || [];
                    if (temp[pid] === te[id]) {
                        te.children.push(temp);
                    }

                    tem = tem.concat(te.children);
                }
            }
        }

        return list;
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     * @param search
     */
    searchChange(event: MouseEvent, search) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        // let value = event.target['value'];
        this.searchClick(search);
    }
    /**
     * 搜索点击
     * @param search
     */
    searchClick(search: any) {
        search = search.trim();
        this.search = search;
        this.searchDebunce();
    }

    /**
     * 关闭搜索
     */
    searchCloseClick() {
        this.search = '';
        this.showSearch = false;
        this.searchDebunce();
    }

    /**
     * 查询实际搜索数据
     */
    getSearchFlowInfo() {
        this.taskService.getFlowInfo({
            projectId: this.projectId,
            keyword: this.search
        }).then(d => {
            // let d = data.json();
            let temps = [];
            this.flows = [];
            if (d.success) {
                d.message.flowProject.forEach(msg => {
                    msg.expand = false;
                    msg.checked = false;
                    msg.queryChild = false;
                    msg.children = [];
                    msg.type = 'catalog';
                    temps.push(msg);
                });
                d.message.flowInfo.forEach( msg => {
                    msg.expand = false;
                    msg.checked = false;
                    msg.queryChild = false;
                    msg.projectName = msg.flowName;
                    msg.children = [];
                    msg.type = 'task';
                    temps.push(msg);
                });
                this.flows = temps;
            }
        });
    }

    /**
     * 添加目录点击
     */
    addDirectory() {
        let [ins] = this.modalService.toolOpen({
            title: '新增目录',
            component: TaskConfigAsideAddComponent,
            datas: {
                flowType: 'workFlow',
                newType: 'newCatalog',
                dircName: ''
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);

        // let [ins, pIns] = this.modalService.open(TaskConfigAsideAddComponent, {
        //     backdrop: 'static',
        //     title: `新增${typeName}目录`
        // });
        //
        // ins.type = this.type;
        // ins.flowType = 'workFlow';
        // ins.newType = 'newCatalog';
        // ins.dircName = '';
        //
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);

        // ins.hideInstance = () => {
        //     ins.destroy();
        // };
    }

    /**
     * 获取目录展开关闭点击
     * @param flow
     */
    async onExpandEvent(flow) {
        // 当节点是展开状态 且未查询子节点
        if (!flow.expand && !flow.queryChild) {
            // 查询子节点
            await this.getFlowInfo(flow.projectId, flow);
            flow.queryChild = true;
            flow.expand = true;
        } else {
            flow.expand = !flow.expand;
        }
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        // 这里采用公共方法遍历数据，callback会回调每一个节点 便于节点数据处理
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;
    }
}
