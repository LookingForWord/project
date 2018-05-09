/**
 * Created by lh on 2017/12/13.
 * sql 输入建表
 */

import {Component} from '@angular/core';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'task-config-content-datasync-collection-sql-component',
    templateUrl: './task.config.content.datasync.collection.sql.component.html',
    styleUrls: ['./task.config.content.datasync.collection.sql.component.scss']
})
export class TaskConfigContentDatasyncCollectionSqlComponent {
    sql: string;      // sql
    // sql = 'select * from wcqk_meta_ds_config';

    error: string;
    errorType: number;

    constructor(private validateService: ValidateService) {}

    /**
     * 数据检查
     */
    check() {
        let success = true;
        this.error = '';
        this.errorType = -1;
        let validate = this.validateService.get(this, this.getValidateObject());
        if (validate) {
            this.error = validate['error'];
            this.errorType = validate['errorType'];
            return false;
        }
        // if (!this.sql || this.sql === '') {
        //     success = false;
        //     this.error = '请输入sql语句';
        //     this.errorType = 1;
        //     return;
        // }

        return success;
    }

    /**
     *
     * @returns
     */
    getValidateObject() {
        return {
            sql: {
                presence: {message: '^请输入sql语句', allowEmpty: false},
                errorType: 1
            }
        };
    }

    /**
     * sql创建表
     * @returns {string}
     */
    queryClick() {
        if (!this.check()) {
            return;
        }

        return this.sql;
    }

    hideInstance: Function;
}
