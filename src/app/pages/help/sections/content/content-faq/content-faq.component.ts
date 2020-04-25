import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Question, Category, Answer, FAQ_Category, FAQ_Question,FAQLastModified } from '../../../../../@models/admin/contentFAQ';
import { ContentFaqService } from '../../../services/content-faq.service';
import { VERSION } from '@angular/material';
import { ThemeSettingsComponent } from '../../../../../@theme/components';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
@Component({
  selector: 'ngx-content-faq',
  templateUrl: './content-faq.component.html',
  styleUrls: ['./content-faq.component.scss']
})
export class ContentFAQComponent implements OnInit,OnDestroy {
  ngOnDestroy(): void {
   this.subscriptions.unsubscribe();
  }
  listOfCategories: Category[];
  listOfFAQCategories: FAQ_Category[];
  listOfQuestions: Question[];
  panelOpenState: boolean = false;
  addBtn: boolean = false;
  listOfOrginalCategories: Category[];
  //listOfOriginalQuestions: Answer;
  listOfOriginalQuestions: Question[];
  questionList: Question[];
  categoryList: Category[];
  faqCategoryList: FAQ_Category[];
  answersByCategory: Answer[];
  private tempCategoryUid: number;
  disablePublish: boolean = false;
  questionsUnique = 0;
  lastModified:FAQLastModified;
  isIE : boolean = false;
  searchTextExists:boolean = false;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;
  constructor(private contentFaq: ContentFaqService,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toastr: ToastrService,
    private contentService: ContentFaqService,
    private http: HttpClient,
    private sharedService: ShareDetailService
  ) { }

  ngOnInit() {
    
    const match = navigator.userAgent.search(/(?:Edge|MSIE|Trident\/.*; rv:)/);
    if (match !== -1) {
        this.isIE = true;
    }
    this.getLastModifiedData();
    this.getCategories();

    this.sharedService.faqSearch.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((data: string) => {
          if(data){       
            this.searchTextExists = true;
            return this.contentService.searchFAQ(data);
          }
          this.searchTextExists = false;
          return (new BehaviorSubject<Category[]>(this.listOfOrginalCategories)).asObservable();
      })).subscribe(response => {  
          this.listOfCategories = response;
      });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ContentFAQ).subscribe((payload) => {
      if (payload == "Save") {
        this.categoryList = [];
        this.faqCategoryList = [];
        
        let contentData = this.listOfCategories.find(c => c.editable == true || c.id.indexOf('temp') > -1);
        this.questionList = [];

        if (this.listOfCategories != null) {
          this.listOfCategories.forEach(catData => {
            if (catData.editable === true) {
              this.categoryList.push(catData);
              let tmpCategory = new FAQ_Category();
              tmpCategory.categoryid = (catData.id.indexOf("temp") > -1) ? '' : catData.id;
              tmpCategory.categorydescription = catData.description;
              tmpCategory.questionlist = new Array<FAQ_Question>();

              catData.questions.forEach(element => {
                let tmpQuestion = new FAQ_Question();
                tmpQuestion.id = (element.id.indexOf("temp") > -1) ? '' : element.id;
                tmpQuestion.question = element.description;
                tmpQuestion.answer = element.answer === null ? '' : element.answer.description;
                tmpQuestion.isactive = true;
                tmpQuestion.ispublished = true;
                tmpCategory.questionlist.push(tmpQuestion);
              });
              this.faqCategoryList.push(tmpCategory);

              if (catData.questions != null) {
                let queData :Question[] = catData.questions.filter(element => element.editable == true && element.id.indexOf('temp') > -1);
                if (queData != undefined)
                  this.questionList = queData;

              }
            }
            //New questions of existing category
            else if (catData.questions != null) {
              catData.questions.forEach(el => {
                if (el.editable) {
                  this.categoryList.push(catData);
                  let tmpCategory = new FAQ_Category();
                  tmpCategory.categoryid = (catData.id.indexOf("temp") > -1) ? '' : catData.id;
                  tmpCategory.categorydescription = catData.description;
                  tmpCategory.questionlist = new Array<FAQ_Question>();

                  catData.questions.forEach(element => {
                    let tmpQuestion = new FAQ_Question();
                    tmpQuestion.id = (element.id.indexOf("temp") > -1) ? '' : element.id;
                    tmpQuestion.question = element.description;
                    tmpQuestion.answer = element.answer === null ? '' : element.answer.description;
                    tmpQuestion.isactive = true;
                    tmpQuestion.ispublished = true;
                    tmpCategory.questionlist.push(tmpQuestion);
                  });
                  this.faqCategoryList.push(tmpCategory);

                  if (catData.questions != null) {
                    let queData :Question[] = catData.questions.filter(element => element.editable == true && element.id.indexOf('temp') > -1);
                    if (queData != undefined)
                      this.questionList = queData;
    
                  }
                }

              })
            }
          });
        }

        let editedCatData = this.categoryList.filter(item => item.description.trim() != "" && item.description != undefined && item.description != "Enter heading here.");
        if (contentData != undefined) {
          if (contentData.description.trim() == "" || contentData.description == undefined || contentData.description == "Enter heading here.") {
            this.dialogService.Open(DialogTypes.Warning, "Category can not be empty");
            return;
          }
        }

        let data: any;
        let testData: any;
        if (this.questionList.length > 0)
         testData = this.questionList.filter(item => item.description == "Enter sub heading here.");
         data = this.questionList.filter(item => item.description.trim() != "" && item.description != undefined && item.description != "Enter sub heading here.");
        if(testData && testData.length > 0){
          this.dialogService.Open(DialogTypes.Warning, "Question content can not be empty");
        }        
        else if ((data && data.length > 0 && data !=undefined ) || this.questionList.length ==0)  {
          this.contentService.InsertUpdateFAQ(this.faqCategoryList)
            .subscribe(data => {
              //If the status is 1 and error message collection is empty then the data was saved successfully.
              if (data['status'] === 1) {
                this.toastr.success(this.translate.instant('screens.admin.commonMessage.dataSaved'));
                this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(false);
                this.getCategories();
              }

            }
            ),
            error => {
              console.log('Error inserting or updating FAQs.')
            },
            () => console.info('OK');
          return false;

          this.toastr.success(this.translate.instant('screens.admin.commonMessage.dataSaved'));

        }
        else if (!(data && data.length > 0) || this.questionList.length !=0 ){
          this.dialogService.Open(DialogTypes.Warning, "Question content can not be empty");
        }
        this.addBtn = false;
      }
      else if (payload == "Publish") {
        this.publishCategory();
      }
    }));
  }

  getLastModifiedData()
{
  this.contentService.getLastModifiedData().subscribe(response=>
    {
      if(response)
      {
        this.lastModified= response;
      }
    });
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
    else if (!this.searchTextExists && !this._isExpansionIndicator(event.target, 'textAreawidth')) {
      this.loadQuestions(cat.id);
    }
  }
  expandPanelQuestion(matExpansionPanel, event, catId, question): void {

    event.stopPropagation(); // Preventing event bubbling
    const expansionIndicatorClass = 'nb-arrow-down';
    if (!this._isExpansionIndicator(event.target, expansionIndicatorClass) && !this._isExpansionIndicator(event.target, 'textAreawidth')) {
      if (!matExpansionPanel.collapsedValue) {
        matExpansionPanel.close(); // Here's the magic
      }
      else
        matExpansionPanel.open();
    }
    else if (!this.searchTextExists && !this._isExpansionIndicator(event.target, 'textAreawidth')) {
      this.loadAnswers(catId, question.id);
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
  getCategories() {
    this.listOfCategories = new Array<Category>();
    this.contentService.getCategories().subscribe(response => {
      if (response !== null && response.length > 0) {
        //Parse the response array viz categoryList
        response.forEach(category => {
          let newCategory = new Category();
          newCategory.id = category['id'];
          newCategory.description = category['description'];
          newCategory.colourCode = category.colourCode;
          newCategory.questions = null;
          newCategory.editable = false;
          newCategory.collapsed = true;
          //Add the category to the list to be displayed on the screen
          this.listOfCategories.push(newCategory);
        });
        this.listOfOrginalCategories = JSON.parse(JSON.stringify(this.listOfCategories));
      }
    });
  }
  loadQuestions(item) {
    if (item.indexOf('temp') == -1) {
      this.listOfQuestions = new Array<Question>();
      this.contentService.getQuestions(item).subscribe(response => {
        if (response !== null && response.length > 0) {
          //Parse the response array viz categoryList
          response.forEach(question => {
            let newQuestion = new Question();
            newQuestion.id = question['id'];
            newQuestion.description = question['description'];
            newQuestion.colourCode = question.colourCode;
            newQuestion.editable = false;
            newQuestion.collapsed = true;
            //Add the category to the list to be displayed on the screen
            this.listOfQuestions.push(newQuestion);
          });
        }
        let index = this.getIndexOfData(item, this.listOfCategories);
        this.listOfCategories[index].questions = JSON.parse(JSON.stringify(this.listOfQuestions));
        this.listOfOrginalCategories[index].questions = JSON.parse(JSON.stringify(this.listOfCategories[index].questions));
        this.listOfQuestions.forEach(ele => {
          this.loadAnswers(item, ele.id);
        })
      });
    }
  }
  loadAnswers(catId, item) {
    //Make API Call only for existing question Id
    if (item !== '' && item !== '000000000000000000000000') {
      let answer = new Answer();
      // this.listOfQuestions = [{ id: '1', content: 'Dude you are getting a telescope?', editable: false, collapsed: true }, { id: '2', content: '5 Reasons to keep your Beauty Salon Reservation?', editable: false, collapsed: true }, { id: '3', content: 'Motivation And Your Personal Vision An Unbeatable Force?', editable: false, collapsed: true }];
      this.contentService.getAnswers(item).subscribe(response => {
        if (response !== null) {
          //Parse the response array viz categoryList
          answer.id = response.id;
          answer.description = response.description;
          answer.editable = false;
          answer.collapsed = true;
        }
        let index = this.getIndexOfData(item, this.listOfQuestions);
        // this.listOfQuestions[index].answer = answer;
        let index1 = this.getIndexOfData(catId, this.listOfCategories);
        this.listOfCategories[index1].questions[index].answer = answer;
        this.listOfOrginalCategories[index1].questions[index].answer = JSON.parse(JSON.stringify(this.listOfCategories[index1].questions[index].answer));
      });
    }

  }
  addAnswerToQuestion(question: Question) {
    let answer = new Answer();
    answer.id = '';
    answer.collapsed = true;
    answer.description = '';
    answer.editable = true;
    question.answer = answer;
    return question;
  }

  //TODO: Check if this can be made more robust and re-usable
  private generateUniqueCatId() {
    if (this.tempCategoryUid !== this.listOfCategories.length) {
      this.tempCategoryUid = this.listOfCategories.length + 1;
    }
    else {
      this.tempCategoryUid++;
    }
    return 'tempUID' + this.tempCategoryUid;
  }
  private generateUniqueQuestionId() {
    this.questionsUnique = this.questionsUnique + 1;
    return 'tempUID' + this.questionsUnique;
  }

  addTopic() {
    var questionlist = new Array();
    var question = new Question();

    question.id = this.generateUniqueQuestionId();
    question.description = 'Enter sub heading here.';
    question.colourCode = 0;
    question.editable = true;
    question.collapsed = false;
    questionlist.push(this.addAnswerToQuestion(question));

    //TODO: generate unique Category ID (only UI)
    var categoryObj = {
      id: this.generateUniqueCatId(),
      description: 'Enter heading here.', questions: questionlist, editable: true, colourCode:0, collapsed: false
    };
    this.listOfCategories.push(categoryObj);
    this.addBtn = true;
    this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(true);

  }
  addTopic1() {
    var questionlist = new Array();
    var question = new Question();
    question.id = '';
    question.description = 'Enter sub heading here.';
    question.colourCode = 0;
    question.editable = true;
    question.collapsed = false;
    questionlist.push(question);
    var categoryObj = { id: '', description: 'Enter heading here.', questions: questionlist, colourCode: 0, editable: true, collapsed: false };

    // //TODO: Check what needs to be done when there are no questions in the DB 
    // if(this.listOfCategories.length===0)
    // {
    //   this.listOfCategories= new Array();
    // }
    this.listOfCategories.push(categoryObj);
    this.addBtn = true;
  }
  addSubHeading(id) {
    var question = new Question();
    question.id = this.generateUniqueQuestionId();
    question.description = `Enter sub heading here.`;
    question.editable = true;
    question.collapsed = false;
    let currentCategoryIdx = this.listOfCategories.findIndex(x => x.id == id);
    this.listOfCategories[currentCategoryIdx].questions.push(this.addAnswerToQuestion(question));
    this.listOfCategories[currentCategoryIdx].collapsed = false;
    this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(true);

  }

  editHeading(id) {
    var categoryHeading = this.getCategoryHeading(id, this.listOfCategories);
    this.loadQuestions(id);
    categoryHeading[0].editable = true;
    this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(true);
  }
  deleteHeading(categoryID: string) {
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
            this.toastr.success(this.translate.instant('Category deleted successfully'));
      
            this.getCategories();
          }
          else {
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          }
        });
      }
    });
  }

  acceptSubHeading(cat) {
    cat.collapsed = true;
    cat.editable = false;
    alert("Created Successgully");
    this.addBtn = false;
  }
  discardCategory(cat) {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = "Are you sure you want to discard?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        cat.collapsed = true;
        cat.editable = false;
        let index = this.getIndexOfData(cat.id, this.listOfCategories);
        
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
          this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(false);
        }
        else {
          this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(false);
        }
      }
      else
        this.dialog.closeAll();
    });
  }
  publishCategory() {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = "Are you sure you want to publish?";

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
            // this.dialogService.Open(DialogTypes.Success, "Data published successfully");
            this.getCategories();
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

  editSubHeading(headingId, subHeadingId) {

    var categoryHeading = this.getCategoryHeading(headingId, this.listOfCategories);
    var questionsubHeading = this.getSubHeading(categoryHeading[0], subHeadingId);
    questionsubHeading[0].editable = true;
    questionsubHeading[0].collapsed = false;
    //document.getElementById('faqtextArea_' + headingId + subHeadingId).removeAttribute('disabled');
    this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(true);
    questionsubHeading[0].answer.editable = true;

  }
  deleteSubHeading(headingId, subHeadingId) {
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
        let deleteQuestionIds = new Array<string>();
        deleteQuestionIds.push(subHeadingId);

        this.contentService.deleteQuestions(deleteQuestionIds).subscribe(response => {
          if (response.status === 1) {
            this.toastr.success(this.translate.instant('screens.admin.commonMessage.deleteQuestion'));
            this.loadQuestions(headingId);
            var category = this.getIndexOfData(headingId, this.listOfCategories);
            if (category != null)
              category[0].collapsed = true;
          }
          else {
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          }
        });
      }
    });
  }

  discardSubheading(cat, question) {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = "Are you sure you want to discard?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        question.collapsed = true;
        question.editable = false;
        let index = this.getIndexOfData(cat.id, this.listOfCategories);
        let questionIndex = this.getIndexOfData(question.id, this.listOfCategories[index].questions);
        if (question.id.indexOf('temp') > -1) {
          this.listOfCategories[index].questions.splice(questionIndex, 1);
          this.addBtn = false;
        }
        else {
          this.listOfCategories[index].questions[questionIndex] = JSON.parse(JSON.stringify(this.listOfOrginalCategories[index].questions[questionIndex]));
        }
        dialogRef.close();
        let questionsEdit: boolean = false;
        let contentData1 = this.listOfCategories.find(c => c.editable == true || c.id.indexOf('temp') > -1);
        if (contentData1 == null) {
          this.listOfCategories.forEach(element => {
            if (element.questions) {
              let contentData = element.questions.find(c => c.editable == true || c.id.indexOf('temp') > -1);
              if (contentData != null) {
                questionsEdit = true;
                return;
              }
            }
          });
        }
        if (contentData1 == null && questionsEdit)
          this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(true);

        else if (contentData1 == null && !questionsEdit)
          this._eventService.getEvent(EventConstants.ContentToolbarFAQ).publish(false);
        this.dialog.closeAll();
      }
    });
  }

  getCategoryHeading(_itemId: string, categoriesList): Category[] {
    // The following line does not work
    return categoriesList.filter(function (element, index, array) { return element.id == _itemId });
  }
  getSubHeading(_categoryHeading: Category, _subItemId: string): Question[] {
    return _categoryHeading.questions.filter(function (element, index, array) { return element.id == _subItemId });

  }
  getIndexOfData(_id: string, listOfData): number {
    return listOfData.findIndex(record => record.id === _id);
  }
}