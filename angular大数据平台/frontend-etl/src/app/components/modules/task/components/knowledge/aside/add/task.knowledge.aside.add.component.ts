/**
 * Created by LIHUA on 2017-08-21.
 *  添加目录
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {SystemService} from 'app/services/system.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'task-knowledge-aside-add-component',
    templateUrl: './task.knowledge.aside.add.component.html',
    styleUrls: ['./task.knowledge.aside.add.component.scss']
})
export class TaskKnowledgeAsideAddComponent implements OnInit, OnDestroy {

    error: string;
    errorType: number;

    parentId: any;       // 上一级的ID
    createUser: any;     // 创建人的ID

    dircName: string;    // 目录名称
    dircPath = '/';      // 目录名称

    type: string;        // 类型
    parent = [];

    menuList = [];       // 目录列表

    menuIndex = 0;       // 目录的层级
    unsubscribes = [];   // 订阅集合

    menuType: any;       // 新增节点类型
    menuTypes = [
        {name: '目录', value: 'menu'},
        {name: '知识表', value: 'button'}
    ];

    taskStatus = 'close'; // 任务的运行状态 open开，close关

    constructor (private modalService: ModalService,
                private userService: SystemService,
                private datatransferService: DatatransferService,
                private toolService: ToolService,
                 private validateService: ValidateService) {
        // 初始化节点类型
        this.menuType = this.menuTypes[0];

        // 树形目录选中点击订阅
        let systemKnowledgeSubjectSubscribe = this.datatransferService.systemKnowledgeTreeCheckedSubject.subscribe(data => {
            if (data.type === 'addmenu') {
                this.onCheckedEvent(data.flow, data.parent);
            }
        });
        this.unsubscribes.push(systemKnowledgeSubjectSubscribe);
        // 获取目录列表
        this.getMenuList();
    }

    async ngOnInit() {
        this.nodeValue();   // 给节点类型赋值
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
        }
    }

    getMenuList() {
        this.userService.getMenus({pid: 0}).then(d => {
            if (d.success ) {
                this.initLists(d.message);
            } else {
                this.modalService.alert(d.modalService);
            }
        });
    }

    /**
     * 初始化目录数据
     * @param data
     * @returns {Array}
     */
    initLists(data) {
        // 这里采用公共方法初始化数据，callback会回调每一个节点 便于初始化节点数据
        this.menuList = this.toolService.treesInit(data, {
            callback: (leaf: any) => {
                leaf.expand = false;
                leaf.checked = false;
            }
        });
        return this.menuList;
    }

    /**
     * 在编辑节点任务时给节点任务类型赋值
     */
    nodeValue() {
        let i = 0;
        this.menuTypes.forEach( t => {
            if (t.value ===  this.menuType) {
                this.menuType = this.menuTypes[i];
            } else {
                i++;
            }
        });
    }

    /**
     * 树形选中点击
     * @param flow
     */
    onCheckedEvent(flow, parent) {
        this.parentId = flow.id;
        this.createUser = flow.createUser;
        // 这里采用公共方法遍历数据，callback会回调每一个节点 便于节点数据处理
        this.toolService.treesTraverse(this.menuList, {
            callback: (leaf) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;
        this.dircPath = '/';
        // 这里采用公共方法获取节点的父节点集合
        let tempFlow = this.toolService.treesPositions(this.menuList, flow);
        tempFlow.forEach(fl => {
            this.dircPath += (fl.menuName + '/');
        });
        // 类型检查
        this.checkMenuType(flow);
    }

    /**
     * 检查类型，当选择的目录为第一级时 可以选择两种类型（目录、知识表），当选择第二级目录的时候 只能选择知识表类型
     * @param flow
     */
    checkMenuType(flow: any) {
        if (flow.pid === '0') {
            this.menuTypes = [
                {name: '目录', value: 'menu'},
                {name: '知识表', value: 'button'}
            ];
        } else {
            this.menuTypes = [
                {name: '知识表', value: 'button'}
            ];
            this.menuType = this.menuTypes[0];
        }
    }

    cancelClick() {
        this.hideInstance();
    }

    /**
     * 保存
     */
    saveClick() {
        this.error = '';
        this.errorType = -1;
        let validate;
        validate = this.validateService.get(this, this.getValidateObject());
        // if (!this.dircName || this.dircName === '') {
        //     this.errorType = 1;
        //     return;
        // }
        // if (this.dircName.length > 20) {
        //     this.errorType = 2;
        //     return;
        // }
        // if (!this.parentId) {
        //     this.errorType = 3;
        //     return;
        // }
        if (validate) {
            this.error = validate['error'];
            this.errorType = validate['errorType'];
            return false;
        }

         // 保存新建目录
        this.userService.addMenu({
            createUser: this.createUser,
            pid: this.parentId ,
            menuName: this.dircName,
            type: this.menuType.value
        }).then(d => {
            if (d.success) {
                if (this.menuType.value === 'menu') {
                    this.modalService.alert('目录创建成功');
                } else if (this.menuType.value === 'button') {
                    this.modalService.alert('知识表创建成功');
                }
                if (this.menuType.value === 'menu') {
                    this.datatransferService.addKnowledgeSubject.next('menu');
                    this.datatransferService.getKnowledgeTreeCheckedSubject.next({
                        addTree: true,
                    });
                } else {
                    // 刷新目录
                    this.datatransferService.addKnowledgeSubject.next(d.message);
                    // 刷新知识列表
                    this.datatransferService.getKnowledgeTreeCheckedSubject.next({
                        content : '',
                        knowledges : []
                    });
                }
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }

    /**
     * @returns
     */
    getValidateObject() {
        return {
            dircName: {
                presence: {message: '^请填写目录或知识表名称', allowEmpty: false},
                length: {maximum: 20, message: '^名称长度不能超过20个字符', allowEmpty: false},
                errorType: 1,
            },
            parentId: {
                presence: { message: '^请选择目录', allowEmpty: false},
                errorType: 3
            }
        };
    }

    nodeTypeChecked(type: any) {
        this.menuType = type;
    }

    hideInstance: Function;
}
