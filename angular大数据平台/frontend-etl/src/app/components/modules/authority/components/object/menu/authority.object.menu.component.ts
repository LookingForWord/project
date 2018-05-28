/**
 * Created by LIHUA on 2017-10-19.
 *  权限管理 对象管理 菜单管理
 */
import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {AuthorityService} from 'app/services/authority.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {DatatransferService} from 'app/services/datatransfer.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';
import {AuthorityObjectMenuAddComponent} from 'app/components/modules/authority/components/object/menu/add/authority.object.menu.add.component';

@Component({
    selector: 'authority-object-menu-component',
    templateUrl: './authority.object.menu.component.html',
    styleUrls: ['./authority.object.menu.component.scss']
})
export class AuthorityObjectMenuComponent implements OnInit {
    list = [];
    pagenow = 1;            // 当前页码
    pagesize = 10;          // 每页显示数据数
    totalcount = 0;         // 总数据数
    keyWord: any;           // 搜索关键字
    menus = [];             // 菜单列表
    noDataType = false;     // 无数据
    displayMode = 'table';    // 切换显示table还是树
    menuTree = [];

    token: any;

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private httpService: HttpService,
                private datatransferService: DatatransferService,
                private cookieService: CookieService
    ) {
        this.token = this.cookieService.get(Cookie.TOKEN);
        this.datatransferService.refreshObjectTree.subscribe(data => {
            if (data === 'refreshTree') {
                this.getMenuTree();
            }
        });
    }

    ngOnInit() {
        this.getMenuList();
    }
    /**
     * 获取菜单列表
     */
    getMenuList(pagenow?: number) {
        if (pagenow) {
           this.pagenow = pagenow;
        }
        this.authorityService.getMenuList({
            // 页码
           pageNum: this.pagenow,
            // 单页记录数
           pageSize: this.pagesize,
            // 排序方式
           orderBy: 'resource_name_desc',
            // 关键字
            keyWord: this.keyWord
        }).then(d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                this.menus = d.data.list;
                this.totalcount = d.data.total;
                this.noDataType = d.data.total === 0 ? true : false;
            } else {
                this.modalService.alert(d.message || d.msg, {auto: true});
            }
        });
    }

    /**
     * 获取树形结构
     */
    async getMenuTree() {
        let systemlist = await this.authorityService.getOwnSystem();
        systemlist = systemlist.data;
        this.authorityService.getDepartmentTree().then(d => {

           if (d.status === ServiceStatusEnum.SUCCESS) {
                systemlist.forEach(sys => {
                    sys.children = [];
                    sys.resourceName = sys.dimName;
                    sys.index = 0;
                    sys.status = 0;
                    sys.expand = true;
                    sys.type = 'system';
                    d.data.forEach(item => {
                        if (item.ownSystemId === sys.dimCode) {
                            item.children && item.children.sort(this.compare('code'));
                            sys.children.push(item);
                        }
                    });
                });
                if (!systemlist || systemlist.length === 0) {
                    return;
                }
                this.menuTree = this.restructData(systemlist, 0);

                // this.mapMenu(this.menuTree);
           } else {
               this.modalService.alert(d.message || d.msg);
           }
        });
    }

    /**
     * 遍历
     */
    restructData(data, index) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.map(item => {
            item.expand = (i < 1 ? true : false);
            item.index = i;
            item.checked = false;
            // this.menuList.push({id: item.id, parentId: item.parentId, name: item.name, orgType: item.orgType, value: item.id});
            if (item.children && item.children.length > 0) {
                this.restructData(item.children, i + 1);
            }
        });
        // 返回新的arr
        return arr;
    }

    /**
     * 新增菜单
     */
    newMenu() {
        let [ins] = this.modalService.toolOpen({
            title: '新增对象',
            component: AuthorityObjectMenuAddComponent,
            datas: {
                action : 'addMenu'
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.refreshList = () => {
            this.getMenuList(1);
            this.getMenuTree();
        };
    }

    /**
     * 菜单详情
     * @param menu
     */
    detailClick(menu: any) {
        this.authorityService.getMenuDetails({id: menu.id}).then(d => {
           if (d.status === ServiceStatusEnum.SUCCESS) {

               let [ins] = this.modalService.open(AuthorityObjectMenuAddComponent, {
                   title: '查看菜单详情',
                   backdrop: 'static'
               });
               ins.code = menu.code;
               ins.resourceName = d.data.resourceName;
               ins.pAddress = d.data.url;
               ins.staus = d.status;
               ins.parentId = d.data.parentId;
               ins.parentMenuName = d.data.parentName;
               // 待定
               ins.type = ins.types[d.data.type - 1];
               ins.status = ins.statues[d.data.status];
               ins.system = {value: d.data.ownSystemId, name: d.data.ownSystemName};
               ins.action = 'infoMenu';
               ins.url = d.data.url;
           }
        });
    }

    /**
     * 编辑保存菜单
     * @param menu
     */
    updateClick(menu: any) {
        this.authorityService.getMenuDetails({id: menu.id}).then(d => {

            if (d.status === ServiceStatusEnum.SUCCESS) {

                let [ins] = this.modalService.toolOpen({
                    title: '修改菜单详情',
                    component: AuthorityObjectMenuAddComponent,
                    datas: {
                        // resourceName : d.data.resourceName,
                        // pAddress : d.data.url,
                        // parentId : d.data.parentId,
                        // parentMenuName : d.data.parentName,
                        // type : ins.types[d.data.type - 1],
                        // status : ins.statues[d.data.status],
                        // system : {value: d.data.ownSystemId, name: d.data.ownSystemName},
                        // action : 'editMenu',
                        // menuID : d.data.id,
                        // code : menu.code,
                        // url : d.data.url,
                    },
                    okCallback: () => {
                        ins.saveClick();
                    }
                } as ToolOpenOptions);

                ins.refreshList = () => {
                    this.getMenuList();
                };

                ins.resourceName = d.data.resourceName;
                ins.pAddress = d.data.url;
                ins.parentId = d.data.parentId;
                ins.parentMenuName = d.data.parentName;

                // 待定
                ins.type = ins.types[d.data.type - 1];
                ins.status = ins.statues[d.data.status];
                ins.system = {value: d.data.ownSystemId, name: d.data.ownSystemName};
                ins.action = 'editMenu';
                ins.menuID = d.data.id;
                ins.code = menu.code;
                ins.url = d.data.url;
            }
        });

    }

    /**
     * 删除菜单
     * @param menu
     */
    deleteClick(menu: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityService.deleteMenu({id: menu.id})
                .then(d => {

                    if (d.status === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('删除成功');
                        this.getMenuList(this.pagenow);
                    } else {
                        this.modalService.alert(d.msg);
                    }
                });
        });
    }

    /**
     * 页码切换
     * @param {number} page
     */
    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getMenuList();
    }

    /**
     * 导出
     */
    exportResource() {
        let [ins] = this.modalService.toolOpen({
            title: '菜单信息导出',
            component: AuthorityExportComponent,
            datas: {
                type : 'export',
                model : 'object'
            },
            okCallback: () => {
                this.authorityService.getMenuList({
                    pageNum: 1,
                    pageSize: this.pagesize ,
                    orderBy: 'resource_name_desc',
                    keyWord: ins.exportKeyword
                }).then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS && d.data && d.data.list && d.data.list.length) {
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
        //     title: '菜单信息导出'
        // });
        //
        // ins.type = 'export';
        // ins.model = 'object';
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
        //         this.authorityService.getMenuList({
        //             pageNum: this.pagenow,
        //             pageSize: this.pagesize ,
        //             orderBy: 'resource_name_desc',
        //             keyWord: ins.exportKeyword
        //         }).then(d => {
        //             if (d.status === ServiceStatusEnum.SUCCESS && d.data && d.data.list && d.data.list.length) {
        //                 ins.errorType = -1;
        //                 ins.exportClick();
        //             } else {
        //                 ins.errorType = 1;
        //                 ins.error = '当前搜索条件下无数据';
        //             }
        //         });
        //     }
        // }]);
        //
        // ins.hideInstance = () => {
        //     ins.destroy();
        // };
    }

    /**
     * 导入
     */
    importResource() {

        let [ins] = this.modalService.toolOpen({
            title: '菜单信息导入',
            component: AuthorityExportComponent,
            datas: {
                type : 'import',
                model : 'object'
            },
            okCallback: () => {
                ins.saveImport();
            }
        } as ToolOpenOptions);

        // // 刷新列表
        ins.refreshList = () => {
            this.getMenuList(1);
            this.getMenuTree();
        };
    }


    /**
     * 导出菜单模板
     */
    exportResourceTemplate() {
        let url = this.httpService.getRealUrl(this.authorityService.exportResourceTemplateUrl) + `?token=${this.token}`;
        return url;
    }

    /**
     * 切换显示树和table
     */
    changeMode(mode: string) {
        if (mode === 'tree') {
            this.getMenuList(this.pagenow);
        } else {
            this.getMenuTree();
        }
        this.displayMode = (mode === 'table' ? 'tree' : 'table');
    }


    /**
     * 按code给侧边菜单菜单排序
     * @param property
     * @returns {(a, b) => number}
     */
    compare (property: any) {
        return function(a, b) {
            if (a[property].indexOf('b') === -1 && b[property].indexOf('b') === -1) {
                let value1 = a[property];
                let value2 = b[property];
                return value1 > value2;
            }
        };
    }

    searchChange($event: MouseEvent) {
        this.getMenuList(1);
    }
}
