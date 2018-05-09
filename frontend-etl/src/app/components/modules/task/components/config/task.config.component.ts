/**
 * Created by xxy on 2017-09-19.
 * 任务配置管理
 */

import {Component} from '@angular/core';

import {TaskService} from 'app/services/task.service';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'task-config-component',
    templateUrl: './task.config.component.html',
    styleUrls: ['./task.config.component.scss']
})
export class TaskConfigComponent {
    leftState: number; // 根据导航栏宽度，修改自身left值

    constructor(private taskService: TaskService,
                private datatransferService: DatatransferService) {
        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
    }
}
