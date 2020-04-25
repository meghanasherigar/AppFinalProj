import { Component, OnInit, ViewChild } from '@angular/core';
import { Question, Category, WhatsNew_Category } from '../../../../../@models/admin/content-whatsnew';
import { Subscription } from 'rxjs';
import { Dialog } from '../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { ContentWhatsnewService } from '../../../services/content-whatsnew.service';

@Component({
  selector: 'ngx-cont-whatsnew',
  templateUrl: './WhatsNewContentComponent.html',
  styleUrls: ['./WhatsNewContentComponent.scss']
})
export class WhatsNewContentComponent implements OnInit {

  listOfCategories: Question[];
  listOfFAQCategories: WhatsNew_Category[];
  listOfQuestions: Question[];
  panelOpenState: boolean = false;
  addBtn: boolean = false;
  listOfOrginalCategories: Category[];
  //listOfOriginalQuestions: Answer;
  listOfOriginalQuestions: Question[];
  questionList: Question[];
  categoryList: Category[];
  faqCategoryList: WhatsNew_Category[];
  private tempCategoryUid: number;
  disablePublish: boolean = false;
  questionsUnique = 0;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;

  constructor(
    private dialog: MatDialog,
    private contentService: ContentWhatsnewService,
    private http: HttpClient) { }

  ngOnInit() {
    this.getWhatsNewList();
  }

  expandPanel(matExpansionPanel, event, cat): void {
    event.stopPropagation(); // Preventing event bubbling
    const expansionIndicatorClass = 'nb-arrow-down';

    if (!this._isExpansionIndicator(event.target, expansionIndicatorClass) && !this._isExpansionIndicator(event.target, 'textAreawidth')) {
      if (!matExpansionPanel.collapsedValue)
        matExpansionPanel.close(); // Here's the magic
      else
        matExpansionPanel.open();
    }
  }

  private _isExpansionIndicator(target: EventTarget, expansionIndicatorClass): boolean {
    return (target['classList'] && target['classList'].contains(expansionIndicatorClass));
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
}