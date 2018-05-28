/**
 * Created by lh on 2017/11/9.
 */

import {Component, ComponentFactoryResolver, OnDestroy, QueryList, ViewChildren, ViewContainerRef, ViewChild} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WebSocketService} from 'app/services/websocket.service';
import {WorkflowWorkContentItemsComponent} from 'app/components/modules/workflow/components/work/content/items/workflow.work.content.items.component';
import {WorkflowWorkAsideAddComponent} from 'app/components/modules/workflow/components/work/aside/add/workflow.work.aside.add.component';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {Cookie} from 'app/constants/cookie';
import {CookieService} from 'ngx-cookie';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

export interface WorkflowWorkContentInterface {
    workflow: any;        // 工作流目录数据
    checked: boolean;     // 是否被选中
    updating: boolean;    // 是否被修改
    itemsInstance: any;   // 下穿内容集合
    asidesInstance: any;  // 侧边栏内容集合
    showAsides: boolean;
    flowInfo: any;        // 工作流任务信息集合,
    sidesArr: any;
}

@Component({
    selector: 'workflow-work-content-component',
    templateUrl: './workflow.work.content.component.html',
    styleUrls: ['./workflow.work.content.component.scss'],
    animations: [Animations.slideBottom]
})
export class WorkflowWorkContentComponent implements OnDestroy {
    tasks = Array<WorkflowWorkContentInterface>();      // 树形点击，右侧内容对应的list数组
    checkedTask: WorkflowWorkContentInterface;
    maxLength = 10;          // 最大显示数
    showRunLog: any;        // 是否显示日志
    logs = [];              // 日志列表
    noLog: any;             // 无日志
    taskIds = [];

    @ViewChildren('taskItems', {read: ViewContainerRef}) taskItems: QueryList<ViewContainerRef>;   // 下穿内容集合

    unsubscribes = [];

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private componentFactoryResolver: ComponentFactoryResolver,
                private workflowService: WorkflowService,
                private webSocketService: WebSocketService,
                private cookieService: CookieService) {
        // 监听工作流目录双击事件
        let workflowTreeDbCheckedSubject = this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            if (data.method === 'dbClick') {
                this.initTask(data.flow);
                this.noLog = [];
                this.showRunLog = false;
                this.webSocketService.ws && this.webSocketService.close();
            }

        });
        this.unsubscribes.push(workflowTreeDbCheckedSubject);
        // 树形工作流编辑订阅
        let workflowTreeUpdateSubjext = this.datatransferService.workflowUpdateTreeSubject.subscribe(data => {
           if (data.action === 'edit' && data.flow && data.flow.newName) {
                this.tasks.forEach(item => {
                   if (item.workflow.flowId === data.flow.flowId) {
                       item.workflow.name = data.flow.newName;
                   }
                });
           }
        });
        this.unsubscribes.push(workflowTreeUpdateSubjext);
        // 树形删除操作  若画布存在对应的flowId则也删除
        let updateCanvasTabSubject = this.datatransferService.workflowUpdateCanvasTabsSubject.subscribe(data => {
            if (data.flows) {
                this.tasks.forEach((item, index) => {
                    data.flows.forEach(child => {
                        if (item.workflow.flowId === child) {
                            item.updating = false;
                            this.deleteByTask(item, index);
                        }
                    });

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
        if (this.tasks.length >= this.maxLength) {
            this.modalService.alert('显示任务数超过最大值' + this.maxLength + '个， 请删除部分显示任务', {auto: true});
            return;
        }
        if (find && find.length) {
            this.checkedTask = find[0];
            this.tasks.forEach(t => t.checked = false);
            this.checkedTask.checked = true;
            return;
        }

        this.tasks.forEach(t => t.checked = false);
        let task: WorkflowWorkContentInterface = {
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
            this.workflowService.getTaskInfo({flowId: data.flowId}).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                    this.checkedTask.flowInfo = d.data;
                    this.checkedTask.sidesArr = d.data.jobs;
                    this.tasks.unshift(task);
                    setTimeout(() => {
                        this.initDynamicComponent();
                    }, 100);
                }
            });
        }
        // this.tasks.push(task);
        //
        // setTimeout(() => {
        //     this.initDynamicComponent();
        // });
    }

    /**
     * 动态新增显示任务组件
     */
    initDynamicComponent() {
        this.modalService.loadingShow(); // 还原的时候加了一个遮罩动画
        let itemsLast = this.taskItems.first;
        // 新增 items 容器
        let itemsComponentFactory = this.componentFactoryResolver.resolveComponentFactory(WorkflowWorkContentItemsComponent);
        this.checkedTask.itemsInstance = itemsLast.createComponent(itemsComponentFactory).instance;
        this.checkedTask.itemsInstance.task = this.checkedTask;
        this.modalService.loadingHide();
    }

    /**
     * 触发器侧边栏弹出栏
     */
    triggerTaskClick($event: MouseEvent) {
        if (this.checkedTask) {
            this.checkedTask.itemsInstance.expandTriggerPanel();
        }
        $event.stopPropagation();
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
        let jobs = this.check('save');
        if (!this.checkedTask.updating) {
            this.modalService.alert('无任何更新,无需保存');
            return;
        }
        if (!jobs) {
            return;
        }
        if (this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.elements.length === 1) {
            this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.connections = [];
        }
        if (!this.checkedTask.flowInfo.flow.timing) {
            this.modalService.alert('请添加触发器', {time: 2000});
            return;
        }
        const params = {
            flowId: this.checkedTask.workflow.flowId,
            jobs: jobs,
            flow: {
                triggerType: 3,
                flowId: this.checkedTask.workflow.flowId,
                connections: JSON.stringify(this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption)
            }
        };

        this.workflowService.saveTasks(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.workflowService.runWorkflow({
                    flowId: this.checkedTask.workflow.flowId,
                    flowName: this.checkedTask.workflow.flowName,
                    triggerType: 3
                }).then( result => {
                    if (result.rspcode === ServiceStatusEnum.SUCCESS) {
                        this.checkedTask.updating = false;
                        this.modalService.alert('保存成功', {time: 1500});
                    }  else {
                        this.modalService.alert(result.message || result.data || '保存失败')
                    }
                });
            } else {
                this.modalService.alert(d.message || d.data || '保存失败');
            }
        });
    }

    /**
     * 立即运行
     */
    async runWorkflow() {
        let jobs = this.check('save');
        if (!jobs) {
            return;
        }
        if (this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.elements.length === 1) {
            this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption.connections = [];
        }
        const params = {
            flowId: this.checkedTask.workflow.flowId,
            jobs: jobs,
            flow: {
                triggerType: 1,
                flowId: this.checkedTask.workflow.flowId,
                connections: JSON.stringify(this.checkedTask.itemsInstance.contents[0].instance.dragTargetOption)
            }
        };

        this.logs = [];
        this.checkedTask.itemsInstance.contents[0].instance.taskIds = [];
        this.webSocketService.ws && this.webSocketService.close();

        this.workflowService.saveTasks(params).then(result => {
            if (result.rspcode === ServiceStatusEnum.SUCCESS) {
                this.workflowService.runNowWorkflow({
                    flowId: this.checkedTask.workflow.flowId,
                    name: this.checkedTask.workflow.name,
                    triggerType: 1
                }).then(d => {
                    if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('操作成功，正在运行');
                        this.webSocketService.ws = null;
                        this.checkedTask.itemsInstance.contents[0].instance.taskIds = [];
                        document.querySelector('.drag-target-container .drag-target').innerHTML = '';
                        this.checkedTask.itemsInstance.contents[0].instance.initCanvasElement();
                        // websocket 获取实时运行状态
                        this.getRunStatus(d.data.exeId, d.data.flowId, this.taskIds[0]);
                        this.showRunLog = true;
                    } else {
                        this.modalService.alert(d.data);
                    }
                });
            }  else {
                this.modalService.alert(result.data || result.rspdesc);
            }
        });
    }

    /**
     * 激活工作流
     */
    activateWorkflow() {
        if (!this.checkedTask || !this.checkedTask.workflow) {
            return;
        }
        if (!this.check('run')) {
            return;
        }
        this.workflowService.activateWorkflow({
            flowId: this.checkedTask.workflow.flowId
        }).then( d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('已激活', {time: 1500});
                this.checkedTask.flowInfo.flow['enabled'] = 1;
            } else {
                this.modalService.alert(d.data || d.data || d.message );
            }
        });
    }

    /**
     * 校验
     */
    check(type) {
        // 未更新就不保存    || !this.checkedTask.updating暂时不要
        if ((!this.checkedTask) && type === 'save') {
            return;
        }

        if (this.checkedTask.itemsInstance.shellUpdate) {
            this.modalService.alert('请先保存任务配置信息');
            return;
        }
        // 未连线
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

        // 有任务信息未填写时
        let hasTask = false;
        if (!elms || elms.length === 0) {
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
                this.modalService.alert('请将画布元素连线');
                return;
            }
        } else if (elms.length === 1) {
            newElemnts = elms;
        }

        if (asides.length === 0 || asides.length < elms.length) {
            this.modalService.alert('请双击任务完善保存每个任务的配置信息', {auto: true});
            hasTask = true;
            return;
        }
        asides.forEach((side, index) => {
            // jar包和shell任务
            if ((!side.jobName || !side.mainFile || !side.jobFile) && !side.external) {
                this.modalService.alert(`请双击任务完善保存第${index + 1}个任务的配置信息`, {auto: true});
                hasTask = true;
            }
            // 外部任务
            if ((!side.externalSource || !side.externalJobId) && side.external) {
                this.modalService.alert(`请双击任务完善保存第${index + 1}个任务的配置信息`, {auto: true});
                hasTask = true;
            }
        });
        if (hasTask) {
            return false;
        }

        let newAisdes = [];
        asides.forEach(side => {
           elms.forEach(elm => {
               if (side.jobId === elm.uuid) {
                   newAisdes.push(side);
               }
           });
        });

        let jobs = [];

        newAisdes.forEach(aside => {
            let type = this.changeJobType(aside.cid);
            jobs.push({
                flowId: this.checkedTask.workflow.flowId,   // 工作流id
                jobId: aside.jobId || aside.uuid,                            // 任务id   前端确定(方便画布还原)
                jobName: aside.jobName,                     // 任务名
                jobFile: aside.jobFile,                     // 文件目录名字集合  ;分割
                mainFile: aside.mainFile,                   // 入口文件名字
                parameter_str: aside.parameter_str,         // 参数
                desc: aside.desc,                           // 描述
                preJobId_str: [],                           // 上一个节点  按连接顺序
                nextJobId_str: [],                          // 下一个节点  按连接顺序
                jobType: type || aside.jobType,                              // 任务类型
                external: aside.external,
                externalSource: aside.externalSource,       // 外部任务 系统对应url
                externalJobId: aside.externalJobId          // 外部任务 树形选中的任务id
            });
        });
        // 任务集合
        jobs.forEach(job => {
            connections.forEach(connect => {
                if (job.jobId === connect.sourceUuid && job.jobId !== connect.targetUuid) {
                    job.nextJobId_str.push(connect.targetUuid);
                }
                if (job.jobId === connect.targetUuid && job.jobId !== connect.sourceUuid) {
                    job.preJobId_str.push(connect.sourceUuid);
                }
            });
        });

        this.taskIds = [];
        jobs.forEach(item => {
           item.nextJobId_str = item.nextJobId_str.join(';');
           item.preJobId_str = item.preJobId_str.join(';');
           if (!item.preJobId_str) {
               this.taskIds.unshift(item.jobId);
           }
        });
        this.findNextJob(this.taskIds[0], jobs);
        console.log(this.taskIds);
        return jobs;
    }

    /**
     * 递归调用挨个查找下一个节点的tjobId
     */
    findNextJob(preJobId: any, jobs: any) {
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].preJobId_str === preJobId && this.taskIds.join(',').indexOf(jobs[i].jobId) === -1) {
                this.taskIds.push(jobs[i].jobId);
                this.findNextJob(jobs[i].jobId, jobs);
                break;
            }
        }
    }

    /**
     * 插件类型转换
     */
    changeJobType(cid: any) {
        let jobType = 0;
        switch (cid) {
            case '41': jobType = 1; break;
            case '45': jobType = 2; break;
            case 'python': jobType = 3; break;
            case '43': jobType = 4; break;
            case '42': jobType = 5; break;
            case '44': jobType = 6; break;
            case '46': jobType = 7; break;
        }
        return jobType;
    }


    /**
     * 实时运行状态   exeId运行id    flowId 工作流id   当前任务id集合
     */
    getRunStatus (exeId: any, flowId: any, taskId: any) {
        let presentTaskId = taskId;
        let status = 0;

        this.webSocketService.createObservableSocket().subscribe( (data) => {
            let d = JSON.parse(data).data;
            d.log && this.logs.push(d.log);

            if ((d.taskId !== presentTaskId || d.status !== status) && d.taskId) {
                if (this.checkedTask.itemsInstance.contents[0].instance.taskIds.length === 0) {
                    this.checkedTask.itemsInstance.contents[0].instance.taskIds.push({status: d.status, taskId: d.taskId});
                } else if (this.checkedTask.itemsInstance.contents[0].instance.taskIds.length !== 0) {
                    let newArr = this.checkedTask.itemsInstance.contents[0].instance.taskIds.filter(item => {
                       return item.taskId === d.taskId;
                    });

                    if (newArr.length === 0) {
                        this.checkedTask.itemsInstance.contents[0].instance.taskIds.push({status: d.status, taskId: d.taskId});
                    } else {
                        this.checkedTask.itemsInstance.contents[0].instance.taskIds.forEach(item => {
                            if (item.taskId === d.taskId) {
                                item.status = d.status;
                            }
                        });
                    }
                }
                presentTaskId = d.taskId;
                status = d.status;
                for (let i = 0; i < this.taskIds.length; i++) {
                    if (this.taskIds[i] === presentTaskId && i <= this.taskIds.length - 1 && (d.status !== 1 && d.status !== 5)) {
                        if (i === this.taskIds.length - 1) {
                            return;
                        }
                        this.sendMessageToServer(exeId, flowId, this.taskIds[i + 1]);
                        return;
                    }
                }
            }
            if (d.taskId === this.taskIds[0] && !this.checkedTask.itemsInstance.contents[0].instance.runHook) {
                this.checkedTask.itemsInstance.contents[0].instance.runNowRedrawCanvas();
            }
        }, (err) => {
            console.log(err);
        }, () => {
            if ( this.webSocketService.ws &&
                this.webSocketService.ws.readyState === 3 &&
                this.taskIds.length > this.checkedTask.itemsInstance.contents[0].instance.taskIds.length
            ) {
                this.webSocketService.close();
                clearInterval(this.checkedTask.itemsInstance.contents[0].instance.runHook);
                this.checkedTask.itemsInstance.contents[0].instance.runHook = null;
                this.checkedTask.itemsInstance.contents[0].instance.taskIds = [];
                this.logs = [];
                // setTimeout(() => {
                //     this.getRunStatus(exeId, flowId, this.taskIds[0]);
                // }, 1000);
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
        // if (this.webSocketService.ws.readyState === 3) {
        //     this.getRunStatus(exeId, flowId, taskId);
        //     return;
        // }
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
        const ping = {
            op: 'PING',
            data: {
                info: 'ping'
            }
        };
        this.webSocketService.sendMessage(JSON.stringify(ping));
        this.webSocketService.sendMessage(JSON.stringify(params));
    }

    /**
     * 关闭日志弹框
     */
    closeLogPanel() {
        console.log('日志弹框被关闭');
        this.webSocketService.ws && this.webSocketService.close();
        this.webSocketService.ws = null;
        clearInterval(this.checkedTask.itemsInstance.contents[0].instance.runHook);
        this.checkedTask.itemsInstance.contents[0].instance.runHook = null;
        this.checkedTask.itemsInstance.contents[0].instance.taskIds = [];
        this.noLog = false;
        this.logs = [];
        this.showRunLog = false;
    }
}
