/**
 * Created by lh on 2017/11/9.
 */

import {AfterContentInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WorkflowWorkAsideAddComponent} from 'app/components/modules/workflow/components/work/aside/add/workflow.work.aside.add.component';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'workflow-work-aside-tree-component',
    templateUrl: './workflow.work.aside.tree.component.html',
    styleUrls: ['./workflow.work.aside.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class WorkflowWorkAsideTreeComponent implements OnInit, AfterContentInit {
    @Input()
    workflows: any;
    @Input()
    allWorkflows: any;
    @Input()
    parentWorkflows: any;
    @Input()
    index: number;
    @Input()
    type: any;
    @Input()
    sessionTrees: any;

    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件
    checkedFlow: any;

    showRightClick = false; // 显示右键点击

    modalX: number; // 右键点击的x轴位置
    modalY: number; // 右键点击的y轴位置

    constructor(private datatransferService: DatatransferService,
                private workflowService: WorkflowService,
                private render: Renderer2,
                private modalService: ModalService,
                private loginService: LoginService) {
    }

    ngOnInit() {
        if (typeof this.allWorkflows === 'undefined') {
            this.allWorkflows = this.workflows;
        }
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
    }

    ngAfterContentInit() {
        if (this.sessionTrees) {
            for (let i = 0; i < this.workflows.length; i++) {
                if (this.workflows[i].checked) {
                    this.dbCheckedClick(this.workflows[i]);
                    break;
                }
            }
        }
    }


    /**
     * 树形双击
     * @param flow
     * @param {MouseEvent} $event
     */
    dbCheckedClick(flow, $event?: MouseEvent) {
        if (!flow.flowId || this.type === 'run.shell') {
            return;
        }
        this.datatransferService.workflowTreeDbCheckedSubject.next({flow: flow, method: 'dbClick'});
        $event && $event.stopPropagation();
    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        if (!flow.expand && this.type !== 'run.shell') {
            this.workflowService.getTreeList({pId: flow.id}).then(d => {
               if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                   flow.children = [];
                    d.data.forEach(item => {
                        if (this.type === 'add') {
                            if (!item.flowId) {
                                flow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: item.flowId ? 'work' : 'catalog',
                                    ...item
                                });
                            }
                        } else {
                            flow.children.push({
                                checked: false,
                                expand: false,
                                type: item.flowId ? 'work' : 'catalog',
                                ...item
                            });
                        }
                    });
               } else {
                   this.modalService.alert(d.message);
               }
            });
        }
        flow.expand = !flow.expand;
        this.checkedFlow = flow;
        this.datatransferService.workflowTreeDbCheckedSubject.next({flow: flow, method: 'oneClick'});
        $event.stopPropagation();
    }

    /**
     * 编辑工作流
     */
    editCatalog(task?: any) {
        this.checkedFlow = task;
        let title = this.checkedFlow.flowId ? '编辑工作流' : '编辑目录';
        let [ins, pIns] = this.modalService.open(WorkflowWorkAsideAddComponent, {
            backdrop: 'static',
            title: title
        });
        ins.type = this.checkedFlow.flowId ? 'editWorkflow' : 'editDirectory';
        ins.dircName = this.checkedFlow.name;

        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                ins.cancelClick();
            }
        }, {
            name: '确认',
            class: 'btn primary',
            click: () => {
                ins.editSave(this.checkedFlow);
            }
        }]);
        ins.cancelClick = () => {
            ins.destroy();
        };
        ins.hideInstance = () => {
            ins.destroy();
        };
    }

    /**
     * 删除目录
     */
    async deleteCatalog($event: MouseEvent, task?: any) {
        $event.stopPropagation();
        this.checkedFlow = task;
        let d = await this.workflowService.getTreeList({pId: task.id});
        let title = '您确认删除吗？';
        if (d.data && d.data.length > 0) {
            title = '该操作将删除所有子项和已加入调度系统中的工作流，您确认吗？';
        }

        let [ins, pIns] = this.modalService.confirm(title);
        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                ins.cancelClick();
            }
        }, {
            name: '确认',
            class: 'btn primary',
            click: () => {
                ins.delete();
            }
        }]);
        ins.cancelClick = () => {
            ins.destroy();
        };
        ins.delete = () => {
          this.workflowService.deleteTree({id: this.checkedFlow.id}).then(d => {
             if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('删除成功');
                if (this.checkedFlow.pId === 0) {
                    this.workflows = this.workflows.filter(item => {
                        return item.id !== this.checkedFlow.id;
                    });
                } else {
                    this.datatransferService.workflowUpdateTreeSubject.next({action: 'delete', flow: this.checkedFlow});
                    // 发布给画布删除对应的tab
                    this.datatransferService.workflowUpdateCanvasTabsSubject.next({action: 'update', flows: d.data});
                }
                ins.destroy();
             } else {
                this.modalService.alert('删除失败，请稍后重试');
             }
          });
        };
    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
