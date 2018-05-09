/**
 * Created by xxy on 2017-11-16.
 * 组织管理左侧树形栏
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {DatatransferService} from 'app/services/datatransfer.service';
import {SystemService} from 'app/services/system.service';

import {ActionTypeEnum} from 'app/components/modules/task/components/rule/task.rule.component';
import {TaskRuleAsideAddComponent} from 'app/components/modules/task/components/rule/aside/add/task.rule.aside.add.component';

@Component({
    selector: 'task-rule-aside-component',
    templateUrl: './task.rule.aside.component.html',
    styleUrls: ['./task.rule.aside.component.scss']
})

export class TaskRuleAsideComponent implements  OnInit, OnDestroy {

    search: string;                 // 搜索关键词

    flows: any;                     // 目录树
    flowType =  ActionTypeEnum.CATALOGLIST;         // 目录树类型

    menuList = [];
    unsubscribes = [];

    constructor(private modalService: ModalService,
                private systemService: SystemService,
                private toolService: ToolService,
                private datatransferService: DatatransferService) {
        // 树形目录展开订阅  已在tree组件中控制了
        let expandSubjectSubscribe = this.datatransferService.taskTreeExpandSubject.subscribe(data => {
                if ( data.type === ActionTypeEnum.CATALOGLIST) {
                    this.onExpandEvent(data.flow);
                }
        });
        this.unsubscribes.push(expandSubjectSubscribe);
        // 树形目录选中点击订阅
        let checkedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
        });
        this.unsubscribes.push(checkedSubjectSubscribe);
        // 删除、新增操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe( data => {
            this.search = '';
            this.getAllRule(0);
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
        // 获取第一级的规则目录
        this.getAllRule(0);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.searchClick();
    }
    /**
     * 查询目录
     * @param parentId
     */
    async getAllRule(parentId, flow?: any, menuName?: any) {
        let d = await this.systemService.queryAllRuleTree({
            pid: parentId,
            menuName: menuName
        });

        let temps = [];
        if (d.success) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];
                temps.push(msg);
            });
        }
        // 如果传递了flow，就代表是子数据
        if (menuName) {
            this.flows = temps;
        } else {
            if (flow) {
                flow.children = flow.children.concat(temps);
            } else {
                this.flows = temps;
                // 这里多一个操作把第一级目录直接展开
                this.flows.forEach(f => {
                    this.datatransferService.taskTreeExpandSubject.next({
                        flow: f,
                        type: this.flowType
                    });
                });
            }
        }


    }

    /**
     * 获取目录展开关闭点击
     * @param flow
     */
    onExpandEvent(flow) {
        // 当节点是展开状态 且未查询子节点
        if (!flow.expand && !flow.queryChild) {
            // 查询子节点
            this.getAllRule(flow.id, flow);
            flow.queryChild = true;
            flow.expand = true;
        } else {
            flow.expand = !flow.expand;
        }
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;
    }

    addDirectory() {
        // let [ins, pIns] = this.modalService.open(TaskRuleAsideAddComponent, {
        //     title: '创建规则库',
        //     backdrop: 'static'
        // });
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);
        // ins.status = ActionTypeEnum.ADDCATALOG;
        let [ins] = this.modalService.toolOpen({
            title: '创建规则库',
            component: TaskRuleAsideAddComponent,
            datas: {
                status: ActionTypeEnum.ADDCATALOG
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        };
    }
    searchClick() {
        this.search = this.search.replace(/\s/g, '');
        this.getAllRule(0, '', this.search);
    }
}
