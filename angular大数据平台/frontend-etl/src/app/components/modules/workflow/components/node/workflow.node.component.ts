/**
 * Created by lh on 2017/11/9.
 */

import {Component, OnInit} from '@angular/core';
import {WorkflowService} from 'app/services/workflow.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { WorkflowNodeAddComponent} from 'app/components/modules/workflow/components/node/add/workflow.node.add.component';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'workflow-node-component',
    templateUrl: './workflow.node.component.html',
    styleUrls: ['./workflow.node.component.scss']
})
export class WorkflowNodeComponent implements OnInit {

    pageNow = 1;
    pageSize = 10;
    totalcount = 0;
    nodeList: any;
    noDataType: any;
    keyWord: any;

    constructor(
        private workflowService: WorkflowService,
        private modalService: ModalService,
        private loginService: LoginService) {

    }

    ngOnInit() {
        this.getNodeList();
    }

    /**
     * 获取节点列表
     * @param page
     */
    getNodeList(page?: any) {

        this.workflowService.getNodeList({

        }).then( d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                let list = JSON.parse(d.data);
                list.forEach(item => {
                    delete item.tags.python; // 系统暂不支持 python
                    item.tagArr = [];
                    let arr = Object.keys(item.tags);
                    arr.forEach(key => {
                        item.tagArr.push({name: key, value: item.tags[key]});
                    });
                });
                this.nodeList = list;
                this.totalcount = this.nodeList.length || 0;
                this.noDataType = this.nodeList.length ? false : true;
            } else {
                this.totalcount = 0;
                this.noDataType = true;
            }
        });

    }

    /**
     * 切换页码
     */
    doPageChange(obj: any) {
        this.pageSize = obj.size;
        this.getNodeList(obj.page);
    }

    /**
     * 编辑节点
     */
    editClick(item: any) {
        let [ins] = this.modalService.toolOpen({
            title: '编辑节点',
            component: WorkflowNodeAddComponent,
            datas: {
                environments : item.tags,
                name : item.name,
                address : item.address
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);

        ins.refreshList = () => {
            this.getNodeList(1);
        };
    }

    /**
     * 获取端口号
     */
    changeAddress(address) {
        if (!address || address.indexOf(':') === -1) {
            return '';
        }
        return address.slice(address.indexOf(':') + 1, );
    }

}
