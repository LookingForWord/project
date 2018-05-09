/**
 * Created by lh on 2017/11/9.
 */

import {Component, ComponentFactoryResolver, OnDestroy, QueryList, ViewChildren, ViewContainerRef, ViewChild} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceNormAuditContentItemsComponent} from 'app/components/modules/governance/components/norm.audit/content/items/governance.norm.audit.content.items.component';
import {GovernanceNormAuditContentReplaceHolderComponent} from 'app/components/modules/governance/components/norm.audit/content/replace.placeholder/governance.norm.audit.content.replace.holder.component';

import {GovernanceService} from 'app/services/governance.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

export interface normAuditContentInterface {
    workflow: any;        // 目录数据
    checked: boolean;     // 是否被选中
    updating: boolean;    // 是否被修改
    itemsInstance: any;   // 下穿内容集合
    asidesInstance: any;  // 侧边栏内容集合
    showAsides: boolean;
    flowInfo: any;        // 工作流任务信息集合,
    sidesArr: any;
}

@Component({
    selector: 'governance-norm-audit-content-component',
    templateUrl: './governance.norm.audit.content.component.html',
    styleUrls: ['./governance.norm.audit.content.component.scss'],
    animations: [Animations.slideBottom]
})
export class GovernanceNormAuditContentComponent implements OnDestroy {
    tasks = Array<normAuditContentInterface>();      // 树形点击，右侧内容对应的list数组
    checkedTask: normAuditContentInterface;
    maxLength = 10;          // 最大显示数
    showRunLog: any;        // 是否显示日志
    logs = [];              // 日志列表
    noLog: any;             // 无日志
    taskIds = [];
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;

    @ViewChildren('taskItems', {read: ViewContainerRef}) taskItems: QueryList<ViewContainerRef>;   // 下穿内容集合

    unsubscribes = [];

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private componentFactoryResolver: ComponentFactoryResolver,
                private governanceService: GovernanceService) {
        // 监听工作流目录双击事件
        let workflowTreeDbCheckedSubject = this.datatransferService.normAuditTreeDbCheckedSubject.subscribe(data => {
            if (data.method === 'dbClick') {
                this.initTask(data.flow);
                this.noLog = [];
                this.showRunLog = false;
            }

        });
        this.unsubscribes.push(workflowTreeDbCheckedSubject);
        // 树形工作流编辑订阅
        let workflowTreeUpdateSubjext = this.datatransferService.normAuditUpdateTreeSubject.subscribe(data => {
           if (data.action === 'edit' && data.flow && data.flow.newName) {
                this.tasks.forEach(item => {
                   if (item.workflow.id === data.flow.id) {
                       item.workflow.name = data.flow.newName;
                   }
                });
           }
        });
        this.unsubscribes.push(workflowTreeUpdateSubjext);
        // 树形删除操作  若画布存在对应的flowId则也删除
        let updateCanvasTabSubject = this.datatransferService.normAuditUpdateCanvasTabsSubject.subscribe(data => {
            if (data.flow) {
                this.tasks.forEach((item, index) => {
                    if (item.workflow.id === data.flow.id) {
                        item.updating = false;
                        this.deleteByTask(item, index);
                    }
                });
            }
        });
        this.unsubscribes.push(updateCanvasTabSubject);
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(u => u.unsubscribe());
    }

    /**
     * 初始化任务
     * @param data
     */
    initTask(data: any) {
        //
        this.checkedTask && clearInterval(this.checkedTask.itemsInstance.contents[0].instance.runHook);

        let find = this.tasks.filter(t => {
            return t.workflow.id === data.id;
        });
        // 最大任务显示数
        if (this.tasks.length >= this.maxLength && find.length === 0) {
            this.modalService.alert('显示任务数超过最大值' + this.maxLength + '个， 请删除部分显示任务');
            return;
        }
        if (find && find.length) {
            this.checkedTask = find[0];
            this.tasks.forEach(t => t.checked = false);
            this.checkedTask.checked = true;
            return;
        }

        this.tasks.forEach(t => t.checked = false);
        let task: normAuditContentInterface = {
            workflow: data,
            checked: true,
            updating: false,
            itemsInstance: null,
            asidesInstance: null,
            showAsides: false,
            flowInfo: this.checkedTask ? this.checkedTask.flowInfo : null,
            sidesArr: null
        };
        this.checkedTask = task;

        // 获取画布信息和任务信息
        if (find.length === 0) {
            this.governanceService.getdataAuditDetail({id: data.id}).then(d => {
                if (d.success) {
                    this.checkedTask.flowInfo = d.message;
                    this.tasks.unshift(task);
                    setTimeout(() => {
                        this.initDynamicComponent();
                    });
                }
            });
        }
    }

    /**
     * 动态新增显示任务组件
     */
    initDynamicComponent() {
        this.modalService.loadingShow(); // 还原的时候加了一个遮罩动画
        let itemsLast = this.taskItems.first;
        // 新增 items 容器
        let itemsComponentFactory = this.componentFactoryResolver.resolveComponentFactory(GovernanceNormAuditContentItemsComponent);
        this.checkedTask.itemsInstance = itemsLast.createComponent(itemsComponentFactory).instance;
        this.checkedTask.itemsInstance.task = this.checkedTask;
        this.modalService.loadingHide();
    }

    /**
     * 切换显示任务
     * @param task
     */
    toggleCheckedTask(task: any) {
        if (this.checkedTask !== task) {
            this.tasks.forEach(t => t.checked = false);
            this.checkedTask = task;
            this.checkedTask.checked = true;
            this.logs = [];
            this.showRunLog = false;
        }
        // 发布给树形  树形flowId相同的置为选中状态
    }

    /**
     * 从tasks里删除任务
     * @param task
     * @param {number} index
     * @param {boolean} fourceDelete 是否强制删除
     */
    deleteByTask (task: any, index: number, fourceDelete?: boolean) {
        if (task.updating) {
            this.deleteTask(task, index, fourceDelete);
        } else {
            this.closeLogPanel();
            this.tasks.splice(index, 1);
            if (this.tasks.length) {
                if (index >= this.tasks.length) {
                    this.checkedTask = this.tasks[this.tasks.length - 1];
                } else {
                    this.checkedTask = this.tasks[index];
                }

                if (task.checked) {
                    this.checkedTask.checked = true;
                }
            } else {
                this.checkedTask = null;
            }
        }
    }

    /**
     * 删除显示的任务
     * @param task
     * @param {number} index
     * @param {boolean} fourceDelete 是否强制删除
     * @returns {Promise<void>}
     */
    async deleteTask(task: any, index: number, fourceDelete?: boolean) {
        let [ins, pIns] = this.modalService.confirm('当前画布未保存，确认是否保存？');

        pIns.setBtns([{
            name: '关闭',
            class: 'btn',
            click: () => {
                if (fourceDelete) {
                    task.updating = false;
                    this.deleteByTask(task, index);
                }
                ins.destroy();
            }
        }, {
            name: '保存',
            class: 'btn primary',
            click: async (e) => {
                await this.saveTaskClick(e);
                ins.destroy();
                this.closeLogPanel();
            }
        }]);
    }

    /**
     * 保存
     */
    saveTaskClick($event) {
        // 没得选中任务 直接返回
        if (!this.checkedTask) {
            return;
        }

        if (!this.checkedTask.updating) {
            return;
        }
        let result = this.check('save');
        if (!result) {
            return;
        }
        let arr = this.checkedTask.itemsInstance.sidesArr;
        const params = {
            id: this.checkedTask.workflow.id,
            normId: this.checkedTask.itemsInstance.checkedNorm ? this.checkedTask.itemsInstance.checkedNorm.id : this.checkedTask.flowInfo.normId,
            configInfo: {jsStr: arr[0].templateContent, uuid: arr[0].uuid, checkedFunc: arr[0].checkedFunc},
            taskPosition: JSON.stringify(this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption),
            taskType: 'DATACHECKNORM'
        };

        this.governanceService.saveDataAudit(params).then(d => {
            if (d.success) {
                this.checkedTask.updating = false;
                this.modalService.alert('保存成功');
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }

    /**
     * 立即运行
     */
    async runWorkflow() {
        // 没得选中任务 直接返回
        if (!this.checkedTask) {
            return;
        }

        let jobs = this.check('save');
        if (this.checkedTask.updating) {
            let elm = document.getElementsByTagName('modal-alert-component')[0];
            elm && elm.parentNode.removeChild(elm);
            this.modalService.alert('请先保存');
            return;
        }
        // 检查执行函数是否含有占位符
        let asides = this.checkedTask.itemsInstance.sidesArr;
        const reg = /\$[a-zA-Z1-9]{0,}/ig;
        let arr = (asides[0].sql || asides[0].templateContent).match(reg);

        let placeArr = [];
        if (arr && arr.length) {
            arr.forEach(item => {
                if (placeArr.join(',').indexOf(item) === -1) {
                    placeArr.push({
                        errorType: false,
                        error: '',
                        oldValue: item,
                        newValue: ''
                    });
                }
            });
            // 打开弹框
            let [ins] = this.modalService.toolOpen({
                title: '替换占位符',
                component: GovernanceNormAuditContentReplaceHolderComponent,
                datas: {
                    templateContent: asides[0].templateContent.templateContent,
                    placeArr: placeArr,
                    configId: this.checkedTask.workflow.id
                },
                okCallback: () => {
                    ins.save();
                }
            } as ToolOpenOptions);

            ins.hideInstance = () => {
                ins.destroy();
            };
        } else {
            this.governanceService.auditRunNow({
                id: this.checkedTask.workflow.id
            }).then(d => {
                if (d.success) {
                    this.modalService.alert(d.message);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        }
    }

    /**
     * 校验
     */
    check(type) {
        // 未更新就不保存
        if ((!this.checkedTask || !this.checkedTask.updating) && type === 'save') {
            return;
        }
        // 配置信息未保存
        if (this.checkedTask.itemsInstance.shellUpdate) {
            this.modalService.alert('请先保存任务配置信息');
            return;
        }
        // 大于一个画布元素时未连线的情况
        if (
            (!this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.connections || this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.connections.length === 0)
            && this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.elements.length > 1
        ) {
            this.modalService.alert('请连线');
            return;
        }

        let asides = this.checkedTask.itemsInstance.sidesArr;
        let elms = this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.elements;
        let connections = this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.connections;

        // 没有画布元素
        let hasTask = false;
        if (!elms || elms.length === 0) {
            let elm = document.getElementsByTagName('modal-alert-component')[0];
            elm && elm.parentNode.removeChild(elm);
            this.modalService.alert('请添加画布元素');
            hasTask = true;
            return;
        }

        let newElemnts = [];
        if (elms.length > 1) {
            connections.forEach(connect => {
                elms.forEach(ele => {
                    if (connect.sourceUuid === ele.uuid  || connect.targetUuid === ele.uuid) {
                        newElemnts.push(ele);
                    }
                });
            });
            if (newElemnts.length < elms.length) {
                let elm = document.getElementsByTagName('modal-alert-component')[0];
                elm && elm.parentNode.removeChild(elm);
                this.modalService.alert('请将画布元素连线');
                return;
            }
        } else if (elms.length === 1) {
            newElemnts = elms;
        }
        if (asides.length === 0 || asides.length < elms.length) {
            this.modalService.alert('请完善配置信息');
            hasTask = true;
            return;
        }

        asides.forEach((side, index) => {
            if (!side.checkedFunc || !side.templateContent) {
                this.modalService.alert(`请完善配置信息`);
                hasTask = true;
            }
        });
        if (hasTask) {
            return;
        }
        return true;
    }

    /**
     * 关闭日志弹框
     */
    closeLogPanel() {
        this.noLog = false;
        this.logs = [];
        this.showRunLog = false;
    }

    /**
     * 运行历史
     */
    getRunHistory() {
        if (!this.checkedTask || this.checkedTask.workflow.type === 'catalog') {
            return;
        }
        this.governanceService.getAuditRunHistoryList({
            configId: this.checkedTask.workflow.id,
            pageNum: this.pageNum,
            pageSize: this.pageSize
        }).then(d => {
            if (d.success && d.message) {
                let arr = d.message.content || [];
                this.totalCount = d.message.totalElements;
                this.logs = arr;
                this.showRunLog = true;
                this.noLog = this.logs.length ? false : true;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 运行历史翻页
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getRunHistory();
    }

    /**
     * 任务运行状态(运行历史)
     */
    getRunStatus(status: any) {
        let str = '';
        switch (status) {
            case 'RUNNING': str = '运行中'; break;
            case 'AWAIT': str = '等待中'; break;
            case 'NORMAL': str = '正常'; break;
            case 'SUCCESS': str = '成功'; break;
            case 'ABNORMAL': str = '异常终止'; break;
            case 'FAIL': str = '失败'; break;
            case 'NOTICE': str = '警告'; break;
            case 'JSEXCEPTION': str = '脚本异常'; break;
        }
        return str;
    }

    /**
     * 删除运行记录
     */
    deleteRunHistory(id: any) {
        this.modalService.toolConfirm('您确认删除吗？', () => {
            this.governanceService.deleteAuditRunHistory({id: id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getRunHistory();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
    }
}
