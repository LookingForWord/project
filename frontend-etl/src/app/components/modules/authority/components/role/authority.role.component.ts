/**
 * Created by LIHUA on 2017-10-17.
 *  权限管理 角色管理
 */
import {Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {AuthorityService} from 'app/services/authority.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {ActionTypeEnum, AuthorityRoleAddComponent} from 'app/components/modules/authority/components/role/add/authority.role.add.component';
import {AuthorityExportComponent} from 'app/components/modules/authority/components/export/authority.export.component';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {AuthorityObjectDataPermissionComponent} from "../object/data.permission/authority.object.data.permission.component";

@Component({
    selector: 'authority-role-component',
    templateUrl: './authority.role.component.html',
    styleUrls: ['./authority.role.component.scss']
})
export class AuthorityRoleComponent implements OnDestroy {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    keyWord: string;
    roles: any;
    token: any;

    roleId: any;          // 角色id
    pid: string;          // 上级ID
    roleName: string;     // 角色名称
    remark: string;       // 备注
    resourceIds: string;  // 权限ids
    oldResourceIds: string;
    resourceList = [];    // 角色权限集合
    userIds: string;      // 人员ids
    userList = [];        // 人员集合
    interList = [];       // 接口集合
    roleStatus: any;      // 角色状态
    state: string;       // 点击角色名时的
    portIds: string;      // 选中的接口的id的集合
    tab = 'menu';

    type = '';           //  目录列表
    departmentList = []; // 菜单权限树的数据集合
    staffList =  [];     // 人员权限树的数据集合
    menuIndex = 0;
    dsId: string;        // 数据源id
    systemId: string;    // 项目（系统id）
    portList = [];       // 接口树的数据集合
    dataAuthority = [];
    @ViewChild(AuthorityObjectDataPermissionComponent)
    premission: AuthorityObjectDataPermissionComponent;

    dataList: any;          // 新的数据权限

    unsubscribes = [];

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private httpService: HttpService,
                private cookieService: CookieService,
                private datatransferService: DatatransferService,
                private toolService: ToolService) {

        this.token = this.cookieService.get(Cookie.TOKEN);
        this.getRoles();

        // 树形目录选中点击返回相应的ids订阅
        let authorityRoleIdsSubjectSubscribe = this.datatransferService.authorityOrleIdsSubject.subscribe(data => {
            if (data.treeType === ActionTypeEnum.DEPARTMENT) {
                this.resourceIds = data.ids;
            } else if (data.treeType === ActionTypeEnum.STAFF) {
                this.userIds = data.ids;
            } else if (data.treeType === ActionTypeEnum.DATA) {
                this.dataAuthority = data.dataAuthority;
                // this.systemId = data.flow.parentId;
            } else if (data.treeType === ActionTypeEnum.PORT) {
                this.portIds = data.ids;
            }
        });
        this.unsubscribes.push(authorityRoleIdsSubjectSubscribe);
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
        }
    }

    /**
     * 权限的tab的点击事件
     * @param tab，为点中tab的类型
     */
    authorityTab(tab: any) {
        if (tab === this.tab) {
            return;
        }
        this.tab = tab;
        // 数据权限（树形）
        if (tab === 'data') {
            this.getDataList();
        }
    }

    /**
     * 新的树形数据权限使用
     * 获取数据权限项目list
     */
    async getDataList() {
        let d = await this.authorityService.getDataList();
        if (d.success) {
            let arr = [];
            d.message.forEach(item => {
                let obj = {
                    id: item.id,
                    name: item.systemName,
                    expand: true,
                    queryChild: true,
                    checked: false,
                    some: false,
                    children: []
                };
                item.metaDses.forEach(idx => {
                    obj.children.push({
                        parentId: item.id,
                        name: idx.dsName,
                        dataType: idx.dsType,
                        id: idx.dsId,
                        checked: false,
                        some: false,
                        expand: false,
                        queryChild: false,
                    });
                });
                arr.push(obj);
            });
            this.dataList = arr || [];
            console.log(this.dataList);
        } else {
            this.modalService.alert(d.message || d.data);
        }
    }


    /**
     * 获取用户列表
     */
    getRoles(pagenow?: number) {
        // 界面上每次搜索都需要把pagenow置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }

        this.authorityService.getRoles({
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
            // orderBy: 'role_name_desc',
            keyWord: this.keyWord
        }).then(d => {
            this.roles = [];

            if (d.status === ServiceStatusEnum.SUCCESS) {
                this.roles = d.data.list;
                this.totalcount = d.data.total;
            } else {
                this.modalService.alert(d.message);
            }

            // 判断有无数据
            this.noDataType = !this.roles.length;
        });
    }

    /**
     * 获取角色详情
     * @param id 角色id
     * @returns {Promise<void>}
     */
    async getRoleInfo(id) {
       let d = await  this.authorityService.getRoleInfo(id);

        if (d.status === ServiceStatusEnum.SUCCESS) {
            // this.roleStatusArray.forEach((value) => {
            //     if (value.value === d.data.status) {
            //         this.roleStatus = value;
            //     }
            // });
            // this.resourceList = d.data.resourceList;
            // this.userList = d.data.userList;
            // this.roleName = d.data.roleName;
            // this.initIds();
            return d.data;
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 新增数据源配置点击
     */
    newRole() {
        let [ins] = this.modalService.toolOpen({
            title: '创建角色',
            component: AuthorityRoleAddComponent,
            datas: {
                status : ActionTypeEnum.ADD
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);

        ins.hideInstance = () => {
            ins.destroy();
            this.getRoles();
        };
    }

    /**
     *初始化权限管理和人员配置的ids
     */
    initIds() {
        if ( this.resourceList) {
            let idLIst = [];
            this.resourceList.forEach( (check) => {
                idLIst.push(check.resourceId);
            });
            this.resourceIds = idLIst.join(',');
            this.oldResourceIds = idLIst.join(',');
        }
        if (this.userList) {
            let idList = [];
            this.userList.forEach( (check) => {
                idList.push(check.id);
            });
            this.userIds = idList.join(',');
        }
        if (this.interList) {
            let idList = [];
            this.interList.forEach( (check) => {
                idList.push(check.interId);
            });
            this.portIds = idList.join(',');
        }

    }

    /**
     * 获取所属部门
     */
    async getDepartment() {
        this.departmentList.length = 0;
        let d = await this.authorityService.getDepartmentTree(0);
        d.data.sort(this.compare('code'));

        d.data.forEach(item => {
            item.parentId = '0';
            this.departmentList.push(item);
        });

        this.toolService.treesTraverse(this.departmentList, {
            callback: (leaf: any) => {
                leaf.expand = false;
                leaf.checked = false;
                leaf.some = false;

                // 如果为查看详情和编辑详情时给权限配置赋值
                if (this.resourceList) {
                    // leaf.expand = true;
                    this.resourceList.forEach(depoment => {
                        if (leaf.id === depoment.resourceId) {
                            leaf.checked = true;
                        }
                    });
                }
            }
        });

        this.toolService.treesTraverse(this.departmentList, {
            callback: (leaf: any) => {
                if (leaf.children && leaf.children.length) {
                    let temp = leaf.children.filter(c => c.checked);
                    // 当子节点的type不等于2即不为按钮

                    if (leaf.children[0].type !== 2) {
                        if (temp.length === leaf.children.length) {
                            leaf.checked = true;
                        } else if (temp.length > 0) {
                            leaf.some = true;
                            leaf.checked = false;
                        }
                    }
                }
            }
        });
    }
    /**
     * 按code给侧边菜单菜单排序
     * @param property
     * @returns {(a, b) => number}
     */
    compare (property: any) {
        return function(a, b) {
            if (a[property].indexOf('f') !== -1 && b[property].indexOf('f') !== -1) {
                let value1 = a[property];
                let value2 = b[property];
                return value1 > value2;
            }
        };
    }

    /**
     * 获取接口权限的第一级
     */
    getSystems () {
        this.portList.length = 0;
        this.authorityService.getOwnSystem().then( async (d) => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                d.data && d.data.forEach(item => {
                    item.children = [];
                    item.expand =  false;
                    item.type = 0;
                    this.portList.push(item);
                });
                await this.initPort();
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 循环添加接口二级数据
     * @returns {Promise<void>}
     */
    async initPort() {
        if (this.portList && this.portList.length) {
            for (let i = 0; i < this.portList.length; i++) {
                let d = await this.authorityService.getPortList({systemId: this.portList[i].dimCode});
                if (d.status === 0) {
                    d.data.forEach( port => {
                        port.type = 1;
                        port.checked = false;
                        port.dimName = port.name;
                    });
                }
                this.portList[i].children = d.data;
            }
            if (this.portList) {
                this.toolService.treesTraverse(this.portList, {
                    callback: (leaf: any) => {
                        if (this.interList) {
                            this.interList.forEach(port => {
                                if (leaf.id === port.interId && (leaf.type === 1)) {
                                    leaf.checked = true;
                                }
                            });
                        }
                    }
                });
            }
        }

    }

    /**type等于1代表公司，等于2代表部门，等于0代表工作人员
     * 获取人员配置树
     */
    async getStaffs() {
        this.staffList.length = 0;
        let d = await this.authorityService.getStaffTree();

        d.data.forEach(item => item.parentId = '0');
        d.data.forEach(item => this.staffList.push(item));
        this.toolService.treesTraverse(this.staffList, {
            callback: (leaf: any) => {
                leaf.expand = !leaf.parentId;
                leaf.checked = false;
                leaf.some = false;
                // 如果为查看详情和编辑详情时给权限配置赋值
                if (this.userList) {
                    // leaf.expand = true;
                    this.userList.forEach(staff => {
                        if (leaf.id === staff.id && leaf.type === 0) {
                            leaf.checked = true;
                        }
                    });
                }
            }
        });

        this.toolService.treesTraverse(this.staffList, {
            callback: (leaf: any) => {
                if (leaf.children && leaf.children.length) {
                    let temp = leaf.children.filter(c => c.checked);

                    if (temp.length === leaf.children.length) {
                        leaf.checked = true;
                    } else if (temp.length > 0) {
                        leaf.some = true;
                        leaf.checked = false;
                    }

                }
            }
        });
    }


    /**
     *用户详情点击
     * @param id
     */
    async detailClick(id: any) {

        let data = await this.getRoleInfo(id);
        if (data) {
            let [ins] = this.modalService.open(AuthorityRoleAddComponent, {
                title: '查看角色详情',
                backdrop: 'static'
            });
            ins.roleID = id;
            ins.roleStatusArray.forEach((value) => {
                if (value.value === data.status) {
                    ins.roleStatus = value;
                }
            });
            ins.resourceList = data.resourceList;
            ins.userList = data.userList;
            ins.roleName = data.roleName;
            ins.status = ActionTypeEnum.INFO;
            ins.hideInstance = () => {
                ins.destroy();
            };
        }
    }

    /**
     * 编辑角色
     * @param id
     */
    async updateClick(id: any) {
        let data = await this.getRoleInfo(id);
        if (data) {
            let [ins] = this.modalService.toolOpen({
                title: '修改角色详情',
                component: AuthorityRoleAddComponent,
                datas: {
                    resourceList: data.resourceList,
                    userList: data.userList,
                    roleName: data.roleName,
                    roleID: id,
                    status: ActionTypeEnum.EDIT
                },
                okCallback: () => {
                    ins.saveClick();
                }
            } as ToolOpenOptions);

            ins.roleStatusArray.forEach((value) => {
                if (value.value === data.status) {
                    ins.roleStatus = value;
                }
            });

            ins.hideInstance = () => {
                ins.destroy();
                this.getRoles();
            };
        }
    }

    /**
     * 删除角色
     * @param id
     */
    deleteClick(id: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.authorityService.deleteRole({id: id}).then(d => {
                if (d.status === ServiceStatusEnum.SUCCESS) {
                    this.modalService.alert('删除成功');
                    this.roleId = '';
                    this.getRoles();
                } else {
                    this.modalService.alert('删除失败');
                }
            });
        });
    }

    /**
     * 导入点击
     */
    importRoles() {
        let [ins] = this.modalService.toolOpen({
            title: '导入角色',
            component: AuthorityExportComponent,
            datas: {
                type : 'import',
                model : 'role'
            },
            okCallback: () => {
                ins.saveImport();
            }
        } as ToolOpenOptions);

        ins.status = ActionTypeEnum.IMPORT;
        ins.hideInstance = () => {
            ins.destroy();
            this.getRoles();
        };
        ins.refreshList = () => {
            this.getRoles();
        };
    }

    /**
     * 导出点击
     */
    exportRoles() {
        let [ins] = this.modalService.toolOpen({
            title: '导出角色',
            component: AuthorityExportComponent,
            datas: {
                type : 'export',
                model : 'role',
                status: ActionTypeEnum.EXPORT
            },
            okCallback: () => {
                this.authorityService.getRoles({
                    pageNum: 1,
                    pageSize: this.pagesize ,
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
    }

    /**
     * 导出角色模板
     */
    exportRoleTemplate() {
        return this.httpService.getRealUrl(this.authorityService.exportRoleTemplateUrl) + `?token=${this.token}`;
    }

    /**
     * 角色名的点击事件
     * @param id,角色id
     */
   async roleNameClick(id: any) {
        if (this.roleId !== id) {
            this.datatransferService.authorityOrleIdsSubject.next({
                id: this.roleId,
            });
        }

        this.roleId = id;
        let data = await this.getRoleInfo(this.roleId);

        if (data) {
            this.roleId = data.id;
            this.resourceList = data.resourceList;
            this.userList = data.userList;
            this.interList = data.interList;
            this.state = data.status;
            this.roleName = data.roleName;
            setTimeout(() => {
                this.initIds();
            });
            setTimeout(async () => {
                await this.getDepartment();
                await this.getStaffs();
                this.getSystems ();
            });
        }
    }

    /**
     *  切换页码
     * @param page
     */
    doPageChange(page: number) {
        this.pagenow = page;
        this.getRoles();
    }

    /**
     * 保存权限
     */
    saveAuthorityClick() {
        let arr = this.premission ? this.premission.allPermissions : [];
        let dataList = [];
        let result = false;
        arr.forEach(first => {
            first.metaDses.forEach(second => {
                if (second.children && second.children) {
                    second.children.forEach(third => {
                       if (third.children && third.children.length) {
                           for (let i = 0; i < third.children.length; i++) {
                               if (third.children[i].rule && !third.children[i].inputValue) {
                                   third.children[i].errorType = 2;
                                   third.children[i].error = '请输入';
                                   result = true;
                                   return;
                               }
                               if (third.children[i].rule && third.children[i].rule.name === 'between') {
                                   if (third.children[i].inputValue.split(',').length !== 2) {
                                       third.children[i].errorType = 2;
                                       third.children[i].error = '范围值以逗号分隔';
                                       result = true;
                                       return;
                                   } else {
                                       let arr = third.children[i].inputValue.split(',');
                                       if (arr[0] > arr[1]) {
                                           third.children[i].errorType = 2;
                                           third.children[i].error = '范围值错误';
                                           result = true;
                                           return;
                                       }
                                   }
                               }
                           }
                       }
                    });
                }
            });
        });
        if (!result && arr.length) {
            arr.forEach(first => {
                first.metaDses.forEach(second => {
                    if (second.children && second.children) {
                        second.children.forEach(third => {
                            dataList.push({
                                roleId: this.roleId,                            // 角色id
                                objId: third.id,	                            // 数据对象id
                                objType: third.objType,                         // （1-表，2-字段，3-文件）
                                readRight: third.readChecked ? 1 : 0,           // 读或查询（1-有权限，0-无权限）
                                writeRight: third.writeChecked ? 1 : 0,	        // 写（或更新）权限 （1-有权限，0-无权限 ）
                                excuteRight: third.excuteChecked ? 1 : 0,	    // 执行权限 （1-有权限，0-无权限 ）
                                deleteRight: third.deleteChecked ? 1 : 0,       // 删除权限 （1-有权限，0-无权限 ）
                            });
                            if (third.children && third.children.length) {
                                for (let i = 0; i < third.children.length; i++) {
                                    dataList.push({
                                        roleId: this.roleId,    // 角色id
                                        objId: third.children[i].id,	// 数据对象id
                                        objParentId: third.children[i].parentId,                    // 数据对象父id
                                        objType: third.children[i].objType,                         // （1-表，2-字段，3-文件）
                                        readRight: third.children[i].readChecked ? 1 : 0,           // 读或查询（1-有权限，0-无权限）
                                        writeRight: third.children[i].writeChecked ? 1 : 0,	        // 写（或更新）权限 （1-有权限，0-无权限 ）
                                        excuteRight: third.children[i].excuteChecked ? 1 : 0,	    // 执行权限 （1-有权限，0-无权限 ）
                                        deleteRight: third.children[i].deleteChecked ? 1 : 0,       // 删除权限 （1-有权限，0-无权限 ）
                                        readRange: third.children[i].rule ? {[third.children[i].rule.name]: String(third.children[i].inputValue)} : null
                                    });
                                }
                            }
                        });
                    }
                });
            });
        } else if (result) {
            return;
        }

        // 菜单权限、接口权限、人员配置的添加
        this.authorityService.editRole({
            id: this.roleId,
            roleName: this.roleName,
            status: this.state,
            resourceIds: this.resourceIds,
            userIds: this.userIds,
            interIds: this.portIds
        }).then(d => {
            if (d.status === ServiceStatusEnum.SUCCESS) {
                // this.modalService.alert('保存成功');
                // 数据权限的添加
                this.authorityService.addDataAuthority(dataList).then(d => {
                    if (d.status === ServiceStatusEnum.SUCCESS) {
                        this.modalService.alert('保存成功');
                        let arr = JSON.parse(this.cookieService.get(Cookie.ROLES)).filter(item => {
                            return item.roleId === this.roleId;
                        });
                        if (arr && arr.length !== 0) {
                            setTimeout(() => {
                                location.reload();
                            }, 1000);
                        }
                    } else {
                        this.modalService.alert(d.message || d.msg || d.data || '保存失败');
                    }
                });
                // let arr = JSON.parse(this.cookieService.get(Cookie.ROLES)).filter(item => {
                //     return item.roleId === this.roleId;
                // });
                // if (arr && arr.length !== 0) {
                //     setTimeout(() => {
                //         location.reload();
                //     }, 1000);
                // }
            } else {
                this.modalService.alert(d.message || d.msg || '保存失败');
            }
        });

    }

    /**
     * 延时搜索
     * @param {MouseEvent} $event
     */
    searchChange($event: MouseEvent) {
        this.getRoles(1);
    }
}
