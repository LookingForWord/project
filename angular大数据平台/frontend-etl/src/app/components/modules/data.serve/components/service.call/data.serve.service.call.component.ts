import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';

@Component({
    selector: 'data-service-service-cll-component',
    templateUrl: './data.serve.service.call.component.html',
    styleUrls: ['./data.serve.service.call.component.scss']
})
export class DataServeServiceCallComponent implements OnInit {
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;
    dataList: any;
    titleList = [];
    noDataType: any;
    urlId: any;
    serveName: any;
    status: any;
    constructor (private router: Router,
                 private location: Location,
                 private activatedRoute: ActivatedRoute,
                 private modalService: ModalService,
                 private dataServeService: DataServeService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.urlId = params['urlId'];
            this.serveName = params['name'];
            this.status = Number(params['status']);
        });
    }
    ngOnInit () {
        this.getServeCallList();
    }

    /**
     * 返回
     */
    goBack() {
        this.location.back();
    }

    /**
     * 获取列表
     */
    getServeCallList() {
        this.dataServeService.serveCallList({
            urlId: this.urlId,
            pageSize: this.pageSize,
            pageNum: this.pageNum
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.dataList = d.data.rows || [];
                if (this.dataList.length) {
                    this.titleList = this.dataList && Object.keys(this.dataList[0]);
                }
                this.totalCount = d.data.counts;
                this.noDataType = this.dataList.length ? false : true;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, {auto: true});
            }
        });
    }

    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getServeCallList();
    }
}
