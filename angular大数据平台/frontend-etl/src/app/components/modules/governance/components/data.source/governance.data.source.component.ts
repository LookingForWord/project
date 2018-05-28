/**
 * created by xxy on 2017/11/21/
 * 任务管理 数据源
 */

import {Component, OnInit} from '@angular/core';
import {KeysPsw} from 'app/constants/keys.psw';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {GovernanceDataSourceAddComponent} from 'app/components/modules/governance/components/data.source/add/governance.data.source.add.component';
import {GovernanceDataSourceSyncComponent} from 'app/components/modules/governance/components/data.source/sync/governance.data.source.sync.component';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

export class SourceTypes {
    name: string;
    value: string;
    dimCode: string;
}

@Component({
    selector: 'governance-data-source-component',
    templateUrl: './governance.data.source.component.html',
    styleUrls: ['./governance.data.source.component.scss']
})
export class GovernanceDataSourceComponent implements OnInit {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    sourceType: any;    // 数据源类型集合
    dsType: string;     // 数据源类型
    keyWord: string;    // 搜索关键字
    keyword: string;    // 搜索关键字
    sources: any;       // 数据源列表信息集合
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    totalPages: number; // 数据源列表总页数
    size: number;       // 每页显示的条数
    id: string;         // 单个数据源id
    sourceTypes: Array<SourceTypes>;   // 数据源类型集合
    syncMessage: any;   // 失败原因（展示所需）
    errorType: any;

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService,
                private toolService: ToolService) {
    }

    ngOnInit() {
        this.getSourcsType();
    }

    /**
     * 获取数据源类型
     */
    getSourcsType() {
        this.governanceService.searchSourceType()
            .then(d => {
                if (d.success && d.message) {
                    let temps = [{name: '全部数据源', value: '', dimCode: ''}];
                    d.message.forEach(type => {
                        temps.push({
                            name: type.rowName,
                            value: type.rowCode,
                            dimCode: type.dimCode
                        });
                    });
                    this.sourceTypes = temps;
                    this.sourceType = temps[0];
                    // 先获取数据源类型列表 再获取数据
                    this.getSource();
                } else {
                    this.modalService.alert(d.message);
                }
            });
    }

    /**
     * 根据数据源类型搜索
     * @param type
     */
    sourceTypeCheck(type: any) {
        this.sourceType = type;
        // 查询列表
        this.getSource(1);
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        // inputDebounce 指令的回调 返回的直接是事件本身
        this.getSource(1);
    }

    /**
     * 获取（搜索）数据源列表
     * @param {number} pagenow
     */
    getSource(pagenow?: number) {
        // 界面搜索都把pagenow重置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }
        // 不允许输入特殊字符
        if (this.keyword) {
            if (RegExgConstant.regEn.test(this.keyword) || RegExgConstant.regCn.test(this.keyword)) {
                this.errorType = 1;
                return;
            }
        }
        this.errorType = -1;
        // 获取全部数据源
        this.governanceService.getDatasources({
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
            dsType: (this.sourceType && this.sourceType['value'] ? this.sourceType['value'] : null),
            keyword: this.keyword
        }).then(d => {
            this.sources = [];
            if (d.success && d.message && d.message.content) {
                let content = d.message.content;
                content.forEach(source => {
                    this.sourceTypes.forEach(sourceType => {
                        if (source.dsType === sourceType.value) {
                            source.dimCode = sourceType.dimCode; // dimCode 表示数据源的类型可否同步源数据  DB_TYPE  可以同步，DS_TYPE 不能同步
                        }
                    });
                    source.links = source.links || [];
                    source.links.forEach(idx => {
                       idx.name =  this.getObjKey(idx);
                       idx.value = this.getObjvalue(idx);
                    });
                });
                this.sources = content;
                this.totalcount = d.message.totalElements;
                this.totalPages = d.message.totalPages;
                this.size = d.message.size;
            } else {
                this.modalService.alert(d.message);
            }
            // 判断有无数据
            this.noDataType = !this.sources.length ? true : false;
        });
    }

    /**
     * 延迟搜索
     */
    searchInstanceChange($event: MouseEvent) {
        this.keyword = this.keyword ? this.keyword.replace(/\s/g, '') : '';
        this.getSource(1);
    }

    /**
     * 把同步状态换成汉字
     * @param {string} status
     * @returns {string}
     */
    changeStatus(status: string) {
        let str = '';
        switch (status) {
            case 'not': str = '未同步'; break;
            case 'ing': str = '同步中'; break;
            case 'failed': str = '失败'; break;
            case 'finished': str = '完成'; break;
        }
        return str;
    }

    /**
     * 把同步状态换成图标
     * @param {string} status
     * @returns {string}
     */
    changeStatusColor(status: string) {
        let arr = '';
        switch (status) {
            case 'not': arr = 'not'; break;
            case 'ing': arr = 'ing'; break;
            case 'failed': arr = 'failed'; break;
            case 'finished': arr = 'finished'; break;
        }
        return arr;
    }

    /**
     * 失败原因提示
     * @param source
     */
    failReason(source: any) {
        this.modalService.alert(source.syncMessage);
    }
    /**
     * 新增数据源配置点击
     */
    newDataSource() {
        let [ins, pIns] = this.modalService.open(GovernanceDataSourceAddComponent, {
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
     * 编辑数据源详情
     * @param id
     */
    async updateClick(item: any) {
        if (item.syncState === 'ing') {
            this.modalService.alert('同步中,暂不可编辑更改');
            return;
        }
        // 先拿到详情数据
        let d = await this.governanceService.getSourceInfo(item.id);
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
        let [ins, pIns] = this.modalService.open(GovernanceDataSourceAddComponent, {
            title: title,
            backdrop: 'static'
        });
        d.message.dsConfigs.forEach(attr => {
            ins[attr.label] = attr.value;
            ins[attr.label + 'Id'] = attr.id;
            // 密码属性 在更新操作的时候显示一个固定的默认值，hdfs类型直接置空（后端数据是没有传这个值的）
            if (attr.label === 'password' && attr.value) {
                ins[attr.label] = this.toolService.decrypt(attr.value, KeysPsw.DATASOURCEKEY);
            }
            if (attr.label === 'url' && attr.value) {
                ins[attr.label] = this.toolService.decrypt(attr.value, KeysPsw.DATASOURCEKEY);
            }
            // 还原ftp类型
            if (attr.label === 'protocol' && d.message.dsType === CollectDatabaseEnum.FTP || d.message.dsType === CollectDatabaseEnum.FILE || d.message.dsType === CollectDatabaseEnum.SPIDER) {
                ins.protocols.forEach(p => {
                    if (p.value === attr.value) {
                        ins.protocol = p;
                    }
                });
            }
        });
        ins.sourceName = d.message.dsName;
        ins.sourceType = d.message.dsType;
        ins.description = d.message.dsDesc;
        ins.sourceSyncState = d.message.syncState;
        ins.baseID = d.message.id;
        ins.sourceDsIntent = d.message.dsIntent;
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
     * 删除数据源
     * @param id
     */
    deleteClick(id: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteSourceInfo(id).then(d => {
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
     * 同步元数据
     * @param {string} id
     */
    asyncClick(id: string) {
        let [ins, pIns] = this.modalService.open(GovernanceDataSourceSyncComponent, {
            title: '同步数据',
            backdrop: 'static'
        });
        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                ins.cancelClick();
            }
        }, {
            name: '保存',
            class: 'btn primary',
            click: () => {
                ins.saveClick();
            }
        }]);

        ins.dataSoureId = id;
        ins.hideInstance = () => {
            ins.destroy();
            this.getSource();

        };
    }

    /**
     * 点击跳转换页
     * @param page
     */
    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getSource();
    }

    /**
     * 管理页面连接测试
     * @param id
     * @returns {Promise<void>}
     */
    async testClick(id: any) {
        this.governanceService.testSourceById(id).then(d => {
            this.modalService.alert(d.message);
        });
    }

    /**
     * 链接信息key值
     * @param item
     * @returns {any}
     */
    getObjKey(item: any) {
        if (!item) {
            return '';
        }
        return Object.keys(item)[0];
    }

    /**
     * 链接信息具体value值
     */
    getObjvalue(item: any) {
        if (!item) {
            return '';
        }
        let arr = Object.keys(item);
        if (arr[0].indexOf('url') !== -1 && item[`${arr[0]}`]) {
            let url = this.toolService.decrypt(item[`${arr[0]}`], KeysPsw.DATASOURCEKEY);
            item[`${arr[0]}`] = url;
        }
        return item[arr[0]];
    }
}
