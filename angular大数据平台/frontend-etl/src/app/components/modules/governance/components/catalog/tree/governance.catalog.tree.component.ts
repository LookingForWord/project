/**
 * Created by xxy on 2017-11-22.
 *  树形递归展示
 */
import {AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {LoginService} from 'app/services/login.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';

import {GovernanceCatalogAsideAddComponent} from 'app/components/modules/governance/components/catalog/aside/add/governance.catalog.aside.add.component';

@Component({
    selector: 'governance-catalog-tree-component',
    templateUrl: './governance.catalog.tree.component.html',
    styleUrls: ['./governance.catalog.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class GovernanceCatalogTreeComponent implements AfterContentInit, OnDestroy, OnInit {
    @Input()
    list: any;       // 目录列表

    @Input()
    type: any;

    @Input()
    parent: any;

    @Input()
    index: any;
    @Input()
    modal: any;                 // 是否是弹框的tree

    parentName: string;         // 还原父级目录层级


    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private governanceService: GovernanceService,
                private loginService: LoginService) {
        this.datatransferService.authorityOrganizeTreeAddSubject.subscribe(data => {

        });
    }

    ngOnInit() {
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
        if (this.parent === 'undefined') {
            this.parent = this.list;
        }
    }
    ngAfterContentInit() {

    }
    ngOnDestroy() {

    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow: any, $event: MouseEvent) {
        this.datatransferService.taskTreeCheckedSubject.next({
            flow: flow,
            type: this.type,
            modal: this.modal || false
        });
        $event.stopPropagation();
    }

    /**
     * 删除目录
     * @param item
     * @param {MouseEvent} $event
     */
    deleteCatalog(item: any, $event: MouseEvent) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteDirectory({id: item.id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    // 发布通知删除成功 在aside页面重新接口获取父级目录下的子目录
                    this.datatransferService.addCatalogSubject.next({parentId: item.parentId, flow: item, method: 'delete'});
                } else {
                    this.modalService.alert(d.message || '删除失败');
                }
            });
        });
        $event.stopPropagation();
    }

    /**
     *  编辑目录
     */
    editCatalog(data: any, $event: MouseEvent) {
        this.parentName = '/';
        data.parentFlow && this.findParentName(data.parentFlow);
        let [ins] = this.modalService.toolOpen({
            title: '编辑目录',
            component: GovernanceCatalogAsideAddComponent,
            datas: {
                status: 'edit',
                name: data.name,
                description: data.description,
                flow: data,
                oldDircPath: this.parentName
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        $event.stopPropagation();
    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
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
