/**
 * created by LIHUA on 2018/01/19/
 * 数据资产 数据资产管理 字段管理
 */
import {Component, OnInit} from '@angular/core';
import 'rxjs/Rx';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'governance-field-component',
    templateUrl: './governance.field.component.html',
    styleUrls: ['./governance.field.component.scss']
})
export class GovernanceFieldComponent implements OnInit {
    keyWord: any;                // 搜索关键字
    noData = true;               // 列表有无数据
    sidePageNow = 1;             // 侧边栏当前页
    totalPage: any;              // 侧边栏总页数
    checkedItem: any;

    pageNow: number = 1;         // 当前页
    pageSize: number = 10;       // 每页显示条数
    totalcount: number = 0;      // table列表总条数
    sources: any;                // 字段详情列表信息集合
    fieldList = [];              // 字段名列表集合

    constructor (private modalService: ModalService,
                 private governanceService: GovernanceService) {}

    ngOnInit() {
        this.getFieldList();
    }

    /**
     * 获取字段
     */
    getFieldList() {
        this.governanceService.getFieldList({
            pageNum: this.sidePageNow,
            pageSize: 50,
            keyword: this.keyWord || ''
        }).then( d => {
            if (d.success && d.message) {
                let arr = [];
                d.message.items && d.message.items.forEach(name => {
                    arr.push({
                        name: name,
                        check: false
                    });
                });
                this.fieldList = [...this.fieldList, ...arr];
                this.totalPage = d.message.totalPage;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 字段选中
     */
    checkField(item: any) {
        if (item.check) {
            return;
        }
        this.fieldList.forEach(field => field.check = false);
        item.check = true;
        this.checkedItem = item;

        this.sources = [];
        this.pageNow = 1;
        this.fieldDetail(item.name);
    }

    /**
     *  获取更多字段
     */
    getMoreField() {
        if (this.sidePageNow === this.totalPage || this.sidePageNow === this.fieldList.length) {
            return;
        }
        this.sidePageNow = this.sidePageNow + 1;
        this.getFieldList();
    }

    /**
     * 根据字段名获取字段列表
     * @param fieldName
     */
    fieldDetail(fieldName: any) {
        this.governanceService.getFieldDetail({
            fieldName: fieldName,
            pageNum: this.pageNow,
            pageSize: this.pageSize
            }).then( d => {
                if (d.success && d.message) {
                    this.sources = d.message.items || [];
                    this.noData = this.sources.length === 0;
                    this.totalcount = d.message.totalCount;
                } else {
                    this.modalService.alert(d.message);
                }
        });
    }

    /**
     * 字段搜索
     * @param {MouseEvent} $event
     */
    searchInstanceChange($event: MouseEvent) {
        this.sidePageNow = 1;
        this.sources = [];
        this.totalcount = 0;
        this.noData = true;

        this.governanceService.getFieldList({
            pageNum: this.sidePageNow,
            pageSize: 50,
            keyword: this.keyWord || ''
        }).then( d => {
            if (d.success && d.message) {
                let arr = [];
                d.message.items && d.message.items.forEach(name => {
                    arr.push({
                        name: name,
                        check: false
                    });
                });
                this.fieldList = arr;
                this.totalPage = d.message.totalPage;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 列表分页
     * @param page
     */
    doPageChange(obj: any) {
        document.getElementsByClassName('right-content')[0].scrollTop = 0;
        this.pageNow = obj.page;
        this.pageSize = obj.size;
        this.fieldDetail(this.checkedItem.name);
    }
}

