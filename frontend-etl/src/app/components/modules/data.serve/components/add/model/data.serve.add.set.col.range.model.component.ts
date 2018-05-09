import {Component, OnInit} from '@angular/core';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

interface conditionArrayType {
    checked: any;        // 选择的
    options: Array<any>; // 下拉选项
    value: any;
    errorType: any;
    error: any;
}

@Component({
    selector: 'data-service-add-set-col-range-model',
    templateUrl: 'data.serve.add.set.col.range.model.component.html',
    styleUrls: ['data.serve.add.set.col.range.model.component.scss']
})
export class DataServeAddSetColRangeModelComponent implements OnInit {

    hideInstance: Function;

    conditionArray: Array<conditionArrayType>;   // 条件组
    colInfo: any;                                // 字段信息

    opts = [
        {
            name: '>'
        }, {
            name: '<'
        }, {
            name: 'between'
        }, {
            name: '>='
        }, {
            name: '<='
        }, {
            name: '!='
        }, {
            name: 'in'
        }, {
            name: 'like'
        }
    ];

    constructor (private modalService: ModalService) {}

    ngOnInit() {
        if (!this.colInfo || !this.colInfo.range) {
            this.conditionArray = [
                {
                    checked: null,
                    options: this.opts,
                    value: '',
                    errorType: -1,
                    error: ''
                }
            ];
        } else if (this.colInfo && this.colInfo.range) {
            this.conditionArray = [];
            for (let key in this.colInfo.range) {
                if (this.colInfo.range.hasOwnProperty(key)) {
                    let temp = {
                        checked: null,
                        options: this.opts,
                        value: this.colInfo.range[key],
                        errorType: -1,
                        error: ''
                    }

                    this.opts.forEach( o => {
                        if (o.name === key) {
                            temp.checked = o;
                        }
                    });

                    this.conditionArray.push(temp);
                }

            }
        }

    }

    /**
     * 确定保存
     * @returns {{}}
     */
    saveClick() {
        if (this._check()) {
            if (this.conditionArray.length === 1 && !this.conditionArray[0].value && !this.conditionArray[0].checked) {
                this.hideInstance();
                return '';
            }
            let res = {};
            this.conditionArray.forEach( c => {
                res[c.checked.name] = c.value;
            });

            this.hideInstance();
            return res;
        }
    }

    /**
     * 检查
     *
    */
    _check(): boolean {
        if (this.conditionArray.length === 1 && !this.conditionArray[0].value && !this.conditionArray[0].checked) {
            return true;
        }
        let decimal = /^(\-|\+)?\d+(\.\d+)?$/;    // 正数、负数、和小数
        const str = '>,<,>=,<=,';
        for (let i = 0; i < this.conditionArray.length; i++) {
            if (!this.conditionArray[i].checked) {
                this.conditionArray[i].errorType = 1;
                this.conditionArray[i].error = '请选择';
                return;
            }
            if (!this.conditionArray[i].value) {
                this.conditionArray[i].errorType = 2;
                this.conditionArray[i].error = '请输入';
                return;
            }
            if (this.conditionArray[i].value && !decimal.test(this.conditionArray[i].value) && str.indexOf(this.conditionArray[i].checked.name) !== -1) {
                this.conditionArray[i].errorType = 2;
                this.conditionArray[i].error = '请输入整数或小数';
                return;
            }
            if (this.conditionArray[i].checked.name === 'between' || this.conditionArray[i].checked.name === 'between') {
                if (this.conditionArray[i].value.indexOf(',') === -1) {
                    this.conditionArray[i].errorType = 2;
                    this.conditionArray[i].error = '格式错误，范围值以逗号隔开';
                    return;
                }
                let arr = this.conditionArray[i].value.split(',');
                if (arr.length < 2 || arr.length > 2) {
                    this.conditionArray[i].errorType = 2;
                    this.conditionArray[i].error = '只允许两个值';
                    return;
                }
               if (!decimal.test(arr[0]) || !decimal.test(arr[1])) {
                   this.conditionArray[i].errorType = 2;
                   this.conditionArray[i].error = '请输入整数或小数';
                   return;
               }
               if (arr[0] > arr[1]) {
                   this.conditionArray[i].errorType = 2;
                   this.conditionArray[i].error = '请将较小值输入在前';
                   return;
               }
            }
            this.conditionArray[i].errorType = -1;
            this.conditionArray[i].error = '';
        }
        return true;
    }


    /**
     * 增加条件
    */
    addCon() {

        this.conditionArray.push({
            checked: null,
            options: this.opts,
            value: '',
            errorType: -1,
            error: ''
        });
    }
    /**
     * 选择条件
     */
    checkCon(item: any, index: number) {
        this.conditionArray[index].checked = item;
    }

    /**
     * 删除行
     */
    deleteLine(item: any, index: any) {
        if (this.conditionArray.length < 2) {
            return;
        }
        this.conditionArray.splice(index, 1);
    }

}
