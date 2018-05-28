/**
 * Created by lh on 2017/11/9.
 */
import {Component, OnInit} from '@angular/core';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {GovernanceService} from 'app/services/governance.service';
import {GovernanceNormAuditAsideAddComponent} from 'app/components/modules/governance/components/norm.audit/aside/add/governance.norm.audit.aside.add.component';

@Component({
    selector: 'governance-norm-audit-aside-component',
    templateUrl: './governance.norm.audit.aside.component.html',
    styleUrls: ['./governance.norm.audit.aside.component.scss']
})
export class GovernanceNormAuditAsideComponent implements OnInit {

    workflows = [];             // 树形list
    allWorkflows: any;          //
    keyWord: any;               // 筛选关键字
    parentFlow: any;            // 父级对象
    updateFlow: any;            // 当前对象

    constructor(private modalService: ModalService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                private governanceService: GovernanceService) {
        this.datatransferService.normAuditTreeDbCheckedSubject.subscribe(data => {
            if (data.type !== 'run.shell') {
                this.onCheckedEvent(data.flow);
            }
        });
        // 新增订阅
        this.datatransferService.normAuditAddTreeSubject.subscribe(success => {
            if (success.flow) {
                // 遍历workflows 找到id、pId与success.flow的相同项
                this.updateTree(this.workflows, success.flow);
                if (this.updateFlow) {
                    this.updateFlow.children = [];
                    this.updateFlow.expand = true;
                    this.governanceService.getAuditDirectoryTree({parentId: this.updateFlow.id, catalogType: 'norm'}).then(d => {
                        if (d.success) {
                            d.message.catalog.forEach(item => {
                                this.updateFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: 'catalog',
                                    name: item.catalogName,
                                    ...item
                                });
                            });
                            d.message.config.forEach(item => {
                                this.updateFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: 'task',
                                    name: item.configName,
                                    ...item
                                });
                            });
                        } else {
                            this.modalService.alert(d.message);
                        }
                    });
                }
            } else {
                this.workflows = [];
                this.getTreeList(0);
            }
        });

        // 树形删除、修改订阅
        this.datatransferService.normAuditUpdateTreeSubject.subscribe(data => {
            if (data.flow.parentId === 0) {
                this.workflows = [];
                this.getTreeList(0);
            } else {
                let str = data.flow.type === 'catalog' ? 'parentId' : 'catalogId';
                this.findParentNode(this.workflows, data.flow, str);
                if (this.parentFlow) {
                    this.parentFlow.expand = true;
                    this.parentFlow.children = [];
                    this.governanceService.getAuditDirectoryTree({parentId: this.parentFlow.id, catalogType: 'norm'}).then(d => {
                        if (d.success) {
                            d.message.catalog.forEach(item => {
                                this.parentFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    name: item.catalogName,
                                    type: 'catalog',
                                    ...item
                                });
                            });
                            d.message.config.forEach(item => {
                                this.parentFlow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: 'task',
                                    name: item.configName,
                                    ...item
                                });
                            });
                        } else {
                            this.modalService.alert(d.message);
                        }
                    });
                }
            }
        });
    }

    async ngOnInit() {
        await this.getTreeList(0);
        this.getTreeList(1);
    }

    searchDebunce = this.toolService.debounce(this.searchDebounce, 500, {leading: false});

    /**
     * 获取树形结构数据
     */
    getTreeList(parentId: any) {
        this.governanceService.getAuditDirectoryTree({parentId: parentId, catalogType: 'norm'}).then(d => {
            if (d.success && d.message) {
                let arr = [];
                d.message.catalog.forEach(item => {
                    arr.push({
                        checked: false,
                        expand: parentId === 0 ? true : false,
                        children: [],
                        type: 'catalog',
                        name: item.catalogName,
                        ...item
                    });
                });
                d.message.config.forEach(item => {
                    arr.push({
                        checked: false,
                        expand: parentId === 0 ? true : false,
                        type: 'task',
                        name: item.configName,
                        ...item
                    });
                });
                if (parentId === 0) {
                    this.workflows = arr;
                    this.getTreeList(this.workflows[0].id);
                } else {
                    this.workflows[0].children = arr;
                }
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow: any) {
        let arr = this.checkData(this.workflows , flow.parentId);
        flow.checked = !flow.checked;
    }

    /**
     * 选中遍历
     */
    checkData(data: any, parentId: any) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, parentId);
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
            if (data[i].id === flow.id && data[i].parentId === flow.parentId) {
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
            component: GovernanceNormAuditAsideAddComponent,
            datas: {
                type : 'addDirectory'
            },
            okCallback: () => {
                ins.okClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        }
    }

    /**
     * 关键字搜索调用接口
     */
    searchDebounce() {
        this.governanceService.getAuditDirectoryTree({param: this.keyWord}).then(d => {
            if (d.success) {
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
    searchClick($event: MouseEvent) {
        // this.workflows = [];
        // this.parentFlow = null;
        // this.updateFlow = null;
        // this.allWorkflows = [];
        // if (this.keyWord && this.keyWord.replace(/\s/g, '')) {
        //     this.searchDebunce();
        // } else {
        //     this.getTreeList(0);
        // }
    }

    /**
     * 编辑、删除寻找父节点
     */
    findParentNode(data: any, flow: any, type?: any) {
        for (let i in data) {
            if (data[i].id === flow[type]) {
                this.parentFlow = data[i];
                break;
            } else {
                this.findParentNode(data[i].children, flow, type);
            }
        }
    }



    /**
     * 新增工作流
     */
    addTaskClick() {
        let [ins] = this.modalService.toolOpen({
            title: '新建任务',
            component: GovernanceNormAuditAsideAddComponent,
            datas: {
                type : 'addTask'
            },
            okCallback: () => {
                ins.addWorkFlow();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        }
    }
}
