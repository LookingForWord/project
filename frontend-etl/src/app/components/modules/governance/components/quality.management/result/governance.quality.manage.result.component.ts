/**
 * created by CaoYue on 2017/12/4/
 * 质量管理 检查报告
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';

@Component({
    selector: 'governance-quality-manage-result-component',
    templateUrl: './governance.quality.manage.result.component.html',
    styleUrls: ['./governance.quality.manage.result.component.scss']
})
export class GovernanceQualityManageResultComponent implements OnInit {
    pagenow = 1;
    pagesize = 10;
    totalcount = 0;
    sourceType: any;    // 数据源类型
    keyword: string;    // 搜索关键字
    sources: any;       // 数据源列表信息集合
    noDataType = false; // 没有列表数据 true为没有数据，false为有数据
    id: string;         // 单个数据源id
    sub: any;           // 从url上获取参数
    prePage: any;

    constructor(private modalService: ModalService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private governanceService: GovernanceService) {
        this.sub = this.activatedRoute.params.subscribe(params => {
            if (params && params['id']) {
                this.prePage = Number(params.page);
                this.id = params.id;
            }
        });
    }

    ngOnInit() {
        this.getCheckList();
    }

    /**
     * 返回上一个页面
     */
    goBack() {
        this.router.navigate([`/main/governance/qualityManage`], {queryParams: {'page': this.prePage}});
    }

    /**
     * 同步状态显示为汉字
     * @param {string} status
     * @returns {string}
     */
    changeStatus(status: string) {
        let str = '';
        switch (status) {
            case 'not': str = '未知'; break;
            case 'ing': str = '同步中'; break;
            case 'fail': str = '失败'; break;
            case 'success': str = '成功'; break;
        }
        return str;
    }

    /**
     * 根据状态显示不同颜色的圆圈
     * @param {string} status
     * @returns {string}
     */
    changeStatusColor(status: string) {
        let arr = '';
        switch (status) {
            case '': arr = 'not'; break;
            case 'fail': arr = 'failed'; break;
            case 'success': arr = 'finished'; break;
        }
        return arr;
    }

    /**
     * 获取（搜索）列表
     * @param {number} pagenow
     */
    getCheckList(pagenow?: number) {
        // 界面搜索都把pagenow重置为1
        if (pagenow) {
            this.pagenow = pagenow;
        }
        this.governanceService.getCheckReport({
            id: this.id,
            pageNum: this.pagenow,
            pageSize: this.pagesize ,
        }).then(d => {
            this.sources = [];
            if (d.success && d.message && d.message.items) {
                this.sources = d.message.items;
                this.totalcount = d.message.totalCount;
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
     * 页面跳转
     * @param page
     */
    doPageChange(page) {
        this.pagenow = page;
        this.getCheckList();
    }
}




