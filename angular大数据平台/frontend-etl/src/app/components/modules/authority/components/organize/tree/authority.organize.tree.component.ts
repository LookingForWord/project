/**
 * Created by XMW on 2017-10-19.
 *  树形递归展示
 */

import {AfterContentInit, Component, ElementRef, Input, OnDestroy, Renderer2, ViewChild} from '@angular/core';

import {AuthorityService} from 'app/services/authority.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {LoginService} from 'app/services/login.service';

import {AuthorityOrganizeAsideAddComponent} from 'app/components/modules/authority/components/organize/aside/add/authority.organize.aside.add.component';

@Component({
    selector: 'authority-organize-tree-component',
    templateUrl: './authority.organize.tree.component.html',
    styleUrls: ['./authority.organize.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class AuthorityOrganizeTreeComponent implements AfterContentInit, OnDestroy {
    @Input()
    list: any;       // 目录列表

    @Input()
    type: any;

    @Input()
    menuList: any;

    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    deleteId: any;              // 删除的目录的ID
    editId: any;                // 删除的目录的ID
    projectName: any;           // 目录名称

    flowEvents = [];            // title监听事件集合
    docEvents = [];             // document event

    showCatalogModal = false;   // 是否显示目录modal
    showTaskTModal = false;     // 是否显示任务modal
    modalX: number;             // modal x 位置
    modalY: number;             // modal y 位置
    modalFlow: any;             // 当前选中项

    constructor(private datatransferService: DatatransferService,
                private render: Renderer2,
                private modalService: ModalService,
                private authorityService: AuthorityService) {
        this.datatransferService.authorityOrganizeTreeAddSubject.subscribe(data => {
            setTimeout(() => {
                this.initRightEvent();
            }, 100);
        });
    }

    ngAfterContentInit() {
        if (!this.type) {
            setTimeout(() => {
                this.initRightEvent();
            }, 100);
        }
    }
    ngOnDestroy() {
        if (this.flowEvents.length) {
            this.flowEvents.forEach(e => e());
            this.flowEvents.length = 0;
        }
    }

    initRightEvent() {
        // 从点击事件里获取注册的dom，是根据子元素类型来查找的
        let getParent = (ev) => {
            let now = ev.toElement || ev.target;
            if (now.nodeName === 'I') {
                return now.parentNode && now.parentNode.parentNode;
            } else if (now.nodeName === 'SPAN' && now.classList.contains('name')) {
                return now.parentNode;
            } else {
                return now;
            }
        };

        let bind = (element) => {
            let mouseenter = this.render.listen(element, 'mouseenter', e => {
                let contextmenu = this.render.listen(document, 'contextmenu', event => {
                    // 当前点击的dom和已经显示的contextmenu不一致，就隐藏contextmenu
                    let dom = getParent(event);
                    if (dom === element) {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;

                        let index = Number(element.getAttribute('index'));
                        let flow = this.list[index];
                        this.modalFlow = flow; // 当前选中的flow

                        if (flow.orgType === 1) {
                            this.showCatalogModal = true;
                        } else if (flow.orgType === 2) {
                            this.showTaskTModal = true;
                        }

                        this.modalX = event.pageX; // 这里直接采用的flex 定位
                        // console.log(event.pageY);
                        if ( document.body.clientHeight - event.pageY < 90) {
                            this.modalY = event.pageY - 90;
                        } else {
                            this.modalY = event.pageY;
                        }

                        this.checkedClick(flow, event); // 选中该目录

                        return false;
                    } else {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;
                    }
                });
                this.docEvents.push(contextmenu);

                let click = this.render.listen(document, 'click', ev => {
                    // firefox右键会触发这个方法，这里直接返回
                    if (ev.button === 2) {
                        return;
                    }

                    // 当前点击的dom和已经显示的contextmenu不一致，就隐藏contextmenu
                    let dom = getParent(ev);
                    if (dom !== element) {
                        this.showCatalogModal = false;
                        this.showTaskTModal = false;

                        if (this.docEvents.length) {
                            this.docEvents.forEach(evt => evt());
                            this.docEvents.length = 0;
                        }
                    }
                });
                this.docEvents.push(click);
            });
            this.flowEvents.push(mouseenter);

            let mouseleave = this.render.listen(element, 'mouseleave', (e) => {
                // 如果当前没有显示modal，就直接注销doc的监听
                if (!this.showTaskTModal && !this.showCatalogModal) {
                    if (this.docEvents.length) {
                        this.docEvents.forEach(ev => ev());
                        this.docEvents.length = 0;
                    }
                }
            });
            this.flowEvents.push(mouseleave);
        };

        let ul = this.titleContainer;
        let lis = ul.nativeElement.children;

        for (let i = 0; i < lis.length; i++) {
            bind(lis[i].children[0]);
        }
    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        this.datatransferService.authorityOrganizeTreeCheckedSubject.next({
            flow: flow,
            action: 'click'
        });
    }

    /**
     * 展开点击
     * @param flow
     * @param {MouseEvent} $event
     * 改变当前项expand即可  索引地址
     */
    expandClick(flow, $event: MouseEvent) {
        flow.expand = !flow.expand;
        // 也可发布订阅到父组件中（此处为了避免父组件中继续使用递归，未使用）
        // this.datatransferService.authorityOrganizeTreeSubject.next({
        //     flow: flow,
        // });
        $event.stopPropagation();
    }

    /**
     * 删除目录
     */
    delete() {
        if (!this.modalFlow.parentId) {
            this.modalService.alert('不能删除总公司');
            return;
        }
        this.deleteId = this.modalFlow.id;
        this.modalService.toolConfirm('确认删除？', () => {
            // 删除公司
            this.authorityService.deleteOrganization({id: this.deleteId}).then(d => {
                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('删除成功');
                    // 发布通知删除成功 在aside页面重新调用树形的接口
                    this.datatransferService.authorityOrganizeTreeAddSubject.next('delete');
                } else {
                    this.modalService.alert(d.msg || '删除失败');
                }
            });
        });
    }

    /**
     * 新增和编辑操作  打开弹框
     */
    openModal(type: any) {
        // if ( (type === 'addCompany' || type === 'addDepartment') && this.modalFlow.index > 3) {
        //     this.modalService.alert('当前项不能再新增下级部门或公司');
        //     return;
        // }

        this.editId = this.modalFlow.id;
        this.projectName = this.modalFlow.name;
        let title = '';
        let parentOrganize = {};
        if (!this.modalFlow.parentId && type === 'editCompany') {
            title = '编辑总公司';
        } else {
            switch (type) {
                case 'addCompany':
                    title = '新增下级公司';
                    parentOrganize = {id: this.modalFlow.id, name: this.modalFlow.name};
                    break;
                case 'addDepartment':
                    title = '新增下级部门';
                    parentOrganize = {id: this.modalFlow.id, name: this.modalFlow.name};
                    break;
                case 'editCompany':
                    title = '编辑公司';
                    parentOrganize = {id: this.modalFlow.parentId, name: this.modalFlow.parentName};
                    break;
                case 'editDepartment':
                    title = '编辑部门';
                    parentOrganize = {id: this.modalFlow.parentId, name: this.modalFlow.parentName};
                    break;
            }
        }

        let [ins] = this.modalService.toolOpen({
            title: title,
            component: AuthorityOrganizeAsideAddComponent,
            datas: {
                type : (!this.modalFlow.parentId && type === 'editCompany' ? 'headOffice' : type),
                company: ((type === 'addCompany' || type === 'addDepartment') ? '' : this.modalFlow.name),
                disabled: (type === 'addCompany' || type === 'addDepartment') ? true : false,
                department: ((type === 'addDepartment' || type === 'addCompany') ? '' : this.modalFlow.name),
                dircName: this.projectName,
                editID: this.editId,
                parentOrganize: parentOrganize,
                flow: this.modalFlow
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
    }

}
