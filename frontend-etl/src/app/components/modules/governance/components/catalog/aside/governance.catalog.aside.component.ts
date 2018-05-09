/**
 * Created by xxy on 2017-11-22.
 * 规则库管理左侧树形栏
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {GovernanceCatalogAsideAddComponent} from 'app/components/modules/governance/components/catalog/aside/add/governance.catalog.aside.add.component';

@Component({
    selector: 'governance-catalog-aside-component',
    templateUrl: './governance.catalog.aside.component.html',
    styleUrls: ['./governance.catalog.aside.component.scss']
})

export class GovernanceCatalogAsideComponent implements  OnInit, OnDestroy {
    search: string;                 // 搜索关键词
    flows: any;                     // 目录树
    flowType =  '';         // 目录树类型
    unsubscribes = [];
    parentFlow: any;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private toolService: ToolService,
                private datatransferService: DatatransferService) {
        // 树形目录选中点击订阅
        let checkedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (!data.modal) {
                this.onCheckedEvent(data.flow);
            }
        });
        this.unsubscribes.push(checkedSubjectSubscribe);


        // 删除、新增、编辑操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe( data => {
            this.search = '';
            if (data.method === 'delete') {
                this.parentFlow = null;
                this.findParentNode(this.flows, data.flow);
                if (this.parentFlow) {
                    this.parentFlow.expand = true;
                    this.parentFlow.children = [];
                    this.getAllRule(data.parentId, this.parentFlow, null, data.flow.parentFlow);
                }
            } else {
                this.datatransferService.taskTreeCheckedSubject.next({flow: this.flows[0], type: 'check'});
                delete this.flows[0].children;
                this.getAllRule(this.flows[0].id, this.flows[0], null, this.flows[0]);
            }
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
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
                this.datatransferService.taskTreeCheckedSubject.next({flow: temps[0], type: 'check', modal: false});
                this.getAllRule(this.flows[0].id, this.flows[0], null, temps[0]);
            } else {
                this.modalService.alert(d.message);
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
     * 查询目录
     * @param parentId 父级目录id
     */
    async getAllRule(parentId, flow?: any, excludeId?: any, parentFlow?: any) {
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
                msg.parentFlow = parentFlow || null;
                temps.push(msg);
            });
        } else {
            this.modalService.alert(d.message);
        }
        // 如果传递了flow，就代表是子数据
        if (excludeId) {
            this.flows = temps;
        } else {
            if (flow) {
                flow.children = temps;
            } else {
                this.flows = temps;
                // 这里多一个操作把第一级目录直接展开
                // this.flows.forEach(f => {
                //     this.datatransferService.taskTreeExpandSubject.next({
                //         flow: f,
                //         type: this.flowType
                //     });
                // });
            }
        }
    }

    /**
     * 目录选中点击
     * @param flow 树形当前选中项
     */
    onCheckedEvent(flow: any) {
        this.toolService.treesTraverse(this.flows, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        flow.checked = true;
        // 当节点是展开状态 且未查询子节点
        if (!flow.expand) {
            // 查询子节点
            this.getAllRule(flow.id, flow, null, flow);
            flow.queryChild = true;
            flow.expand = true;
        } else {
            flow.expand = !flow.expand;
        }
    }

    /**
     * 创建目录
     */
    addDirectory() {
        let [ins] = this.modalService.toolOpen({
            title: '创建目录',
            component: GovernanceCatalogAsideAddComponent,
            datas: {
                status: 'add'
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
    }


    searchClick() {
        this.search = this.search.replace(/\s/g, '');
        this.getAllRule('5a17b7e674ce0947d52e8e4f', '', this.search);
    }

    /**
     * 删除寻找父节点以便只更新直接父目录
     * @param data
     * @param flow
     */
    findParentNode(data, flow) {
        for (let i in data) {
            if (data[i].id === flow.parentId) {
                this.parentFlow = data[i];
                break;
            } else {
                this.findParentNode(data[i].children, flow);
            }
        }
    }

    /**
     * 新增编辑找到对应目录
     */
    findSameNode(flows, parentFlow) {
        for (let i in flows) {
            if (flows[i].id === parentFlow.id) {
                this.parentFlow = flows[i];
                break;
            } else {
                this.findSameNode(flows[i].children, parentFlow);
            }
        }
    }

}
