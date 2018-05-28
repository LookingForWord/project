/**
 * Created by LIHUA on 2017-10-19.
 *  权限管理 对象管理 系统管理
 */
import {Component, OnInit} from '@angular/core';

import {AuthorityService} from 'app/services/authority.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';

import {AuthorityObjectInterfaceAddComponent} from 'app/components/modules/authority/components/object/interfaceManage/add/authority.object.interface.add.component';
import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'authority-object-interface-component',
    templateUrl: './authority.object.interface.component.html',
    styleUrls: ['./authority.object.interface.component.scss']
})
export class AuthorityObjectInterfaceComponent implements OnInit {
    pagenow = 1;
    pagesize = 10;
    totalcount = 10;
    keyWord = '';               // 关键字
    interfaces = [];            // 接口列表
    noDataType = false;         // 无数据
    token: any;
    systems = [];

    constructor(private modalService: ModalService,
                private httpService: HttpService,
                private authorityService: AuthorityService,
                private cookieService: CookieService,
                private loginService: LoginService) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }
    async ngOnInit() {
        let d = await this.authorityService.getOwnSystem();
        if (d.status === ServiceStatusEnum.SUCCESS) {
            let arr = [];
            d.data && d.data.forEach(item => {
                arr.push({name: item.dimName, value: item.dimCode});
            });
            this.systems = arr;
        } else {
            this.modalService.alert(d.message || d.msg);
        }
        this.getInterfaceList();
    }

    /**
     * 创建接口
     */
    newInterface() {

        let [ins] = this.modalService.toolOpen({
            title: '创建接口',
            component: AuthorityObjectInterfaceAddComponent,
            datas: {
                // action : 'addMenu'
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);

        // let [ins, pIns] = this.modalService.open(AuthorityObjectInterfaceAddComponent, {
        //     title: '创建接口',
        //     backdrop: 'static'
        // });
        //
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.destroy();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);

        ins.hideInstance = () => {
            ins.destroy();
            this.getInterfaceList(1);
        };
    }

    /**
     * 获取接口列表
     * @param {number} page
     */
    getInterfaceList(page?: number) {
        if (page) {
            this.pagenow = page;
        }
        this.authorityService.getInterfacesList({
            // orderBy:
            pageNum: this.pagenow,
            pageSize: 10,
            keyWord: this.keyWord
        }).then(d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                this.totalcount = d.data.total || 0;
                this.interfaces = d.data.list;
            } else {
                this.modalService.alert(d.message || d.msg, {auto: true});
            }
        });
    }

    /**
     * 查看详情
     * @param itf
     */
    detailClick(itf: any) {
        let [ins] = this.modalService.open(AuthorityObjectInterfaceAddComponent, {
            title: '接口详情',
            backdrop: 'static'
        });
        ins.type = 'detail';
        ins.name = itf.name;
        ins.url = itf.url;
        ins.status = itf.status === 0 ? ins.statusArr[0] : ins.statusArr[1];
        ins.ownSystemId = itf.ownSystemId;
    }

    /**
     * 编辑接口
     * @param itf
     */
    updateClick(itf: any) {

        let [ins] = this.modalService.toolOpen({
            title: '编辑接口',
            component: AuthorityObjectInterfaceAddComponent,
            datas: {
                // type : 'edit',
                // name : itf.name,
                // url : itf.url,
                // status : itf.status === 0 ? ins.statusArr[0] : ins.statusArr[1],
                // ownSystemId : itf.ownSystemId,
                // present : itf
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);


        // let [ins, pIns] = this.modalService.open(AuthorityObjectInterfaceAddComponent, {
        //     title: '编辑接口',
        //     backdrop: 'static'
        // });
        ins.type = 'edit';
        ins.name = itf.name;
        ins.url = itf.url;
        ins.status = itf.status === 0 ? ins.statusArr[0] : ins.statusArr[1];
        ins.ownSystemId = itf.ownSystemId;
        ins.present = itf;
        //
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.destroy();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);
        ins.hideInstance = () => {
            ins.destroy();
            this.getInterfaceList();
        };
    }

    /**
     * 删除
     * @param itf
     */
    deleteClick(itf: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityService.deleteInterface({id: itf.id})
                .then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('删除成功');
                        this.getInterfaceList();
                    } else {
                        this.modalService.alert(d.message || '删除失败');
                    }
                });
        });
    }

    /**
     * 将系统id转为系统名
     */
    changeToName (id: any) {
        for (let i = 0; i < this.systems.length; i++) {
            if (this.systems[i].value === id) {
                return this.systems[i].name;
            }
        }
    }

    /**
     * 页码切换
     * @param {number} page
     */
    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getInterfaceList();
    }

    /**
     * 导出
     */
    exportResource() {
        let [ins] = this.modalService.toolOpen({
            title: '接口信息导出',
            component: AuthorityExportComponent,
            datas: {
                type : 'export',
                model : 'interface'
            },
            okCallback: () => {
                this.authorityService.getInterfacesList({
                    pageNum: 1,
                    pageSize: this.pagesize,
                    keyWord: ins.exportKeyword
                }).then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS && d.data && d.data.list && d.data.list.length > 0) {
                        ins.errorType = -1;
                        ins.exportClick();
                    } else {
                        ins.errorType = 1;
                        ins.error = '当前搜索条件下无数据';
                    }
                });
            }
        } as ToolOpenOptions);

        // let [ins, pIns] = this.modalService.open(AuthorityExportComponent, {
        //     backdrop: 'static',
        //     title: '接口信息导出'
        // });
        //
        // ins.type = 'export';
        // ins.model = 'interface';
        //
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '确认',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.exportClick();
        //     }
        // }]);
        // ins.hideInstance = () => {
        //     ins.destroy();
        // };
    }

    /**
     * 导入
     */
    importResource() {
        let [ins] = this.modalService.toolOpen({
            title: '接口信息导入',
            component: AuthorityExportComponent,
            datas: {
                type : 'import',
                model : 'interface'
            },
            okCallback: () => {
                ins.saveImport();
            }
        } as ToolOpenOptions);

        // let [ins, pIns] = this.modalService.open(AuthorityExportComponent, {
        //     title: '接口信息导入',
        //     backdrop: 'static'
        // });
        //
        // ins.type = 'import';
        // ins.model = 'interface';
        // // 销毁组件
        // ins.hideInstance = () => {
        //     ins.destroy();
        // };
        // 刷新列表
        ins.refreshList = () => {
            this.getInterfaceList(1);
        };
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '确认',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveImport();
        //     }
        // }]);
    }


    /**
     * 导出菜单模板
     */
    exportResourceTemplate() {
        let url = this.httpService.getRealUrl(this.authorityService.exportInterfaceTemplateUrl) + `?token=${this.token}`;
        return url;
    }
}
