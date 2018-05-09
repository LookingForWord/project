
import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceTableAnalysisDetailComponent} from 'app/components/modules/governance/components/table.analysis/detail/governance.table.analysis.detail.component';
import 'rxjs/Rx';

@Component({
    selector: 'governance-table-analysis-component',
    templateUrl: './governance.table.analysis.component.html',
    styleUrls: ['./governance.table.analysis.component.scss']
})

export class GovernanceTableAnalysisComponent implements OnDestroy, OnInit {
    reportList = [];            // 报告列表
    dirId: any;                 // 目录id
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    keyWord:  string;
    unsubscribes = [];

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private datatransferService: DatatransferService,
    ) {
        // 树形目录选中点击订阅
        let checkedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            // 注意未分配的话 有个特殊的type和id    取其一判断,值均为  'undistributedCata'
            if (data.type === 'tableManage') {
                this.pageNum = 1;
                if (data.flow.id !== this.dirId) {
                    if (data.flow.parentId === '0' && data.flow.id !== '01') {
                        this.dirId = '0';
                    } else {
                        this.dirId = data.flow.id;
                    }
                    this.getReportList();
                }
            }
        });
        this.unsubscribes.push(checkedSubjectSubscribe);
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
     * 获取表报告列表
     */
    getReportList() {
        this.governanceService.getTableReport({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            dirId: this.dirId,
        }).then(d => {
            if (d.success && d.message) {
                this.reportList = d.message.items || [];
                this.totalcount = d.message.totalCount;
                this.noData = this.reportList.length ? false : true;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 分页点击事件
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getReportList();
    }

    /**
     * 删除表报告
     * @param item
     */
    deleteClick(item: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteReport({id: item.resultId}).then( d => {
                if (d.success) {
                    this.getReportList();
                }

                this.modalService.alert(d.message);
            });
        });
    }

    /**
     * 查看详情
     * @param item
     */
    detailClick(item: any) {
        let [ins] = this.modalService.open(GovernanceTableAnalysisDetailComponent, {
            title: '报告详情',
            backdrop: 'static'
        });
        ins.type = 'detail';
        ins.checkItem = item;
    }
}
