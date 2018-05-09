/**
 * Created by lh on 2017/12/16.
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {RepositoryService} from 'app/services/repository.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'task-database-table-component',
    templateUrl: './task.database.table.component.html',
    styleUrls: ['./task.database.table.component.scss']
})
export class TaskDatabaseTableComponent implements OnInit {
    pageNow = 1;
    pageSize = 10;
    rowTotal = 0;
    noDataType = false;     // 没有列表数据 true为没有数据，false为有数据
    searchValue = '';       // 数据表搜索关键字
    tableNameArray = [];    // 数据表名
    databaseId = '';        // 数据仓库ID
    databaseType: string;   // 数据表所属的数据仓库类型
    databaseName: string;   // 数据表所属的数据仓库类型
    tableId = '';           // 数据表ID
    databasesTable: any;    // 数据表集合
    tableStatus = 'delete'; // 数据表的状态 delete为删除
    filedTypes: any;        // 字段类型

    constructor(private repositoryService: RepositoryService,
                private route: ActivatedRoute,
                private router: Router,
                private modalService: ModalService) {
        this.route.queryParams.subscribe(params => {
            if (params && params['id']) {
                this.databaseId = params['id'];
                this.pageNow = Number(params['pageNow']) || 1 ;
                this.databaseTableList();
                this.databaseType = params['type'];
                this.databaseName = params['dsName'];
            }
        });
    }

    ngOnInit() {
        this.getFieldType();
    }

    /**
     * 返回
     */
    back() {
        this.router.navigate(['/main/task/database']);
    }

    /**
     * 获取字段类型列表
     */
    getFieldType() {
        this.repositoryService.getAllDict('w_mysql_column_type')
            .then(d => {
                if (d.success) {
                    this.filedTypes = d.message;
                } else {
                    this.modalService.alert(d.message);
                }
            });
    }

    /**
     * 获取数据表列表
     * @param pageNow
     */
    databaseTableList(pageNow?: number) {
        // 界面搜索都把pageNow重置为1
        if (pageNow) {
            this.pageNow = pageNow;
        }

        this.repositoryService.gatDatabaseTables({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            directoryList: null,
            datasourceList: [this.databaseId],
            labelList: null,
            noLabel: null,
            noDir: null,
            keywords: this.searchValue,
            // keyword: this.searchValue
        }).then(d => {
            this.databasesTable = [];
            if (d.success ) {
                this.databasesTable = d.message.items;
                this.rowTotal = d.message.totalCount;
            } else {
                this.modalService.alert(d.message);
            }

            // 判断有无数据
            this.noDataType = !this.databasesTable.length;
        });
    }

    doPageChange(obj: any) {
        this.pageNow = obj.page;
        this.pageSize = obj.size;
        this.databaseTableList();
    }

    /**
     *
     * 创建Hive表
     */
    newTableClick() {
        this.router.navigate(['/main/task/database/table/add'], {
            queryParams: {
                id: this.databaseId,
                type: this.databaseType,
                dsName: this.databaseName,
                action: 'add',
                pageNow: this.pageNow
            }
        });
    }

    /**
     * 查看Hive表详情
     */
    viewDetails(tbid) {
        this.router.navigate(['/main/task/database/table/info'], {
            queryParams: {
                id: this.databaseId,
                type: this.databaseType,
                dsName: this.databaseName,
                action: 'info',
                pageNow: this.pageNow,
                tableid: tbid
            }
        });
    }

    /**
     * 取消点击
     */
    cancelClick() {
        this.hideInstance();
    }

    hideInstance: Function;

}
