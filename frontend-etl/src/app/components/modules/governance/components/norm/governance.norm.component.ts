import {Component, OnInit} from '@angular/core';
import 'rxjs/Rx';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {GovernanceService} from 'app/services/governance.service';
import {GovernanceNormAddComponent} from 'app/components/modules/governance/components/norm/add/governance.norm.add.component';

@Component({
    selector: 'governance-norm-component',
    templateUrl: './governance.norm.component.html',
    styleUrls: ['./governance.norm.component.scss']
})
export class GovernanceNormComponent implements OnInit {
    pageNum = 1;
    pageSize = 10;
    totalcount= 0;
    keyword: any;
    noData: any;
    normList = [];          // 指标列表

    constructor(private governanceService: GovernanceService,
                private modalService: ModalService) {

    }

    ngOnInit() {
        this.getNormList();
    }

    /**
     * 获取指标列表
     * @param {number} pageNum
     */
    getNormList(pageNum?: number) {
        this.governanceService.getNormList({
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            keyword: this.keyword || ''
        }).then(d => {
           if (d.success && d.message) {
               this.normList = d.message.content || [];
               this.totalcount = d.message.totalElements;
               this.noData = this.normList.length === 0 ? true : false;
           } else {
               this.modalService.alert(d.message);
           }
        });
    }

    /**
     * 分页跳转
     * @param page
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getNormList();
    }

    /**
     * 搜索
     * @param {MouseEvent} $event
     */
    searchInstanceChange($event: MouseEvent) {
        this.pageNum = 1;
        this.getNormList();
    }

    /**
     * 删除
     * @param id
     */
    deleteClick(id: any) {
        this.modalService.toolConfirm('您确认删除吗？', () => {
            this.governanceService.deleteNorm({id: id}).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getNormList();
                } else {
                    this.modalService.alert(d.message);
                }
            });
        });
    }

    /**
     * 查看详情
     * @param item
     */
    detailClick(item: any) {
        this.modalService.toolOpen({
            component: GovernanceNormAddComponent,
            title: '指标详情',
            datas: {
                type: 'detail',
                checkItem: item
            }
        });
    }

    /**
     * 编辑
     * @param item
     */
    editClick(item: any) {
        let [ins, pIns] = this.modalService.open(GovernanceNormAddComponent, {
            title: '编辑指标',
            backdrop: 'static'
        });
        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                if (ins.showType === 'viewSql') {
                    ins.showType = 'norm';
                    let elm = document.getElementsByClassName('sql-btn')[0];
                    let button = document.createElement('button');
                    button.className = 'btn primary norm-save';
                    button.innerHTML = '保存';
                    button.onclick = () => {
                        ins.saveClick();
                    };
                    elm.parentNode.appendChild(button);
                } else {
                    ins.destroy();
                }
            }
        }, {
            name: 'Sql预览',
            class: 'btn sql-btn',
            click: () => {
                ins.viewSql();
            }
        }, {
            name: '保存',
            class: 'btn primary norm-save',
            click: () => {
                ins.saveClick();
            }
        }]);
        ins.type = 'edit';
        ins.checkItem = item;
        ins.hideInstance = () => {
            this.getNormList();
            ins.destroy();
        };
    }

    /**
     * 新建指标
     */
    addNorm() {
        let [ins, pIns] = this.modalService.open(GovernanceNormAddComponent, {
            title: '新建指标',
            backdrop: 'static'
        });
        pIns.setBtns([{
            name: '取消',
            class: 'btn',
            click: () => {
                if (ins.showType === 'viewSql') {
                    ins.showType = 'norm';
                    let elm = document.getElementsByClassName('sql-btn')[0];
                    let button = document.createElement('button');
                    button.className = 'btn primary norm-save';
                    button.innerHTML = '保存';
                    button.onclick = () => {
                        ins.saveClick();
                    };
                    elm.parentNode.appendChild(button);
                } else {
                    ins.destroy();
                }
            }
        }, {
            name: 'Sql预览',
            class: 'btn sql-btn',
            click: () => {
                ins.viewSql();
            }
        }, {
            name: '保存',
            class: 'btn primary norm-save',
            click: () => {
                ins.addSubmit();
            }
        }]);
        ins.type = 'add';
        ins.hideInstance = () => {
            this.pageNum = 1;
            this.getNormList();
            ins.destroy();
        };
    }
}
