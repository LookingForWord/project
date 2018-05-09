/**
 * Created by lh on 2017/12/18.
 * 运维中心 任务运维 预览
 */

import {Component} from '@angular/core';

@Component({
    selector: 'task-operation-maintenance-preview-component',
    templateUrl: './task.operation.maintenance.preview.component.html',
    styleUrls: ['./task.operation.maintenance.preview.component.scss']
})
export class TaskOperationMaintenancePreviewComponent {
    dataSourceTitle: any;
    targetSourceTitle: any;
    dataSourceArr: any;
    dataTargetArr: any;
    constructor() {}

    cancelClick() {
        this.hideInstance();
    }
    hideInstance: Function;
}
