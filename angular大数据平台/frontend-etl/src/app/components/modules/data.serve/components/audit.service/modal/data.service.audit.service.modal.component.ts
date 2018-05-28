import {Component} from '@angular/core';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare var moment: any;

@Component({
    selector: 'data-service-audit-service-modal-component',
    templateUrl: 'data.serve.audit.service.modal.component.html',
    styleUrls: ['data.serve.audit.service.modal.component.scss']

})
export class DataServiceAuditServiceModalComponent {
    id: any;        // 服务id
    resultList = [
        {name: '通过', value: 1},
        {name: '不通过', value: 2}
    ];
    checkedResult = {name: '通过', value: 1};
    errorType: any;
    error: any;
    approveDesc: any;
    expireDate: any;

    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss'
    };

    constructor(private dataServeService: DataServeService,
                private modalService: ModalService) {

    }

    chooseResult(item: any) {
        this.checkedResult = item;
    }

    saveClick () {
        if (!this.check()) {
            return;
        }
        this.dataServeService.auditServe({
            id: this.id,
            approveDesc: this.approveDesc,
            expireDate: this.expireDate && this.expireDate.value,
            approveStatus: this.checkedResult.value
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('已审批');
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || d.msg || d.data);
            }
        });
    }
    check () {
        if (this.checkedResult.value === 1 && (!this.expireDate || !this.expireDate.value)) {
            this.errorType = 2;
            this.error = '请选择过期时间';
            return;
        }
        let now = new Date().getTime();
        if (this.expireDate && new Date(this.expireDate.value).getTime() < now) {
            this.errorType = 2;
            this.error = '过期时间不能早于今天';
            return;
        }
        if (this.checkedResult.value === 2 && !this.approveDesc) {
            this.errorType = 3;
            this.error = '请填写拒绝理由';
            return;
        }
        this.errorType = -1;
        this.error = '';
        return true;
    }
    hideInstance: Function;
}
