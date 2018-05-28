/**
 * Created by LIHUA on 2017-08-21.
 * 任务内容
 *
 * 日期组件 https://github.com/kekeh/ngx-mydatepicker#options-attribute
 */

import {Component, ComponentFactoryResolver, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {TaskService} from 'app/services/task.service';
import {LoginService} from 'app/services/login.service';
import {TaskConfigService} from 'app/services/task.config.service';
import {EtlService} from 'app/services/etl.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {TaskConfigContentTabComponent} from './tab/task.config.content.tab.component';

@Component({
    selector: 'task-config-content-component',
    templateUrl: './task.config.content.component.html',
    styleUrls: ['./task.config.content.component.scss']
})
export class TaskConfigContentComponent implements OnInit, OnDestroy {

    tasks: any;

    modules: any;

    @ViewChildren('tasktabs', {read: ViewContainerRef})
    tasktabs: QueryList<ViewContainerRef>;

    unsubscribes = [];

    tcs: any;

    @ViewChild('configPanel') configPanel;

    showPanel = false; // 是否显示调度配置

    constructor (private modalService: ModalService,
                 private datatransferService: DatatransferService,
                 private taskService: TaskService,
                 private loginService: LoginService,
                 private componentFactoryResolver: ComponentFactoryResolver,
                 private render: Renderer2,
                 private toolService: ToolService,
                 tcs: TaskConfigService,
                 private etlService: EtlService) {

        this.tcs = tcs;

        // 树形目录双击选中点击订阅 查询该目录的全部子任务
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeDbCheckedSubject.subscribe(async data => {
            if ((data.type === 'workList' || data.type === 'nodeList') && data.flow.type === 'task') {
                this.tcs.initTask(data);
                // 获取任务详情相关信息
                if (!this.tcs.checkedTask.flowInfo) {
                    await this.tcs.getFlowInfoTask();

                    setTimeout(async () => {
                        // 动态新增显示组件
                        await this.initDynamicComponent();
                        // 初始化任务配置时间
                        this.configPanel.initFlowInfo();
                    }, 100);
                }
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);

        // 任务名称修改订阅
        let updateCatalogSubjectSubscribe = this.datatransferService.updateCatalogSubject.subscribe(data => {
            this.tcs.updateTaskName(data);
        });
        this.unsubscribes.push(updateCatalogSubjectSubscribe);

        // 任务删除订阅
        let removeCatalogSubjectSubscribe = this.datatransferService.removeCatalogSubject.subscribe(data => {
            // 如果删除的任务正在任务列表 直接删除
            this.tasks = this.tasks.filter(task => {
                return !(task.flow.projectId === data);
            });
        });
        this.unsubscribes.push(removeCatalogSubjectSubscribe);
    }

    ngOnInit() {
        this.tasks = this.tcs.tasks;

        setTimeout(() => {
            this.initModules(); // 获取拖拽模块
        }, 1000);
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(s => s.unsubscribe());
    }

    toggleCheckedTask(task: any) {
        this.tcs.toggleTask(task);
    }

    async deleteTask(task: any, index: number, fource?: Boolean) {
        await this.tcs.deleteTask(task, index, fource);
    }

    async initDynamicComponent() {
        // 存在画布信息 表示需要还原界面 提前把数据先查询出来
        if (this.tcs.checkedTask.task.flowPosition) {
            await this.tcs.restoreTaskDatas();
        }

        let first = this.tasktabs.first;
        if (first) {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TaskConfigContentTabComponent);
            this.tcs.checkedTask.instance = first.createComponent(componentFactory).instance;
            this.tcs.checkedTask.host = first;

            this.tcs.checkedTask.instance.task = this.tcs.checkedTask;

            this.tcs.checkedTask.instance.addContent({
                title: this.tcs.checkedTask.flow.taskName,
                checked: true,
                host: null,
                instance: null,
                type: 'datasync',
                modules: this.modules
            });
        } else {
            this.modalService.alert('画布初始化错误，请重新刷新网页');
        }
    }

    /**
     * 拖拽模块查询
     */
    initModules() {
        this.etlService.getAllModules().then(d => {
            this.modules = [];
            if (d.success && d.message && d.message.length) {
                while (d.message.length) {
                    let temp = d.message.shift();
                    if (temp.parentId === '0') {
                        temp.checked = false;
                        temp.expand = false;
                        this.modules.push(temp);
                    } else {
                        let find = false;
                        this.modules.forEach(module => {
                            if (module.id === temp.parentId) {
                                find = true;
                                module.children = module.children || [];
                                module.children.push(temp);
                            }
                        });

                        if (!find) {
                            d.message.push(temp);
                        }
                    }
                }
            }
        });
    }

    /**
     * 调度配置 显示切换回调
     * @param data
     */
    onShowPanelCallback(data: boolean) {
        this.showPanel = data;
    }

    /**
     * 添加任务
     */
    addTask() {
        this.tcs.addTask();
    }

    /**
     * 保存任务点击
     * @param {MouseEvent} $event
     */
    saveTaskClick($event: MouseEvent) {
        if (!this.tcs.checkedTask || !this.tcs.checkedTask.updating) {
            return;
        }

        this.saveNodeTask(this.tcs.checkedTask, $event);
    }

    /**
     * 保存任务
     * @param task
     * @param {MouseEvent} $event
     */
    saveNodeTask(task: any, $event: MouseEvent) {
        // 获取 cronTime_cn 对象
        let [cronSuccess, cronTime_cn, projectCycle] = this.configPanel.getCronTime_cn();
        if (!cronSuccess) {
            if (this.showPanel) {
                $event.stopPropagation();
            } else {
                this.configPanel.showPanelClick($event);
            }
            return;
        }

        let tab = this.tcs.checkedTask.instance; // tab实例
        let datasync = tab.contents[0].instance; // 画布组件实例

        let params = {
            taskId: task.flow.taskId,
            task: {
                projectCycle: projectCycle,
                cronTime_cn: cronTime_cn,
                flowPosition: JSON.stringify(datasync['dragTargetOption'])
            },
            jobList: [],
            hopList: [],
            cleanList: [],
            sourceList: []
        };

        // 连线关系
        datasync['dragTargetOption'].connections.forEach(connection => {
             params.hopList.push({
                 sourceJobId: connection.sourceUuid,
                 targetJobId: connection.targetUuid
             });
        });

        let orderNo = 0;
        for (let i = 0; i < datasync['dragTargetOption'].elements.length; i++) {
            let element = datasync['dragTargetOption'].elements[i];

            // 先做数据检查
            let elementContent = tab.getContentByUuid(element.uuid);
            if (!elementContent) {
                this.modalService.alert('请配置模块 ' + element.moduleName + (element.nickname ? '(' + element.nickname + ')' : ''));
                return;
            }
            // 配置项
            let elementInstance = elementContent.instance;
            if (elementInstance && elementInstance.dataCheck && !elementInstance.dataCheck()) { // 先做一步数据检查 检查不合格把界面显示出来
                elementContent.notShow = false;
                tab.addContent(elementContent);
                return;
            }

            // 配置jobList
            let jobListConfig = {
                jobId: element.uuid,
                moduleNo: element.moduleNumber,
                moduleName: element.moduleName,
                moduleType: element.moduleType
            };
            // 输入、输出、汇聚
            if (element.moduleType === 'input' || element.moduleType === 'output' || element.moduleNumber === 30012) {
                jobListConfig['outputAlias'] = element.nickname;
                if (element.moduleType === 'output' || element.moduleNumber === 30012) {
                    jobListConfig['inputAlias'] = elementInstance.getSourcesNickname(); // 获取输入节点的nickname
                }
            } else {
                // 过滤 转换
                if (elementInstance && elementInstance.getSourcesNickname) {
                    jobListConfig['outputAlias'] = jobListConfig['inputAlias'] = elementInstance.getSourcesNickname();
                } // 获取输入节点的nickname
            }
            params.jobList.push(jobListConfig);

            // 过滤
            if (element.moduleType === 'filter') { // 数据过滤
                orderNo = 0;
                elementInstance.checkFieldData && elementInstance.checkFieldData.forEach(field => {
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: JSON.stringify({
                            // field.oldMessage 在去重过滤的时候是数组，所以需要判定一下
                            sourceFieldName: this.toolService.isArray(field.oldMessage) ? field.oldMessage.map(m => m.fieldName).join(',') : field.oldMessage.fieldName,
                            sourceFieldType: this.toolService.isArray(field.oldMessage) ? field.oldMessage.map(m => m.dataType).join(',') : field.oldMessage.dataType,
                            checkType: field.checkRule.value,
                            checkValue: field.checkValue
                        }),
                        orderNo: (orderNo++)
                    });
                });
            }

            // 转换
            if (element.moduleType === 'transfer') {
                // 一般类型转换
                orderNo = 0;
                elementInstance.replaceFieldData && elementInstance.replaceFieldData.forEach(field => {
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: JSON.stringify({
                            sourceFieldName: field.oldMessage.fieldName,
                            sourceFieldType: field.oldMessage.dataType,
                            changeType: field.replaceRule && field.replaceRule.value,
                            // 枚举类型的值 需要特殊处理
                            changeValue: this.toolService.contains(field.replaceRule.value, ['replaceEmpty', 'fixed', 'random', 'merge', 'modulo', 'toggleCase', 'reverse', 'multi', 'express3']) ? field.replaceVal : field.enums[0].id,
                            changeName: this.toolService.contains(field.replaceRule.value, ['replaceEmpty', 'fixed', 'random', 'merge', 'modulo', 'toggleCase', 'reverse', 'multi', 'express3']) ? '' : field.enums[0].menuName,
                            replaceValue: (field.replaceRule.value === 'replaceEmpty') ? field.replaceValue : '',
                            min: (field.replaceRule.value === 'random') ? field.replaceVal : '',   // 随机值转换就沿用的空值替换的绑定参数
                            max: (field.replaceRule.value === 'random') ? field.replaceValue : '',
                            type: field.replaceRule.value === 'random' ? 'number' : (field.replaceRule.value === 'toggleCase' ? field.replaceVal.value : ''), // 随机值转换 number， 小写转换 lower，大写转换 upper
                            targetFieldName: field.outputField
                        }),
                        orderNo: (orderNo++)
                    });
                });

                // 拼接转换（字段合并）
                elementInstance.mergeFieldData && elementInstance.mergeFieldData.forEach(field => {
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: JSON.stringify({
                            sourceFieldName: field.oldMessage.map(m => m.fieldName).join(','),
                            sourceFieldType: field.oldMessage.map(m => m.dataType).join(','),
                            targetFieldName: field.targetField,
                            targetFieldType: field.targetFieldType,
                            delimiter: field.combineSymbol
                        })
                    });
                });

                // 拆分转换
                elementInstance.splitFieldData && elementInstance.splitFieldData.forEach(field => {
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: JSON.stringify({
                            sourceFieldName: field.oldMessage.fieldName,
                            sourceFieldType: field.oldMessage.dataType,
                            targetFieldName: field.targetField,
                            targetFieldType: field.targetFieldType,
                            type: field.splitType.value,    // 拆分类型
                            delimiter: field.splitSymbol,   // 拆分符
                            index: field.splitBit,          // 取位值
                            startIndex: field.substrStart,  // 截取位置 初始
                            endIndex: field.substrEnd       // 截取位置 结束
                        })
                    });
                });

                // 汇聚转换
                if (element.moduleNumber === 30012) {
                    let map = [], join = [];

                    // 根据uuid获取源对应fieldName
                    let getSourceFieldName = (uuid) => {
                        let fieldName = '';
                        elementInstance.inputFiles.forEach(input => {
                            input.sourceFiles.forEach(field => {
                                if (field.uuid === uuid) {
                                    fieldName = field.fieldName;
                                }
                            });
                        });
                        return fieldName;
                    };
                    // 根据uuid获取目标对应fieldName
                    let getOutputFieldName = (uuid) => {
                        let fieldName = '';
                        elementInstance.outputs.forEach(output => {
                            if (output.uuid === uuid) {
                                fieldName = output.fieldName;
                            }
                        });
                        return fieldName;
                    };

                    elementInstance.connections.forEach(c => {
                        if (c.sourceKey === 'true' && c.targetKey === 'false') {
                            // map类型
                            map.push(c.targetNickname + '.' + getOutputFieldName(c.targetUuid) + '=' + c.sourceNickname + '.' + getSourceFieldName(c.sourceUuid));
                        } else {
                            // join类型
                            join.push(c.targetNickname + '.' + getSourceFieldName(c.targetUuid) + '=' + c.sourceNickname + '.' + getSourceFieldName(c.sourceUuid));
                        }
                    });
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: JSON.stringify({
                            map: map,
                            join: join.join(','),
                            outputs: elementInstance.outputs // 这个参数以后要简化
                        })
                    });
                }
            }

            // 输入模块
            if (element.moduleType === 'input') {
                let configAttr = {
                    sourceId: elementInstance.gatherSource.id,                                                    // 采集源
                    tableName: elementInstance.gatherSourceTable && elementInstance.gatherSourceTable.tableName,  // 源表
                    splitBy: elementInstance.splitByField && elementInstance.splitByField.fieldName,              // 拆分依赖
                    opMaps: elementInstance.splitPartitionNum                                                    // 拆分分区
                };

                // 这里存的时候要把 dataType改为fieldType
                let sourceFiles = null;
                if (elementInstance.sourceFiles && elementInstance.sourceFiles.length) {
                    sourceFiles = elementInstance.sourceFiles.map((sourceFile, index) => {
                        return {
                            fieldName: sourceFile.fieldName,
                            fieldType: sourceFile.dataType,
                            fieldNum: index
                        };
                    });
                }

                // 如果是通过sql查询的源字段 那就要传递源字段
                let sqlTable = elementInstance.gatherSourceTables.filter(table => {
                    return table.tableName === elementInstance.gatherSourceTable.tableName;
                });
                if (!sqlTable.length) {
                    configAttr['sourceFields'] = sourceFiles;
                }

                // ftp类型 新增属性
                if (element.moduleName === CollectDatabaseEnum.FTP) {
                    configAttr['header'] = elementInstance.header;
                    configAttr['sourceFile'] = elementInstance.sourceFile;
                    configAttr['fieldDelimiter'] = elementInstance.fieldDelimiter;
                    configAttr['identify'] = elementInstance.identify;
                    configAttr['sourceFields'] = sourceFiles;
                } else if (element.moduleName === CollectDatabaseEnum.KAFKA) {
                    configAttr['topic'] = elementInstance.topic;
                    configAttr['bodyFormat'] = elementInstance.bodyFormat && elementInstance.bodyFormat.value;
                    configAttr['sourceFields'] = sourceFiles;
                    if (configAttr['bodyFormat'] === 'csv') {
                        configAttr['header'] = elementInstance.header;
                        configAttr['fieldDelimiter'] = elementInstance.fieldDelimiter;
                    }
                } else if (element.moduleName === CollectDatabaseEnum.HDFS) {
                    configAttr['sourceFile'] = elementInstance.sourceFile;
                    configAttr['bodyFormat'] = elementInstance.bodyFormat && elementInstance.bodyFormat.value;
                    configAttr['sourceFields'] = sourceFiles;
                } else if (element.moduleName === CollectDatabaseEnum.FILE) {
                    configAttr['sourceFile'] = elementInstance.sourceFile;
                    configAttr['sourceFields'] = sourceFiles;
                } else if (element.moduleName === CollectDatabaseEnum.SPIDER) {
                    configAttr['sourceFile'] = elementInstance.sourceFile;
                    configAttr['sourceFields'] = sourceFiles;
                    configAttr['header'] = elementInstance.header;
                }

                params.sourceList.push({
                    jobId: element.uuid,
                    sourceDataType: element.moduleName,
                    sourceType: element.moduleType,
                    configAttr: JSON.stringify(configAttr),
                    extractType: elementInstance.gatherType.name || '',     // 采集类型 全量/增量
                    appendType: elementInstance.appendType ? elementInstance.appendType.name : '',      // 增量类型
                    appendMode: elementInstance.appendMode ? elementInstance.appendMode.name : '',      // 增量方式
                    incrementColumn: elementInstance.incrementColumn ? elementInstance.incrementColumn.fieldName : '', // 增量字段
                    extractMark: ((elementInstance.extractMark && elementInstance.extractMark.value)  ?
                        elementInstance.extractMark.value :
                        elementInstance.extractMark) || '',     // 增量起始值
                });
            }
            // 输出模块
            if (element.moduleType === 'output') {
                params.sourceList.push({
                    jobId: element.uuid,
                    sourceDataType: element.moduleName,
                    sourceType: element.moduleType,
                    configAttr: JSON.stringify({
                        sourceId: elementInstance.targetObject.id,        // 目标库
                        tableName: elementInstance.targetTable.tableName, // 目标表,
                        overwrite: elementInstance.isCover                // 是否覆盖
                    })
                });

                orderNo = 0;
                elementInstance.outputFieldDatas && elementInstance.outputFieldDatas.forEach(field => {
                    params.cleanList.push({
                        jobId: element.uuid,
                        configAttr: {
                            sourceFieldName: field.oldMessage.fieldName,
                            sourceFieldType: field.oldMessage.dataType,
                            targetFieldName: field.targetMessage.fieldName,
                            targetFieldType: field.targetMessage.dataType
                        },
                        orderNo: (orderNo++)
                    });
                });
            }
        }

        this.etlService.saveEtlConfig(params).then(d => {
            this.modalService.alert(d.message);
            if (d.success) {
                this.tcs.checkedTask.updating = false;
            }
        });
    }

    /**
     * 提交任务
     */
    submitTaskClick() {
        if (this.tcs.checkedTask) {
            if (this.tcs.checkedTask.updating) {
                this.modalService.alert('请先保存任务再提交');
                return;
            }

            this.etlService.submitTask(this.tcs.checkedTask.task.taskId).then(d => {
                this.modalService.alert(d.message);
            });
        }
    }

    /**
     * 点击导入
     */
    importClick() {


    }
}
