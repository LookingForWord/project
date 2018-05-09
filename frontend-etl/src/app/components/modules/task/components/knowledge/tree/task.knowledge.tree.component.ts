/**
 * Created by xxy on 2017-09-19.
 *  树形递归展示
 */
import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {SystemService} from 'app/services/system.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'task-knowledge-tree-component',
    templateUrl: './task.knowledge.tree.component.html',
    styleUrls: ['./task.knowledge.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class TaskKnowledgeTreeComponent implements OnInit, OnDestroy {

    @Input()
    type: string;     // 类型 addmenu 添加目录， menulist 目录列表
    @Input()
    menuList: any;    // 目录列表
    @Input()
    index: number;    // 层级
    @Input()
    parent: any;      // 父级目录
    @Input()
    menuAll: any;     // 全部目录

    // 目录 在目录上监听右键事件
    @ViewChild('titleContainer') titleContainer: ElementRef;
    deleteId: any;    // 删除的目录的ID
    projectName: any; // 目录名称
    flowEvents = [];  // title监听事件集合

    content = '';     // 知识内容
    knowledge = [];   // 知识内容扩展

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private userService: SystemService,
                private loginService: LoginService,
                private toolService: ToolService) {
    }

    ngOnInit() {
        if (typeof this.menuAll === 'undefined') {
            this.menuAll = this.menuList;
        }
    }

    ngOnDestroy() {
        if (this.flowEvents.length) {
            this.flowEvents.forEach(e => e());
            this.flowEvents.length = 0;
        }
    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        // 防止重复点击 重复发送请求
        if (this.menuAll) {
            let temp;
            this.toolService.treesTraverse(this.menuAll, {
                callback: (leaf) => {
                    // 到树形里查找节点是否被选中了
                    if (leaf.id === flow.id && leaf.checked) {
                        temp = leaf;
                    }
                }
            });
            if (temp) {
                return;
            }
        }
        if (this.type === 'addmenu') {
            this.datatransferService.systemKnowledgeTreeCheckedSubject.next({
                flow: flow,
                type: this.type
            });
        } else if (this.type === 'menulist' && flow.type === 'button') {
            // 选中目录
            this.datatransferService.systemKnowledgeTreeCheckedSubject.next({
                flow: flow,
                type: this.type
            });
        }
            // 获取知识详情
        if (flow.type === 'button' && this.type !== 'addmenu') {
            this.userService.getContent(flow.id)
                .then(d => {
                    if (d.success) {
                        if (!d.message) {
                            this.content = '';
                            this.knowledge = [];
                        } else {
                            this.content = d.message.content;
                            this.knowledge =  d.message.knowledgeContentExts;
                        }
                        this.datatransferService.getKnowledgeTreeCheckedSubject.next({
                            content : this.content,
                            knowledges : this.knowledge
                        });

                    } else {
                        this.modalService.alert(d.message || '获取知识详情失败');
                    }
                });
            // 保存知识传值
            this.datatransferService.addKnowledgesTreeCheckedSubject.next({
                id: flow.id,
                createUser: flow.createUser,
                addType: 'oldButton'
            });
        }

        if (!flow.expand) {
            if (this.type !== 'button') {
            this.userService.getMenus({pid: flow.id}).then(d => {
                if (d.success) {
                    flow.children = [];
                    d.message.forEach(item => {
                        if (this.type === 'addmenu') {
                            if (!item.flowId && item.type === 'menu') {
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
            }
        }
        flow.expand = !flow.expand;
        $event.stopPropagation();
    }

    expandClick(flow, $event: MouseEvent) {
        $event.stopPropagation();
        flow.expand = !flow.expand;
    }

    /**
     * 删除目录
     */
    deleteCatalog(flow, $event: MouseEvent) {
        $event.stopPropagation();
        this.deleteId = flow.id;
        this.modalService.toolConfirm('确认删除？', () => {
            this.userService.deleteMenu(this.deleteId)
                .then(d => {
                    if (d.success) {
                        this.datatransferService.addKnowledgeSubject.next('refresh');
                        if (flow.checked) {
                            this.content = '';
                            this.knowledge = [];
                        }
                        this.datatransferService.getKnowledgeTreeCheckedSubject.next({
                            content : '',
                            knowledges : [],
                            deleteTree: true, // 主体内容删除
                        });
                        this.modalService.alert('删除成功');
                    } else {
                        this.modalService.alert(d.message || '删除失败');
                    }
                });
        });
    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
