/**
 * Created by LIHUA on 2017-08-11.
 */
declare var moment: any;
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'date'})
export class DatePipe implements PipeTransform {
    transform(value: any, type: string = 'YYYY/MM/DD') {
        return moment(value).format(type);
    }
}
