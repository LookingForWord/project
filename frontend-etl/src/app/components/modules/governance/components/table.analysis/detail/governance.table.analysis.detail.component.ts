
import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';

@Component({
    selector: 'governance-table-analysis-detail-component',
    templateUrl: 'governance.table.analysis.detail.component.html',
    styleUrls: ['./governance.table.analysis.detail.component.scss']
})
export class GovernanceTableAnalysisDetailComponent implements OnInit {
    type: any;
    checkItem: any;
    resultName: any;
    createTime: any;
    countResult: any;
    resultList = [];
    noData: any;
    fieldFilter = [];
    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {

    }

    ngOnInit() {
        this.getReportDetail(this.checkItem.resultId);
    }

    /**
     * 获取报告详情
     */
    getReportDetail(id: any) {
        this.governanceService.getReportDetail({id: id}).then(d => {
            if (d.success && d.message) {
                this.resultName = d.message.resultName;
                this.createTime = d.message.createTime;
                this.countResult = d.message.countResult;
                this.fieldFilter = d.message.fieldFilter ? JSON.parse(d.message.fieldFilter) : [];
                let newObj = {};
                d.message.analyseResultExtList && d.message.analyseResultExtList.forEach(idx => {
                    if (!newObj[idx.resultField]) {
                        newObj[idx.resultField] = {
                            min: '',
                            max: '',
                            count: '',
                            sum: '',
                            average: '',
                            base: '',
                            aveLength: '',
                            stddev: '',
                            varpop: '',
                            range: ''
                        };
                    }
                    newObj[idx.resultField][idx.resultKey] = idx.resultValue;
                });
                let arr = [];
                for (let key in newObj) {
                    arr.push({
                        resultField: key,
                        obj: newObj[key]
                    });
                }
                this.resultList =  arr || [];
                this.noData = this.resultList.length ? false : true;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }
}
