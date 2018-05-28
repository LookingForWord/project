/**
 * Created by lh on 2017/11/9.
 */
import {Component, OnInit} from '@angular/core';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {WorkflowService} from 'app/services/workflow.service';
import {WorkflowWorkAsideAddComponent} from 'app/components/modules/workflow/components/work/aside/add/workflow.work.aside.add.component';
import {ServiceStatusEnum} from 'app/constants/service.enum';

@Component({
    selector: 'workflow-work-aside-component',
    templateUrl: './workflow.work.aside.component.html',
    styleUrls: ['./workflow.work.aside.component.scss']
})
export class WorkflowWorkAsideComponent implements OnInit {

    workflows = [];             // 树形list
    allWorkflows: any;          //
    keyWord: any;               // 筛选关键字
    parentFlow: any;            // 父级对象
    updateFlow: any;            // 当前对象
    sessionTrees: any;

    constructor(private modalService: ModalService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                private workflowService: WorkflowService) {
        this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
        });
        // 新增订阅
        this.datatransferService.workflowAddTreeSubject.subscribe(success => {
            if (success.flow) {
                // 遍历workflows 找到id、pId与success.flow的相同项
                this.updateTree(this.workflows, success.flow);
                if (this.updateFlow) {
                    this.updateFlow.children = [];
                    this.updateFlow.expand = true;
                    this.workflowService.getTreeList({pId: this.updateFlow.id}).then(d => {
                        if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                            d.data.forEach(item => {
                                this.updateFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: item.flowId ? 'work' : 'catalog',
                                    ...item
                                });
                            });
                        }
                    });
                }
            } else {
                this.workflows = [];
                this.getTreeList();
            }
        });

        // 树形删除、修改订阅
        this.datatransferService.workflowUpdateTreeSubject.subscribe(data => {
            if (data.flow.pId === 0) {
                this.workflows = [];
                this.getTreeList();
            } else {
                this.findParentNode(this.workflows, data.flow);
                if (this.parentFlow) {
                    this.parentFlow.expand = true;
                    this.parentFlow.children = [];
                    this.workflowService.getTreeList({pId: this.parentFlow.id}).then(d => {
                        if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                            d.data.forEach(item => {
                                this.parentFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: item.flowId ? 'work' : 'catalog',
                                    ...item
                                });
                            });
                        }
                    });
                }
            }
        });

        // 如果是从调度返回的工作流  还需要从url判断  后期再加
        let obj = sessionStorage.getItem('outWorkFlow');
        let workFlowTress = sessionStorage.getItem('workFlowTress');
        if (obj && workFlowTress) {
            this.workflows = JSON.parse(workFlowTress);
            this.sessionTrees = true;
        } else {
            this.getTreeList();
            this.sessionTrees = false;
        }
    }

    ngOnInit() {

    }

    searchDebunce = this.toolService.debounce(this.searchDebounce, 500, {leading: false});

    /**
     * 获取树形结构数据
     */
    getTreeList() {
        this.workflowService.getTreeList({pId: 0}).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                d.data.forEach(item => {
                    this.workflows.push({
                        checked: false,
                        expand: false,
                        type: item.flowId ? 'work' : 'catalog',
                        ...item
                    });
                });
            }
        });
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow: any) {
        let arr = this.checkData(this.workflows , flow.pId);
        flow.checked = !flow.checked;
        flow.type !== 'run.shell' && sessionStorage.setItem('workFlowTress', JSON.stringify(this.workflows));
    }

    /**
     * 选中遍历
     */
    checkData(data, pid) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, pid);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 新增后更新目录树
     */
    updateTree(data, flow) {
        for (let i in data) {
            if (data[i].id === flow.id && data[i].pId === flow.pId) {
                this.updateFlow = data[i];
                break;
            } else {
                this.updateTree(data[i].children, flow);
            }
        }
    }

    /**
     * 新增目录
     */
    addDirectory() {
        let [ins] = this.modalService.toolOpen({
            title: '新建目录',
            component: WorkflowWorkAsideAddComponent,
            datas: {
                type : 'addDirectory'
            },
            okCallback: () => {
                ins.okClick();
            }
        } as ToolOpenOptions);
    }

    /**
     * 关键字搜索调用接口
     */
    searchDebounce() {
        this.workflowService.searchTreeList({param: this.keyWord}).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.workflows = [];
                d.data.forEach(item => {
                    this.workflows.push({
                        checked: false,
                        expand: false,
                        type: item.flowId ? 'work' : 'catalog',
                        ...item
                    });
                });
                this.allWorkflows = d.data;
            }
        });
    }
    /**
     * 关键字搜索
     * @param {string} search
     */
    searchClick(search: string) {
        if (search && !search.replace(/\s/g, '')) {
            return;
        }
        this.workflows = [];
        this.parentFlow = null;
        this.updateFlow = null;
        this.allWorkflows = [];
        if (search && search.replace(/\s/g, '')) {
            this.searchDebunce();
        } else {
            this.getTreeList();
        }
    }

    /**
     * 编辑、删除寻找父节点
     */
    findParentNode(data, flow) {
        for (let i in data) {
            if (data[i].id === flow.pId) {
                this.parentFlow = data[i];
                break;
            } else {
                this.findParentNode(data[i].children, flow);
            }
        }
    }

    /**
     * 新增工作流
     */
    addTaskClick() {
        let [ins] = this.modalService.toolOpen({
            title: '新建工作流',
            component: WorkflowWorkAsideAddComponent,
            datas: {
                type : 'addWorkflow'
            },
            okCallback: () => {
                ins.addWorkFlow();
            }
        } as ToolOpenOptions);
    }
}
