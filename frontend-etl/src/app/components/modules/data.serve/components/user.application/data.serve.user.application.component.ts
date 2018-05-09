/**
 * Created by lh on 2018/01/30.
 *  数据服务 服务列表
 */

import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import {DataServeApplyModalComponent} from 'app/components/modules/data.serve/components/apply/apply.modal/data.serve.apply.modal.component';


@Component({
    selector: 'data-serve-user-application-component',
    templateUrl: './data.serve.user.application.component.html',
    styleUrls: ['./data.serve.user.application.component.scss']
})
export class DataServeUserApplicationComponent implements OnInit {
    sortList = [
        {name: '创建时间', esc: false, desc: false},
        {name: '访问量', esc: false, desc: false}
    ];
    statusList = [
        { name: '全部', value: '' },
        { name: '待审批', value: 0 },
        { name: '通过', value: 1 },
        { name: '不通过', value: 2 },
        { name: '已取消', value: 3 }
    ];
    checkedStatus = { name: '全部', value: '' };
    applyList: any;

    pageNum = 1;
    pageSize = 10;
    totalCount = 30;
    keyWord: any;
    tagNames = '';

    constructor(private router: Router,
                private location: Location,
                private activatedRoute: ActivatedRoute,
                private modalService: ModalService,
                private dataServeService: DataServeService) {

    }
    ngOnInit () {
        this.getApplyList();
    }

    /**
     * 申请列表
     */
    getApplyList() {
        this.dataServeService.userApplyHistoryList({
            status: this.checkedStatus.value,
            keyWord: this.keyWord,
            pageNum: this.pageNum,
            pageSize: this.pageSize
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.applyList = d.data.list || [];
                this.totalCount = d.data.total;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message);
            }
        });
    }

    /**
     * 切页
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getApplyList();
    }

    /**
     * 关键词搜索
     */
    searchChange($event: MouseEvent) {
        this.pageNum = 1;
        this.getApplyList();
    }

    /**
     * 筛选排序
     */
    sort(item: any, type: any) {
        if (type === 'esc') {
            this.pageNum = 1;
            item.esc = !item.esc;
            item.desc = false;
        } else if (type === 'desc') {
            this.pageNum = 1;
            item.esc = false;
            item.desc = !item.desc;
        }
    }

    /**
     * 返回
     */
    goBack() {
        this.location.back();
    }

    /**
     * 取消申请
     */
    cancel(item: any) {
        this.modalService.toolConfirm('确认取消吗？', () => {
            this.dataServeService.cancleApplyServe({
                id: item.id
            }).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('已取消申请');
                    this.getApplyList();
                } else {
                    this.modalService.alert(d.data || d.rspdesc || d.message);
                }
            });
        });

    }

    /**
     * 重新申请
     */
    apply(item: any) {
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
            this.getApplyList();
        };
    }

    chooseStatus(item: any) {
        if (item.value !== this.checkedStatus.value) {
            this.checkedStatus = item;
        }
        this.getApplyList();
    }
}
