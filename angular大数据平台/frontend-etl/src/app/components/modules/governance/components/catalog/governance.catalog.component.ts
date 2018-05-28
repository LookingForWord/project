/**
 * Created by xxy on 2017-11-22.
 *  权限管理 组织管理
 */
import {Component, OnDestroy} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceCatalogAsideAddComponent} from 'app/components/modules/governance/components/catalog/aside/add/governance.catalog.aside.add.component';

@Component({
    selector: 'governance-catalog-component',
    templateUrl: './governance.catalog.component.html',
    styleUrls: ['./governance.catalog.component.scss']
})

export class GovernanceCatalogComponent implements OnDestroy {

    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    parentId: any;
    parentFlow: any;
    noCheck = true;

    unsubscribes = [];

    parentName: any;    // 父级目录名称集合

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private datatransferService: DatatransferService
    ) {
        // 树形目录选中点击订阅
        let taskTreeCheckedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            if (!data.modal && this.parentFlow !== data.flow) {
                this.getChildCatalogList(data.flow.id);
                this.noCheck = false;
                this.parentFlow = data.flow;
                this.parentName = '';
            }
        });
        this.unsubscribes.push(taskTreeCheckedSubjectSubscribe);

        // 删除、新增/编辑操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.addCatalogSubject.subscribe( (data) => {
            if (data.flow) {
                this.getChildCatalogList(data.flow.parentId);
                this.noCheck = false;
            }
        });
        this.unsubscribes.push(addCatalogSubjectSubscribe);
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }
    /**
     * 获取所有目录
     * parentId: 父级目录id
     */
    getChildCatalogList(parentId?: any) {
        this.governanceService.getCatalogList({id: parentId}).then(d => {
            if (d.success ) {
                this.list = d.message;
                this.parentId = parentId;
                this.totalcount = this.list.length;
                this.noData = this.list.length <= 0 ? true : false;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 新增目录
     */
    newRule() {
        if (!this.noCheck) {
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
    }

    /**
     * 目录详情
     * @param item
     */
    detailClick(item) {
        this.parentName = '/';
        this.findParentName(this.parentFlow);
        let [ins, pIns] = this.modalService.open(GovernanceCatalogAsideAddComponent, {
            title: '目录详情'
        });
        ins.status = 'detail';
        ins.name = item.name;
        ins.description = item.description;
        ins.flow = item;
        ins.oldDircPath = this.parentName;
    }

    /**
     * 编辑目录
     * @param item
     */
    updateClick(item: any) {
        this.parentName = '/';
        this.findParentName(this.parentFlow);
        let [ins] = this.modalService.toolOpen({
            title: '编辑目录',
            component: GovernanceCatalogAsideAddComponent,
            datas: {
                status: 'edit',
                name: item.name,
                description: item.description,
                flow: item,
                fromtable: true,
                oldDircPath: this.parentName
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
    }

    /**
     * 删除目录
     * @param item
     */
    deleteClick(item) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteDirectory({id: item.id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.datatransferService.addCatalogSubject.next({method: 'delete', flow: item});
                    this.getChildCatalogList(item.parentId);
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
    }

    /**
     * 逐级去找parentFlow  去还原父级目录
     */
    findParentName(flow: any) {
        this.parentName = `/${flow.name}` + this.parentName ;
        if (flow.parentFlow && flow.parentFlow.name) {
            this.findParentName(flow.parentFlow);
        }
    }

}
