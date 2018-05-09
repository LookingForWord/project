import {Component, OnInit} from '@angular/core';
import {GovernanceService} from 'app/services/governance.service';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

@Component({
    selector: 'governance-norm-add-component',
    templateUrl: './governance.norm.add.component.html',
    styleUrls: ['./governance.norm.add.component.scss']
})
export class GovernanceNormAddComponent implements OnInit {
    checkItem: any;
    type: any;                          // 弹框类型  detail 查看详情   edit 编辑指标 add 新增指标
    checkName: any;                     // 指标名
    checkType: any;                     // 指标类型
    checkTypes = [{
        name: 'sql',
        value: 'sql'
    }];                                 // 指标类型集合   目前只有这个
    resultType: any;                    // 结果类型
    resultTypes = [{
        name: '单行',
        value: 'single'
    }, {
        name: '多行',
        value: 'multi'
    }];                                 // 结果类型集合
    dsType: any;                        // 数据源类型选中项
    dsTypes: any;
    dataSourceName: any;                // 数据源名称选中项
    dataSourceNames: any;
    normSql: any;                       // sql语句
    oldNormSql: any;

    errorType: any;
    error; any;
    showplaceholder: any;       // 是否进行过sql预览操作
    showType = 'norm';          // dom显示类型
    placeArr = [];              // 占位符待替换集合
    previewList = [];           // sql预览结果
    showPreviewResult: any;     // 是否显示预览结果
    keys = [];
    thWidth = 0;

    constructor(private governanceService: GovernanceService,
                private modalService: ModalService,
                private validateService: ValidateService) {

    }

    ngOnInit() {
        this.dsTypes = [];
        this.governanceService.getSourcsType().then(d => {
            if (d.success) {
                let arr = [];
                d.message && d.message.forEach( item => {
                    arr.push({
                        name: item.rowName,
                        value: item.rowCode
                    });
                });
                this.dsTypes = arr;
                if (this.type !== 'add') {
                    this.getNormDetail();
                }
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 获取指标详情
     */
    getNormDetail() {
        this.governanceService.getNormDetail({id: this.checkItem.id}).then(d => {
            if (d.success) {
                this.checkName = d.message.checkName;
                this.resultType = d.message.resultType === 'single' ? this.resultTypes[0] : this.resultTypes[1];
                this.dsTypes.forEach(item => {
                    if (item.value === d.message.dsType) {
                        this.dsType = item;
                    }
                });
                this.getSourceList(d.message.dsName);
                this.checkTypes.forEach(item => {
                    if (item.value === d.message.checkType) {
                        this.checkType = item;
                    }
                });
                this.normSql = d.message.normSql;
                this.oldNormSql = d.message.normSql;
            } else {
                this.modalService.alert(d.message);
            }
        });
    }

    /**
     * 编辑保存
     */
    saveClick() {
        if (!this.check()) {
            return;
        }
        if (this.oldNormSql !== this.normSql && !this.checkPreview()) {
            let elm = document.getElementsByClassName('norm-save')[0];
            elm.parentNode.removeChild(elm);
            return;
        }
        this.governanceService.editNorm({
            checkName: this.checkName,
            dsType: this.dsType.value,
            dsId: this.dataSourceName.id,
            dsName: this.dataSourceName.dsName,
            checkType: this.checkType.value,
            resultType: this.resultType.value,
            normSql: this.normSql,
            id: this.checkItem.id
        }).then(d => {
            if (d.success) {
                this.modalService.alert(d.message || '更新指标成功');
                this.hideInstance();
            } else {
                // 当指标名重复的时候 错误在d.message
                // 当sql解析错误 错误在d.message.message
                let msg = d.message.message || d.message;
                this.modalService.alert(msg);
            }
        });
    }

    /**
     * 新增保存
     */
    addSubmit() {
        if (!this.check()) {
            return;
        }
        if (!this.checkPreview()) {
            let elm = document.getElementsByClassName('norm-save')[0];
            elm.parentNode.removeChild(elm);
            return;
        }
        this.governanceService.addNorm({
            checkName: this.checkName,
            dsType: this.dsType.value,
            dsName: this.dataSourceName.dsName,
            checkType: this.checkType.value,
            resultType: this.resultType.value,
            normSql: this.normSql,
            dsId: this.dataSourceName.id
        }).then(d => {
            if (d.success) {
                this.modalService.alert(d.message || '新建指标成功');
                this.hideInstance();
            } else {
                // 当指标名重复的时候 错误在d.message
                // 当sql解析错误 错误在d.message.message
                let msg = d.message.message || d.message;
                this.modalService.alert(msg);
            }
        });
    }

    /**
     * 校验
     */
    check() {
        let validate = this.validateService.get(this, this.getValidateObject(), ['checkName', 'checkType', 'dsType', 'dataSourceName', 'resultType', 'normSql']);
        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return;
        }
        this.error = '';
        this.errorType = -1;
        return true;
    }

    getValidateObject() {
        return {
            checkName: {
                presence: {message: '^请填写指标名称', allowEmpty: false},
                length: {maximum: 20, message: '^名称最多20个字符', allowEmpty: false},
                reg: {format: RegExgConstant.numberAlphabet, message: '^字母开头的字母、数字、下划线组合'},
                errorType: 1
            },
            checkType: {
                presence: {message: '^请选择指标类型', allowEmpty: false},
                errorType: 2
            },
            dsType: {
                presence: {message: '^请选择数据源类型', allowEmpty: false},
                errorType: 3
            },
            dataSourceName: {
                presence: {message: '^请选择数据源', allowEmpty: false},
                errorType: 4
            },
            resultType: {
                presence: {message: '^请选择结果类型', allowEmpty: false},
                errorType: 5
            },
            normSql: {
                presence: {message: '^请填写sql语句', allowEmpty: false},
                errorType: 6
            }
        };
    }

    /**
     * 下拉框选择
     * @param value
     * @param type
     */
    selectChange(value: any, type: any) {
        if (this[type] === value) {
            return;
        }
        this[type] = value;
        // 数据源类型选中
        if (type === 'dsType') {
            this.dataSourceNames = [];
            this.dataSourceName = null;
            this.getSourceList();
        }
    }

    /**
     * 获取数据源列表
     */
    async getSourceList(dsName?: any) {
        let arr = [];
        let d = await this.governanceService.getDataSourceMenus({dsType: this.dsType.value});
        if (d.success && d.message) {
            d.message.forEach(item => {
                arr.push(item);
                if (dsName && item.dsName === dsName && item.dsType === this.dsType.value) {
                    this.dataSourceName = item;
                }
            });
            this.dataSourceNames = arr;
        } else {
            this.modalService.alert(d.message);
        }
    }

    /**
     * 预览sql
     */
    viewSql() {
        if (!this.check() && this.showType === 'norm') {
            return;
        }
        if (this.check() && this.normSql.indexOf('$') === -1) {
            this.getSqlResult(null);
            return;
        }
        if (this.check() && this.showType === 'norm' && this.normSql.indexOf('$') !== -1) {
            this.placeArr = [];
            const reg = /\$[a-zA-Z1-9]{0,}/ig;
            let arr = this.normSql.match(reg);
            arr.forEach(item => {
                this.placeArr.push({
                    errorType: false,
                    error: '',
                    oldValue: item,
                    newValue: ''
                });
            });
            this.showType = 'viewSql';
            let elm = document.getElementsByClassName('norm-save')[0];
            elm.parentNode.removeChild(elm);
            return;
        }

        let placeholders = [{}];
        let result = false;
        for (let i = 0 ; i < this.placeArr.length ; i++) {
            if (!this.placeArr[i].newValue) {
                this.placeArr[i].errorType = true;
                this.placeArr[i].error = '请输入替换值';
                result = true;
                break;
            }
            if (RegExgConstant.regEn.test(this.placeArr[i].newValue) || RegExgConstant.regCn.test(this.placeArr[i].newValue)) {
                this.placeArr[i].errorType = true;
                this.placeArr[i].error = '不能包含特殊字符';
                result = true;
                break;
            }
            this.placeArr[i].errorType = false;
            this.placeArr[i].error = '';
            placeholders[0][`${this.placeArr[i].oldValue}`] = this.placeArr[i].newValue;
        }
        if (result) {
            return;
        }
        this.getSqlResult(placeholders);
    }

    /**
     * 调用sql预览接口
     */
    getSqlResult(placeholders: any) {
        this.governanceService.previewSql({
            dsId: this.dataSourceName.id,
            sql: this.normSql,
            placeholders: placeholders
        }).then( d => {
            if (d.success && d.message) {
                this.modalService.alert('操作成功可以执行保存');
                this.showType = 'norm';
                if (!document.getElementsByClassName('norm-save') || document.getElementsByClassName('norm-save').length === 0) {
                    let elm = document.getElementsByClassName('sql-btn')[0];
                    let button = document.createElement('button');
                    button.className = 'btn primary norm-save';
                    button.innerHTML = '保存';
                    button.onclick = () => {
                        if (this.type === 'add') {
                            this.addSubmit();
                        } else {
                            this.saveClick();
                        }
                    };
                    elm.parentNode.appendChild(button);
                }

                this.showplaceholder = true;
                this.showPreviewResult = true;
                let arr = [];
                d.message.forEach(item => {
                    this.keys = Object.keys(item);
                    arr.push({
                        ...item,
                    });
                });
                this.thWidth = 100 / this.keys.length;

                this.previewList = arr;
                this.resultType = this.previewList.length > 1 ? this.resultTypes[1] : this.resultTypes[0];
            } else {
                this.modalService.alert(d.message || '网络异常');
            }
        });
    }

    /**
     * 校验是否有占位符和进行过预览操作
     *
     */
    checkPreview () {
        // 有占位符 且处于添加指标dom状态
        if (!this.showplaceholder) {
            if (this.normSql.indexOf('$') !== -1 && this.showType !== 'viewSql') {
                this.placeArr = [];
                const reg = /\$[a-zA-Z1-9]{0,}/ig;
                let arr = this.normSql.match(reg);
                arr.forEach(item => {
                    this.placeArr.push({
                        errorType: false,
                        error: '',
                        oldValue: item,
                        newValue: ''
                    });
                });
                this.showType = 'viewSql';
                return;
            }
            // 替换占位符dom显示 且未进行sql预览操作
            if (this.showType === 'viewSql' && !this.showplaceholder) {
                let result = false;
                this.placeArr.forEach(item => {
                    if (!item.newValue) {
                        result = true;
                    }
                });
                if (result) {
                    this.modalService.alert('请替换占位符');
                    return;
                }
                this.modalService.alert('请进行sql预览操作');
                return;
            }
        }
        return true;
    }
    goBack() {
        this.showType = 'norm';
    }

    hideInstance: Function;
}
