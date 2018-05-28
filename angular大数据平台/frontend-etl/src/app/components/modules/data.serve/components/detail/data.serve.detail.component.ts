import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';

@Component({
    selector: 'data-serve-detail-component',
    templateUrl: './data.serve.detail.component.html',
    styleUrls: ['./data.serve.detail.component.scss']
})
export class DataServeDetailComponent implements OnInit {
    serveId: any;
    tab = 'introduce';
    systemName: any;
    detailData = {
        serveTags: [],
        createTime: '',
        status: 0,
        accessCount: 0,
        url: '',
        createUserCnname: '',
        name: '',
        returnColumns: [],
        urlId: ''
    };
    noDataType: any;
    errorList = [
        {name: '0', desc: '成功'},
        {name: '-1', desc: '请求失败'},
        {name: '115', desc: '没有权限'},
        {name: '2', desc: '权限未通过'}
    ];
    previewList = [];
    titleList = [];
    noPreview: any;

    constructor (private router: Router,
                 private location: Location,
                 private activatedRoute: ActivatedRoute,
                 private modalService: ModalService,
                 private dataServeService: DataServeService) {
        this.activatedRoute.params.subscribe(params => {
            this.serveId = params['id'];
            this.systemName = params['systemName'];
        });
    }

    ngOnInit () {
        this.getDetail();
    }

    /**
     * 获取服务详情
     */
    getDetail() {
        this.dataServeService.editServe_getServeDetailById({id: this.serveId}).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.detailData['serveTags'] = d.data.serveTags || [];
                this.detailData['createTime'] = d.data.createTime || '';
                this.detailData['status'] = d.data.status;
                this.detailData['accessCount'] = d.data.accessCount;
                this.detailData['url'] = d.data.url || '';
                this.detailData['createUserCnname'] = d.data.createUserCnname || '';
                this.detailData['name'] = d.data.name || '';
                this.detailData['urlId'] = d.data.urlId;
                this.detailData['returnColumns'] = d.data.returnColumns || [];
                if (this.detailData['returnColumns'].length === 0) {
                    this.noDataType = true;
                } else {
                    this.noDataType = false;
                }
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, {auto: true});
            }
        });
    }

    /**
     * tab切换
     */
    tabChecked(type: any) {
        if (type === this.tab) {
            return;
        }
        this.tab = type;
        if (this.tab === 'preview') {
            this.getServeCallList(this.detailData['urlId']);
        }
    }

    /**
     * 获取列表
     */
    getServeCallList(urlId: any) {
        this.dataServeService.serveCallList({
            urlId: urlId,
            pageSize: 10,
            pageNum: 1
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.previewList = d.data.rows || [];
                if (this.previewList.length) {
                    this.titleList = this.previewList && Object.keys(this.previewList[0]);
                }
                if (this.previewList.length) {
                    this.noPreview = false;
                } else {
                    this.noPreview = true;
                }
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, {auto: true});
            }
        });
    }
    /**
     * 返回
     */
    goBack() {
        this.location.back();
    }
}
