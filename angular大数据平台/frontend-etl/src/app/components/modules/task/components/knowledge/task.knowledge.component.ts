/**
 * Created by LIHUA on 2017-09-18.
 * 系统管理知识库
 */
import {Component} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {TaskKnowledgeAsideAddComponent} from 'app/components/modules/task/components/knowledge/aside/add/task.knowledge.aside.add.component';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'task-knowledge-component',
    templateUrl: './task.knowledge.component.html',
    styleUrls: ['./task.knowledge.component.scss']
})
export class TaskKnowledgeComponent {
    leftState: number; // 根据导航栏宽度，修改自身left值
    constructor( private datatransferService: DatatransferService,
                 private modalService: ModalService) {
        // 监听导航栏布局变化 修改本身布局
        this.datatransferService.navigateStateSubject.subscribe(data => {
            this.leftState = data;
        });
    }

    /**
     * 添加目录点击
     */
    addDirectory() {
        // let [ins, pIns] = this.modalService.open(TaskKnowledgeAsideAddComponent, {
        //     backdrop: 'static',
        //     title: '新增目录 / 知识表'
        // });
        // ins.type = 'addmenu';
        // ins.dircName = '';
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);
        let [ins] = this.modalService.toolOpen({
            title: '新增目录 / 知识表',
            component: TaskKnowledgeAsideAddComponent,
            datas: {
                type: 'addmenu',
                dircName: '',
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        };
    }
}
