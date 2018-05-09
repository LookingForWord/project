import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {HomeService} from 'app/services/home.service';

@Component({
    selector: 'home-detail-component',
    templateUrl: './home.detail.component.html',
    styleUrls: ['./home.detail.component.scss']
})

export class HomeDetailComponent implements OnInit {

    categoryId: any;                    // 接收到id
    categoryName: any;                  // 相应名称
    pageNum = 1;                        // 当前页码
    pageSize = 10;                      // 当前页展示条数
    totalCount = 10;                    // 总数据数
    dataList = [];                      // 数据集合list
    noDataType: any;                    // 有无数据
    keyword: any;                       // 关键字
    type: any;                          // set 数据集  item 数据项

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private location: Location,
                private modalService: ModalService,
                private homeService: HomeService) {
        this.activatedRoute.params.subscribe(params => {
            this.categoryId = params['categoryId'];
            this.type = params['type'];
        });
        this.activatedRoute.queryParams.subscribe(params => {
            this.categoryName = decodeURI(params['name']);
        });
    }

    ngOnInit () {
        this.getDataList();
    }

    /**
     * 获取相应集的数据  (目录、表。。。)
     * @param {number} page
     */
    getDataList (page?: any) {
        // 界面搜索都把pageNow重置为1
        if (page) {
            this.pageNum = page;
        }
        if (this.type === 'item') {
            this.homeService.getDataItemList({
                categoryId: this.categoryId,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            }).then(d => {
                if (d.success && d.message) {
                    this.dataList = d.message.content || [];
                    this.totalCount = d.message.totalElements;
                    this.noDataType = ((!this.dataList || this.dataList.length === 0) ? true : false);
                } else {
                    this.noDataType = true;
                    this.modalService.alert(d.message);
                }
            });
        } else if (this.type === 'set') {
            this.homeService.getDataSetList({categoryId: this.categoryId}).then(d => {
                if (d.success && d.message) {
                    this.dataList = d.message;
                    this.totalCount = d.message.length;
                    this.noDataType = ((!this.dataList || this.dataList.length === 0) ? true : false);
                } else {
                    this.noDataType = true;
                    this.modalService.alert(d.message);
                }
            });
        }

    }

    /**
     * 页码切换
     */
    doPageChange(obj: any) {
        this.pageNum = obj.page;
        this.pageSize = obj.size;
        this.getDataList();
    }

    /**
     * 返回数据中心主页
     */
    back () {
        this.location.back();
    }
}
