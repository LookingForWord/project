/**
 * Created by lh on 2017/12/16.
 * 数据仓库列表
 */

import {Component} from '@angular/core';
import 'rxjs/Rx';
import {Router} from '@angular/router';
import {RepositoryService} from 'app/services/repository.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {TaskDatabaseAddComponent} from 'app/components/modules/task/components/database/add/task.database.add.component';
import {KeysPsw} from '../../../../../constants/keys.psw';

@Component({
    selector: 'task-database-component',
    templateUrl: './task.database.component.html',
    styleUrls: ['./task.database.component.scss']
})
export class TaskDatabaseComponent {
    pageNow = 1;
    pageSize = 10;
    rowTotal = 0;
    databaseSearch = '';  // 搜索关键字
    dbID: string;         // 数据仓库ID
    databases: any;       // 数据仓库列表数据集合
    noDataType = false;   // 没有列表数据 true为没有数据，false为有数据

    constructor(private repositoryService: RepositoryService,
                private router: Router,
                private modalService: ModalService,
                private toolService: ToolService) {
        this.getDatabaseList();
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        let value = event.target['value'];
        this.getDatabaseList(1);
    }

    /**
     * 获取数据
     */
    getDatabaseList(pageNow?: number) {

        // 每次界面搜索的时候都把pageNow重置为1
        if (pageNow) {
            this.pageNow = pageNow;
        }

        this.repositoryService.getDatabases({
            pageNum: this.pageNow,
            pageSize: this.pageSize,
            dsIntent: 'db',
            keyword: this.databaseSearch
        }).then(d => {
            this.databases = [];

            if (d.success && d.message && d.message.content) {
                this.databases = d.message.content;
                this.rowTotal = d.message.totalElements;
            }
            // 判断有无数据
            if (!this.databases.length) {
                this.noDataType = true;
            } else {
                this.noDataType = false;
            }
        });
    }

    /**
     *页面跳转
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNow = obj.page;
        this.pageSize = obj.size;
        this.getDatabaseList();
    }

    /**
     * 创建数据库
     */
    newDatabaseClick() {
        // let [ins, pIns] = this.modalService.open(TaskDatabaseAddComponent, {
        //     title: '创建数据库连接',
        //     backdrop: 'static'
        // });
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '保存',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.saveClick();
        //     }
        // }]);
        // ins.status = 1;
        // ins.pIns = pIns;
        let [ins] = this.modalService.toolOpen({
            title: '创建数据库连接',
            component: TaskDatabaseAddComponent,
            datas: {
                status : 1,
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
            this.getDatabaseList();
        };
    }

    /**
     * 根据仓库ID查看仓库详情
     * @param dbid
     * @param {MouseEvent} $event
     */
    viewDetails(dbid: any, $event: MouseEvent) {
        this.dbID = dbid;
        this.repositoryService.infoDatabase(dbid)
            .then(d => {
                if (d.success) {
                    let [ins] = this.modalService.open(TaskDatabaseAddComponent, {
                        title: '查看数据源详情',
                        backdrop: 'static'
                    });
                    d.message.dsConfigs.forEach(attr => {
                        ins[attr.label] = attr.value;
                        ins[attr.label + 'Id'] = attr.id;
                    });
                    ins.sourceDsec = d.message.dsDesc;
                    ins.sourceName = d.message.dsName;
                    ins.sourceType = d.message.dsType;
                    ins.status = 0;
                    ins.hideInstance = () => {
                        ins.destroy();
                    };
                } else {
                    this.modalService.alert(d.message);
                }
            });
        $event.preventDefault();
    }

    /**
     * 编辑仓库详情
     * @param dbid
     * @param {MouseEvent} $event
     */
    editData(dbid, $event: MouseEvent) {
        this.repositoryService.infoDatabase(dbid)
            .then(d => {
                if (d.success) {
                    console.log(d);
                    let [ins, pIns] = this.modalService.open(TaskDatabaseAddComponent, {
                        title: '修改数据源详情',
                        backdrop: 'static'
                    });
                    d.message.dsConfigs.forEach(attr => {
                        // url需要解密显示
                        ins[attr.label] = attr.label === 'url' ? this.toolService.decrypt(attr.value, KeysPsw.DATASOURCEKEY) : attr.value;
                        ins[attr.label + 'Id'] = attr.id;
                    });
                    pIns.setBtns([{
                        name: '取消',
                        class: 'btn',
                        click: () => {
                            ins.cancelClick();
                        }
                    }, {
                        name: '连接测试',
                        class: 'btn',
                        click: () => {
                            ins.connectClick();
                        }
                    }, {
                        name: '保存',
                        class: 'btn primary',
                        click: () => {
                            ins.saveClick();
                        }
                    }]);
                    ins.sourceName = d.message.dsName;
                    ins.sourceType = d.message.dsType;
                    ins.sourceId = d.message.id;
                    ins.sourceDsec = d.message.dsDesc;
                    ins.sourceDeletedState = d.message.deletedState;
                    ins.sourceSyncState = d.message.syncState;
                    ins.dsIntent = d.message.dsIntent;
                    ins.status = 2;
                    ins.pIns = pIns;
                    ins.hideInstance = () => {
                        ins.destroy();
                        this.getDatabaseList();
                    };
                } else {
                    this.modalService.alert(d.message);
                }
            });
        $event.preventDefault();
    }

    /**
     * 删除仓库
     * @param dbid
     * @param {MouseEvent} $event
     */
    deleteData(dbid, $event: MouseEvent) {
        this.dbID = dbid;
        this.modalService.toolConfirm('确认删除？', () => {
            this.repositoryService.deleteSourceInfo({
                id: this.dbID,
            }).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getDatabaseList();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
        $event.preventDefault();
    }

    /**
     *
     * @param id
     * @param databaseType
     * @param dsName
     */
    tdNameClick(id, databaseType , dsName) {
        // url 里不能存在括号（不然刷新的时候报错），所以就不用url传参，改为queryParams传参
        this.router.navigate([`/main/task/database/table`], {
            queryParams: {
                id: id,
                type: databaseType,
                dsName: dsName,
                pageNow: this.pageNow
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
