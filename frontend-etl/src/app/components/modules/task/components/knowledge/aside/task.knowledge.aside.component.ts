/**
 * Created by xxy on 2017-09-19.
 * 知识库新增知识目录和知识表
 */

import {Component, OnDestroy} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {SystemService} from 'app/services/system.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'task-knowledge-aside-component',
    templateUrl: './task.knowledge.aside.component.html',
    styleUrls: ['./task.knowledge.aside.component.scss']
})
export class TaskKnowledgeAsideComponent implements   OnDestroy {
    pid = 0;           // 目录列表父级id
    type = 'menulist'; // menulist 目录列表
    menuList = [];     // 目录列表
    menuIndex = 0;     // 目录的层级
    unsubscribes = []; // 订阅钩子函数集合
    knowledgeID: any;  // 知识id

    constructor(private modalService: ModalService,
                private userService: SystemService,
                private datatransferService: DatatransferService,
                private toolService: ToolService) {

        // 树形目录选中点击订阅
        let systemKnowledgeSubjectSubscribe = this.datatransferService.systemKnowledgeTreeCheckedSubject.subscribe(data => {
            if (data.type === 'menulist') {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(systemKnowledgeSubjectSubscribe);
        // 刷新目录树
        let addKnowledgeSubjectSubscribe = this.datatransferService.addKnowledgeSubject.subscribe( projectId => {
            if (projectId !== 'menu') {
                this.knowledgeID = projectId;
            } else {
                this.knowledgeID = '';
                this.datatransferService.addKnowledgesTreeCheckedSubject.next({
                    id: '',
                    createUser: '',
                    addType: 'newMenu'
                });
            }
            this.getMenuList();
        });
        this.unsubscribes.push(addKnowledgeSubjectSubscribe);
        // 获取全部目录
        this.getMenuList();
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 获取目录列表
     */
    getMenuList() {
        this.userService.getMenus({pid: 0}).then(d => {
            if (d.success) {
                this.initLists(d.message);
                this.checkedClick(this.menuList[0]);
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 点击事件展开目录并请求数据
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event?: MouseEvent) {
            this.userService.getMenus({pid: flow.id}).then(d => {
                if (d.success) {
                    flow.children = [];
                    d.message.forEach(item => {
                        if (this.type === 'addmenu') {
                            if (!item.flowId) {
                                flow.children.push({
                                    checked: false,
                                    expand: false,
                                    type: this.type,
                                    ...item
                                });
                            }
                        } else {
                            flow.children.push({
                                checked: false,
                                expand: false,
                                type: this.type,
                                ...item
                            });
                        }
                    });
                }
            });
        $event && $event.stopPropagation();
    }
    /**
     * 初始化目录数据
     * @param data
     * @returns {Array}
     */
    initLists(data) {
        this.menuList.length = 0;
        // 这里采用公共方法初始化数据，callback会回调每一个节点 便于初始化节点数据    toolService中方法有问题   数据没展示完全
        this.toolService.treesInit(data, {
            callback: (leaf) => {
                if (leaf.level  < 2 ? true : false) {
                    leaf.expand = true;
                }
                leaf.checked = false;
                if (leaf.id === this.knowledgeID) {
                    leaf.checked = true;
                    this.datatransferService.addKnowledgesTreeCheckedSubject.next({
                        id: leaf.id,
                        createUser: leaf.createUser,
                        addType: 'newButton'
                    });
                }
            },
            container: this.menuList
        });
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        // 这里采用公共方法遍历数据，callback会回调每一个节点 便于节点数据处理
        this.toolService.treesTraverse(this.menuList, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = !flow.checked;
    }
}
