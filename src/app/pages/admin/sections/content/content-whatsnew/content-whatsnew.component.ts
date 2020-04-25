import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Question, Category, WhatsNew_Category, WhatsNew_Question, WhatsNewLastModified, CkEditor } from '../../../../../@models/admin/content-whatsnew';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { Subscription, from } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { ContentWhatsnewService } from '../../../services/content-whatsnew.service';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-content-whatsnew',
  templateUrl: './content-whatsnew.component.html',
  styleUrls: ['./content-whatsnew.component.scss']
})
export class ContentWhatsnewComponent implements OnInit,OnDestroy {

  listOfCategories: Question[];
  addBtn: boolean = false;
  listOfOrginalCategories: Category[];
  questionList: Question[];
  faqCategoryList: WhatsNew_Category[];
  private tempCategoryUid: number;
  disablePublish: boolean = false;
  questionsUnique = 0;
  lastModified: WhatsNewLastModified;
  lastPublished:  WhatsNewLastModified;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;
  public editorValue: string;
  public currentArray: any;
  public currentIndex: number;
  public editable: boolean = false;
  public discardheading: boolean = false;


  constructor(
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService,

    private contentService: ContentWhatsnewService, 
    private sharedAdminService: SharedAdminService, private translate: TranslateService) { }

    loaderId='ContentWhatsnewLoader';
    loaderPosition=POSITION.centerCenter;
    loaderFgsType=SPINNER.ballSpinClockwise; 
    loaderColor = '#55eb06';

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.discardheading = false;
    this.sharedAdminService.sourceElement = {};
    this.sharedAdminService.newEditor = undefined;
    this.getLastModifiedData();
    this.getLastPublishedData();
    this.getWhatsNewList();

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ContentWhatsNew).subscribe((payload) => {

      if (payload === "Save") {
        this.editable = false;
        var rootNames = this.sharedAdminService.newEditor.model.document.getRootNames();
        for (const rootName of rootNames) {
          var array = rootName.split("-");
          let _id = array[2];
          let contentData = this.listOfCategories.find(c => c.editable == true && c.id == _id);
          if (contentData) {
            contentData.answer = this.sharedAdminService.newEditor.getData({ rootName });
          }
        }
        let contentData = this.listOfCategories.filter(c => c.editable === true || c.id.indexOf('temp') > -1);
        this.questionList = [];
        let valid = true;
        this.faqCategoryList = [];
        if (contentData != undefined) {
          contentData.forEach(catData => {
            if (catData.question.trim() === "" || catData.question === undefined) {
              valid = false;
              this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.admin.commonMessage.questionEmpty'));
              return;
            } else if (catData.answer.trim() === "" || catData.answer === undefined) {
              valid = false;
              this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.admin.commonMessage.answerEmpty'));
              return;
            }
          });
        }

        contentData.forEach(catData => {
          if (catData.editable === true) {
            let tmpCategory = new WhatsNew_Category();
            tmpCategory.categoryid = (catData.id.indexOf('temp') > -1) ? '' : catData.id;
            tmpCategory.categorydescription = '';
            tmpCategory.questionlist = new Array<WhatsNew_Question>();
            let tmpQuestion = new WhatsNew_Question();
            tmpQuestion.id = (catData.id.indexOf('temp') > -1) ? '' : catData.id;
            tmpQuestion.question = catData.question;
            tmpQuestion.publishedAdmin = false;
            tmpQuestion.publishedAnswer = false;
            tmpQuestion.publishedQuestion = false;
            tmpQuestion.PublishedUser = true;
            tmpQuestion.answer = catData.answer === null ? '' : catData.answer;
            tmpQuestion.isactive = true;
            tmpQuestion.ispublished = true;
            tmpCategory.questionlist.push(tmpQuestion);
            this.faqCategoryList.push(tmpCategory);
          }
        });

        if (valid) {
          if ((this.faqCategoryList && this.faqCategoryList.length > 0)) {
            this.contentService.InsertUpdateWhatsNew(this.faqCategoryList)
              .subscribe(data => {
                //If the status is 1 and error message collection is empty then the data was saved successfully.
                if (data['status'] === 1) {
                  this.toastr.success(this.translate.instant('screens.admin.commonMessage.dataSaved'));
                  this.getLastModifiedData();
                  this.getLastPublishedData();
                  this._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(false);
                  this.getWhatsNewList();
                  document.getElementById("toolbar-menu").innerHTML = "";
                }

              }), (error) => {
                console.log('Error inserting or updating FAQs.')
              }, () => console.info('OK');
          }
        }
        this.addBtn = false;

      } else if (payload == "Publish") {
        this.publishCategory();
      }
    }));
  }

  getLastModifiedData() {
    this.contentService.getLastModifiedData().subscribe(response => {
      if (response) {
        this.lastModified = response;
      }
    });
  }
  getLastPublishedData() {
    this.contentService.getLastPublishedData().subscribe(response => {
      if (response) {
        this.lastPublished = response;
      }
    });
  }

  expandedStopPropagation() {
    event.stopPropagation(); // Preventing event bubbling
  }


  expandPanel(matExpansionPanel, event, cat, index): void {
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

  ShowIconsSet(divIcons) {
    divIcons.classList.add("showIcons");
  }

  HideIconsSet(divIcons) {
    divIcons.classList.remove("showIcons");
  }

  getWhatsNewList() {
    this.discardheading = false;
    this.listOfCategories = new Array<Question>();
    this.contentService.getWhatsNewQuestion().subscribe(response => {
      if (response !== null && response.length > 0) {
        //Parse the response array viz categoryList
        response.forEach(questionsList => {
          let newCategory = new Question();
          newCategory.id = questionsList['id'];
          newCategory.question = questionsList['question'];
          newCategory.answer = questionsList['answer'];
          this.editorValue = questionsList['answer'];
          newCategory.colourcode = questionsList['colourCode'];
          newCategory.editable = false;
          newCategory.collapsed = true;
          this.listOfCategories.push(newCategory);
        });
        this.listOfOrginalCategories = JSON.parse(JSON.stringify(this.listOfCategories));
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }

  //TODO: Check if this can be made more robust and re-usable
  private generateUniqueCatId() {
    if (this.tempCategoryUid !== this.listOfCategories.length) {
      this.tempCategoryUid = this.listOfCategories.length + 1;
    } else {
      this.tempCategoryUid++;
    }
    return 'tempUID' + this.tempCategoryUid;
  }
  private generateUniqueQuestionId() {
    this.questionsUnique = this.questionsUnique + 1;
    return 'tempUID' + this.questionsUnique;
  }

  addTopic() {
    this.discardheading = false;
    this.editable = false;
    this.currentIndex = this.listOfCategories.length + 1;
    var question = new Question();

    question.id = this.generateUniqueQuestionId();
    question.collapsed = false;
    //TODO: generate unique Category ID (only UI)
    var categoryObj = {
      id: this.generateUniqueCatId(),
      question: '',
      answer: '',
      publishedadmin: false,
      colourcode: -1,
      editable: true,
      collapsed: false,
      isactive: false,
      ispublished: false,
      publishedQuestion: null,
      publishedAnswer: null,
      publishedAdmin: false,
      PublishedUser: false,

    };
    this.listOfCategories.push(categoryObj);
    this.addBtn = true;
    this._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(true);
  
  }

  editHeading(id, index) {
    this.discardheading = false;
    this.editable = true;
    this.currentIndex = index + 1;
    const currentElement = this.listOfCategories[index];
    this.listOfCategories[index] = new Question(); 
    const objectToAdd  = new Question();
    objectToAdd.id = currentElement.id;
    objectToAdd.editable = true;
    objectToAdd.collapsed = false;
    objectToAdd.answer = currentElement.answer;
    objectToAdd.question = currentElement.question;
    this.listOfCategories[index] = objectToAdd;
    this._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(true);
  }

  deleteHeading(categoryID: string) {
    this.discardheading = false;
    //TODO: revisit logic:  API takes Array but UI supports single deletion, hence 
    // list of deleted categories.
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = "Are you sure you want to delete?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let deleteCategoryIds = new Array<string>();
        deleteCategoryIds.push(categoryID);

        this.contentService.deleteCategories(deleteCategoryIds).subscribe(response => {
          //If the deletion was successful, get categories
          if (response.status === 1) {
            this.toastr.success(this.translate.instant('screens.admin.commonMessage.categoryDeleted'));
            this.getWhatsNewList();
          }
          else {
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          }
        });
      }
    });
  }

  discardCategory(cat, index) {
    let currentindex = index;
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.admin.commonMessage.discardQ');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        cat.collapsed = true;
        cat.editable = false;
        let index = this.getIndexOfData(cat.id, this.listOfCategories);
        this.discardheading = true;
        delete this.sharedAdminService.sourceElement["header" + '-' + (index + 1) + "-" + cat.id];

        //Check for the tempID for newly added category
        if (cat.id.indexOf('temp') > -1) {
          this.listOfCategories.splice(index, 1);
          this.addBtn = false;
        }
        else {
          this.listOfCategories[index] = JSON.parse(JSON.stringify(this.listOfOrginalCategories[index]));
        }
        dialogRef.close();
        let contentData = this.listOfCategories.find(c => c.editable == true || c.id.indexOf('temp') > -1);
        if (contentData == null) {
          this.disablePublish = false;
        }
        else {
          this.disablePublish = true;
        }
      }
      else
        this.dialog.closeAll();
    });
  }

  discardElementChanges(collapsed, editable,index){
    const currentElement = this.listOfCategories[index];
    this.listOfCategories[index] = new Question(); 
    const objectToAdd  = new Question();
    objectToAdd.id = currentElement.id;
    objectToAdd.editable = collapsed;
    objectToAdd.collapsed = editable;
    objectToAdd.answer = currentElement.answer;
    objectToAdd.question = currentElement.question;
    this.listOfCategories[index] = objectToAdd;
  }

  publishCategory() {
    this.discardheading = false;
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.admin.commonMessage.publishQ');
   
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let publishCategories = new Array<string>();
        this.listOfOrginalCategories.forEach(element => {
          publishCategories.push(element.id);
        });
        this.contentService.publishCategories(publishCategories).subscribe(response => {
          if (response.status === 1) {
            this.toastr.success(this.translate.instant('screens.admin.commonMessage.publish'));
             this.getWhatsNewList();
            this.getLastPublishedData();
          }
          else {
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          }
        });
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  getIndexOfData(_id: string, listOfData): number {
    return listOfData.findIndex(record => record.id === _id);
  }
    
  ngOnDestroy() {
    this.sharedAdminService.sourceElement = {};
    this.sharedAdminService.newEditor = undefined;
    this.subscriptions.unsubscribe();
  }
}