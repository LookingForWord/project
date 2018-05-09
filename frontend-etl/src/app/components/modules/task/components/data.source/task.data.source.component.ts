/**
 * Created by LIHUA on 2017-08-05.
 * 任务管理 数据源
 */

import {Component} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {TaskDataSourceAddComponent} from 'app/components/modules/task/components/data.source/add/task.data.source.add.component';

import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {KeysPsw} from 'app/constants/keys.psw';

@Component({
    selector: 'task-data-source-component',
    templateUrl: './task.data.source.component.html',
    styleUrls: ['./task.data.source.component.scss']
})
export class TaskDataSourceComponent {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;

    keyWord: string;    // 搜索关键字
    sources: any;       // 数据源列表信息集合
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private toolService: ToolService) {
        this.getSource();
    }

    /**
     * 获取数据源列表
     */
    getSource(pagenow?: number) {
        // 界面搜索都把pagenow重置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }

        this.governanceService.getDatasources({
            pageNum: this.pagenow,
            pageSize: this.pagesize,
            keyword: this.keyWord
        }).then(d => {
            this.sources = [];

            if (d.success && d.message && d.message.content) {
                this.sources = d.message.content;
                this.totalcount = d.message.totalElements;
            } else {
                this.modalService.alert(d.message);
            }

            // 判断有无数据
            this.noDataType = this.sources.length > 0;
        });
    }


    /**
     * 新增数据源配置点击
     */
    newDataSource() {
        let [ins, pIns] = this.modalService.open(TaskDataSourceAddComponent, {
            title: '创建数据源',
            backdrop: 'static'
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

        ins.status = 1;
        ins.pIns = pIns;
        ins.hideInstance = () => {
            ins.destroy();
            this.getSource();
        };
    }

    /**
     * 数据源详情点击
     * @param id
     */
    async detailClick(id: any) {
        // 先拿到详情数据
        let d = await this.governanceService.getSourceInfo(id);

        if (d.success) {
            this.openComponent(d, '查看数据源详情', 0);
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 数据源修改点击
     * @param id
     */
    async updateClick(id: any) {
        // 先拿到详情数据
        let d = await this.governanceService.getSourceInfo(id);
        if (d.success) {
            this.openComponent(d, '修改数据源详情', 2);
        } else {
            this.modalService.alert(d.message);
        }
    }
    /**
     * 打开模态框
     * @param d 模态数据
     * @param {string} title 标题
     * @param {number} status 模态状态
     */
    openComponent(d: any, title: string, status: number) {
        let [ins, pIns] = this.modalService.open(TaskDataSourceAddComponent, {
            title: title,
            backdrop: 'static'
        });
        d.message.dsConfigs.forEach(attr => {
            ins[attr.label] = attr.value;
            ins[attr.label + 'Id'] = attr.id;
            // 密码属性
            if (attr.label === 'password' && attr.value) {
                ins[attr.label] = this.toolService.decrypt(attr.value, KeysPsw.DATASOURCEKEY);
            }
            // 还原ftp类型
            if (attr.label === 'protocol' && d.message.dsType === CollectDatabaseEnum.FTP) {
                ins.protocols.forEach(p => {
                    if (p.value === attr.value) {
                        ins.protocol = p;
                    }
                });
            }
        });
        ins.sourceName = d.message.dsName;
        ins.sourceType = d.message.dsType;
        ins.sourceSyncState = d.message.syncState;
        ins.baseID = d.message.id;
        ins.status = status;
        ins.pIns = pIns;
        ins.hideInstance = () => {
            ins.destroy();
            // 编辑操作 都再查询一次列表
            if (status === 2) {
                this.getSource();
            }
        };
        // 修改状态
        if (status === 2) {
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
        }
    }

    /**
     * 删除点击
     * @param source
     */
    deleteClick(source: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteSourceInfo(source.id)
                .then(d => {
                    if (d.success) {
                        this.modalService.alert('删除成功');
                        this.getSource();
                    } else {
                        this.modalService.alert(d.message || '删除失败');
                    }
                });
        });
    }

    /**
     * 分页回调
     * @param {number} page
     */
    doPageChange(page: number) {
        this.pagenow = page;
        this.getSource();
    }
}
