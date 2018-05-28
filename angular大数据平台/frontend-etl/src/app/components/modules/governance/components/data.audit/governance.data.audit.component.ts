/**
 * created by LIHUA on 2018/01/19/
 * 数据资产 数据质量管理 数据稽核
 */
import {Component} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'governance-data-audit-component',
    templateUrl: './governance.data.audit.component.html',
    styleUrls: ['./governance.data.audit.component.scss']
})
export class GovernanceDataAuditComponent {
    leftState: number; // 根据导航栏宽度，修改自身left值

    constructor(private datatransferService: DatatransferService) {

        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
    }
}

