/**
 * Created by lh on 2018/01/30.
 *  数据服务 服务列表
 */

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ModalService, ToolOpenOptions } from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import {CookieService} from 'ngx-cookie';

import {Cookie} from 'app/constants/cookie';
@Component({
    selector: 'data-serve-list-component',
    templateUrl: './data.serve.list.component.html',
    styleUrls: ['./data.serve.list.component.scss']
})
export class DataServeListComponent implements OnInit {
    // 服务列表
    services = [
        { name: '全部服务', value: '' },
        { name: '公共服务', value: 0 },
        { name: '个人服务', value: 1 }
    ];
    checkedService = { name: '全部服务', value: '' };
    // 标签
    tags = [];
    // 排序方式
    sortList = [
        { name: '创建时间', asc: false, desc: false },
        { name: '访问量', asc: false, desc: false }
    ];

    pageNum = 1;
    pageSize = 10;
    totalCount = 0;
    tagNames = '';

    keyWord: any;
    orderBy: any;
    serveList: any;

    constructor(private router: Router,
        private activatedRoute: ActivatedRoute,
        private modalService: ModalService,
        private dataServeService: DataServeService,
                private cookieService: CookieService) {

    }

    ngOnInit() {
        this.getServeList();
        this.getTagsList();
    }

    /**
     *
     * 获取标签列表
     */
    getTagsList() {
        this.dataServeService.addServe_getTagsArray().then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                let arr = d.data || [];
                arr.forEach(item => {
                    this.tags.push({
                        name: item, checked: false
                    });
                });
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message);
            }
        });
    }

    /**
     * 获取列表数据
     */
    getServeList() {
        this.dataServeService.getServeList({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            keyWord: this.keyWord || '',
            orderBy: this._getOrderBy(),
            type: this.checkedService.value,
            tagNames: this.tagNames
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.serveList = d.data.list || [];
                this.totalCount = d.data.total;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message);
            }
        });
    }
    /**
     * 标签切换
     */
    chooseTag(item: any) {
        item.checked = !item.checked;
        let arr = [];
        this.tags.forEach(item => {
            item.checked && arr.push(item.name);
        });
        this.tagNames = arr.length ? arr.join(',') : '';
        this.pageNum = 1;
        this.getServeList();
    }

    /**
     * 服务类别筛选
     * @param item
     */
    chooseServe(item: any) {
        if (item.value !== this.checkedService.value) {
            this.checkedService = item;
            this.pageNum = 1;
            this.getServeList();
        }
    }
    /**
     * 切页
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getServeList();
    }

    /**
     * 关键词搜索
     */
    searchChange($event: MouseEvent) {
        if (this.keyWord) {
            this.pageNum = 1;
        }
        this.getServeList();
    }

    /**
     * 获取排序方式
     */
    _getOrderBy() {
        let _orderBy ;
        this.sortList.forEach(s => {
            if (s.name === '创建时间') {
                _orderBy = s.desc ? 'create_time_desc' :
                    s.asc ? 'create_time_asc' : '';
            } else if (!_orderBy) {
                _orderBy = s.desc ? 'access_count_desc' :
                    s.asc ? 'access_count_asc' : '';
            }
        });
        this.pageNum = _orderBy ? 1 : this.pageNum;
        return _orderBy;
    }


    /**
     * 筛选排序
     */
    sort(item: any, type: any) {
        this.sortList.forEach(s => {
            if (s.name !== item.name) {
                s.asc = false;
                s.desc = false;
            }
        });
        if (type === 'asc') {
            item.asc = !item.asc;
            item.desc = false;
        } else if (type === 'desc') {
            item.asc = false;
            item.desc = !item.desc;
        }
        this.pageNum = 1;
        this.getServeList();
    }


    /**
     * 跳转审核页面
     */
    turnToAudit() {
        // this.router.navigate([`/main/workflow/result/detail/list/${task.flowId}/${this.pageNow}`],
        //     {queryParams: {'name': encodeURI(task.flowName)}});
        this.router.navigate([`/main/dataServe/auditService`]);
    }

    /**
     * 跳转新增服务页面
     * 跳转编辑服务
     */
    turnToAddServe(item?: any) {
        if (item) {
            // 跳转编辑服务
            this.router.navigate([`/main/dataServe/addServe/${item.id}`]);
        } else {
            // 跳转新增服务页面
            this.router.navigate([`/main/dataServe/addServe`, '-1']);
        }
    }

    /**
     * 跳转申请服务
     */
    turnToApply() {
        this.router.navigate([`/main/dataServe/applyServe`]);
    }

    /**
     * 跳转详情
     */
    turnToDetail(item: any) {
        this.router.navigate([`/main/dataServe/detail/${item.id}/${item.systemName}`]);
    }

    /**
     * 跳转服务调用
     */
    turnToServiceCall(item: any) {
        // let token = this.cookieService.get(Cookie.TOKEN);
        let index = item.url.lastIndexOf('/');
        let url = item.url.slice(index + 1, );
        this.router.navigate([`/main/dataServe/service-call`], {queryParams: {urlId: url, name: item.name, status: item.status }});
    }

    /**
     * 跳转我的申请
     */
    turnToUserApplication() {
        this.router.navigate([`/main/dataServe/application`]);
    }
}
