/**
 * Created by LIHUA on 2017-08-25.
 * 文件大小转换
 */

import {PipeTransform, Pipe} from '@angular/core';

@Pipe({name: 'size'})
export class SizePipe implements PipeTransform {

    constructor() {}

    /**
     *
     * @param value          待转换的值
     * @param {string} unit  待转换单位
     * @returns {string}
     */
    transform(value: any, unit?: string): string {
        value = Number(value);

        if (unit === 'KB' || unit === 'kb') {
            value = value * 1024;
        }
        if (unit === 'MB' || unit === 'mb') {
            value = value * 1024 * 1024;
        }
        if (unit === 'GB' || unit === 'gb') {
            value = value * 1024 * 1024 * 1024;
        }
        if (unit === 'TB' || unit === 'tb') {
            value = value * 1024 * 1024 * 1024;
        }

        if (value < 1024) {
            return (value / 1024).toFixed(2) + 'B';
        } else if (value < 1024 * 1024) {
            return (value / (1024 * 1024)).toFixed(2) + 'KB';
        } else if (value < 1024 * 1024 * 1024) {
            return (value / (1024 * 1024)).toFixed(2) + 'MB';
        } else if (value < 1024 * 1024 * 1024 * 1024) {
            return (value / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
        } else if (1024 * 1024 * 1024 * 1024 * 1024) {
            return (value / (1024 * 1024 * 1024 * 1024)).toFixed(2) + 'TB';
        } else {
            return 'size too big';
        }
    }
}
