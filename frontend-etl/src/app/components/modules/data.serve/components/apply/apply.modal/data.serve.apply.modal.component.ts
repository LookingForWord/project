import {Component} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import {DatepickerOptions} from 'frontend-common/ts_modules/directives/datepicker/datepicker.directive';
declare var moment: any;

@Component({
    selector: 'data-service-apply-modal-component',
    templateUrl: 'data.serve.apply.modal.component.html',
    styleUrls: ['data.serve.apply.modal.component.scss']

})
export class DataServeApplyModalComponent {

    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss'
    };
    errorType: any;
    error: any;
    applyDesc: any;
    expireDate: any;
    serveId: any;

    constructor(private modalService: ModalService,
                private dataServeService: DataServeService) {

    }


    saveClick() {
        if (!this.expireDate || !this.expireDate.value) {
            this.errorType = 1;
            this.error = '请选择过期时间';
            return;
        }
        let now = new Date().getTime();
        if (new Date(this.expireDate.value).getTime() < now) {
            this.errorType = 1;
            this.error = '过期时间不能早于今天';
            return;
        }
        this.errorType = -1;
        this.error = '';
        this.dataServeService.applyServe({
            serveId: this.serveId,
            applyDesc: this.applyDesc,
            expireDate: this.expireDate.value
        }).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('申请成功');
                this.refreshList();
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || d.msg || d.data);
            }
        });
    }

    hideInstance: Function;
    refreshList: Function;
}
