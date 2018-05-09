/**
 * Created by lh on 2017/12/16.
 */

import {Component, OnInit} from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {RepositoryService} from 'app/services/repository.service';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'task-database-table-add-field-component',
    templateUrl: './task.database.table.add.field.component.html',
    styleUrls: ['./task.database.table.add.field.component.scss']
})
export class TaskDatabaseTableAddFieldComponent implements OnInit {
    title: string;              // 弹窗的标题
    status: string;             // 弹窗的类型
    rightType =  'tableList';   // 页面右边的类型
    // tableName: string;          // 表格名称
    rule: any;                  // 规则
    tabType = 'tag';            // tag为标签，folder为文件夹
    dsId =  [];                  // 数据源id
    list = [];
    pageNum = 1;
    pageSize = 10;
    totalcount = 0;
    noData = true;
    keyWord:  string;
    sourceName: any;
    initSourceName: any;
    sourceNames = [];
    tableId: any;           // 表id (来源分析用)
    checkedTableName: any;  // 选择的表名(来源分析用)

    sqlLanguage: string;
    databaseType: string;    // 数据源type
    fields: any;

    constructor(private modalService: ModalService,
                private datatransferService: DatatransferService,
                private repositoryService: RepositoryService) {}

    async ngOnInit() {
        this.getSources();
        setTimeout( () => {
            this.getTableList();
        });
    }

    /**
     * 获取所以数据源列表
     */
    getSources() {
        this.repositoryService.getAllSource().then( d => {
            if (d.success) {

                this.sourceNames = d.message;
                this.initSourceName = JSON.stringify(d.message);
                this.sourceNames.splice(0, 0 , {
                    dsName: '全部数据源',
                    id: 0
                });
                this.sourceName = this.sourceNames[0];
                if (this.sourceName.id === 0) {
                    this.dsId = [];
                } else {
                    this.dsId = [this.sourceName.id];
                }
            }
        });
    }

    /**
     * 获取所有元数据
     * @param {MouseEvent} $event
     * @returns {Promise<void>}
     */
    async getTableList($event?: MouseEvent) {
        if ($event) {
            this.pageNum = 1;
        }

        this.repositoryService.gatDatabaseTables({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            directoryList: null,
            datasourceList: this.dsId,
            labelList: null,
            noLabel: null,
            noDir: null,
            keywords: this.keyWord
        }).then(d => {
            this.list = [];
            if (d.success ) {
                this.list = d.message.items;
                this.totalcount = d.message.totalCount;
            } else {
                this.modalService.alert(d.message);
            }

            // 判断有无数据
            this.noData = !this.list.length;
        });
    }

    tableName(id) {
        this.repositoryService.getFields ({
            targetDsType: this.databaseType,
            tableId: id
        }).then(d => {
            if (d.success) {
                this.fields = d.message;
                // this.fields = d.message.fields;

                // let fieldData = [];
                // this.fields.forEach(item => {
                //     fieldData.push({
                //         clName: item['fieldName'],                                     // 名称
                //         dataType: {name: item['dataType'], value: item['dataType']},           // 字段类型
                //         content: item['fieldComment'],                                        // 备注描述
                //         length: item['length'],                                        // 字段长度
                //         clPrecision: (item['precisionVal'] || ''),                    // 精度
                //         nullCheck: (item['isnullable'] === 'N' ? {name: '不允许', value: 'N'} : {name: '允许', value: 'Y'}),   // 是否允许空值选中
                //         radio: (item['primaryKey'] === 'Y' ? true : false),
                //         errorType: -1,
                //         defValue: item['defValue'],
                //         hasFieldLength: (item['length'] ? true : false),              // 是否有字段长度
                //         hasFieldPrecision: (item['precisionVal'] ? true : false),           // 是否有字段精度
                //     });
                // });
                // this.fields = fieldData;
                this.datatransferService.databaseCreateTableGetFields.next(this.fields);
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }

    /**
     * 返回表格列表页
     */
    back () {
        this.rightType = 'tableList';
    }

    /**
     * 数据源切换
     * @param type
     */
    sourceNameChecked(type: any) {
        if (this.sourceName.id !== type.id ) {
            this.sourceName = type;
            if (this.sourceName.id === 0) {
                this.dsId = [];
            } else {
                this.dsId = [this.sourceName.id];
            }

            this.getTableList();
        }
    }

    /**
     * 来源分析
     */
    sourceAnalysis(item, type?: any) {
        this.tableId = item.id;
        this.checkedTableName = item.tableName;
        this.rightType = 'sourceAnalysis';
    }
    /**
     * 分页点击事件
     * @param page
     */
    doPageChange(page) {
        this.pageNum = page;
        this.getTableList();
    }


    /**
     * 取消点击
     */
    cancelClick() {
        this.hideInstance();
    }

    hideInstance: Function;
}
