/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WorkflowService} from 'app/services/workflow.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'workflow-work-aside-add-component',
    templateUrl: './workflow.work.aside.add.component.html',
    styleUrls: ['./workflow.work.aside.add.component.scss']
})
export class WorkflowWorkAsideAddComponent implements OnInit {
    type: String;                                   // 类型  编辑目录、工作流edit、新增目录addDirectory、新增工作流addWorkflow
    menuTypes = [{name: '一次性执行', id: 1}, {name: '周期性执行', id: 2}, {name: '持续执行' , id: 3}];
    menuType = {name: '一次性执行', id: 1};          // 当前选中工作流类型
    editName: any;                                  // 编辑操作名称
    dircName: any;                                  // 目录名称
    dircPath = '';                                  // 目录
    remark: any;                                    // 工作流描述

    menuIndex = 0;                                  // 目录层级
    menuList = [];                                  // 目录list
    allMenuList = [];                               // 所有目录数据

    checkedFlow: any;                               // 当前选中目录项

    errorObj = {
        dircName: false,                            // 名称
        dircPath: false,                            // 目录
        type: false,                                // 工作流类型
        remark: false                               // 描述
    };

    constructor(private modalService: ModalService,
                private workflowService: WorkflowService,
                private datatransferService: DatatransferService,
                private toolService: ToolService) {
        this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            if (data.method === 'oneClick' && (this.type === 'addDirectory' || this.type === 'addWorkflow')) {
                this.checkedFlow = data.flow;
                this.dircPath = '';
                this.checkData(this.menuList , data.flow.pId);
                this.findParentNode(this.menuList, data.flow);
            }
        });

        this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
        });
    }

    ngOnInit() {
        if (this.type === 'addDirectory' || this.type === 'addWorkflow') {
            this.getTreeList();
        }
    }
    getTreeList() {
        this.workflowService.getTreeList({pId: 0}).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                d.data.forEach(item => {
                    this.menuList.push({
                        ...item,
                        checked: false,
                        expand: false,
                        type: item.flowId ? 'work' : 'catalog'
                    });
                });
            }
        });
    }

    retrustData(data) {
        let map = {};
        let that = this;
        let arr = [];
        data.forEach(function (item) {
            // 默认展开一级
            if (item.pId === '0') {
                item.checked = false;
                item.expand = true;
                item.type = item.flowId ? 'work' : 'catalog';
            } else {
                item.checked = false;
                item.expand = true;
                item.type = item.flowId ? 'work' : 'catalog';
            }
            map[item.id] = item;
            if (!item.flowId) {
                arr.push(item);
            }
        });
        this.allMenuList = arr;
        let val = [];
        data.forEach(function (item) {
            // 只显示目录  ，不显示工作流
            if (!item.flowId) {
                // 以当前遍历项，的pid,去map对象中找到索引的id
                let parent = map[item.pId];
                // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
                if (parent) {
                    (parent.children || ( parent.children = [] )).push(item);
                } else {
                    // 如果没有在map中找到对应的索引id,那么直接把 当前的item添加到 val结果集中，作为顶级
                    item.checked = false;
                    item.expand = true;
                    val.push(item);
                }
            }
        });
        return val;
    }

    /**
     * 寻找父节点
     * @param data
     * @param flow
     */
    findParentNode(data, flow) {
        let checkedList = this.toolService.treesPositions(this.menuList, flow);
        // 将选中的部门从父级自下拼接为字符串
        checkedList && checkedList.forEach(item => {
            this.dircPath += `/${item.name}`;
        });
    }
    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        flow.checked = !flow.checked;
    }

    /**
     * 选中遍历
     */
    checkData(data, pid) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, pid);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 确认创建目录
     */
    okClick() {
        if (!this.check()) {
            return;
        }
        const params = {
            name: this.dircName,
            pId: this.checkedFlow ? this.checkedFlow.id : 0
        };
        this.workflowService.addTreeDirectory(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.hideInstance();
                this.modalService.alert(d.data || '创建目录成功');
                this.datatransferService.workflowAddTreeSubject.next({action: 'add', flow: (this.checkedFlow ? this.checkedFlow : null)});
            } else {
                this.modalService.alert(d.data || d.message || '创建失败');
            }
        });
    }

    /**
     * 创建目录、工作流校验
     * @returns {boolean}
     */
    check() {
        let result = false;
        if (!this.dircName) {
            this.errorObj.dircName = true;
            result = true;
        } else if (this.dircName) {
            this.errorObj.dircName = false;
        }
        if (!this.dircPath && this.type === 'addWorkflow') {
            this.errorObj.dircPath = true;
            result = true;
        } else if (this.dircPath && this.type === 'addWorkflow') {
            this.errorObj.dircPath = false;
        }
        // if (!this.remark && this.type === 'addWorkflow') {
        //     this.errorObj.remark = true;
        //     result = true;
        // } else if (this.remark && this.type === 'addWorkflow') {
        //     this.errorObj.remark = false;
        // }
        return !result;
    }

    /**
     * 编辑保存
     */
    editSave(checkedFlow: any) {
        if (!this.dircName) {
            this.errorObj.dircName = true;
            return;
        }
        this.workflowService.updateTree({
            name: this.dircName,
            id: checkedFlow.id,
            pId: checkedFlow.pId
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert(d.data || d.message || '修改成功');
                this.hideInstance();
                this.datatransferService.workflowUpdateTreeSubject.next({action: 'edit', flow: {...checkedFlow, newName: this.dircName}});
            } else {
                this.modalService.alert(d.data);
            }
        });
    }

    /**
     * 新建工作流
     */
    addWorkFlow() {
        if (!this.check()) {
           return;
        }
        const params = {
            pId: this.checkedFlow.id,
            desc: this.remark,
            policy: this.menuType.id,
            name: this.dircName,
        };
        this.workflowService.addTreeWork(params).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert(d.data || '新建工作流成功');
                this.hideInstance();
                this.datatransferService.workflowAddTreeSubject.next({action: 'addWorkflow', flow: this.checkedFlow});
            } else {
                this.modalService.alert(d.data || d.message || '新建失败，请稍后重试');
            }
        });
    }

    /**
     * 工作流类型选中
     */
    nodeTypeChecked(value) {
        this.menuType = value;
    }

    hideInstance: Function;
}
