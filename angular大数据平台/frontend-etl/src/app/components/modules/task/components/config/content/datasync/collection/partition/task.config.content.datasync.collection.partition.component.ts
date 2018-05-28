/**
 * Created by lh on 2017/11/10.
 *  分区信息编辑
 */

import {Component} from '@angular/core';

export class PartitionData {
    fieldName: string;
    value: string;
    errorType: number;
}

@Component({
    selector: 'task-config-content-datasync-collection-partition-component',
    templateUrl: './task.config.content.datasync.collection.partition.component.html',
    styleUrls: ['./task.config.content.datasync.collection.partition.component.scss']
})
export class TaskConfigContentDatasyncCollectionPartitionComponent {
    // 分区列表
    partitions = Array<PartitionData>();

    constructor() {}

    /**
     * 数据还原
     */
    initPartitions(partitions: any) {
        if (partitions) {
            partitions.forEach(partition => {
                this.partitions.push({
                    fieldName: partition.fieldName,
                    value: partition.value,
                    errorType: -1
                });
            });
        }
    }

    /**
     * 保存点击
     * @returns {{fieldName: string; value: string}[]}
     */
    saveClick() {
        if (!this.partitions || !this.partitions.length) {
            return [];
        }
        if (!this.check()) {
            return;
        }

        return this.partitions.map((partition, i) => {
            return partition.value;
        });
    }

    /**
     * 保存检查
     * @returns {any}
     */
    check() {
        let i, success;
        for (i = 0; i < this.partitions.length; i++) {
            this.partitions[i].errorType = -1;
            success = true;
            if (!this.partitions[i].fieldName || this.partitions[i].fieldName === '') {
                this.partitions[i].errorType = 1;
                success = false;
            } else if (!this.partitions[i].value || this.partitions[i].value === '') {
                this.partitions[i].errorType = 2;
                success = false;
            } else if (this.partitions[i].value.length > 30) { // 限制长度为30个字符
                this.partitions[i].errorType = 3;
                success = false;
            }
            if (!success) {
                break;
            }
        }

        return success;
    }

    cancelClick() {
        this.hideInstance();
    }


    /**
     * 删除行
     * @param {number} index
     */
    deleteClick(index: number) {
        this.partitions.splice(index, 1);
    }

    hideInstance: Function;
}
