/**
 * 属性验证器服务
 *
 *
 * http://validatejs.org/
 */

import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

declare let validate: any;
import {Injectable} from '@angular/core';

@Injectable()
export class ValidateService {

    constructor(private toolService: ToolService) {
        validate.validators.errorType = () => {};

        validate.validators.reg = (value, options) => {
            if (options && options.format) {
                if (this.toolService.isRegExp(options.format)) {
                    if (!options.format.test(value)) {
                        return options.message;
                    }
                }
                if (this.toolService.isString(options.format)) {
                    if (!(new RegExp(options.format)).test(value)) {
                        return options.message;
                    }
                }
            }
        };
    }

    /**
     * 验证函数
     * @param scope          待验证对象
     * @param obj            验证配置
     * @param list           验证属性
     * @param {boolean} all  是否返回全部验证结果
     */
    get(scope: any, obj: any, list?: any, all: boolean = false) {
        let validateObject = this.getValidateObjects(obj, list);
        let check = validate(scope, validateObject);
        if (check) {
            let checkError = this.getCheckError(obj, check);
            if (all) {
                return checkError;
            } else {
                let first = null;
                Object.keys(checkError).forEach((c, i) => {
                    if (i === 0) {
                        first = checkError[c];
                    }
                });
                return first;
            }
        }
    }

    /**
     * 获取验证对象
     * @param obj
     * @param list
     * @returns {any}
     */
    private getValidateObjects(obj: any, list: any) {
        if (list) {
            let validateObject = {};
            list.forEach(l => {
                validateObject[l] = obj[l];
            });
            return validateObject;
        } else {
            return obj;
        }
    }

    /**
     *
     * @param obj
     * @param check
     */
    private getCheckError(obj, check) {
        let checkError = {};
        Object.keys(check).forEach(c => {
            checkError[c] = {
                error: check[c][0],
                errorType: obj[c].errorType
            };
        });

        return checkError;
    }
}
