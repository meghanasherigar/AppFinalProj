import { Component, OnInit, ViewChild } from '@angular/core';
import { Question, Category, WhatsNew_Category } from '../../../@models/admin/content-whatsnew';
import { Subscription } from 'rxjs';
import { Dialog } from '../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ContentWhatsnewService } from '../../help/services/content-whatsnew.service';
declare var $: any;
@Component({
  selector: 'ngx-whatsnew',
  templateUrl: './whatsnew.component.html',
  styleUrls: ['./whatsnew.component.scss']
})
export class WhatsnewComponent implements OnInit {

  listOfCategories: Question[];
  listOfFAQCategories: WhatsNew_Category[];
  listOfQuestions: Question[];
  panelOpenState: boolean = false;
  addBtn: boolean = false;
  listOfOrginalCategories: Category[];
  listOfOriginalQuestions: Question[];
  questionList: Question[];
  categoryList: Category[];
  faqCategoryList: WhatsNew_Category[];
  disablePublish: boolean = false;
  questionsUnique = 0;
  subscriptions: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private contentService: ContentWhatsnewService) { }

  ngOnInit() {
    this.getWhatsNewList();
    setTimeout("$('.carousel').carousel({interval: 5000});", 5000);
  }

  getWhatsNewList() {
    this.listOfCategories = new Array<Question>();
    this.contentService.getWhatsNewListUser().subscribe(response => {
      if (response !== null && response.length > 0) {
        response.forEach(questionsList => {
          let newCategory = new Question();
          newCategory.id = questionsList['id'];
          newCategory.question = questionsList['question'];
          newCategory.answer = questionsList['answer'];
          newCategory.editable = false;
          newCategory.collapsed = true;
          this.listOfCategories.push(newCategory);
        });
      }
    });
  }

  getCategoryHeading(_itemId: string, categoriesList): Category[] {
    // The following line does not work
    return categoriesList.filter(function (element, index, array) { return element.id == _itemId });
  }
  skipWhatsNew() {
    this.router.navigate(['pages/home']);
  }
}
