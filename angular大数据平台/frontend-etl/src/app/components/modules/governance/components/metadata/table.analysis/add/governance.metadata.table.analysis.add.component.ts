import {Component, OnInit} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {FieldData} from 'app/components/modules/governance/components/metadata/table.analysis/governance.metadata.table.analysis.component';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare var moment: any;

@Component({
    selector: 'governance-metadata-table-analysis-add-component',
    templateUrl: 'governance.metadata.table.analysis.add.component.html',
    styleUrls: ['./governance.metadata.table.analysis.add.component.scss']
})

export class GovernanceMetadataTableAnalysisAddComponent implements OnInit {
    type: any;
    checkItem: any;
    resultName: any;            // 报告名称
    creatorName: any;           // 创建者
    createTime: any;            // 创建时间
    countResult: any;           // 行数统计
    deletedState: any;          // 状态
    resultList = [];
    noData: any;
    fieldFilter = [];
    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {

    }

    ngOnInit() {
        this.getReportDetail(this.checkItem.id);
    }

    /**
     * 获取报告详情
     */
    getReportDetail(id: any) {
        this.governanceService.getHistoryDetail({resultId: id}).then(d => {
            if (d.success && d.message) {
                this.resultName = d.message.resultName;
                this.createTime = d.message.createTime;
                this.creatorName = d.message.creatorName;
                this.countResult = d.message.countResult;
                this.deletedState = d.message.deletedState;
                this.fieldFilter = d.message.fieldFilter ? JSON.parse(d.message.fieldFilter) : [];
                let newObj = {};
                d.message.extList && d.message.extList.forEach(idx => {
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
