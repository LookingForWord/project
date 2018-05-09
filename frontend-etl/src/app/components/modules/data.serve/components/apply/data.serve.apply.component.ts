/**
 * Created by lh on 2018/01/30.
 *  数据服务 服务列表
 */

import {Component,  OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DataServeApplyModalComponent} from 'app/components/modules/data.serve/components/apply/apply.modal/data.serve.apply.modal.component';
import { DataServeService, ServiceOrderByEnum } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';

@Component({
    selector: 'data-serve-apply-component',
    templateUrl: './data.serve.apply.component.html',
    styleUrls: ['./data.serve.apply.component.scss']
})
export class DataServeApplyComponent implements OnInit  {
    tags = [];
    sortList = [
        {name: '创建时间', asc: false, desc: false},
        {name: '访问量', asc: false, desc: false}
    ];
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;

    keyWord: any;
    tagNames = '';
    orderBy: any;
    dataList: any;

    constructor(private router: Router,
                private location: Location,
                private activatedRoute: ActivatedRoute,
                private modalService: ModalService,
                private dataServeService: DataServeService) {

    }

    ngOnInit() {
        this.getServeList();
        this.getTagsList();
    }

    /**
     * 服务列表
     */
    getServeList() {
        this.dataServeService.getPublicServeList({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            keyWord: this.keyWord || '',
            orderBy: this._getOrderBy(),
            tagNames: this.tagNames
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.dataList = d.data.list || [];
                this.dataList = this.dataList.filter(item => item.type === 0);
                this.totalCount = this.dataList.length;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message);
            }
        });
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
            this.pageNum = 1;
            item.asc = !item.asc;
            item.desc = false;
        } else if (type === 'desc') {
            this.pageNum = 1;
            item.asc = false;
            item.desc = !item.desc;
        }
        this.getServeList();
    }

    /**
     * 返回
     */
    goBack() {
        this.location.back();
    }

    /**
     * 申请
     */
    openApplyModal(item: any) {
        let [ins] = this.modalService.toolOpen({
            title: '服务申请',
            component: DataServeApplyModalComponent,
            datas: {
                serveId: item.id
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);

        ins.hideInstance = () => {
            ins.destroy();
        };
        ins.refreshList = () => {
            this.getServeList();
        };
    }
}
