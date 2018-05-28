/**
 * created by LIHUA on 2018/01/22/
 * 数据资产 数据治理 血缘(影响)分析 新增数据表
 */
import {Component} from '@angular/core';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';

@Component({
    selector: 'governance-blood-analysis-add-component',
    templateUrl: './governance.blood.analysis.add.component.html',
    styleUrls: ['./governance.blood.analysis.add.component.scss']
})
export class GovernanceBloodAnalysisAddComponent {
    dataSourceType: any;  // 数据源选择类型
    dataSourceTypes: any; // 数据源类型

    dataSource: any;  // 选中的数据源
    dataSources = []; // 数据源列表

    table: any;  // 选中的表
    tables = []; // 表列表

    error: string;
    errorType: number;

    constructor(private governanceService: GovernanceService,
                private modalService: ModalService,
                private validateService: ValidateService) {
        this.getDataSourceTypes();
    }

    /**
     * 获取数据源类型
     */
    getDataSourceTypes() {
        this.governanceService.getAllFileType()
            .then(d => {
                if (d.success) {
                    let t = [];
                    d.message.forEach(m => {
                         t.push({
                             name: m.rowName,
                             value: m.rowCode
                         });
                    });

                    this.dataSourceTypes = t;
                } else {
                    this.modalService.alert(d.message || '获取数据源类型失败');
                }
            });
    }

    /**
     * 获取对应数据源类型的数据源
     */
    getDataSourceMenus() {
        this.governanceService.getDataSourceMenus({
            dsType: this.dataSourceType.value
        }).then(d => {
             if (d.success) {
                 let t = [];
                 d.message.forEach(m => {
                     t.push({
                         name: m.dsName,
                         value: m.id
                     });

                     this.dataSources = t;
                 });
             } else {
                 this.modalService.alert(d.message || '获取数据源失败');
             }
        });
    }

    /**
     * 获取对应数据源获取数据源表
     */
    getSourceTables() {
        this.governanceService.getSourceTables({
            id: this.dataSource.value
        }).then(d => {
            if (d.success) {
                let t = [];
                d.message.forEach(m => {
                    t.push({
                        name: m.tableName,
                        value: m.id
                    });

                    this.tables = t;
                });
            } else {
                this.modalService.alert(d.message || '获取数据源表失败');
            }
        });
    }

    /**
     * 数据源类型选择回调
     * @param data
     */
    dataSourceTypeChecked(data: any) {
        if (this.dataSourceType && this.dataSourceType.value === data.value) {
            return;
        } else {
            this.dataSourceType = data;

            this.dataSource = null;
            this.dataSources = null;
            this.table = null;
            this.tables = null;

            this.getDataSourceMenus();
        }
    }

    /**
     * 数据源选择回调
     * @param data
     */
    dataSourceChecked(data: any) {
        if (this.dataSource && this.dataSource.value === data.value) {
            return;
        } else {
            this.dataSource = data;

            this.table = null;
            this.tables = null;

            this.getSourceTables();
        }
     }

    /**
     * 数据源表选择回调
     * @param data
     */
    tableChecked(data: any) {
        this.table = data;
    }

    /**
     * 确定点击
     */
    okClick() {
        if (!this.check()) {
            return;
        }

        return {
            dataSourceType: this.dataSourceType,
            dataSource: this.dataSource,
            table: this.table
        };
    }

    /**
     * 数据检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;

        let validate = this.validateService.get(this, GovernanceBloodAnalysisAddComponent.getValidateObject());
        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }

        return true;
    }

    static getValidateObject() {
        return {
            dataSourceType: {
                presence: {message: '^请选择数据源类型', allowEmpty: false},
                errorType: 1
            },
            dataSource: {
                presence: {message: '^请选择数据源', allowEmpty: false},
                errorType: 2
            },
            table: {
                presence: {message: '^请选择数据源表', allowEmpty: false},
                errorType: 3
            }
        };
    }
}

