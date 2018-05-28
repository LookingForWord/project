/**
 * Created by lh on 2017/11/15.
 */
import {Component, ViewChild, ElementRef, OnInit, Renderer2, OnDestroy} from '@angular/core';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {WorkflowWorkContentRunPluginTreeComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/tree/workflow.work.content.run.plugin.tree.component';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {Cookie} from 'app/constants/cookie';
import {CookieService} from 'ngx-cookie';

@Component({
    selector: 'workflow-work-content-run-plugin-shell-component',
    templateUrl: './workflow.work.content.run.plugin.shell.component.html',
    styleUrls: ['./workflow.work.content.run.plugin.shell.component.scss']
})
export class WorkflowWorkContentRunPluginShellComponent implements OnInit, OnDestroy {
    task: any;
    parent: any;

    pageNum = 1;
    pageSize = 10;
    totalcount = 10;

    external: any;                      // 是否是外部任务
    cid: any;
    // shell参数用
    jobName: any;                       // 任务名称
    desc: any;                          // 任务描述
    uuid: string;                          // uuid

    mainFile: any;                      // 入口文件
    jobFile = [];                       // 入口文件集合
    shellParameter: any;                // shell参数

    // 外部任务用
    systemName: any;                    // 系统名称选中项
    systemNames: any;                   // 系统名称集合
    externalSource: any;                // 系统名称url
    checkedTreeTask: any;               // 选中项任务
    checkedTreeTasks = [];              // 任务集合
    externalJobId: any;                 // 选中任务的id
    taskDirth: any;                     // 选中项目录层级
    uploadName = '';
    tasks = [
        {
            name: '111111',
            checked: false
        }, {
            name: '111111',
            checked: false
        }, {
            name: '111111',
            checked: false
        }
    ];

    importUrl: any;         // 导入地址
    @ViewChild('uploaderRef') uploaderRef: ElementRef;      // 上传按钮
    uploader: any;
    errorType = 0;
    error = '';
    showAsidesHook: any;
    token: any;

    constructor(private workflowService: WorkflowService,
                private modalService: ModalService,
                private cookieService: CookieService,
                private render: Renderer2) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }

    ngOnInit() {
        if (this.task && this.task.flowInfo && this.task.flowInfo.jobs) {
            this.task.flowInfo.jobs.forEach(item => {
                if (item.jobId === this.uuid) {
                    let jobFiles = item.jobFile.split(';');
                    jobFiles.forEach(idx => {
                        this.jobFile.push({name: idx});
                    });
                    this.jobFile = JSON.parse(JSON.stringify(this.jobFile));
                    this.jobName = item.jobName;
                    this.desc = item.desc;
                    this.mainFile = {name: item.mainFile};
                    this.shellParameter = item.parameter_str;
                    this.external = item.external;
                    this.externalSource = item.externalSource;
                    this.externalJobId = item.externalJobId;
                    item.uuid = item.jobId;
                    this.uploadName = item.jobFile;
                }
            });
            this.parent.sidesArr = this.task.flowInfo.jobs;
        }
        setTimeout(() => {
            this.initUploader();
            // tab切换bug
            this.showAsidesHook = this.render.listen(document, 'keydown', (e: MouseEvent) => {
                if (e['keyCode'] === 9 && e.target['classList'].contains('textarea')) {
                    if (document.all) {
                        e['keycode'] = 0;
                        e['returnvalue'] = false;
                        return false;
                    } else {
                        e.stopPropagation();
                        return false;
                    }
                }
            });
        }, 500);

        if (this.external) {
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
                        this.workflowService.getExteriorsystemTasks({treeUrl: this.systemName.treeUrl, id: this.systemName.id, flowId: this.task.flowInfo.flow.flowId}).then(d => {
                            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                                let data = d.data || [];
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
    }

    ngOnDestroy() {
        this.showAsidesHook = null;
    }

    /**
     * 保留  后期可能要用
     * @param page
     */
    onPageChange(page?: any) {

    }

    /**
     * 单选切换选中
     * @param data
     * @param item
     */
    onRadioCallback(data, item) {
        this.tasks.forEach(item => {
            item.checked = false;
        });
        item.checked = !item.checked;
    }


    /**
     * 初始化上传对象
     */
    initUploader() {
        const flowId = String(this.task.workflow.flowId);
        const jobId = this.uuid;
        const option: FileUploaderOptions = {
            url: this.workflowService.uploadShellUrl + `?flowId=${flowId}&jobId=${jobId}&token=${this.token}`,
            itemAlias: 'file',
            method: 'POST',
            autoUpload: false,
            queueLimit: 5
        };

        this.uploader = new FileUploader(option);
        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);
            if (res.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('上传成功', {time: 1000});

                // 重名就不需要push了
                let repeat = false;
                this.jobFile.forEach(item => {
                    if (item.name === res.data[0].fileName) {
                        repeat = true;
                    }
                });

                if (!repeat) {
                    this.jobFile.push({name: res.data[0].fileName});     // 入口文件集合
                    this.uploadName = this.uploadName ? (this.uploadName + ';' + res.data[0].fileName) : (res.data[0].fileName);
                }

                this.mainFile = this.jobFile.length === 1 ? this.jobFile[0] : this.mainFile;
                this.jobFile = JSON.parse(JSON.stringify(this.jobFile));
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
            // if (this.uploader.queue.length > 1) {
            //     this.uploader.removeFromQueue(this.uploader.queue[0]);
            // }

            // 大小限制
            if (item.file.size > 2048 * 1024 * 1024) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
                this.error = '文件最大为2G';
                this.errorType = 5;
                return;
            }

            let name = item.file.name;
            if (name.length < 5) {
                this.error = '文件名过短';
                this.errorType = 5;
                this.uploader.queue[0].remove();                // 清除上传队列
                this.uploader.progress = 0;                     // 重置上传进度
                this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                return;
            }
            // shell任务
            // 名字长度小于5 且不是.sh结尾 就判定为不是sh文件
            if (!(name.substr(name.length - 3) === '.sh') && this.cid === '41') {
                this.error = '请上传sh格式文件';
                this.errorType = 5;
                this.uploader.queue[0].remove();                // 清除上传队列
                this.uploader.progress = 0;                     // 重置上传进度
                this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                return;
            } else if (!(name.substr(name.length - 4) === '.jar') && (this.cid === '43' || this.cid === '44')) {
                this.error = '请上传jar格式文件';
                this.errorType = 5;
                this.uploader.queue[0].remove();                // 清除上传队列
                this.uploader.progress = 0;                     // 重置上传进度
                this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                return;
            } else if (!((name.substr(name.length - 4) === '.sql') || name.substr(name.length - 4) === '.hql') && this.cid === '42') {
                this.error = '请上传sql或hql格式文件';
                this.errorType = 5;
                this.uploader.queue[0].remove();                // 清除上传队列
                this.uploader.progress = 0;                     // 重置上传进度
                this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                return;
            } else if (this.cid === '45' &&
                !(name.substr(name.length - 4) === '.jar' || name.substr(name.length - 4) === '.sql' || name.substr(name.length - 3) === '.py')
            ) {
                this.error = '请上传jar、sql、py格式文件';
                this.errorType = 5;
                this.uploader.queue[0].remove();                // 清除上传队列
                this.uploader.progress = 0;                     // 重置上传进度
                this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
                return;
            }
            this.uploader.uploadAll();
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
            this[type] = present;
            this.makeUpdating();
            this.externalSource = present.externalUrl;
            // 获取任务下拉框数据
            this.checkedTreeTasks = [];
            this.checkedTreeTask = null;
            this.taskDirth = '';

            this.workflowService.getExteriorsystemTasks({treeUrl: this.systemName.treeUrl, id: this.systemName.id, flowId: this.task.flowInfo.flow.flowId}).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                    let data = d.data || [];
                    this.checkedTreeTasks = this.retrustToTree(data);
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
            let that = this;
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
                if (!ins.checkedFlow || !ins.dircPath || !ins.checkedFlow.isTask) {
                    ins.errorType = 1;
                    that.parent.showAsides = true;
                    return;
                }
                ins.errorType = -1;
                that.checkedTreeTask = ins.checkedFlow;
                that.taskDirth = ins.dircPath;
                that.makeUpdating();
                ins.destroy();
            };
        }
    }


    addTaskClick(event) {

    }

    /**
     * 保存每个任务配置
     * @param event
     */
    saveTaskClick() {
        if (!this.check()) {
           return;
        }

        this.errorType = -1;

        let fileArr = [];
        this.jobFile.forEach(item => {
            fileArr.push(item.name);
        });
        if (this.parent.sidesArr.length === 0) {
            this.parent.sidesArr.push({
                cid: this.cid,
                jobName: this.jobName,
                desc: this.desc,
                uuid: this.uuid,
                jobId: this.uuid,
                jobFile: fileArr.join(';'),                                                         // 入口文件名字集合  分号分割
                mainFile: this.mainFile ? this.mainFile.name : null,                                // 入口文件名字
                parameter_str: this.shellParameter,                                                 // 参数
                externalJobId: this.checkedTreeTask ? this.checkedTreeTask.externalJobId : null,    // 外部任务选中的树形任务id
                externalSource: this.externalSource,                                                // 外部任务系统的treeUrl
                external: this.external
            });
        } else {
            let repeat = false;
            this.parent.sidesArr.forEach(item => {
                if (item.uuid === this.uuid || item.jobId === this.uuid) {
                    item.cid = this.cid,
                    item.jobName = this.jobName;
                    item.desc = this.desc;
                    item.jobFile = fileArr.join(';'),
                    item.mainFile = this.mainFile ? this.mainFile.name : null;
                    item.parameter_str = this.shellParameter;
                    item.externalJobId = this.checkedTreeTask ? this.checkedTreeTask.externalJobId : null,
                    item.externalSource = this.externalSource,
                    item.external = this.external;
                    repeat = true;
                }
            });
            !repeat && this.parent.sidesArr.push({
                cid: this.cid,
                jobName: this.jobName,
                desc: this.desc,
                uuid: this.uuid,
                jobId: this.uuid,
                jobFile: fileArr.join(';'),
                mainFile: this.mainFile ? this.mainFile.name : null,
                parameter_str: this.shellParameter,
                externalJobId: this.checkedTreeTask ? this.checkedTreeTask.externalJobId : null,
                externalSource: this.externalSource,
                external: this.external
            });
        }

        this.parent.contents[0].instance.dragTargetOption.elements.forEach(item => {
            if (item.uuid === this.uuid) {
                let start = item.innerHTML.indexOf('<') === -1 ? 0 : item.innerHTML.indexOf('<');
                let num = item.innerHTML.lastIndexOf('>');
                item.innerHTML = num === -1 ? this.jobName : (item.innerHTML.slice(start, num + 1) + this.jobName);
            }
        });
        let elems = document.querySelectorAll('.drag-item.jtk-draggable.jtk-endpoint-anchor');
        for (let i = 0; i < elems.length; i++) {
            if (elems[i].getAttribute('uuid') === this.uuid) {
                elems[i].setAttribute('title', this.jobName);
                let tag_1 = elems[i].getElementsByTagName('i')[0];
                let tag_2 = elems[i].getElementsByTagName('i')[1];
                if (tag_2) {
                    elems[i].innerHTML = '';
                    elems[i].appendChild(tag_1);
                    elems[i].appendChild(tag_2);
                    let txt = document.createTextNode(this.jobName);
                    elems[i].appendChild(txt);
                } else {
                    elems[i]['textContent'] = this.jobName;
                    elems[i].appendChild(tag_1);
                }
                break;
            }
        }
        this.parent.showAsides = false;
        this.parent.shellUpdate = false;
        this.modalService.alert('已暂存', {time: 1000});
        let arr = document.getElementsByClassName('workflow-now');
        arr && arr.length && arr[0].classList.remove('workflow-now');
    }

    /**
     * 关闭右侧弹框
     */
    closePanel() {
        this.parent.showAsides = false;
        let arr = document.getElementsByClassName('workflow-now');
        arr && arr.length && arr[0].classList.remove('workflow-now');
    }

    /**
     * 表单校验
     */
    check() {
        if (!this.jobName) {
            this.errorType = 1;
            return false;
        }
        // 外部任务
        if (this.external) {
            if (!this.externalSource) {
                this.errorType = 4;
                return;
            }
            if (!this.checkedTreeTask) {
                this.errorType = 5;
                return;
            }
        } else {
            if (!this.mainFile) {
                this.errorType = 3;
                return false;
            }
        }

        return true;
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
     * 选中入口文件
     */
    chooseMainFile(value: any) {
        if (value === this.mainFile) {
            return;
        }
        this.makeUpdating();
        this.mainFile = value;
    }

    /**
     * 是否更新过
     */
    makeUpdating () {
        this.parent.shellUpdate = true;
        this.task.updating = true;
    }

}
