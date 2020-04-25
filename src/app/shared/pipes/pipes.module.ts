import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatPipe } from './momentPipe';
import { DateTimeFormatPipe } from './dateTimeFormatPipe';
import { DateAgoPipe } from './date-agoPipe';
import { SafeHtmlPipe } from './safeHtml.pipe';

@NgModule({
  declarations: [DateFormatPipe, DateTimeFormatPipe,DateAgoPipe, SafeHtmlPipe],
  imports: [
    CommonModule,
  ],
  exports: [DateFormatPipe, DateTimeFormatPipe,DateAgoPipe, SafeHtmlPipe],
  providers: [DateFormatPipe, DateTimeFormatPipe,DateAgoPipe, SafeHtmlPipe]
})
export class PipesModule { }
