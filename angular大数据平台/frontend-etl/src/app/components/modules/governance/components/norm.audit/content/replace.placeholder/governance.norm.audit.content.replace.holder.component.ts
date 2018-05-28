import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

@Component({
    selector: 'governance-norm-audit-content-replace-holder-component',
    templateUrl: 'governance.norm.audit.content.replace.holder.component.html',
    styleUrls: ['./governance.norm.audit.content.replace.holder.component.scss']
})
export class GovernanceNormAuditContentReplaceHolderComponent implements OnInit {
    templateContent: any;
    placeArr: any;
    configId: any;
    type: any;
    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {

    }

    ngOnInit() {

    }

    /**
     * 保存
     */
    save() {
        if (!this.check()) {
            return;
        }
        let parems = {};
        this.placeArr.forEach(item => {
           parems[item.oldValue] = item.newValue;
        });
        this.governanceService.auditRunNow({
            parems: parems,
            id: this.configId
        }).then(d => {
           if (d.success) {
               this.modalService.alert(d.message);
               this.hideInstance();
           } else {
               this.modalService.alert(d.message);
           }
        });
    }

    /**
     * 校验
     */
    check() {
        for(let i = 0; i < this.placeArr.length; i++) {
            if (!this.placeArr[i].newValue) {
                this.placeArr[i].errorType = true;
                this.placeArr[i].error = '请填写替换值';
                return
            }
            if (!RegExgConstant.chartable.test(this.placeArr[i].newValue)) {
                this.placeArr[i].errorType = true;
                this.placeArr[i].error = '只能是数字或字母';
                return;
            }
            this.placeArr[i].errorType = false;
            this.placeArr[i].error = '';
        }
        return true;
    }
    hideInstance: Function;
}
