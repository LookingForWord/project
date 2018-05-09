/**
 * Created by XMW on 2017-10-17.
 *  权限管理 组织管理
 */

import {Component} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {AuthorityService} from 'app/services/authority.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

import {ServiceStatusEnum} from 'app/constants/service.enum';

import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';

@Component({
    selector: 'authority-organize-component',
    templateUrl: './authority.organize.component.html',
    styleUrls: ['./authority.organize.component.scss']
})

export class AuthorityOrganizeComponent {

    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    oldOrgId: any;
    token: any;

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private datatransferService: DatatransferService,
                private httpService: HttpService,
                private cookieService: CookieService
    ) {
        this.token = this.cookieService.get(Cookie.TOKEN);

        this.datatransferService.authorityOrganizeTreeCheckedSubject.subscribe(data => {
            if (!this.oldOrgId || this.oldOrgId !== data.flow.id) {
                this.oldOrgId = data.flow.id;
                this.getOrganizeList(data.flow.id);
            }
        });
        this.getOrganizeList();
        // 删除、新增操作后刷新目录树
        let addCatalogSubjectSubscribe = this.datatransferService.authorityOrganizeTreeAddSubject.subscribe( str => {
            this.getOrganizeList();
        });
    }

    /**
     * 上传导入
     */
    openUpload () {
        let [ins] = this.modalService.toolOpen({
            title: '组织信息导入',
            component: AuthorityExportComponent,
            datas: {
                type : 'import',
                model : 'organize'
            },
            okCallback: () => {
                ins.saveImport();
            }
        } as ToolOpenOptions);
        let that = this;

        ins.hideInstance = () => {
            ins.destroy();
        };
        ins.refreshList = () => {
            this.getOrganizeList(this.oldOrgId);
            that.datatransferService.authorityOrganizeTreeAddSubject.next('import');
        };
    }

    /**
     * 获取所有组织
     */
    getOrganizeList(orgId?: any) {
        this.authorityService.getAllOrganization({
            orgId : orgId || ''
        }).then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {
                this.list = d.data;
                this.totalcount = d.total || 0;
                this.oldOrgId = orgId;
                this.reTrustData();
                if (!d.data) {
                   this.noData = true;
                }
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 获取导出地址
     */
    getExport() {
        let [ins] = this.modalService.toolOpen({
            title: '组织信息导出',
            component: AuthorityExportComponent,
            datas: {
                type : 'export',
                model : 'organize'
            },
            okCallback: () => {
                ins.exportClick();
            }
        } as ToolOpenOptions);
    }

    /**
     * 导出组织机构模板
     */
    exportOrganizeTemplate() {
        let url = this.httpService.getRealUrl(this.authorityService.exportOrganizeTemplateUrl) + `?token=${this.token}`;
        return url;
    }

    /**
     * 数据重组
     */
    reTrustData() {
        let present = null;
        let arr = [];
        this.list.forEach(item => {
           if (item.type === 1 && item.id !== this.oldOrgId) {
               arr.unshift(item);
           } else if (item.type === 1 && item.id === this.oldOrgId) {
               present = item;
           } else {
               arr.push(item);
           }
        });
        present && arr.unshift(present);
        this.list = arr;
    }
}
