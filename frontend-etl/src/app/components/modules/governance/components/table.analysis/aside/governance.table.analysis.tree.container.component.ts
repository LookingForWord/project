/**
 * Created by xxy on 2017-11-22.
 * 规则库管理左侧树形栏
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import 'rxjs/Rx';
import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'governance-table-analysis-tree-container-component',
    templateUrl: './governance.table.analysis.tree.container.component.html',
    styleUrls: ['./governance.table.analysis.tree.container.component.scss']
})

export class GovernanceTableAnalysisTreeContainerComponent implements  OnInit, OnDestroy {
    flows: any;                     // 目录树
    flowType =  'tableManage';      // 树形类别

    unsubscribes = [];

    constructor(private governanceService: GovernanceService,
                private toolService: ToolService,
                private datatransferService: DatatransferService) {

        let checkedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (data.type === 'tableManage') {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(checkedSubjectSubscribe);
    }

    ngOnInit() {
        this.governanceService.getCatalogList({id: 0}).then(d => {
            if (d.success) {
                let temps = [];
                d.message.forEach(msg => {
                    msg.expand = false;
                    msg.checked = true;
                    msg.queryChild = true;
                    msg.children = [];
                    msg.type = 'CatalogList';
                    temps.push(msg);
                });
                this.flows = temps;
                // 默认选中根目录  右侧列表默认展示根目录下一级目录
                this.datatransferService.taskTreeCheckedSubject.next({flow: temps[0], type: 'tableManage'});
                this.getSecondCataList();
            }
        });
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 获取二级目录，会加入一个特殊目录   未分配
     */
    getSecondCataList () {
        this.governanceService.getCatalogList({id: this.flows[0].id}).then(d => {
            let temps = [{
                expand: false,
                checked: false,
                type: 'undistributedCata',
                name: '未分配',
                parentId: '0',
                id: '01'
            }];
            if (d.success) {
                d.message.forEach(msg => {
                    msg.expand = false;
                    msg.checked = false;
                    msg.queryChild = false;
                    msg.children = [];
                    msg.type = 'CatalogList';
                    temps.push(msg);
                });
                this.flows[0].children = temps;
            }
        });
    }

    /**
     * 查询目录
     * @param parentId
     * @param flow
     * @param excludeId
     * @returns {Promise<void>}
     */
    async getAllRule(parentId, flow?: any, excludeId?: any) {
        let d = await this.governanceService.getCatalogList({
            id: parentId,
            excludeId: excludeId
        });

        let temps = [];
        if (d.success) {
            d.message.forEach(msg => {
                msg.expand = false;
                msg.checked = false;
                msg.queryChild = false;
                msg.children = [];
                msg.type = 'CatalogList';
                temps.push(msg);
            });
        }
        // 如果传递了flow，就代表是子数据
        if (excludeId) {
            this.flows = temps;
        } else {
            if (flow) {
                flow.children = temps;
            } else {
                this.flows = temps;
            }
        }
    }

    /**
     * 目录选中点击
     * @param flow
     */
    onCheckedEvent(flow) {
        if (flow.type !== 'undistributedCata') {
            this.toolService.treesTraverse(this.flows, {
                callback: (leaf: any) => {
                    leaf.checked = false;
                }
            });
            flow.checked = true;
            // 当节点是展开状态 且未查询子节点
            if (!flow.expand && flow.parentId !== '0') {
                // 查询子节点
                this.getAllRule(flow.id, flow);
                flow.queryChild = true;
                flow.expand = true;
            } else if (!flow.expand && flow.parentId === '0') {
                this.getSecondCataList();
                flow.queryChild = true;
                flow.expand = true;
            } else {
                flow.expand = !flow.expand;
            }
        } else {
            this.toolService.treesTraverse(this.flows, {
                callback: (leaf: any) => {
                    leaf.checked = false;
                }
            });
            flow.checked = true;
        }
    }
}
