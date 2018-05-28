import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import 'rxjs/Rx';

import {AuthorityService} from 'app/services/authority.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'authority-object-data-permission-component',
    templateUrl: './authority.object.data.permission.component.html',
    styleUrls: ['./authority.object.data.permission.component.scss'],
})
export class AuthorityObjectDataPermissionComponent implements OnInit, OnDestroy {

    @Input()
    isUser = false;        // 是否是用户管理
    @Input()
    roleId: string;        // 角色id

    permissions = [];      // 数据权限属性结构
    allPermissions = [];    // 所有的数据

    searchPermission: any; // 搜索暂存对象
    unsubscribes = [];
    ruleList = [
        {name: '>', value: '>'},
        {name: '<', value: '<'},
        {name: '>=', value: '>='},
        {name: '<=', value: '<='},
        {name: '!=', value: '!='},
        {name: 'between', value: 'between'},
        {name: 'in', value: 'in'},
    ];                      // 范围规则集合


    constructor(private authorityService: AuthorityService,
                private toolService: ToolService,
                private datatransferService: DatatransferService,
                private modalService: ModalService) {
        // 树形目录选中点击返回相应的ids订阅
        let authorityRoleIdsSubjectSubscribe = this.datatransferService.authorityOrleIdsSubject.subscribe(data => {
            if (data) {
                this.permissions = [];
                this.getDataList();
            }
        });
        this.unsubscribes.push(authorityRoleIdsSubjectSubscribe);
    }

    ngOnInit() {
        this.getDataList();
    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
        }
    }

    /**
     * 下拉框选中
     * @param checked
     * @param type
     * @param item
     */
    chooseOption(checked: any, type: any, item: any) {
        if (type === 'rule' && item[type] !== checked) {
            item[type] = checked;
            item.inputValue = '';
        } else {
            item[type] = checked;
            item.inputValue = item.inputValue || '';
        }
    }

    /**
     * 添加查询范围
     * @param subPermission
     * @param permission
     * @param {number} objType
     * @param {string} right
     * @param {MouseEvent} $event
     */
    rangeClick(subPermission: any, permission: any, objType: number, right: string, $event: MouseEvent) {
        if (right === 'readRight') {
            subPermission.readChecked = !subPermission.readChecked;
        }
        if (permission.index === 4 && right === 'readRange') {
            let num = permission.permission.filter(p => p.readChecked),
                parent = this.permissions[2].permission.filter(p => p.selected)[0],
                parentChecked = parent.readChecked;
            // 子集全部选中 如果父级没选中就选中父级（自己取消选中 父级不管）
            if (!parentChecked && num[0].readChecked) {
                parent.readChecked = true;
            }
        }
    }

    /**
     * 添加规则
     */
    // addField() {
    // 功能待定
    // }
    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        let value = event.target['value'];
        let key = '';
        // 1 2 4 列直接是文本过滤
        if (this.toolService.contains(this.searchPermission.index, [1, 2, 4])) {
            switch (this.searchPermission.index) {
                case 1: key = 'systemName'; break;
                case 2: key = 'dsName'; break;
                // case 3: key = 'tableName'; break;
                case 4: key = 'fieldName'; break;
            }
            let arr = [];
            console.log(this.searchPermission , this.searchPermission.permission);
            this.searchPermission.permission.forEach(p => {
                p.show = p[key] && p[key].toLowerCase().indexOf(value) !== -1;
                p.selected = false;
                p.show && arr.push(p);
            });
            // 搜索后触发一次点击事件
            this.permissionTitleClick(this.permissions[this.searchPermission.index - 1], arr[0]);
        } else if (this.searchPermission.index === 3) {
            // 3列表需要动态查询 直接调用分页回调函数
            this.permissionIndex3DoPageChange(1, value);
        }
    }

    /**
     * 搜索焦点事件
     * @param permission
     */
    searchFocus(permission: any) {
        this.searchPermission = permission;
    }

    /**
     * 获取前两列数据
     */
    getDataList() {
        this.authorityService.getDataList().then(d => {
            if (d.success) {
                d.message.forEach(m => {
                    m.checked = false;
                    m.selected = false;
                });
                this.permissions.push({
                    index: 1,
                    permission: d.message
                });
                this.allPermissions = JSON.parse(JSON.stringify(d.message));
                // 默认点击出现第二列
                this.permissionTitleClick(this.permissions[0], d.message[0]);
            } else {
                this.modalService.alert(d.message, {auto: true});
            }
        });
    }

    /**
     * 单元项点击
     * @param permission  当前单元项
     * @param subPermission
     */
    permissionTitleClick(permission: any, subPermission: any) {
        // 点击的第1列
        if (permission.index === 1 && !subPermission.selected && subPermission.metaDses && subPermission.metaDses.length) {
            subPermission.metaDses.forEach(p => {
                p.checked = false;
                p.selected = false;
            });
            // 先清空从第二层级的值
            while (this.permissions.length > 1) {
                this.permissions.pop();
            }
            this.permissions.push({
                index: 2,
                permission: subPermission.metaDses
            });
            permission.permission.forEach(p => {
                p.selected = false;
            });
            subPermission.selected = true;
            // 默认点击出现第三列
            this.permissionTitleClick(this.permissions[1], this.permissions[1].permission[0]);
        }

        // 点击的第2列
        if (permission.index === 2 && subPermission && !subPermission.selected) {
            let temp = {
                index: 3,
                permission: null,
                pageNow: 1,
                pageSize: 10,
                totalCount: 0,
                dsId: subPermission.dsId
            };
            this.getSearchData(temp, () => {
                permission.permission.forEach(p => {
                    p.selected = false;
                });
                subPermission.selected = true;
                temp.permission.forEach(p => {
                    p.readChecked = false;
                    p.writeChecked = false;
                    p.deleteChecked = false;
                    p.excuteChecked = false;
                });

                // 获取原始数据权限
                this.isUser && temp.permission.length && this.getSearchDataAuthority(1, temp.permission.map(p => p.id), (data) => {
                    data.forEach(item => {
                        temp.permission.forEach(p => {
                            if (item.objId === p.id) {
                                p.readChecked = item.readRight === 1;
                                p.writeChecked = item.writeRight === 1;
                                p.deleteChecked = item.deleteRight === 1;
                                p.excuteChecked = item.excuteRight === 1;
                            }
                        });
                    });
                });

                // this.isUser && temp.permission.length && this.getSearchDataAuthorityByParentId(subPermission.dsId, (data) => {
                //      console.log(data);
                // });
                // 默认点击出现第四列
                if (temp.permission.length) {
                    this.permissionTitleClick(temp, temp.permission[0]);
                }

            });
        }

        // 点击的第3列
        if (permission.index === 3 && !subPermission.selected) {
            if (subPermission.children && subPermission.children.length) {
                subPermission.children.forEach(f => {
                    f.checked = f.rightSign === 1;
                    f.selected = false;
                    f.readChecked = false; // 字段查询权限
                    f.writeChecked = false;
                    f.deleteChecked = false;
                    f.excuteChecked = false;
                });
                while (this.permissions.length > 3) {
                    this.permissions.pop();
                }
                this.permissions.push({
                    index: 4,
                    permission: subPermission.children
                });
                permission.permission.forEach(p => {
                    p.selected = false;
                });
                subPermission.selected = true;
                // 获取原始数据权限
                this.isUser && this.getSearchDataAuthority(2, subPermission.children.map(f => f.id), (data) => {
                    data.forEach(item => {
                        // 目前只有单行
                        let rule = null, inputValue = '';
                        if (item.readRange && item.readRange.indexOf(':') !== -1) {
                            let obj = JSON.parse(item.readRange);
                            let ruleNames = Object.keys(obj);
                            this.ruleList.forEach(n => {
                               if (n.value === ruleNames[0]) {
                                    rule = n;
                               }
                            });
                            inputValue = ruleNames && ruleNames.length ? obj[`${ruleNames[0]}`] : '';
                        }
                        subPermission.children.forEach(p => {
                            if (item.objId === p.id) {
                                p.readChecked = item.readRight === 1;
                                p.writeChecked = item.writeRight === 1;
                                p.deleteChecked = item.deleteRight === 1;
                                p.excuteChecked = item.excuteRight === 1;
                                p.rule = rule || null;
                                p.inputValue = inputValue || '';
                            }
                        });
                    });
                });
            }
        }
    }

    /**
     * 查询第三级数据
     * @param temp
     * @param {Function} callback
     */
    getSearchData(temp: any, callback?: Function) {
        this.authorityService.searchData({
            dsId: temp.dsId,
            pageNum: temp.pageNow,
            pageSize: temp.pageSize,
            objName: temp.tableName,
            rightSign: this.isUser ? 1 : null // 用户管理模块只查询纳入权限的数据
        }).then(d => {
            if (d.success) {
                temp.totalCount = d.message.totalElements;
                if (d.message.content && d.message.content) {
                    d.message.content.forEach(c => {
                        c.checked = c.rightSign === 1; // 初始化的时候看是否被授予权限管理
                        c.selected = false;
                        if (c.children && c.children.length) {
                            c.children.forEach(idx => {
                                idx.parentId = c.id;
                                idx.inputValue = '';
                                idx.rule = null;
                            });
                        }
                    });
                    temp.permission = d.message.content || [];

                    while (this.permissions.length > 2) {
                        this.permissions.pop();
                    }
                    this.permissions.push(temp);

                    this.findSecondItem(this.allPermissions, temp);
                }
                callback && callback();
            }
        });
    }

    /**
     * 从所有数据中找到指定项
     */
    findSecondItem(list: any, item: any) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].metaDses && list[i].metaDses.length) {
                for (let n = 0; n < list[i].metaDses.length; n++) {
                    if (list[i].metaDses[n].dsId === item.dsId) {
                        if (list[i].metaDses[n].children) {
                            let result = false;
                            list[i].metaDses[n].children.forEach(idx => {
                               item.permission.forEach(k => {
                                   if (idx.id === k.id) {
                                       idx = k;
                                       result = true;
                                   }
                               });
                            });
                            !result && list[i].metaDses[n].children.concat(item.permission);
                        } else {
                            list[i].metaDses[n].children = item.permission;
                        }
                    }
                }
            }
        }
    }

    /**
     * 查询数据权限
     * @param objType
     * @param objIds
     * @param {Function} callback
     */
    getSearchDataAuthority(objType: any, objIds: any, callback: Function) {
        this.authorityService.searchDataAuthority({
            objType: '',
            objIds,
            roleId: this.roleId
        }).then(d => {
            if (d.status === 0 && d.data ) {
                // 数据权限还原
                callback(d.data);
            } else {
                this.modalService.alert(d.msg);
            }
        });
    }

    /**
     * 查询数据权限
     * @param objType
     * @param objIds
     * @param {Function} callback
     */
    getSearchDataAuthorityByParentId(objParentId, callback: Function) {
        this.authorityService.searchDataAuthority({
            objParentId,
            roleId: this.roleId
        }).then(d => {
            if (d.status === 0 && d.data ) {
                // 数据权限还原
                callback(d.data);
            } else {
                this.modalService.alert(d.msg);
            }
        });
    }

    /**
     * 新增或者修改数据权限
     * @param params
     */
    getAddDataAuthority(params: any) {
        this.authorityService.addDataAuthority(params)
            .then(d => {
                if (d.status !== 0) {
                    this.modalService.alert(d.msg);
                }
            });
    }

    /**
     * 数据选中
     * @param subPermission
     * @param permission
     * @param {MouseEvent} $event
     */
    permissionCheckedClick(subPermission: any, permission: any, $event: MouseEvent) {
        subPermission.checked = !subPermission.checked;
        if (permission.index === 3) {
            setTimeout(() => {
                if (subPermission.objType === 1) { // 表 点击
                    this.permissions[3].permission.forEach(p => {
                        p.checked = subPermission.checked;
                    });

                    if (subPermission.checked) {
                        // 全选
                        this.permissionAddData(1, [subPermission.id]);
                        this.permissionAddData(2, this.permissions[3].permission.map(p => p.id));
                    } else {
                        // 全删除
                        this.permissionDeleteData(1, [subPermission.id]);
                        this.permissionDeleteData(2, this.permissions[3].permission.map(p => p.id));
                    }
                } else if (subPermission.objType === 3) { // 文件 点击
                    if (subPermission.checked) {
                        // 全选
                        this.permissionAddData(3, [subPermission.id]);
                    } else {
                        // 全删除
                        this.permissionDeleteData(3, [subPermission.id]);
                    }
                }
            });
        }
        if (permission.index === 4) {
            if (subPermission.checked) {
                // 自身选中
                this.permissionAddData(2, [subPermission.id]);
            } else {
                // 自身取消选中
                this.permissionDeleteData(2, [subPermission.id]);
            }

            let num = permission.permission.filter(p => p.checked),
                parent = this.permissions[2].permission.filter(p => p.selected)[0],
                parentChecked = num.length === permission.permission.length;

            // 子集全部选中 如果父级没选中就选中父级（自己取消选中 父级不管）
            if (parentChecked && parent.checked !== parentChecked) {
                parent.checked = true;
                this.permissionAddData(1, [parent.id]);
            }

        }
    }

    /**
     * 查询 修改 删除等用户权限选中切换
     * @param subPermission
     * @param permission
     * @param {number} objType    1 表， 2 字段， 3 文件
     * @param {string} right      readRight 读， writeRight 写， deleteRight 删除
     * @param {MouseEvent} $event
     */
    permissionUserCheckedClick(subPermission: any, permission: any, objType: number, right: string, $event: MouseEvent) {
        if (!subPermission.selected && permission.index === 3) {
            return;
        }
        if (right === 'readRight') {
            subPermission.readChecked = !subPermission.readChecked;
        }
        if (right === 'writeRight') {
            subPermission.writeChecked = !subPermission.writeChecked;
        }
        if (right === 'deleteRight') {
            subPermission.deleteChecked = !subPermission.deleteChecked;
        }
        if (right === 'excuteRight') {
            subPermission.excuteChecked = !subPermission.excuteChecked;
        }
        // 第三列查询联动第四列，需要添加查询范围，所以注释掉，需要时可注释回来
        if (permission.index === 3 ) {
            setTimeout(() => {
                if (subPermission.objType === 1) { // 表点击
                    this.permissions[3].permission.forEach(p => {
                        switch (right) {
                            case 'readRight': p.readChecked = subPermission.readChecked; break;
                            case 'writeRight': p.writeChecked = subPermission.writeChecked; break;
                            case 'deleteRight': p.deleteChecked = subPermission.deleteChecked; break;
                            case 'excuteRight': p.excuteChecked = p.excuteChecked; break;
                        }
                    });
                    if (subPermission.readChecked || subPermission.writeChecked || subPermission.deleteChecked || subPermission.excuteChecked) {
                        // 全选
                        this.permissions[3].permission.map(p => p.id);
                    } else {
                        // 全删除
                        this.permissions[3].permission.map(p => p.id);
                    }
                } else if (subPermission.objType === 3) { // 文件点击

                }
            });
        }
        if (permission.index === 4 ) {
            // 读
            let parent = this.permissions[2].permission.filter(p => p.selected)[0];
            let num = permission.permission.filter(p => {
                    if (right === 'readRight') {
                        return p.readChecked;
                    } else if (right === 'writeRight') {
                        return p.writeChecked;
                    } else if (right === 'deleteRight') {
                        return p.deleteChecked;
                    } else if (right === 'excuteRight') {
                        return p.excuteChecked;
                    }
                });
            // 子集全部选中 如果父级没选中就选中父级（自己取消选中 父级不管）
            if (!parent.readChecked && num[0].readChecked && right === 'readRight') {
                parent.readChecked = true;
            } else if (!parent.writeChecked && num[0].writeChecked && right === 'writeRight') {
                parent.writeChecked = true;
            } else if (!parent.deleteChecked && num[0].deleteChecked && right === 'deleteRight') {
                parent.deleteChecked = true;
            } else if (!parent.excuteChecked && num[0].excuteChecked && right === 'excuteRight') {
                parent.excuteChecked = true;
            }
        }
    }

    /**
     * 表分页点击回调 也可以作为搜索查询
     * @param {number} page
     * @param {string} tableName 搜索的时候会传表名
     */
    permissionIndex3DoPageChange(page: number, tableName?: string) {
        let temp = this.permissions[2];
        temp.pageNow = page;
        temp.tableName = tableName;
        this.getSearchData(temp, () => {
            temp.permission.forEach(p => {
                p.readChecked = false;
                p.writeChecked = false;
                p.deleteChecked = false;
                p.excuteChecked = false;
            });
            let newArr = temp.permission.map(p => p.id);
            newArr = (tableName && !newArr.length) ? [''] : newArr;
             // 获取原始数据权限
            this.getSearchDataAuthority(1, newArr, (data) => {
                data.forEach(item => {
                    temp.permission.forEach(p => {
                        if (item.objId === p.id) {
                            p.readChecked = item.readRight === 1;
                            p.writeChecked = item.writeRight === 1;
                            p.deleteChecked = item.deleteRight === 1;
                            p.excuteChecked = item.excuteRight === 1;
                        }
                    });
                });
            });
        });
    }

    /**
     * 添加数据对象
     * @param objType
     * @param objIds
     */
    permissionAddData(objType: any, objIds: any) {
        this.authorityService.addData({
            objType,
            objIds
        }).then(d => {
            if (d.success) {
                let elm = document.getElementsByTagName('modal-alert-component')[0];
                elm && elm.parentNode.removeChild(elm);
                this.modalService.alert(d.message, {time: 1500});
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 删除数据对象
     * @param objType
     * @param objIds
     */
    permissionDeleteData(objType: any, objIds: any) {
        this.authorityService.deleteData({
            objType,
            objIds
        }).then(d => {
            if (d.success) {
                let elm = document.getElementsByTagName('modal-alert-component')[0];
                elm && elm.parentNode.removeChild(elm);
                this.modalService.alert(d.message, {time: 1500});
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

}
