import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from './momentPipe';
import * as moment from 'moment';

@Pipe({
  name: 'dateTimeFormat',
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
      return moment(value).local().format(Constants.DATE_TIME_FMT);
  }
}
