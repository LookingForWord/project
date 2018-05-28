/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {WorkflowResultDetailLogComponent} from 'app/components/modules/workflow/components/result/detail/log/workflow.result.detail.log';
import {WorkflowWorkContentRunPluginTreeComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/tree/workflow.work.content.run.plugin.tree.component';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {Cookie} from 'app/constants/cookie';
import {CookieService} from 'ngx-cookie';

@Component({
    selector: 'workflow-result-detail-success-panel-component',
    templateUrl: './workflow.result.detail.success.panel.component.html',
    styleUrls: ['./workflow.result.detail.success.panel.component.scss'],
    animations: [Animations.slideLeft]
})
export class WorkflowResultDetailSuccessPanelComponent implements OnInit, OnChanges {
    @Input()
    showPanel: any;                                         // 弹出栏显示隐藏
    @Input()
    flowId: any;                                            // 工作流id
    @Input()
    exeId: any;                                             // 运行id
    @Input()
    jobId: any;                                             // 任务id
    @Input()
    present: any;                                           // 当前项
    @Input()
    dragTargetOption: any;

    jobName: any;                                           // 任务名
    // shell脚本使用
    jobFile = [];                                           // 目录
    mainFile: any;                                          // 入口文件
    parameter_str: any;                                     // shell参数
    desc: any;                                              // 描述
    external: any;                                          // 是否是外部任务

    // 外部任务使用的
    externalSource: any;                                    // 系统url
    systemName: any;
    systemNames: any;
    checkedTreeTask: any;                                   // 任务选中
    checkedTreeTasks = [];                                  // 任务集合
    externalJobId: any;                                     // 任务id
    taskDirth: any;                                         // 选中任务的层级
    uploadName: any;

    @ViewChild('uploaderRef') uploaderRef: ElementRef;      // 上传按钮
    @Output() changePanel = new EventEmitter<any>();
    uploader: any;                                          // 上传对象

    errorType: any;
    error: any;
    hidePanelEventHook = null; // 关闭右侧panel钩子函数
    token: any;

    constructor(private modalService: ModalService,
                private cookieService: CookieService,
                private workflowService: WorkflowService,
                private validateService: ValidateService) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }

    ngOnInit() {
        setTimeout(() => {
            this.initUploader();
        }, 200);

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.present && changes.present.currentValue) {

            let jobFile = this.present.jobFile.split(';');
            jobFile.forEach(item => {
                this.jobFile.push({name: item});
            });
           this.jobFile = JSON.parse(JSON.stringify(this.jobFile));

            this.uploadName = this.present.jobFile;
            this.jobName = this.present.jobName;
            this.mainFile = {name: this.present.mainFile};
            this.parameter_str = this.present.parameter_str;
            this.desc = this.present.desc;
            this.external = this.present.external;
            this.externalSource = this.present.externalSource;
            this.externalJobId = this.present.externalJobId;
        };
        if (this.external) {
            this.getSystem();
        }
        if (changes.jobId && changes.jobId.currentValue && changes.jobId.currentValue !== changes.jobId.previousValue) {
            this.jobId = changes.jobId.currentValue;
            this.initUploader();
        }
        this.errorType = -1;
    }

    /**
     * 获取系统名集合 和任务
     */
    getSystem() {
        // 系统还原
        this.workflowService.getExteriorsystemNames().then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.systemNames = [];
                d.data.forEach(item => {
                    this.systemNames.push(item);
                    if (this.externalSource && this.externalSource === item.externalUrl) {
                        this.systemName = item;
                    }
                });

                // 任务还原
                if (this.systemName) {
                    this.checkedTreeTasks = [];
                    this.workflowService.getExteriorsystemTasks({treeUrl: this.systemName.treeUrl, id: this.systemName.id}).then(d => {
                        if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                            let data = d.data || [];
                            this.checkedTreeTasks = data;
                            data.forEach(item => {
                                if (item.externalJobId === this.externalJobId) {
                                    this.checkedTreeTask = item;
                                }
                            });
                            this.checkedTreeTasks = this.retrustToTree(data);
                        } else {
                            this.modalService.alert(d.rspdesc);
                        }
                    });
                }
            } else {
                this.modalService.alert(d.rspdesc);
            }
        });
    }


    /**
     * 保存
     */
    saveTaskClick() {
        if (!this.check()) {
            return;
        }
        let jobFiles = [];
        this.jobFile.forEach(idx => {
           jobFiles.push(idx.name);
        });
        this.errorType = -1;
        this.present.jobName = this.jobName;
        this.present.jobFile = jobFiles.join(';');
        this.present.mainFile = this.mainFile ? this.mainFile.name : null;
        this.present.parameter_str = this.parameter_str;
        this.present.desc = this.desc;
        this.present.externalJobId = this.checkedTreeTask ? this.checkedTreeTask.externalJobId : this.present.externalJobId;

        let elems = document.querySelectorAll('.drag-item.workflow-result');
        for (let i = 0; i < elems.length; i++) {
            if (elems[i].getAttribute('uuid') === this.present.jobId) {
                elems[i].setAttribute('title', this.jobName);
                let tag_1 = elems[i].getElementsByTagName('i')[0];
                if (tag_1) {
                    elems[i].innerHTML = '';
                    elems[i].appendChild(tag_1);
                    let txt = document.createTextNode(this.jobName);
                    elems[i].appendChild(txt);
                    this.dragTargetOption && this.dragTargetOption.elements.forEach(item => {
                        if (item.uuid === this.present.jobId) {
                            item.innerHTML = elems[i].innerHTML;
                        }
                    });
                }
                break;
            }
        }

        this.modalService.alert('已暂存', {time: 1000});
        this.changePanel.emit(false);
    }

    /**
     * 关闭右侧弹窗
     */
    closePanel() {
        this.changePanel.emit(false);
    }

    /**
     * 删除
     */
    deleteClick() {

    }

    /**
     * 校验表单
     */
    check() {
        // if (!this.jobName) {
        //     this.errorType = 1;
        //     return;
        // }
        // if (!this.external) {
        //     if (!this.jobFile) {
        //         this.errorType = 3;
        //         return;
        //     }
        //     if (!this.mainFile) {
        //         this.errorType = 4;
        //         return;
        //     }
        // }
        // if (this.external) {
        //     if (!this.externalSource) {
        //         this.errorType = 5;
        //         return;
        //     }
        //     if (!this.checkedTreeTask) {
        //         this.errorType = 6;
        //         return;
        //     }
        // }
        this.error = null;
        this.errorType = 0;
        let validate;
        if (!this.external) {
            validate = this.validateService.get(this, this.getValidateObject(), ['jobName', 'jobFile', 'mainFile']);
        }
        if (this.external) {
            validate = this.validateService.get(this, this.getValidateObject(), ['jobName', 'externalSource', 'checkedTreeTask']);
        }

        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }
        return true;
    }

    /**
     * 校验
     */
    getValidateObject() {
        return {
            jobName: {
                presence: {message: '^请填写任务名', allowEmpty: false},
                errorType: 1
            },
            jobFile: {
                presence: {message: '^请上传文件', allowEmpty: false},
                errorType: 3
            },
            mainFile: {
                presence: {message: '^请选择入口文件', allowEmpty: false},
                errorType: 4
            },
            externalSource: {
                presence: {message: '^请选择系统', allowEmpty: false},
                errorType: 5
            },
            checkedTreeTask: {
                presence: {message: '^请选择任务', allowEmpty: false},
                errorType: 6
            }
        };
    }

    /**
     * 外部任务选择系统名称和任务
     */
    chooseExterior(present: any, type: any) {
        if (type === 'systemName') {
            if (this[type] === present) {
                return;
            }
            this.makeUpdating();
            this[type] = present;
            this.externalSource = present.externalUrl;
            // 获取任务下拉框数据
            this.checkedTreeTasks = [];
            this.checkedTreeTask = null;
            this.taskDirth = '';
            this.workflowService.getExteriorsystemTasks({treeUrl: this.systemName.treeUrl, id: this.systemName.id}).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                    let data = d.data || [];
                    if ( data instanceof Array) {
                        this.checkedTreeTasks = this.retrustToTree(data);
                    }
                } else {
                    this.modalService.alert(d.rspdesc);
                }
            });
        } else {
            if (!this.systemName) {
                this.errorType = 4;
                return;
            }
            this.errorType = -1;

            let [ins, pIns] = this.modalService.open(WorkflowWorkContentRunPluginTreeComponent, {
                title: '选择任务',
                backdrop: 'static'
            });
            pIns.setBtns([{
                name: '取消',
                class: 'btn',
                click: () => {
                    ins.destroy();
                }
            }, {
                name: '保存',
                class: 'btn primary',
                click: () => {
                    ins.saveClick();
                }
            }]);
            ins.treeUrl = this.systemName.treeUrl;
            ins.systemId = this.systemName.id;
            ins.checkedFlow = this.checkedTreeTask;
            ins.tasks = this.checkedTreeTasks;
            ins.dircPath = this.taskDirth;
            if (this.checkedTreeTask) {
                ins.dircPath = '';
                ins.checkData(ins.tasks , this.checkedTreeTask.parentId);
                ins.findParentNode(ins.tasks, this.checkedTreeTask);
                ins.onCheckedEvent(this.checkedTreeTask);
            }

            ins.saveClick = () => {
                if (!ins.checkedFlow || !ins.dircPath) {
                    ins.errorType = 1;
                    return;
                }
                ins.errorType = -1;
                ins.destroy();
                this.checkedTreeTask = ins.checkedFlow;
                this.taskDirth = ins.dircPath;
                this.makeUpdating();
            };
        }
    }

    /**
     * 查看日志
     */
    viewTaskLog() {
        let [ins, pIns] = this.modalService.open(WorkflowResultDetailLogComponent, {
            title: '运行日志',
            backdrop: 'static'
        });
        ins.flowId = this.flowId;
        ins.exeId = this.exeId;
        ins.jobId = this.present.jobId;
    }

    /**
     * 初始化上传对象
     */
    initUploader() {
        const flowId = this.flowId;
        const jobId = this.jobId;
        const option: FileUploaderOptions = {
            url: this.workflowService.uploadShellUrl + `?flowId=${flowId}&jobId=${jobId}&token=${this.token}`,
            itemAlias: 'file',
            method: 'POST',
            autoUpload: false
        };
        this.uploader = new FileUploader(option);

        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);
            if (res.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('上传成功', {time: 1000});

                let result = false;
                this.jobFile.forEach(idx => {
                    if (res.data[0].fileName === idx.name) {
                        result = true;
                    }
                });
                if (!result) {
                    this.jobFile.push({name: res.data[0].fileName});
                    this.uploadName = this.uploadName ? (this.uploadName + ';' + res.data[0].fileName) : res.data[0].fileName;
                    this.jobFile = JSON.parse(JSON.stringify(this.jobFile));
                }
                this.mainFile = (this.jobFile.length === 1 ? this.jobFile[0] : this.mainFile);
                this.makeUpdating();
            } else {
                this.modalService.alert('上传失败');
            }

            this.uploader.queue[0].remove();                // 清除上传队列
            this.uploader.progress = 0;                     // 重置上传进度
            this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
        };

        this.uploader.onAfterAddingFile = (item: FileItem) => {
            this.errorType = 0;
            // 保证上传队列只有一个文件
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
            }

            // 大小限制
            if (item.file.size > 2048 * 1024 * 1024) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
                this.error = '文件最大为2G';
                this.errorType = 2;
                return;
            }

            let name = item.file.name;
            for (let i = 0; i < this.dragTargetOption.elements.length; i++) {
                if (this.dragTargetOption.elements[i].uuid === this.jobId) {
                    // // 名字长度小于5 且不是.sh结尾 就判定为不是sh文件
                    if (name.length < 5) {
                        this.error = '文件名太短';
                        this.errorType = 2;
                        this.uploader.queue[0].remove();                // 清除上传队列
                        this.uploader.progress = 0;                     // 重置上传进度
                        this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                        return;
                    }
                    if (!(name.substr(name.length - 3) === '.sh') && this.dragTargetOption.elements[i].cid === '41') {
                        this.error = '请上传sh格式文件';
                        this.errorType = 2;
                        this.uploader.queue[0].remove();                // 清除上传队列
                        this.uploader.progress = 0;                     // 重置上传进度
                        this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                        return;
                    } else if (!(name.substr(name.length - 4) === '.jar') &&
                               (this.dragTargetOption.elements[i].cid === '43' || this.dragTargetOption.elements[i].cid === '44')
                    ) {
                        this.error = '请上传jar格式文件';
                        this.errorType = 2;
                        this.uploader.queue[0].remove();                // 清除上传队列
                        this.uploader.progress = 0;                     // 重置上传进度
                        this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                        return;
                    } else if (!((name.substr(name.length - 4) === '.sql') || name.substr(name.length - 4) === '.hql') &&
                               this.dragTargetOption.elements[i].cid === '42'
                    ) {
                            this.error = '请上传sql或hql格式文件';
                            this.errorType = 2;
                            this.uploader.queue[0].remove();                // 清除上传队列
                            this.uploader.progress = 0;                     // 重置上传进度
                            this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                            return;
                    } else if (this.dragTargetOption.elements[i].cid === '45' &&
                        !(name.substr(name.length - 4) === '.jar' || name.substr(name.length - 4) === '.sql' || name.substr(name.length - 3) === '.py')
                    ) {
                        this.error = '请上传jar、sql、py格式文件';
                        this.errorType = 2;
                        this.uploader.queue[0].remove();                // 清除上传队列
                        this.uploader.progress = 0;                     // 重置上传进度
                        this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                        return;
                    }

                    this.uploader.uploadAll();
                }
            }
        };
    }

    // javascript  树形结构
    retrustToTree(data: any) {
        // 删除 所有 children,以防止多次调用
        data.forEach( (item) => {
            delete item.children;
        });

        // 将数据存储为 以 externalJobId 为 KEY 的 map 索引数据列
        let map = {};
        data.forEach( (item) => {
            item.type = 'run.shell';
            map[item.externalJobId] = item;
        });
        let val = [];
        data.forEach((item, index) => {
            // 以当前遍历项，的pid,去map对象中找到索引的id
            let parent = map[item.parentId];

            // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
            if (parent) {
                (parent.children || ( parent.children = [] )).push(item);
            } else {
                // 如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
                item.expand = true;
                val.push(item);
            }
        });

        return val;
    }

    /**
     * 选择入口文件
     */
    chooseMainFile (value: any) {
        if (value.name === this.mainFile.name) {
            return;
        }
        this.mainFile = value;
        this.makeUpdating();
    }

    /**
     * 任务配置是否更新过
     */
    makeUpdating () {
        this.changePanel.emit(true);
    }
}
