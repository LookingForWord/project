//
// import {Component, OnDestroy} from '@angular/core';
// import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
// import {DatatransferService} from 'app/services/datatransfer.service';
// import {SystemService} from 'app/services/system.service';
// import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
// import {AuthorityService} from 'app/services/authority.service';
//
// @Component({
//     selector: 'authority-object-data-component',
//     templateUrl: './authority.object.data.component.html',
//     styleUrls: ['./authority.object.data.component.scss']
// })
// export class AuthorityObjectDataComponent implements   OnDestroy {
//     pid = 0;           // 目录列表父级id
//     type = 'menulist'; // menulist 目录列表
//     menuList = [];     // 目录列表
//     menuIndex = 0;     // 目录的层级
//     unsubscribes = []; // 订阅钩子函数集合
//     knowledgeID: any;  // 知识id
//
//     constructor(private modalService: ModalService,
//                 private userService: SystemService,
//                 private datatransferService: DatatransferService,
//                 private toolService: ToolService,
//                 private authorityService: AuthorityService) {
//
//         // 树形目录选中点击订阅
//         let systemKnowledgeSubjectSubscribe = this.datatransferService.systemKnowledgeTreeCheckedSubject.subscribe(data => {
//             if (data.type === 'menulist') {
//                 this.onCheckedEvent(data.flow);
//             }
//         });
//         this.unsubscribes.push(systemKnowledgeSubjectSubscribe);
//         // 刷新目录树
//         let addKnowledgeSubjectSubscribe = this.datatransferService.addKnowledgeSubject.subscribe( projectId => {
//             if (projectId !== 'menu') {
//                 this.knowledgeID = projectId;
//             } else {
//                 this.knowledgeID = '';
//                 this.datatransferService.addKnowledgesTreeCheckedSubject.next({
//                     id: '',
//                     createUser: '',
//                     addType: 'newMenu'
//                 });
//             }
//             this.getMenuList();
//             this.getList();
//         });
//         this.unsubscribes.push(addKnowledgeSubjectSubscribe);
//         // 获取全部目录
//         this.getMenuList();
//         this.getList();
//     }
//
//     ngOnDestroy() {
//         if (this.unsubscribes.length) {
//             this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
//             this.unsubscribes.length = 0;
//         }
//     }
//
//     getList() {
//         this.authorityService.getDataList().then(d => {
//            console.log(d);
//             if (d.success) {
//                 this.initLists(d.message);
//                 this.checkedClick(this.menuList[0]);
//             } else {
//                 this.modalService.alert(d.message);
//             }
//         });
//     }
//
//     /**
//      * 获取目录列表
//      */
//     getMenuList() {
//         this.userService.getMenus({pid: 0}).then(d => {
//             if (d.success) {
//                 this.initLists(d.message);
//                 this.checkedClick(this.menuList[0]);
//             } else {
//                 this.modalService.alert(d.message);
//             }
//         });
//     }
//
//     /**
//      * 点击事件展开目录并请求数据
//      * @param flow
//      * @param {MouseEvent} $event
//      */
//     checkedClick(flow, $event?: MouseEvent) {
//         this.userService.getMenus({pid: flow.id}).then(d => {
//             if (d.success) {
//                 flow.children = [];
//                 d.message.forEach(item => {
//                     if (this.type === 'addmenu') {
//                         if (!item.flowId) {
//                             flow.children.push({
//                                 checked: false,
//                                 expand: false,
//                                 type: this.type,
//                                 ...item
//                             });
//                         }
//                     } else {
//                         flow.children.push({
//                             checked: false,
//                             expand: false,
//                             type: this.type,
//                             ...item
//                         });
//                     }
//                 });
//             }
//         });
//         $event && $event.stopPropagation();
//     }
//     /**
//      * 初始化目录数据
//      * @param data
//      * @returns {Array}
//      */
//     initLists(data) {
//         this.menuList.length = 0;
//         // 这里采用公共方法初始化数据，callback会回调每一个节点 便于初始化节点数据    toolService中方法有问题   数据没展示完全
//         this.toolService.treesInit(data, {
//             callback: (leaf) => {
//                 if (leaf.level  < 2 ? true : false) {
//                     leaf.expand = true;
//                 }
//                 leaf.checked = false;
//                 if (leaf.id === this.knowledgeID) {
//                     leaf.checked = true;
//                     this.datatransferService.addKnowledgesTreeCheckedSubject.next({
//                         id: leaf.id,
//                         createUser: leaf.createUser,
//                         addType: 'newButton'
//                     });
//                 }
//             },
//             container: this.menuList
//         });
//     }
//
//     /**
//      * 目录选中点击
//      * @param flow
//      */
//     onCheckedEvent(flow) {
//         // 这里采用公共方法遍历数据，callback会回调每一个节点 便于节点数据处理
//         this.toolService.treesTraverse(this.menuList, {
//             callback: (leaf: any) => {
//                 leaf.checked = false;
//             }
//         });
//         flow.checked = !flow.checked;
//     }
// }
/**
 * Created by LIHUA on 2017-10-19.
 *  权限管理 对象管理 菜单管理
 */
import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {Cookie} from 'app/constants/cookie';
import {AuthorityService} from 'app/services/authority.service';

import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'authority-object-data-component',
    templateUrl: './authority.object.data.component.html',
    styleUrls: ['./authority.object.data.component.scss']
})
export class AuthorityObjectDataComponent implements OnInit {
    list = [];
    pagenow = 1;            // 当前页码
    pagesize = 10;          // 每页显示数据数
    totalcount = 0;         // 总数据数
    keyWord: any;           // 搜索关键字
    noDataType = false;     // 无数据
    menuList = [];
    token: any;

    constructor(private modalService: ModalService,
                private authorityService: AuthorityService,
                private datatransferService: DatatransferService,
                private cookieService: CookieService,
                private loginService: LoginService
    ) {
        this.token = this.cookieService.get(Cookie.TOKEN);
        this.datatransferService.refreshObjectTree.subscribe(data => {
            if (data === 'refreshTree') {
                this.getMenuTree();
            }
        });
    }

    ngOnInit() {
        this.getMenuTree();
    }

    /**
     * 获取树形结构
     */
    async getMenuTree() {
        let systemlist = await this.authorityService.getDataList();
        systemlist = systemlist.message;
        this.authorityService.getDataList().then(d => {
            if (d.success) {
                systemlist.forEach(sys => {
                    console.log(sys);
                    sys.children = [];
                    sys.index = 0;
                    sys.status = 0;
                    sys.expand = true;
                    sys.type = 'system';
                    d.message.forEach(item => {
                        if ((sys.id === item.id) && item.dsId) {
                            sys.metaDses.push(item);
                        }
                    });
                });
                this.menuList = JSON.parse(JSON.stringify(this.restructData(systemlist, 0)));
                console.log(this.menuList);
            } else {
                this.modalService.alert(d.message || d.msg);
            }
        });
    }

    /**
     * 遍历
     */
    restructData(data, index, parentId?: any) {
        let arr = data; // 数据暂存
        let i = index;  // 层级
        arr.map(item => {
            item.expand = (i < 1 ? true : false);
            item.index = i;
            item.checked = true;
            item.parentId = parentId;
            let temp = item.metaDses;

            item.children = temp;
            if (item.children && item.children.length > 0) {
                this.restructData(item.children, i + 1, item.id);
            }
        });
        // 返回新的arr
        return arr;
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
}
