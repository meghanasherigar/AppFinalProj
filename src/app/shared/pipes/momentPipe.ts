import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

export class Constants {
    static readonly DATE_FMT = 'DD MMM YYYY';
    static readonly DATE_TIME_FMT = `${Constants.DATE_FMT} hh:mm:ss`;
 }

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
    transform(value: Date | moment.Moment, dateFormat?: string): any {
        if(dateFormat == undefined || dateFormat == null) {
        return moment(value).local().format(Constants.DATE_FMT);
        } else {
        return moment(value).local().format(dateFormat);
        }
    }
}

