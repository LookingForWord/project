/**
 * Created by lh on 2017/11/9.
 */

import {AfterContentInit, Component, Input, OnInit, Renderer2, ElementRef, ViewChild} from '@angular/core';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceDataAuditAsideAddComponent} from 'app/components/modules/governance/components/data.audit/aside/add/governance.data.audit.aside.add.component';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {GovernanceService} from 'app/services/governance.service';
import {LoginService} from 'app/services/login.service';
import {ActionTypeEnum} from 'app/components/modules/governance/components/data.audit/aside/governance.data.audit.aside.component';

@Component({
    selector: 'governance-data-audit-aside-tree-component',
    templateUrl: './governance.data.audit.aside.tree.component.html',
    styleUrls: ['./governance.data.audit.aside.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class GovernanceDataAuditAsideTreeComponent implements OnInit, AfterContentInit {
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
    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件


    checkedFlow: any;
    dircPath = '';

    constructor(private datatransferService: DatatransferService,
                private governanceService: GovernanceService,
                private modalService: ModalService,
                private toolService: ToolService,
                private loginService: LoginService,
                private render: Renderer2) {
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

    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        if (flow.type === 'task') {
            flow.expand = !flow.expand;
            this.checkedFlow = flow;
            this.datatransferService.dataAuditTreeDbCheckedSubject.next({flow: flow, method: 'oneClick', type: this.type});
            return;
        }
        if (!flow.expand) {
            this.governanceService.getAuditDirectoryTree({parentId: flow.id, catalogType: 'data'}).then(d => {
               if (d.success && d.message) {
                   flow.children = [];
                   d.message.catalog.forEach(item => {
                       flow.children.push({
                           checked: false,
                           expand: false,
                           type: 'catalog',
                           name: item.catalogName,
                           ...item
                       });
                   });
                   if (this.type !== 'add') {
                        d.message.config.forEach(item => {
                            flow.children.push({
                                checked: false,
                                expand: false,
                                type: 'task',
                                name: item.configName,
                                ...item
                            });
                        });
                   }
               } else {
                   this.modalService.alert(d.message);
               }
            });
        }
        flow.expand = !flow.expand;
        this.checkedFlow = flow;
        this.datatransferService.dataAuditTreeDbCheckedSubject.next({flow: flow, method: 'oneClick', type: this.type});
        $event.stopPropagation();
    }
    /**
     * 树形双击
     * @param flow
     * @param {MouseEvent} $event
     */
    dbCheckedClick(flow: any, $event: MouseEvent) {
        if (this.type === 'add' || flow.type === 'catalog') {
            return;
        }
        this.datatransferService.dataAuditTreeDbCheckedSubject.next({flow: flow, method: 'dbClick'});
        $event.stopPropagation();
    }
    /**
     * 编辑目录或任务
     */
    editCatalog(task?: any) {
        if (task.parentId === '0' || task.parentId === 0) {
            this.modalService.alert('根目录不能删除');
            return;
        }
        this.dircPath = '';
        this.checkedFlow = task;
        this.findParentPath(task);
        let title = this.checkedFlow.type === 'task' ? '编辑任务' : '编辑目录';
        let [ins] = this.modalService.toolOpen({
            title: title,
            component: GovernanceDataAuditAsideAddComponent,
            datas: {
                type: this.checkedFlow.type === 'task' ? ActionTypeEnum.EDITTASK : ActionTypeEnum.EDITCATALOG,
                dircName: this.checkedFlow.name,
                dircPath: this.dircPath.slice(0, this.dircPath.lastIndexOf('/')),
                id: this.checkedFlow.id,
                checkedFlow: {...this.checkedFlow, id: this.checkedFlow.parentId}
            },
            okCallback: () => {
                ins.editSave(this.checkedFlow);
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        };
    }

    /**
     * 删除目录
     */
    async deleteCatalog($event: MouseEvent, task?: any) {
        if (task.parentId === '0' || task.parentId === 0) {
            this.modalService.alert('根目录不能删除');
            return;
        }
        $event.stopPropagation();
        this.checkedFlow = task;
        let title = '您确认删除吗？';

        this.modalService.toolConfirm(title, () => {
            if ( task.type === 'task') {
                this.governanceService.deleteAuditTask({id: task.id}).then(d => {
                   if (d.success) {
                       this.modalService.alert('删除成功');
                       this.datatransferService.dataAuditUpdateTreeSubject.next({action: 'delete', flow: this.checkedFlow});
                       // 发布给画布删除对应的tab
                       this.datatransferService.dataAuditUpdateCanvasTabsSubject.next({action: 'update', flow: this.checkedFlow});
                   } else {
                       this.modalService.alert(d.message);
                   }
                });
            } else if (task.type === 'catalog') {
                this.governanceService.deleteAuditDirectory({id: task.id, catalogType: 'data'}).then(d => {
                    if (d.success) {
                        this.modalService.alert('删除成功');
                        this.datatransferService.dataAuditUpdateTreeSubject.next({action: 'delete', flow: this.checkedFlow});
                        // 发布给画布删除对应的tab
                        this.datatransferService.dataAuditUpdateCanvasTabsSubject.next({action: 'update', flow: this.checkedFlow});
                    } else {
                        this.modalService.alert(d.message);
                    }
                });
            }
        });
    }

    /**
     * 查找父节点
     * @param data
     * @param flow
     */
    findParentNode(data: any, flow: any) {
        for (let i in data) {
            if (data[i].id === flow.parentId) {
                this.checkedFlow = data[i];
                break;
            } else {
                this.findParentNode(data[i].children, flow);
            }
        }
    }
    /**
     * 寻找父节点
     * @param data
     * @param flow
     */
    findParentPath(flow: any) {
        let checkedList = this.toolService.treesPositions(this.allWorkflows, flow);
        // 将选中的部门从父级自下拼接为字符串
        checkedList && checkedList.forEach(item => {
            this.dircPath += `/${item.name}`;
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
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
