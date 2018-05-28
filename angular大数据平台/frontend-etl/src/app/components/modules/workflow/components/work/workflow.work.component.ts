/**
 * Created by lh on 2017/11/9.
 */

import {Component} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'workflow-work-component',
    templateUrl: './workflow.work.component.html',
    styleUrls: ['./workflow.work.component.scss']
})
export class WorkflowWorkComponent {
    leftState: number; // 根据导航栏宽度，修改自身left值

    constructor(private datatransferService: DatatransferService) {

        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
    }
}
