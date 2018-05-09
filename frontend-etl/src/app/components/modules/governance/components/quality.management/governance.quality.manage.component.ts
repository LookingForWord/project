
/**
 * created by CaoYue on 2017/12/5/
 * 质量管理
 */

import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import 'rxjs/Rx';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {GovernanceQualityManageAddComponent} from 'app/components/modules/governance/components/quality.management/add/governance.quality.manage.add.component';
import {GovernanceQualityManageRuleComponent} from 'app/components/modules/governance/components/quality.management/rule/governance.quality.manage.rule.component';

@Component({
    selector: 'governance-quality-manage-component',
    templateUrl: './governance.quality.manage.component.html',
    styleUrls: ['./governance.quality.manage.component.scss']
})

export class GovernanceQualityManageComponent implements OnInit {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    sourceType: any;    // 数据源类型
    keyword: string;    // 搜索关键字
    source: any;        // 质量管理单条数据
    sources: any;       // 数据源列表信息集合
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    totalPages: number; // 数据源列表总页数
    size: number;       // 每页显示的条数
    id: string;         // 单个数据源id
    errorType: any;

    constructor(private modalService: ModalService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private governanceService: GovernanceService) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.activatedRoute.queryParams.subscribe(params => {
                if (params.page && !location.hash) {
                    this.pagenow = Number(params.page);
                    window.location.hash = String(params.page);
                } else if (window.location.hash && window.location.hash !== '#') {
                    this.pagenow = Number(window.location.hash.slice(1,));
                }
            });
        });
    }

    ngOnInit() {
        this.getCheckList();
    }

    /**
     * 搜索
     * @param {MouseEvent} event
     */
    searchChange(event: MouseEvent) {
        this.getCheckList(1);
    }

    /**
     * 获取质量列表
     * @param {number} pagenow
     */
    getCheckList(pagenow?: number) {
        // 界面搜索都把pagenow重置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }

        if (this.keyword) {
            if (RegExgConstant.regCn.test(this.keyword) || RegExgConstant.regEn.test(this.keyword)) {
                this.errorType  = 1;
                return;
            }
        }
        this.errorType = -1;
        window.location.hash = String(this.pagenow);
        this.governanceService.getCheckList({
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
            keyword: this.keyword || ''
        }).then(d => {
            this.sources = [];
            if (d.success && d.message) {
                this.sources = d.message.items || [];
                this.totalcount = d.message.totalCount;
                this.totalPages = d.message.totalPage;
                this.size = d.message.size;
            } else {
                this.modalService.alert(d.message);
            }
            // 判断有无数据
            if (!this.sources.length) {
                this.noDataType = true;
            } else {
                this.noDataType = false;
            }
        });
    }

    /**
     * 把同步状态换成图标
     * @param {string} status
     * @returns {string}
     */
    changeStatusColor(status: string) {
        let arr = '';
        switch (status) {
            case 'Unknown': arr = 'not'; break;
            case 'fail': arr = 'failed'; break;
            case 'success': arr = 'finished'; break;
        }
        return arr;
    }

    /**
     * 状态转换为文字
     * @param {string} status
     * @returns {string}
     */
    changeStatus(status: string) {
        let str = '';
        switch (status) {
            case 'Unknown': str = '未知'; break;
            case 'ing': str = '同步中'; break;
            case 'fail': str = '失败'; break;
            case 'success': str = '成功'; break;
        }
        return str;
    }

    /**
     * 新建配置
     * @param type
     * @param item
     */
    newCheckClick(type: any, item?: any) {
        let [ins] = this.modalService.toolOpen({
            title: (type === 'add' ? '新建配置' : '编辑配置'),
            component: GovernanceQualityManageAddComponent,
            datas: {
                status: type,
                present: (item ? item : null),
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        // ins.status = type;
        // ins.present = (item ? item : null);
        ins.hideInstance = () => {
            ins.destroy();
        };
        ins.refreshList = () => {
            this.getCheckList();
        };
    }

    /**
     * 跳转到结果检查
     * @param source 每个表的情况包括id，规则数目等
     */
    resultClick(source) {
        this.router.navigate([`/main/governance/qualityManage/result/${source.id}/${this.pagenow}/${this.pagesize}`]);
    }

    /**
     * 检查规则
     * @param item
     */
    ruleClick(item) {
        let [ins, pIns] = this.modalService.open(GovernanceQualityManageRuleComponent, {
            title: '规则检查',
            backdrop: 'static'
        });
        pIns.setBtns([{
            name: '关闭',
            class: 'btn',
            click: () => {
                ins.destroy();
                ins.refreshList();
        }}]);
        ins.source = item;
        ins.refreshList = () => {
            this.getCheckList();
        }
    }

    /**
     * 删除数据源
     * @param id
     */
    deleteClick(id: any) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.governanceService.deleteFormCheck(id).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    this.getCheckList();
                } else {
                    this.modalService.alert(d.message || '删除失败');
                }
            });
        });
    }

    /**
     * 切换页码
     * @param page
     */
    doPageChange(obj: any) {
        this.pagenow = obj.page;
        this.pagesize = obj.size;
        this.getCheckList();
    }
}




