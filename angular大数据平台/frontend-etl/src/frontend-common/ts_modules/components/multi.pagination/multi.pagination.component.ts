/**
 * 分页组件
 */
import {Component, Input, EventEmitter, Output, OnInit, OnChanges} from '@angular/core';

import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

export class Page {
    text: string;
    target: number;
    disable: boolean;
    cur: boolean;
}

@Component({
    selector: 'multi-pagination-component',
    templateUrl: './multi.pagination.component.html',
    styleUrls: ['./multi.pagination.component.scss']
})
export class MultiPaginationComponent implements OnInit, OnChanges {

    @Input()
    pagenow: number;

    @Input()
    totalcount: number;

    @Input()
    pagesize: number;

    @Output()
    onPageChange: EventEmitter<any> = new EventEmitter();

    list: Array<Page>;

    jump: string; // 跳转页码

    sizeList = [
        {name: '10条/页', value: 10},
        {name: '20条/页', value: 20},
        {name: '50条/页', value: 50},
    ];
    checkedSize: any;

    constructor() {
        this.checkedSize = this.sizeList[0];
    }

    ngOnInit() {
        this.getList();
    }

    ngOnChanges(obj) {
        this.getList();

        // 把跳转置空
        this.jump = null;
    }

    /**
     * 页面跳转
     * @param page 跳转页码
     */
    pageTo(page: Page): void {
        // 防止点击eclipse发起请求传参为-1，引起报错  / 已经是最首页或最后一页了点击下一页或上一页重复发起请求
        if (page.disable || page.target === -1) {
            return;
        }
        this.onPageChange.emit({page: page.target, size: this.checkedSize.value});
        this.getList();

        // 把跳转置空
        this.jump = null;
    }

    /**
     * 获取分页
     */
    getList(): void {
        this.list = this.generate(this.totalcount, this.pagenow, this.pagesize);
    }

    /**
     * 分页数组计算
     * @param total 总条数
     * @param page 当前页
     * @param count 每页条数
     * @returns {Array}
     */
    generate(total: number, page: number, count: number): Array<Page> {
        if (total === 0) {
            return [];
        }
        // 始终保持...中间有五个页码
        let res = [],
            pageCount = Math.ceil(total / count),
            // 当前页大于4的时候
            start = page > 4 ? Math.max(page - 2, 1) : 1,
            end = Math.min(start + 4, pageCount),
            dis = end - start,
            // 当前页小于总页数-3取小值   否则直接取页码总和
            _end = (page + 3) < pageCount ? Math.min(page + 2, pageCount) : pageCount,
            // 如果_end等于页码总和
            _start = _end === pageCount ? Math.max(_end - 5, 1) : Math.max(_end - 4, 1),
            _dis = _end - _start;
        // 决定...的位置
        if (_dis > dis) {
            start = _start;
            end = _end;
        }

        // // 如果起始页不为1页，则显示首页
        // if (start !== 1) {
        //     res.push({
        //         text: '首页',
        //         target: 1,
        //         disable: false,
        //         cur: false
        //     });
        // }

        // 如果当前页为1，则有上一页不可用
        if (page === 1) {
            res.push({
                text: '<',
                target: 1,
                disable: true,
                cur: false
            });
        }

        // 如果当前页不为1，则有上一页
        if (page !== 1) {
            res.push({
                text: '<',
                target: page - 1,
                disable: false,
                cur: false
            });
        }

        // 如果起始页不为1页，则显示首页
        if (start !== 1) {
            res.push({
                text: '1',
                target: 1,
                disable: false,
                cur: false
            }, {
                text: '...',
                target: -1,
                disable: true,
                cur: false
            });
        }
        for (let i = start; i <= end; i++) {
            res.push({
                text: '' + i,
                target: i,
                disable: i === page,
                cur: i === page
            });
        }

        // 如果结尾页不为最后一页，则有最后一页
        if (end !== pageCount) {
            // res.pop();
            res.push({
                text: '...',
                target: -1,
                disable: true,
                cur: false
            }, {
                text: pageCount,
                target: pageCount,
                disable: false,
                cur: false
            });
        }

        // 如果当前页为最后一页，则有下一页不可用
        if (page === pageCount) {
            res.push({
                text: '>',
                target: page ,
                disable: true,
                cur: false
            });
        }
        // 如果当前页不为最后一页，则有下一页
        if (page !== pageCount) {
            res.push({
                text: '>',
                target: page + 1,
                disable: false,
                cur: false
            });
        }

        // // 如果结尾页不为最后一页，则有最后一页
        // if (end !== pageCount) {
        //     res.push({
        //         text: '尾页',
        //         target: pageCount,
        //         disable: false,
        //         cur: false
        //     });
        // }
        return res;
    }

    /**
     * jump跳转
     */
    jumpBlur() {
        if (this.jump && RegExgConstant.integer.test(this.jump)) {
            let number = Number(this.jump);
            if (number > 0 && number <= this.list[this.list.length - 2].target && number !== this.pagenow) {
                this.onPageChange.emit({page: number, size: this.checkedSize.value});
                this.getList();
            }
        }
    }

    /**
     * 每页条数切换
     */
    selectChange(checked: any) {
        if (checked.value === this.checkedSize.value) {
            return;
        }
        this.checkedSize = checked;
        this.onPageChange.emit({page: 1, size: this.checkedSize.value});
        this.getList();
    }
}
