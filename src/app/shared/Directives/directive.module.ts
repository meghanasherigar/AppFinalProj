import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Alphabetdirective} from './alphabet.directive';
import { TwoDigitDecimaNumberDirective } from './number.directive';

@NgModule({
  declarations: [Alphabetdirective, TwoDigitDecimaNumberDirective],
  imports: [
    CommonModule,
  ],
  exports: [Alphabetdirective, TwoDigitDecimaNumberDirective],
})
export class DirectiveModule { }
