/**
 * Created by LIHUA on 2017-08-21.
 *  添加目录
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FileUploader, FileUploaderOptions, FileItem} from 'ng2-file-upload';

import {TaskService} from 'app/services/task.service';
import {LoginService} from 'app/services/login.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {DatatransferService} from 'app/services/datatransfer.service';
import {EtlService} from 'app/services/etl.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'task-config-aside-add-component',
    templateUrl: './task.config.aside.add.component.html',
    styleUrls: ['./task.config.aside.add.component.scss']
})
export class TaskConfigAsideAddComponent implements OnInit, OnDestroy {

    error: string;
    errorType: number;
    type: string;            // 类型
    projectId = '0';         // 初始目录id

    parentId: any;           // 上一级的ID
    createUserId: any;       // 创建人的ID

    dircName = '';           // 目录名称
    dircPath = '/';          // 目录名称

    flows: any;              // 目录树
    checkedFlow: any;        // 选中的目录
    flowIndex = 0;           // 目录的层级
    flowType: string;        // 目录树类型 workList 工作流列表， nodeList 节点任务列表， workFlow 工作流新增目录， workTask 工作流新增任务

    unsubscribes = [];
    newType: any;            // newCatalog为新增目录，editCatalog为编辑目录,work为新建任务,node为新建节点

    taskDescription: string; // 新增任务和新增节点的描述
    nodeType: any;           // 新增节点类型
    nodeTypes = [
        {name: '数据同步', value: 'etl'},
        {name: '机器学习', value: 'mining'},
        {name: 'BI', value: 'bi'},
        {name: '插件管理', value: 'plugin'}
    ];

    editID: any;             // 编辑id

    taskStatus = 'close';    // 任务的运行状态 open开，close关

    @ViewChild('uploaderRef') uploaderRef: ElementRef; // 上传按钮
    uploader: any;                                     // 上传对象

    constructor(private taskService: TaskService,
                private modalService: ModalService,
                private loginService: LoginService,
                private datatransferService: DatatransferService,
                private cookieService: CookieService,
                private toolService: ToolService,
                private validateService: ValidateService,
                private etlService: EtlService) {
        // 初始化节点类型
        this.nodeType = this.nodeTypes[0];

        // 树形目录展开订阅
        let taskTreeExpandSubjectSubscribe = this.datatransferService.taskTreeExpandSubject.subscribe(data => {
            if (data.type === 'workFlow') {
                this.onExpandEvent(data.flow);
            }
        });
        this.unsubscribes.push(taskTreeExpandSubjectSubscribe);

        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.type === 'workFlow') {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);
    }

    async ngOnInit() {
        let data = await this.getFlowInfo(this.projectId);
        if (data) {
            this.flows = data;
        }
        this.nodeValue(); // 给节点类型赋值

        // 文件导入类型
        if (this.newType === 'import') {
            this.initUploader();
        }
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 在编辑节点任务时给节点任务类型赋值
     */
    nodeValue() {
        let i = 0;
        this.nodeTypes.forEach( t => {
            if (t.value ===  this.nodeType) {
                this.nodeType = this.nodeTypes[i];
            } else {
                i++;
            }
        });
    }

    /**
     * 获取目录
     * @param projectId
     * @returns {Promise<any>}
     */
    async getFlowInfo(projectId) {
        let d = await this.etlService.getQueryAllFlowProject(projectId);

        if (d.success && d.message.flowProject && d.message.flowProject.length) {
            d.message.flowProject.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.type = 'catalog';
                msg.children = [];
            });
            return d.message.flowProject;
        }
    }

    /**
     * 树形展开关闭点击
     * @param flow
     * @returns {Promise<void>}
     */
    async onExpandEvent(flow) {
        // 当节点是展开状态 且未查询子节点
        if (!flow.expand && !flow.queryChild) {
            // 查询子节点
            let data = await this.getFlowInfo(flow.projectId);

            if (data) {
                flow.children = flow.children.concat(data);
            }

            flow.queryChild = true;
            flow.expand = true;
        } else {
            flow.expand = !flow.expand;
        }
    }

    /**
     * 树形选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        this.parentId = flow.projectId;
        this.createUserId = flow.createUserId;

        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;

        this.dircPath = '/';
        let tempFlow = this.toolService.treesPositions(this.flows, flow);
        tempFlow.forEach(fl => {
            this.dircPath += (fl.projectName + '/');
        });
    }

    cancelClick() {
        this.hideInstance();
    }

    /**
     * 保存
     */
    async saveClick() {
        this.error = '';
        this.errorType = -1;
        let validate;

        // 保存目录
        if (this.newType === 'newCatalog') {
            this.dircName = this.dircName.trim();
            validate = this.validateService.get(this, this.getValidateObject(),
                ['dircName', 'parentId']);

            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }

             // 保存新建目录
            let d = await this.etlService.addFlowProject({
                createUserId: this.createUserId,
                parentId: this.parentId,
                projectName: this.dircName,
                projectType: 'node'
            });
            if (d.success) {
                this.modalService.alert('保存成功');
                this.datatransferService.addCatalogSubject.next(0);
                this.hideInstance();
            } else {
                this.modalService.alert('保存失败');
            }

        } else if (this.newType === 'work' || this.newType === 'node') {
            // 保存节点
            this.dircName = this.dircName.trim();
            validate = this.validateService.get(this, this.getValidateObject(),
                ['dircName', 'parentId']);
            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }

            // 保存新建任务
            let d = await this.etlService.addNodeTask({
                createUserId: this.createUserId,
                projectId: this.parentId,
                taskName: this.dircName,
                remark: this.taskDescription
            });
            if (d.success) {
                this.modalService.alert(d.message);
                this.datatransferService.addCatalogSubject.next(0);
                this.hideInstance();
            } else {
                this.modalService.alert(d.message);
            }

        } else if (this.newType === 'editCatalog') {
            // 保存编辑目录
            this.dircName = this.dircName.trim();
            validate = this.validateService.get(this, this.getValidateObject(),
                ['dircName']);
            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }

            this.etlService.updateFlowProject({
                projectId: this.editID ,
                projectName: this.dircName,
            }).then(d => {
                if (d.success = true) {
                    this.modalService.alert('保存成功');
                    this.datatransferService.addCatalogSubject.next(0);
                    this.hideInstance();
                } else {
                    this.modalService.alert('保存失败');
                }
            });
        } else if (this.newType === 'editTask') {
            // 保存编辑任务
            this.dircName = this.dircName.trim();
            validate = this.validateService.get(this, this.getValidateObject(),
                ['dircName']);
            if (validate) {
                this.error = validate['error'];
                this.errorType = validate['errorType'];
                return false;
            }

            this.etlService.updateTaskBasicInfo({
                taskId: this.editID,
                taskName: this.dircName,
                remark: this.taskDescription,
            }).then(d => {
                if (d.success = true) {
                    this.modalService.alert('保存成功');
                    this.datatransferService.addCatalogSubject.next(0);
                    this.datatransferService.updateCatalogSubject.next({
                        id: this.editID,
                        flowName: this.dircName
                    });
                    this.hideInstance();
                } else {
                    this.modalService.alert('保存失败');
                }
            });
        } else if (this.newType === 'updateStatus') {
            this.taskService.updateFlowTaskStatus({
                Id: this.editID ,
                status: this.taskStatus
            }).then(d => {
                // let d = data.json();
                if (d.success = true) {
                    this.modalService.alert('保存成功');
                    this.hideInstance();
                } else {
                    this.modalService.alert('保存失败');
                }
            });
        }

    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            dircName: {
                presence: {message: '^名称不能为空', allowEmpty: false},
                errorType: 1,
            },
            parentId: {
                presence: { message: '^请选择上级目录', allowEmpty: false},
                errorType: 2
            }
        };
    }

    /**
     * 初始化上传对象
     */
    initUploader() {
        let token = this.cookieService.get(Cookie.TOKEN);
        const option: FileUploaderOptions = {
            url: this.taskService.importUrl + `?token=${token}`,
            itemAlias: 'file',
            method: 'POST',
            autoUpload: false
        };
        this.uploader = new FileUploader(option);

        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);

            if (res.success) {
                this.modalService.alert('上传成功');
                this.datatransferService.addCatalogSubject.next(0);
            } else {
                this.modalService.alert(res.message);
            }

            this.uploader.queue[0].remove();                // 清除上传队列
            this.uploader.progress = 0;                     // 重置上传进度
            this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框
            this.hideInstance();
        };

        this.uploader.onAfterAddingFile = (item: FileItem) => {
            // 保证上传队列只有一个文件
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
            }

            // 名字长度小于5 且不是.xml结尾 就判定为不是xml文件
            if (!this.toolService.fileCheck(item.file.name, 'xml')) {
                this.error = '请上传.xml格式文件';
                this.errorType = 3;
            }
        };
    }

    /**
     * 保存导入信息
     */
    saveImport() {
        this.error = '';
        this.errorType = -1;

        if (!this.uploader || !this.uploader.queue.length) {
            this.error = '请选择文件';
            this.errorType = 3;
            return;
        }

        // 判定是否是xml文件
        if (this.toolService.fileCheck(this.uploader.queue[0].file.name, 'xml')) {
            this.error = '请上传.xml格式文件';
            this.errorType = 3;
            return;
        }

        if (!this.parentId) {
            this.error = '请选择目录';
            this.errorType = 2;
            return;
        }

        this.uploader.queue[0].url = this.uploader.queue[0].url + this.parentId;
        this.uploader.uploadAll();
    }

    hideInstance: Function;

}
