/**
 * Created by XMW on 2017-10-19.
 *  树形递归展示
 */

import {AfterContentInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {AuthorityService} from 'app/services/authority.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {LoginService} from 'app/services/login.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

import {AuthorityObjectMenuAddComponent} from 'app/components/modules/authority/components/object/menu/add/authority.object.menu.add.component';

@Component({
    selector: 'authority-object-menu-tree-component',
    templateUrl: './authority.object.menu.tree.component.html',
    styleUrls: ['./authority.object.menu.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class AuthorityObjectMenuTreeComponent implements AfterContentInit, OnDestroy {
    @Input()
    list: any;       // 目录列表

    @Input()
    type: any;

    @Input()
    menuList: any;

    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private loginService: LoginService,
                private authorityService: AuthorityService) {
        this.datatransferService.authorityOrganizeTreeAddSubject.subscribe(data => {

        });
    }

    ngAfterContentInit() {

    }
    ngOnDestroy() {

    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        // this.datatransferService.authorityOrganizeTreeCheckedSubject.next({
        //     flow: flow,
        //     action: 'click'
        // });
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
     * 编辑保存菜单
     * @param menu
     */
    updateClick(menu: any, $event: MouseEvent) {
        this.authorityService.getMenuDetails({id: menu.id}).then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                let [ins, pIns] = this.modalService.open(AuthorityObjectMenuAddComponent, {
                    title: '修改菜单详情',
                    backdrop: 'static'
                });
                ins.hideInstance = () => {
                    ins.destroy();
                };
                ins.refreshList = () => {
                    // this.getMenuList();
                    this.datatransferService.refreshObjectTree.next('refreshTree');
                };
                pIns.setBtns([{
                    name: '取消',
                    class: 'btn',
                    click: () => {
                        ins.cancelClick();
                    }
                }, {
                    name: '保存',
                    class: 'btn primary',
                    click: () => {
                        ins.saveClick();
                    }
                }]);

                ins.resourceName = d.data.resourceName;
                ins.pAddress = d.data.url;
                ins.parentId = d.data.parentId;
                ins.parentMenuName = d.data.parentName;

                // 待定
                ins.type = ins.types[d.data.type - 1];
                ins.status = ins.statues[d.data.status];
                ins.system = {value: d.data.ownSystemId, name: d.data.ownSystemName};
                ins.action = 'editMenu';
                ins.menuID = d.data.id;
                ins.code = menu.code;
                ins.url = d.data.url;
            }
        });
        $event.stopPropagation();
    }

    /**
     * 删除菜单
     * @param menu
     */
    deleteClick(menu: any, $event: MouseEvent) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityService.deleteMenu({id: menu.id})
                .then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('删除成功');
                        this.datatransferService.refreshObjectTree.next('refreshTree');
                    } else {
                        this.modalService.alert(d.message || '删除失败');
                    }
                });
        });
        $event.stopPropagation();
    }
    /**
     * 菜单详情
     * @param menu
     */
    detailClick(menu: any, $event: MouseEvent) {
        this.authorityService.getMenuDetails({id: menu.id}).then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                let [ins, pIns] = this.modalService.open(AuthorityObjectMenuAddComponent, {
                    title: '查看菜单详情',
                    backdrop: 'static'
                });
                ins.code = menu.code;
                ins.resourceName = d.data.resourceName;
                ins.pAddress = d.data.url;
                ins.staus = d.status;
                ins.parentId = d.data.parentId;
                ins.parentMenuName = d.data.parentName || 'ETL';
                // 待定
                ins.type = ins.types[d.data.type - 1];
                ins.status = ins.statues[d.data.status];
                ins.system = {value: d.data.ownSystemId, name: d.data.ownSystemName};
                ins.action = 'infoMenu';
                ins.url = d.data.url;
            }
        });
        $event.stopPropagation();
    }

    /**
     * 上移
     * @param list 当前的list
     * @param present 当前项
     */
    up(list: any, present: any, $event: MouseEvent) {
        let items = list;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === present.id && i !== 0) {
                [items[i - 1], items[i]] = [items[i], items[i - 1]];
                return;
            }
        }
        $event.stopPropagation();
    }

    /**
     * 下移
     * @param now
     * @param downItem
     */
    down( list: any, present: any, $event: MouseEvent) {
        let items = list;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === present.id && i !== (list.length -1)) {
                [items[i], items[i + 1]] = [items[i + 1], items[i]];
                return;
            }
        }
        $event.stopPropagation();
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
