import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import {DataServiceAuditServiceModalComponent} from 'app/components/modules/data.serve/components/audit.service/modal/data.service.audit.service.modal.component';
declare var moment: any;

@Component({
    selector: 'data-service-audit-ervice-component',
    templateUrl: './data.serve.audit.service.component.html',
    styleUrls: ['./data.serve.audit.service.component.scss']
})
export class DataServiceAuditServiceComponent implements OnInit {
    pageNum = 1;
    pageSize = 10;
    totalCount = 0;
    statusList = [
        {name: '全部', value: ''},
        {name: '待审批', value: 0},
        {name: '审批通过', value: 1},
        {name: '审批不通过', value: 2}
    ];
    checkedStatus = {name: '待审批', value: 0};
    keyWord: any;
    noDataType: any;
    auditList: any;
    constructor (private router: Router,
                 private location: Location,
                 private activatedRoute: ActivatedRoute,
                 private modalService: ModalService,
                 private dataServeService: DataServeService) {

    }
    ngOnInit () {
        this.getAuditList();
    }
    /**
     * 返回
     */
    goBack() {
        this.location.back();
    }

    /**
     * 下拉框选择
     */
    chooseStatus(item: any) {
        if (item === this.checkedStatus) {
            return;
        }
        this.checkedStatus = item;
        this.pageNum = 1;
        this.getAuditList();
    }

    /**
     * 延时搜索
     */
    searchChange($event: MouseEvent) {
        this.pageNum = 1;
        this.getAuditList();
    }

    /**
     * 获取列表
     */
    getAuditList() {
        this.dataServeService.aduitServeHistoryList({
            keyWord: this.keyWord,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            status: this.checkedStatus.value
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.auditList = d.data.list || [];
                this.totalCount = d.data.total;
                this.noDataType = this.auditList.length ? false : true;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message);
            }
        });
    }

    /**
     * 切换页码
     * @param obj
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getAuditList();
    }

    /**
     * 审批弹框
     */
    openModal(item: any) {
        let [ins] = this.modalService.toolOpen({
            title: '服务审批',
            component: DataServiceAuditServiceModalComponent,
            datas: {
                id: item.id,
                expireDate: item.expireDate ? {
                    date: item.expireDate,
                    value: moment(item.expireDate).format('YYYY-MM-DD HH:mm:ss')
                } : null
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
            this.getAuditList();
        };
    }
}
