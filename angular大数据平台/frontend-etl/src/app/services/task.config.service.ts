/**
 * Created by LIHUA on 2017/8/14/014.
 * 数据融合 任务配置管理 辅助服务
 */

import {Injectable} from '@angular/core';

import {TaskService} from 'app/services/task.service';
import {EtlService} from 'app/services/etl.service';
import {GovernanceService} from 'app/services/governance.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {TaskConfigAsideAddComponent} from 'app/components/modules/task/components/config/aside/add/task.config.aside.add.component';
import {CollectDatabaseEnum} from '../constants/collect.database.enum';

@Injectable()
export class TaskConfigService {
    tasks = []; // 全部显示的配置任务
    checkedTask = null; // 当前展示的任务
    maxTasksNumber = 10; // 最多任务显示数目

    constructor(private modalService: ModalService,
                private taskService: TaskService,
                private etlService: EtlService,
                private governanceService: GovernanceService,
                private toolService: ToolService) {
    }

    initTask(data: any) {
        if (this.tasks.length >= this.maxTasksNumber) {
            this.modalService.alert(`显示任务数超过最大值${this.maxTasksNumber}个， 请删除部分显示任务`);
            return;
        }

        // 先查找当前任务有没有加入到当前显示列表
        let find = -1;
        this.tasks.forEach((t, i) => {
            if ((t.flow.id === data.flow.id) && (t.flow.id !== this.checkedTask.id)) {
                find = i;
                this.checkedTask = t;
                t.checked = true;
            } else {
                t.checked = false;
            }
        });

        // 没找到就新加显示任务
        if (find === -1) {
            this.checkedTask = {
                flow: data.flow,                   // 目录基础数据
                checked: true,                     // 是否tab显示
                updating: false,                   // 是否正在被编辑
                host: null,                        // 任务组件的挂载dom
                instance: null,                    // 任务组件实例
            };
            this.tasks.unshift(this.checkedTask);  // 任务从头插入
        }
    }

    updateTaskName(data: any) {
        this.tasks.forEach(task => {
            if (task.flow.taskId === data.id) {
                task.flow.taskName = data.flowName;
            }
        });
    }

    toggleTask(task: any) {
        if (this.checkedTask !== task) {
            this.tasks.forEach(t => t.checked = false);
            this.checkedTask = task;
            this.checkedTask.checked = true;
        }
    }

    async deleteTask(task: any, index: number, fource?: Boolean) {
        if (task.updating) {
            await this.deleteConfirmTask(task, index, fource);
        } else {
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

    async deleteConfirmTask(task: any, index: number, fource: Boolean) {

        let [ins, pIns] = this.modalService.confirm('当前画布未保存，确认是否保存？');

        pIns.setBtns([{
            name: '关闭',
            class: 'btn',
            click: async () => {
                if (fource) {
                    task.updating = false;
                    await this.deleteTask(task, index);
                }
                ins.destroy();
            }
        }, {
            name: '保存',
            class: 'btn primary',
            click: async () => {
                // let d = await this.saveWorkTask(task);
                // if (d.success) {
                //     ins.destroy();
                //     this.modalService.alert(d.message);
                //     task.updating = false;
                //     await this.deleteTask(task, index);
                // }
            }
        }]);
    }

    /**
     * 查询任务基本信息
     * @returns {Promise<void>}
     */
    async getFlowInfoTask() {
        let d = await this.etlService.getTaskInfo(this.checkedTask.flow.taskId);
        if (d.success) {
            // 绑定任务基本信息
            Object.keys(d.message).forEach(key => {
                this.checkedTask[key] = d.message[key];
            });
        } else {
            this.modalService.alert(d.message);
        }
    }

    addTask() {
        let [ins] = this.modalService.toolOpen({
            title: '新增任务',
            component: TaskConfigAsideAddComponent,
            datas: {
                type: 'node',
                flowType: 'workFlow',
                newType: 'node',
                dircName: '',
            },
            okCallback: () => {
                ins.saveClick();
            },
            autoOkHide: false
        } as ToolOpenOptions);
    }

    async restoreTaskDatas() {
        this.modalService.loadingShow(); // 还原的时候加了一个遮罩动画

        // 循环里面如果有异步请求，但是这个操作想要同步的话采用for循环
        for (let i = 0; i < this.checkedTask.sourceList.length; i++) {
            let source = this.checkedTask.sourceList[i];
            let config = JSON.parse(source.configAttr);

            // 输入配置
            if (source.sourceType === 'input') {
                // 获取采集源信息
                let d = await this.governanceService.getDataSourceByType(source.sourceDataType);
                if (d.success) {
                    source.gatherSources = d.message;
                } else {
                    this.modalService.alert(d.message);
                }

                // 获取源表 mysql oracle hive sqlserver db2 存在源表信息
                if (source.gatherSources && source.gatherSources.length && this.toolService.contains(source.moduleName, [CollectDatabaseEnum.MYSQL, CollectDatabaseEnum.ORACLE, CollectDatabaseEnum.SQLSERVER, CollectDatabaseEnum.HIVE, CollectDatabaseEnum.DB2])) {
                    let d = await this.governanceService.getSourceTables({id: config.sourceId});
                    if (d.success) {
                        source.gatherSourceTables = d.message;
                    } else {
                        this.modalService.alert(d.message);
                    }
                    // 获取源字段
                    if (source.gatherSourceTables && source.gatherSourceTables.length) {
                        let table = source.gatherSourceTables.filter(table => table.tableName === config.tableName);
                        if (table && table.length) {
                            // 从下拉选择的源字段
                            let d = await this.governanceService.getTableFields(table[0].id);
                            if (d.success) {
                                source.sourceFiles = d.message;
                            } else {
                                this.modalService.alert(d.message);
                            }
                            // 获取拆分依赖
                            let s = await this.governanceService.getSplitBy({id: table[0].id});
                            if (s.success) {
                                source.splitByFields = s.message;
                            } else {
                                this.modalService.alert(s.message);
                            }
                        } else {
                            // 从sql选择的源字段
                            let d = await this.taskService.getFieldsBySql({sql: config.tableName, sourceId: config.sourceId});
                            if (d.success) {
                                source.sourceFiles = [];
                                source.splitByFields = [];
                                d.message.forEach(msg => {
                                    // 源字段
                                    source.sourceFiles.push({
                                        fieldName: msg.fieldName,
                                        dataType: msg.fieldType,
                                        fieldType: msg.fieldType
                                    });
                                    if (msg.isSplit) {
                                        // 拆分依赖
                                        source.splitByFields.push({
                                            fieldName: msg.fieldName,
                                            dataType: msg.fieldType,
                                            fieldType: msg.fieldType
                                        });
                                    }
                                });
                            } else {
                                this.modalService.alert(d.message);
                            }
                        }
                    }
                }
            }

            // 输出配置
            if (source.sourceType === 'output') {
                // 获取目标库信息
                let d = await this.governanceService.getDataSourceByType(source.sourceDataType);
                if (d.success) {
                    source.targetObjects = d.message;
                } else {
                    this.modalService.alert(d.message);
                }

                // 获取目标表
                if (source.targetObjects && source.targetObjects.length) {
                    let d = await this.governanceService.getSourceTables({id: config.sourceId});
                    if (d.success) {
                        source.targetTables = d.message;
                    } else {
                        this.modalService.alert(d.message);
                    }

                    // 目标字段
                    if (source.targetTables && source.targetTables.length) {
                        let table = source.targetTables.filter(table => table.tableName === config.tableName);
                        if (table && table.length) {
                            let d = await this.governanceService.getTableFields(table[0].id);
                            if (d.success) {
                                source.targetFiles = d.message;
                            } else {
                                this.modalService.alert(d.message);
                            }
                        }
                    }
                }
            }
        }
    }

}
