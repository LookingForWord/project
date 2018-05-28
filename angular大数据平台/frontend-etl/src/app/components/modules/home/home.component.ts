/**
 * Created by xxy on 2017/12/13/013.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {HomeService} from 'app/services/home.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
@Component({
    selector: 'home-component',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    data: any;                  // 当前时间
    intervalHook: any;
    timeOutHook: any;

    totalDataItemNum: any;          // 总数据项
    totalDataSetNum: any;           // 总数据集
    totalDataTotalNum: any;         // 总数据量

    basicDataList = [];             // 基础数据集合
    noAuthourity: any;

    constructor( private router: Router,
                 private homeService: HomeService,
                 private modalService: ModalService
    ) {
        this.getData();
        this.intervalHook = setInterval(() => {
            this.getData();
        }, 1000);
    }

    ngOnInit() {
        this.getDataCenter();
        this.timeOutHook = setInterval(() => {
            this.basicDataList = [];
            this.getDataCenter();
        }, 5 * 60 * 1000);
    }

    ngOnDestroy() {
        clearInterval(this.intervalHook);
        this.intervalHook = null;
        this.timeOutHook = null;
    }

    /**
     * 获取数据
     */
    getDataCenter () {
        this.homeService.getDataCenter().then(d => {
            if (d.success && d.message) {
                this.noAuthourity = false;
                if (d.message.totalInfo) {
                    this.totalDataItemNum = d.message.totalInfo.totalDataItemNum;
                    this.totalDataSetNum = d.message.totalInfo.totalDataSetNum;
                    this.totalDataTotalNum = d.message.totalInfo.totalDataTotalNum;
                }
                if (d.message.basicInfo && d.message.basicInfo.basicDataList) {
                    let arr = d.message.basicInfo.basicDataList;
                    arr.forEach((item, index) => {
                        let icon = '';
                        switch (index) {
                            case 0: icon = 'population'; break;
                            case 1: icon = 'company1'; break;
                            case 2: icon = 'geography'; break;
                            case 3: icon = 'economics'; break;
                        }
                        this.basicDataList.push({
                            ...item,
                            icon: icon
                        });
                    });
                }
            } else if (d.code === 115) {
                this.noAuthourity = true;
                this.modalService.alert(d.message);
            } else {
                this.noAuthourity = false;
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 时间显示
     */
    getData() {
        let date = new Date();
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1);
        month = (month.length === 1 ? ('0' + month) : month);
        let day = String(date.getDate());
        day = (day.length === 1 ? ('0' + day) : day);
        let hour = String(date.getHours());
        hour = (hour.length === 1 ? ('0' + hour) : hour);
        let minute = String(date.getMinutes());
        minute = (minute.length === 1 ? ('0' + minute) : minute);
        let second = String(date.getSeconds());
        second = (second.length === 1 ? ('0' + second) : second);
        let time = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second ;
        this.data = time;
    }

    /**
     * 跳转到对应项的详情列表
     * obj 当前的项
     */
    turnToDetail (obj: any, type: any) {
        // 传参跳转到指定的详情列表
        this.router.navigate([`/main/home/detail/${obj.categoryId}/${type}`],
            {queryParams: {'name': encodeURI(obj.categoryName)}});
    }

}
