/**
 * Created by LIHUA on 2017-08-25.
 *  字符串处理
 */
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'substr'})
export class SubstrPipe implements PipeTransform {

    /**
     * 字符串截取
     * @param {string} value  待处理字符串
     * @param {number} max    最大值
     * @param {string} final  结尾修饰符
     * @returns {string}
     */
    transform(value: string, max = 30, final = '...') {
        value = value + '';
        if (value.length > max) {
            value = value.substr(0, max) + final;
        }
        return value;
    }
}
