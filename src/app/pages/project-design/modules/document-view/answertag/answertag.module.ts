import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnswertagMenuComponent } from './answertag-menu/answertag-menu.component';
import { AnswertagTabsComponent } from './answertag-tabs/answertag-tabs.component';
import { AnswertagVariablesComponent } from './answertag-variables/answertag-variables.component';

@NgModule({
  declarations: [AnswertagMenuComponent, AnswertagTabsComponent, AnswertagVariablesComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  imports: [
    CommonModule
  ]
})
export class AnswertagModule { }
