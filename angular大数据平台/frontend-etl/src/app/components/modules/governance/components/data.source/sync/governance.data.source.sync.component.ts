/**
 * Created by xxy on 2017/12/20/020.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {GovernanceService} from 'app/services/governance.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'governance-data-source-sync-component',
    templateUrl: './governance.data.source.sync.component.html',
    styleUrls: ['./governance.data.source.sync.component.scss']
})
export class GovernanceDataSourceSyncComponent implements OnInit, OnDestroy {

    status = 'addVisual';
    flows: any;                     // 目录树LIST
    checkedId: string;              //  选中的目录id
    modal = 'addsql';               // 是否是弹框中的目录树
    parentFlow: any;                // 树形选中项
    dircPath = '';                  // 目录
    dataSoureId: string;            // 数据源id
    unsubscribes = [];
    constructor(
        private modalService: ModalService,
        private governanceService: GovernanceService,
        private datatransferService: DatatransferService,
        private toolService: ToolService
                 ) {
        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.modal === 'addsql') {
                this.onCheckedEvent(data.flow, data.type);
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);
    }

    async ngOnInit() {
        let data = await this.getAllRule(0);
        if (data) {
            this.flows = data;
        }
    }
    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 查询目录
     * @param parentId 父级目录id
     */
    async getAllRule(parentId, excludeId?: any) {
        let d = await this.governanceService.getCatalogList({
            id: parentId,
            excludeId: excludeId
        });
        if (d.success) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];
                msg.type = 'CatalogList';
            });
        }
        return d.message;
    }

    /**
     * 目录选中点击
     * @param flow
     */
    async onCheckedEvent(flow, type?: any) {
        this.checkedId = flow.id;
        if (!flow || !this.flows) {
            return;
        }
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = true;
        // 当节点是展开状态 且未查询子节点
        this.parentFlow = flow;
        // 查询子节点
        let data = await this.getAllRule(flow.id);
        flow.expand = !flow.expand;
        if (data) {
            flow.children = data;
        }
        flow.queryChild = true;

        this.dircPath = '/';
        let tempFlow = this.toolService.treesPositions(this.flows, flow);
        tempFlow && tempFlow.forEach(fl => {
            this.dircPath = this.dircPath + (fl.name + '/');
        });

    }

    /**
     * 保存按钮
     */
    saveClick() {
        this.governanceService.asyncData({
            dataSourceId: this.dataSoureId,
            dirId: this.checkedId,
            extra: {
                path: this.dircPath
            }
        }).then( d => {
            if (d.success) {
                this.modalService.alert(d.message || '同步成功');
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '同步失败');
            }
        });
    }

    /**
     * 取消
     */
    cancelClick() {
        this.hideInstance();
    }
    hideInstance: Function;
}
