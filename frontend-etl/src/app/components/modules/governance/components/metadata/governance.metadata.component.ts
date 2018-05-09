/**
 * Created by xxy on 2017-11-22.
 *  数据治理 元数据管理
 */
import {Component, OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {GovernanceMetadataAsideAddComponent} from 'app/components/modules/governance/components/metadata/aside/add/governance.metadata.aside.add.component';

export const ActionTypeEnum = {
    INFO: 'infoRule',         // 查看规则详情
    ADDSQL: 'addSQL',          // SQL建表
    ADDVISUAL: 'addVisual',    // 可视化建表
    EDIT: 'editTable',         // 编辑表格
    RULECHECK: 'ruleCheck',    // 规则检测
    RULELIST: 'ruleList',      // 规则列表
    CREATESQL: 'createSQL',    // 生成SQL
    IMPACT: 'impact',          // 影响分析
    SOURCE: 'source',          // 来源分析

    // 树的类型
    CATALOGLIST: 'CatalogList',  // 数据表文件夹目录
    ADDCATALOG: 'addCatalog',   // 新建规则库
    EDITCATALOG: 'editCatalog', // 编辑规则库
    RULECATALOG: 'ruleCatalog'  // 规则目录
};

@Component({
    selector: 'governance-metadata-component',
    templateUrl: './governance.metadata.component.html',
    styleUrls: ['./governance.metadata.component.scss']
})

export class GovernanceMetadataComponent implements OnDestroy, OnInit, AfterViewInit {

    title: string;              // 弹窗的标题
    status: string;             // 弹窗的类型
    rightType =  'tableList';   // 页面右边的类型
    tableName: string;          // 表格名称
    rule: any;                  // 规则
    tabType = 'tag';            // tag为标签，folder为文件夹
    tags: any;                  // 所有标签
    initTags: any;                  // 所有标签
    isAll = true;               // 是否为搜索全部
    dirId = [];                 // 目录id
    dsId =  [];                  // 数据源id
    labelList = [];             // 标签id的集合
    noLabel = null;                // 选中没有为分配的标签传的值 null为没有选中，1为选中
    noDir = null;                  // 选中没有为分配的目录传的值 null为没有选中，1为选中

    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = false;
    keyWord:  string;
    sourceName: any;
    initSourceName: any;
    sourceNames = [];
    tableId: any;           // 表id (来源分析用)
    checkedTableName: any;  // 选择的表名(来源分析用)

    sqlLanguage: string;
    unsubscribes = [];

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private datatransferService: DatatransferService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            if (!params.meta) {
                sessionStorage.removeItem('meta');
            }
            if (params.page && !location.hash) {
                this.pageNum = Number(params.page);
                window.location.hash = String(params.page);
            } else if (window.location.hash && window.location.hash !== '#') {
                this.pageNum = Number(window.location.hash.slice(1, ));
            }
        });
        let obj = sessionStorage.getItem('meta') ? JSON.parse(sessionStorage.getItem('meta')) : '';
        if (obj) {
            this.keyWord = obj.keyWord;
        }

        // 树形目录选中点击订阅
        let checkedSubjectSubscribe = this.datatransferService.taskTreeCheckedSubject.subscribe(data => {
            // 注意未分配的话 有个特殊的type和id    取其一判断,值均为  'undistributedCata'
            if (data.type === 'tableManage') {
                // 做进一步操作
                this.pageNum = 1;
                if (data.flow.parentId === '0') {
                    this.dirId = null;
                    if (data.flow.type === 'undistributedCata') {
                        this.isAll = false;
                        this.noDir = 1;
                    } else {
                        this.isAll = true;
                        this.noDir = null;
                    }
                }  else {
                    this.noDir = null;
                    this.dirId = [data.flow.id];
                    this.isAll = false;
                }
                this.getTableList();
                if (window.location.hash && window.location.hash !== '#') {
                    window.location.hash = String(this.pageNum);
                }
            }
        });
        this.unsubscribes.push(checkedSubjectSubscribe);
    }

    async ngOnInit() {
        this.getTags();
        this.getSources();
        setTimeout( () => {

        });
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        if (this.unsubscribes.length) {
            this.unsubscribes.forEach(unsubscribe => unsubscribe.unsubscribe());
            this.unsubscribes.length = 0;
        }
    }

    /**
     * 获取所有标签列表
     */
    getTags() {
        this.governanceService.getMetaLabel().then( d => {
            if (d.success) {
               this.tags = d.message ;
               if (this.tags) {
                   this.tags.forEach( item => {
                       item.checked = false;
                   });
               }
               this.initTags = JSON.stringify(this.tags);
               this.tags.splice(0, 0 , {
                   createTime: 1512438083000,
                   createUser: '\ufffd\ufffd\ufffd\ufffdԱ',
                   creatorId: '297e84f25dc4bd8e015dc4bedebc0000',
                   deletedState: false,
                   description: '321321',
                   id: '0',
                   name: '全部标签',
                   checked: true
               });
                this.tags.splice(1, 0 , {
                    createTime: 1512438083000,
                    createUser: '\ufffd\ufffd\ufffd\ufffdԱ',
                    creatorId: '297e84f25dc4bd8e015dc4bedebc0000',
                    deletedState: false,
                    description: '321321',
                    id: 'undistributedTags',
                    name: '未分配',
                    checked: false
                });
            } else  {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 获取所以数据源列表
     */
    async getSources() {
        let d = await this.governanceService.getAllSource();
       if (d.success) {
           this.sourceNames = d.message;
           this.initSourceName = JSON.stringify(d.message);
           this.sourceNames.splice(0, 0 , {
               dsName: '全部数据源',
               id: 0
           });
           let obj = sessionStorage.getItem('meta') ? JSON.parse(sessionStorage.getItem('meta')) : '';
           if (obj) {
               this.sourceName = obj.sourceName;
           } else {
               this.sourceName = this.sourceNames[0];
           }

           this.dsId = [this.sourceName.id];
           this.getTableList();
       }
    }

    /**
     * 获取表格列表数据
     * @param dirId
     * @param dsId
     * @param labelList
     * @param noLabel
     * @param noDir
     * @returns {Promise<any>}
     */
    async gettable(dirId?, dsId?, labelList?, noLabel?, noDir?) {
       let data = await this.governanceService.getmetaTableByTag(
           {
               pageNum: this.pageNum,
               pageSize: this.pageSize,
               directoryList: dirId,
               datasourceList: dsId,
               labelList: labelList,
               noLabel: noLabel,
               noDir: noDir,
               keywords: this.keyWord || '',
           });
       return data;
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        sessionStorage.setItem('meta', '');
        this.keyWord = this.keyWord.replace(/\s/g, '');
        this.getTableList(0);
    }
    /**
     * 获取所有元数据
     */
    async getTableList(type?: number) {
        if (type === 0) {
            this.pageNum = 1;
        }
        if (this.sourceName && this.sourceName['id'] === 0) {
            this.dsId = null;
        }
        // 当选中全部标签和选中根目录时获取全部数据
        if (this.isAll) {
            let d = await this.gettable(null, this.dsId, null, null, null);
            if (d['success'] ) {
                this.list = d['message'].items;
                this.totalcount = d['message'].totalCount;
                this.noData = this.list.length <= 0 ? true : false;
            } else {
                this.modalService.alert(d['message'] || d['msg']);
            }
        } else {
            // 当没有点击全部标签且tabType为tag标签时
            if (this.tabType === 'tag') {
                let d = await this.gettable(null, this.dsId, this.labelList, this.noLabel, null);
                if (d['success'] ) {
                    this.list = d['message'].items;
                    this.totalcount = d['message'].totalCount;
                    this.noData = this.list.length <= 0 ? true : false;
                } else {
                    this.modalService.alert(d['message'] || d['msg']);
                }
            } else if (this.tabType === 'folder') {
                // 当没有点击根目录且tabType为folder文件夹时
                let d = await this.gettable(this.dirId, this.dsId, null, null, this.noDir);
                if (d['success'] ) {
                    this.list = d['message'].items;
                    this.totalcount = d['message'].totalCount;
                    this.noData = this.list.length <= 0 ? true : false;
                } else {
                    this.modalService.alert(d['message'] || d['msg']);
                }
            }
        }
    }

    /**
     * sql建表 和可视化建表
     */
    newTable(type) {
        if (type === ActionTypeEnum.ADDVISUAL) {
            this.title = '可视化建表';
            this.status = ActionTypeEnum.ADDVISUAL;
        } else if (type === ActionTypeEnum.ADDSQL) {
            this.title = 'SQL建表';
            this.status = ActionTypeEnum.ADDSQL;
        }
        let [ins] = this.modalService.toolOpen({
            title: this.title,
            component: GovernanceMetadataAsideAddComponent,
            datas: {
                status: this.status,
                dataSourceNames: [],
                tagArrary: this.initTags ? JSON.parse(this.initTags) : [],
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
            this.getTableList(0);
        };
    }

    /**
     * 返回表格列表页
     */
    back () {
        this.rightType = 'tableList';
    }

    /**
     * 管理表格    编辑操作
     * @param item
     * @param type
     */
    manageClick(item?: any, type?: any) {
        this.rightType = 'tableList';
        if (type === ActionTypeEnum.EDIT) { // 编辑表格
            this.title = '表详情';
            this.status = type;

            let [ins] = this.modalService.toolOpen({
                title: this.title,
                component: GovernanceMetadataAsideAddComponent,
                datas: {
                    editId: item.id,
                    status: this.status,
                    tagArrary: JSON.parse(this.initTags),
                    dataSourceNames: [],
                    dsType: item.dsType,
                    sourceType: item.dsType,
                },
                okCallback: () => {
                    ins.saveClick();
                }
            } as ToolOpenOptions);

            ins.hideInstance = () => {
                ins.destroy();
                this.getTableList();
            };
        }  else if (type === ActionTypeEnum.CREATESQL) { // 生成SQL
            this.title = '生成SQL';
            this.status = type;
            this.governanceService.CreateSql(item.id)
                .then(d => {
                    if (d.success) {
                        let [ins] = this.modalService.open(GovernanceMetadataAsideAddComponent, {
                            title: this.title,
                            backdrop: 'static'
                        });
                        ins.editId = item.id;
                        ins.sqlLanguage = d.message.sql;
                        ins.status = this.status;
                    }
                });
        } else if (type === ActionTypeEnum.IMPACT) { // 影响分析
            this.title = item.tableName ? `${item.tableName}影响的表` : '影响的表';
            this.status = type;
            let [ins] = this.modalService.open(GovernanceMetadataAsideAddComponent, {
                title: this.title,
                backdrop: 'static'
            });
            ins.editId = item.id;
            ins.status = this.status;
        }
    }

    /**
     * 删除表
     * @param id
     */
    deleteClick(id) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteTable({id: id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getTableList(0);
                } else {
                    this.modalService.alert('删除失败');
                }
            });
        });
    }

    /**
     * 数据源切换
     * @param type
     */
    sourceNameChecked(type: any) {
        if (this.sourceName.id !== type.id ) {
            sessionStorage.setItem('meta', '');
            this.pageNum = 1;
            window.location.hash = '1';
            this.sourceName = type;
            this.dsId = [this.sourceName.id];
            this.getTableList();
        }
    }

    /**
     *
     * @param item
     */
    sourceAnalysis(item) {
        this.tableId = item.id;
        this.checkedTableName = item.tableName;
        this.rightType = 'sourceAnalysis';
    }

    /**
     * 类型切换
     * @param {string} type
     */
    tabClick(type: string) {
        if (type !== this.tabType) {
            this.tabType = type;
            this.isAll = true;
            // 还原标签的选中状态
            if (!this.tags) {
                return;
            }
            this.tags.forEach( item => {
                item.checked = false;
            });
        }
    }

    /**
     * 标签的选中事件
     * @param id 选中的标签的id
     */
    tabCheck(id) {
        this.isAll = false;
        this.labelList = [];
        this.pageNum = 1;
        if (this.tags) {
            this.tags.forEach( tag => {
                if (id === '0') {
                    // 当选中的是全部时去除其他标签的选中
                    tag.checked = false;
                    if (tag.id === id) {
                        tag.checked = !tag.checked ;
                    }
                } else {
                    // 当选中的不是全部时去除全部的选中
                    this.tags[0].checked = false;
                    if (tag.id === id) {
                        tag.checked = !tag.checked ;
                    }
                }
                if (tag.checked) {
                    if (tag.id === 'undistributedTags') {
                        this.noLabel = 1;
                    } else {
                        this.labelList.push(tag.id);
                    }
                }
                if (!this.tags[1].checked) {
                    this.noLabel = null;
                }
            });
        }
        if ((id === '0' && this.tags[0].checked) || this.tags[0].checked) {
            this.isAll = true;
            this.labelList = null;
        }
        this.getTableList();
    }

    /**
     * 分页点击事件
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        window.location.hash = String(obj.page);
        this.getTableList();
    }

    /**
     * 跳转到表分析页面
     */
    turnToTableAnalysis(item: any) {
        if (this.keyWord || this.sourceName) {
            sessionStorage.setItem('meta', JSON.stringify({keyWord: this.keyWord, sourceName: this.sourceName}));
        }
        this.router.navigate([`/main/governance/metadata/tableAnalysis/${item.id}/${this.pageNum}/${item.dsType}/${item.tableName}/${item.dsId}`]);
    }
}
