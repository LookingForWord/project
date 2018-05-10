/**
 * Created by lh on 2017/12/19.
 * 数字显示转换
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'number'})
export class NumberPipe implements PipeTransform {

    /**
     * 把数字按照连接符连接
     * @param value
     * @param {string} connector
     */
    transform(value: any, connector = ',') {
        return NumberPipe.trans(value, connector);
    }

    static trans(value: any, connector = ',') {
        value = value + '';

        let temp = [];
        if (value.length > 3) {
            value = value.split('').reverse();
            for (let i = 0; i < value.length; i++) {
                if ((i + 1) < value.length && (i + 1) % 3 === 0) {
                    temp.push(value[i]);
                    temp.push(connector);
                } else {
                    temp.push(value[i]);
                }
            }
        }

        return temp.length ? temp.reverse().join('') : value;
    }
}
