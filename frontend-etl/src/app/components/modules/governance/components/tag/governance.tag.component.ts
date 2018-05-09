/**
 * created by xxy on 2017/11/21/
 * 任务管理 数据源
 */

import {Component} from '@angular/core';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';

import {GovernanceTagAddComponent} from 'app/components/modules/governance/components/tag/add/governance.tag.add.component';

@Component({
    selector: 'governance-tag-component',
    templateUrl: './governance.tag.component.html',
    styleUrls: ['./governance.tag.component.scss']
})
export class GovernanceTagComponent {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    keyWord: string;    // 搜索关键字
    labelList: any;     // 标签列表信息集合
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    id: any;            // 单个标签id

    constructor(private modalService: ModalService,
                private governanceService: GovernanceService) {
        this.getList();
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.getList(1);
    }

    /**
     * 获取标签列表
     */
    getList(pagenow?: number) {
        // 界面搜索都把pagenow重置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }
        this.governanceService.getLabelList({
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
            keyWord: this.keyWord || ''
        }).then(data => {
            this.labelList = [];
            let d = data;
            if (d.success && d.message && d.message.content) {
                this.labelList = d.message.content;
                this.totalcount = d.message.totalElements;
            } else {
                this.modalService.alert(d.message);
            }
            // 判断有无数据
            this.noDataType = !this.labelList.length ? true : false;
        });
    }

    /**
     * 新增标签配置点击
     */
    newLabel() {
        let [ins] = this.modalService.toolOpen({
            title: '创建标签',
            component: GovernanceTagAddComponent,
            datas: {
                status : 1,
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
            this.getList();
        };
    }

    /**
     * 标签详情点击
     * @param id
     */
    detailClick(id: any) {
        this.governanceService.getLabelDetail({id: id})
            .then(d => {
                if (d.success) {
                    let [ins] = this.modalService.toolOpen({
                        title: '创建标签',
                        component: GovernanceTagAddComponent,
                        datas: {
                            id: d.message.id,
                            name: d.message.name,
                            createTime: d.message.createTime,
                            createUser: d.message.createUser,
                            description: d.message.description,
                            status: 0,
                        },
                        okCallback: () => {
                            ins.destroy();
                        }
                    } as ToolOpenOptions);
                } else {
                    this.modalService.alert(d.message);
                }
            });
    }

    /**
     * 编辑标签
     * @param id
     */
    updateClick(id: any) {
        this.governanceService.getLabelDetail({id: id}).then(d => {
            if (d.success) {
                let [ins] = this.modalService.toolOpen({
                    title: '修改标签详情',
                    component: GovernanceTagAddComponent,
                    datas: {
                        status: 2,
                        id: d.message.id,
                        name: d.message.name,
                        createTime: d.message.createTime,
                        createUser: d.message.createUser,
                        description: d.message.description,
                        creatorId: d.message.creatorId,
                    },
                    okCallback: () => {
                        ins.saveClick();
                    }
                } as ToolOpenOptions);
                ins.hideInstance = () => {
                    ins.destroy();
                    this.getList();
                };
            }
        });
    }
    /**
     * 删除标签
     * @param id
     */
    deleteClick(id: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteLabel(id).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getList();
                } else {
                    this.modalService.alert(d.message || '删除失败');
                }
            });
        });
    }

    /**
     * 页面跳转
     * @param page
     */
    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getList();
    }
}
