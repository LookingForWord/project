import {Component, OnInit} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'workflow-work-content-run-pugin-tree-component',
    templateUrl: './workflow.work.content.run.plugin.tree.component.html',
    styleUrls: ['./workflow.work.content.run.plugin.tree.component.scss']
})
export class WorkflowWorkContentRunPluginTreeComponent implements OnInit {

    tasks = [];
    treeUrl: any;
    systemId: any;

    checkedFlow: any;
    dircPath: any;

    errorType: any;

    constructor (private datatransferService: DatatransferService,
                 private toolService: ToolService) {
        this.datatransferService.workflowTreeDbCheckedSubject.subscribe(data => {
            this.checkedFlow = data.flow;
            this.dircPath = '';
            this.checkData(this.tasks , data.flow.parentId);
            this.findParentNode(this.tasks, data.flow);
            this.onCheckedEvent(data.flow);
        });

    }

    ngOnInit() {
    }

    /**
     * 寻找父节点
     */
    findParentNode(data: any, flow: any) {
        let checkedList = this.toolService.treesPositions(this.tasks, flow);
        // 将选中的部门从父级自下拼接为字符串
        checkedList && checkedList.forEach(item => {
            this.dircPath += `/${item.name}`;
        });
    }
    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow: any) {
        flow.checked = !flow.checked;
    }

    /**
     * 选中遍历
     */
    checkData(data: any, pid: any) {
        let arr = data; // 数据暂存
        arr.map(item => {
            item.checked = false;
            if (item.children && item.children.length > 0) {
                this.checkData(item.children, pid);
            }
        });
        // 返回新的arr
        return arr;
    }


    saveClick: Function;

}
