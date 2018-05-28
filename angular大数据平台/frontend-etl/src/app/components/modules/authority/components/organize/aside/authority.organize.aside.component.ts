/**
 * Created by XMW on 2017-10-19.
 * 组织管理左侧树形栏
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {AuthorityService} from 'app/services/authority.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'authority-organize-aside-component',
    templateUrl: './authority.organize.aside.component.html',
    styleUrls: ['./authority.organize.aside.component.scss']
})

export class AuthorityOrganizeAsideComponent implements  OnInit, OnDestroy {

    search: string;                 // 搜索关键词
    showSearch = false;             // 是否显示搜索框

    organizationArr = [];           // 目录树
    menuList = [];
    unsubscribes = [];

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private datatransferService: DatatransferService) {

        // 树形目录展开订阅  已在tree组件中控制了
        // let expandSubjectSubscribe = this.datatransferService.authorityOrganizeTreeSubject.subscribe(data => {
        //          this.onExpandEvent(data.flow);
        // });
        // this.unsubscribes.push(expandSubjectSubscribe);

        // 树形目录选中点击订阅
        let checkedSubjectSubscribe = this.datatransferService.authorityOrganizeTreeCheckedSubject.subscribe(data => {
            this.onCheckedEvent(data.flow);
        });
        this.unsubscribes.push(checkedSubjectSubscribe);

        // 删除、新增操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.authorityOrganizeTreeAddSubject.subscribe( str => {
            this.getAllOrganize();
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);

        // 获取所有组织
        this.getAllOrganize();
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
     * 查询目录
     * @param parentId
     */
    async getAllOrganize(parentId?: any) {
        let d = await this.authorityService.getOrganizationTree();
        if (!d.data || d.data.length === 0) {
           return;
        }
        // 递归重组数据
        let arr = this.restructData(d.data, 0) || [];
        this.organizationArr = arr;
    }

    /**
     * 遍历
     */
    restructData(data, index) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.map((item, n) => {
           item.expand = (i < 4 ? true : false);
           item.index = i;
           item.checked = (item.parentId === null && item.index === 0 && n === 0) ? true : false;
           this.menuList.push({id: item.id, parentId: item.parentId, name: item.name, orgType: item.orgType, value: item.id});
           if (item.children && item.children.length > 0) {
               this.restructData(item.children, i + 1);
           }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 获取目录展开关闭点击
     * @param flow
     */
    onExpandEvent(flow) {

    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        let arr = this.checkData(this.organizationArr , flow.parentId);
        flow.checked = !flow.checked;
        this.organizationArr = arr;
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
}
