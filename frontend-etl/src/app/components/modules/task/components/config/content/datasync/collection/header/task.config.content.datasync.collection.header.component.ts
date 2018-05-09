/**
 * Created by LIHUA on 2017-10-26.
 *  header 选择
 */
import {Component} from '@angular/core';

import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';

export class HeaderData {
    fieldName: string;
    dataType: any;
    errorType: number;
}

@Component({
    selector: 'task-config-content-datasync-collection-header-component',
    templateUrl: './task.config.content.datasync.collection.header.component.html',
    styleUrls: ['./task.config.content.datasync.collection.header.component.scss']
})
export class TaskConfigContentDatasyncCollectionHeaderComponent {

    headers = Array<HeaderData>(); // header列表

    type: string; // 采集库类型
    collectDatabaseEnum = CollectDatabaseEnum; // 采集库类型枚举

    dataTypes = [ // 数据类型
        {name: 'string', value: 'string'},
        {name: 'int', value: 'int'},
        {name: 'float', value: 'float'},
        {name: 'double', value: 'double'},
        {name: 'long', value: 'long'}
    ];

    constructor(private modalService: ModalService) {}

    /**
     * 初始化headers
     * @param {any} headers
     */
    initHeaders(headers: any) {
        if (headers) {
            headers.forEach(header => {
                this.headers.push({
                    fieldName: header.fieldName,
                    dataType: this.getDateType(header.dataType),
                    errorType: -1
                });
            });
        }
    }

    /**
     * 获取类型
     * @param {string} dataType
     * @returns {any}
     */
    getDateType(dataType: string) {
        if (!dataType) {
            // 当dataType不存在时
            return  {name: 'string', value: 'string'};
        } else {
            // 原来的
            let temp = this.dataTypes.filter(f => f.value === dataType);
            if (temp && temp.length) {
                return temp[0];
            } else {
                return {name: dataType, value: dataType};
            }
        }

    }

    /**
     * 保存点击
     * @returns {HeaderData[]}
     */
    saveClick() {
        if (!this.headers || !this.headers.length) {
            this.modalService.alert('请添加表头字段');
        }
        if (!this.check()) {
            return;
        }

        return this.headers.map((header, i) => {
            return {
                fieldName: header.fieldName,
                fieldNum: i,
                dataType: header.dataType.value
            };
        });
    }

    /**
     * 保存检查
     * @returns {any}
     */
    check() {
        for (let i = 0; i < this.headers.length; i++) {
            this.headers[i].errorType = -1;
            if (!this.headers[i].fieldName || this.headers[i].fieldName === '') {
                this.headers[i].errorType = 1;
                return;
            }
            if (!this.headers[i].dataType || !this.headers[i].dataType.value) {
                this.headers[i].errorType = 2;
                return;
            }
        }
        return true;
    }

    cancelClick() {
        this.hideInstance();
    }

    /**
     * 删除行
     * @param {number} index
     */
    deleteClick(index: number) {
        this.headers.splice(index, 1);
    }

    /**
     * 新增header
     */
    addClick() {
        this.headers.push({
            fieldName: '',
            dataType:  {name: 'string', value: 'string'},
            errorType: -1
        });
    }

    /**
     * 类型切换
     * @param header
     */
    dataTypeChecked(header: any) {
        this.headers[header.index].dataType = header.checked;
    }

    hideInstance: Function;
}
