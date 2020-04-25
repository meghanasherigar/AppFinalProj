import { Component, OnInit, Input } from '@angular/core';
// import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { eventConstantsEnum, NavigationSource, EventConstants } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { InformationRequestPreviewViewModel, InfoGatheringIcons, InformationRequestViewModel } from '../../../../../../@models/projectDesigner/task';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { SendmailUserComponent } from '../../../../../common/sendmail-user/sendmail-user.component';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { environment } from '../../../../../../../environments/environment.uat';
import { QuestionsBlockTypeDetails } from '../../../../../../@models/projectDesigner/block';
import { InformationResponseViewModel, InfoRequestStatus } from '../../../../../../@models/projectDesigner/infoGathering';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { SendEmailService } from '../../../../../../shared/services/send-email.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { UserRightsViewModel, QuestionIdsViewModel, ForwardEmailViewModel, QuestionsUserViewModel, SendBackForwardQuestionsViewModel, UserBasicViewModel } from '../../../../../../@models/userAdmin';
import { TaskService } from '../../services/task.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { Router } from '@angular/router';
import { SendBackToAssigneeComponent } from '../../info-gathering/send-back-to-assignee/send-back-to-assignee.component';
import { SubMenus } from '../../../../../../@models/projectDesigner/designer';
import { SendBackForwardQuestionComponent } from '../send-back-forward-question/send-back-forward-question.component';
import { StorageService, StorageKeys } from '../../../../../../@core/services/storage/storage.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SessionStorageService } from '../../../../../../@core/services/storage/sessionStorage.service';

enum Number {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4
}
@Component({
  selector: 'ngx-info-request-level2-menu',
  templateUrl: './info-request-level2-menu.component.html',
  styleUrls: ['./info-request-level2-menu.component.scss']
})

export class InfoRequestLevel2MenuComponent implements OnInit {
  private dialogTemplate: Dialog;
  show: boolean = true;
  imageName: any = this.translate.instant('screens.project-designer.document-view.info-request.collapse-label');
  subscriptions: Subscription = new Subscription();
  informationRequest: any = new InformationResponseViewModel();
  dialogSendBack: Dialog;
  blockTypeDetails: QuestionsBlockTypeDetails[];
  projectDetails: any;
  status = { inProgress: InfoRequestStatus.InProgress, inReview: InfoRequestStatus.Review, final: InfoRequestStatus.Final };
  options = [
    { name: this.translate.instant('screens.project-designer.document-view.info-request.expand-block'), value: '1', checked: true },
    { name: this.translate.instant('screens.project-designer.document-view.info-request.expand-questions'), value: '2', checked: true },
  ]
  userAccessRights: UserRightsViewModel;
  infoGatheringIcons: InfoGatheringIcons;
  FilterSection: boolean = true;
  navigationSource: string = '';

  constructor(private router: Router, private shareDetailService: ShareDetailService, private taskService: TaskService,
    private translate: TranslateService, private _eventService: EventAggregatorService, private dialog: MatDialog,
    private toastr: ToastrService, private sendEmailService: SendEmailService, private dialogService: DialogService,
    private designerService: DesignerService, private storageService: StorageService, private nbDialogService: NbDialogService,
    private location: Location,  private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    this.AccessRights();

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.requestLevel2Details).subscribe((payload: any) => {
      this.informationRequest = payload;
      if (this.designerService.templateDeliverableList != undefined) {
        let template = this.designerService.templateDeliverableList.templates.templatesDropDown.find(x => x.templateId == payload.templateId);
        this.informationRequest.templateId = (template != undefined) ? template.templateName : null;
        let entity = this.designerService.templateDeliverableList.deliverables.deliverableResponse.find(x => x.entityId == payload.deliverableId);
        this.informationRequest.deliverableId = (entity != undefined) ? entity.entityName : null;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadBlockTypes)
      .subscribe((payload: any) => {
        this.blockTypeDetails = payload;
        if(this.designerService.saveAsDraftCheck == true){
          this.designerService.saveAsDraftCheck = false;
          this.sendingBackFroReview();
        }
      }));

      this.designerService.navigationSource.subscribe(origin => {
        if (origin) {
          this.navigationSource = origin;
        } else {
          this.navigationSource = '';
        }

      });
  }
  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.FilterSection = true;
      this.imageName = this.translate.instant('screens.project-designer.document-view.info-request.collapse-label');
    }
    else {
      this.FilterSection = false;
      this.imageName = this.translate.instant('screens.project-designer.document-view.info-request.expand-label');
    }
  }
  onCheckboxChange(event) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoRequestView).publish(this.options);
  }

  saveInfoRequest() {
    this.designerService.disableMessage = false;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).publish("saveInfoRequest");
  }

  popupForwardMail() {
    if (this.designerService.questionIdsViewModel.length == 0) {
      this.dialogService.Open(DialogTypes.Warning, "Please select atleast one question!");
      return;
    }
    this.designerService.isForwardMail = true;
    this.nbDialogService.open(SendmailUserComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.designerService.questionIdsViewModel }
    });
  }
  SendBackPopUp() {
    //API call to save as draft
    this.designerService.disableMessage = true;
    this.designerService.saveAsDraftCheck = true;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).publish("saveinforequest"));

  }

  sendingBackFroReview(){
    let sendBackSpecial: boolean = false;
    let _userContext = JSON.parse(this.storageService.getItem("currentUser"));
    let email = _userContext.profile.email;
    //let name = _userContext.profile.given_name + ' ' + _userContext.profile.family_name;    
    let currentUser = this.designerService.infoDraftResponseModel.AssignTo.filter(x => x.email == email);
    if (currentUser[0].isForwarded) {
      this.projectDetails = this.shareDetailService.getORganizationDetail();
      let mdl = new ForwardEmailViewModel();
      let context: QuestionsUserViewModel[] = [];
      let sendBackForwardQuestions: boolean = false;
      mdl.InformationRequestId = this.designerService.infoRequestId;
      mdl.QuestionsId = this.designerService.questionIdsViewModel;
      this.sendEmailService.getusersforforwardquestions(mdl).subscribe(
        data => {
          if (data[0]['users'].length == 0) {
            // if(this.designerService.selectedQuestionTitle[0].isForwarded===true)
            // {
            sendBackSpecial = true;
            this.sendBackForReview(sendBackSpecial);
            // }   //forward to assignee
          }
          else {
            sendBackForwardQuestions = true;
            data.forEach(item => {
              let mdl = new QuestionsUserViewModel();
              mdl.QuestionId = item["questionId"];
              mdl.Users = item["users"];
              let title = this.designerService.selectedQuestionTitle.filter(x => x.questionId === mdl.QuestionId["questionId"]);
              mdl.Title = title[0].title;
              context.push(mdl);
              if (sendBackForwardQuestions) {
                this.nbDialogService.open(SendBackForwardQuestionComponent, {
                  closeOnBackdropClick: false,
                  closeOnEsc: true,
                  context: { section: context }
                });
              }
            });
          }
        });

    }
    if (!(sendBackSpecial === false) || (!currentUser[0].isForwarded)) {
      this.sendBackForReview(sendBackSpecial);
    }
  }

  sendBackForReview(sendBackSpecial) {
    this.dialogSendBack = new Dialog();
    this.dialogSendBack.Type = DialogTypes.SendBack;
    let questions = 0;
    let answers = 0;
    if (this.blockTypeDetails != null) {
      this.blockTypeDetails.forEach(element => {
        questions += (element.numberOfQuestions) ? element.numberOfQuestions : 0;
        answers += (element.numberOfAnswers) ? element.numberOfAnswers : 0;
      });
    }
    this.dialogSendBack.Message = `The questions will be sent back to Reviewer. Do you wish to continue? SplitChar
      Answered: ${answers} SplitChar
      Not Answered: ${questions - answers} SplitChar
      Total Questions: ${questions}`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogSendBack
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (sendBackSpecial) {
          let mdl = new SendBackForwardQuestionsViewModel();
          mdl.InformationRequestId = this.designerService.infoRequestId;
          let user = this.designerService.infoDraftResponseModel.AssignTo.filter(x => x.isForwarded == true);
          this.designerService.questionIdsViewModel.forEach(question => {
            let tmp = new QuestionsUserViewModel();
            tmp.QuestionId = question;
            user.forEach(x => {
              let assigneeMdl = new UserBasicViewModel();
              assigneeMdl.FirstName = x.firstName;
              assigneeMdl.LastName = x.lastName;
              assigneeMdl.Email = x.email;
              tmp.Users.push(assigneeMdl);
            });
            mdl.Questions.push(tmp);
          });
          this.subscriptions.add(this.sendEmailService.sendbackforreviewforforwardquestion(mdl)
            .subscribe(response => {
              if (response.status === ResponseStatus.Sucess) {
                this.toastr.success(this.translate.instant('screens.project-user.sendBackForReviewSuccessMessage'));
                
              } else {
                this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
              }
              this.dismiss();
            },
              error => {
                this.dialogService.Open(DialogTypes.Warning, error.message);
              }));
        }
        else {
          let payLoad = new InformationRequestViewModel();
          payLoad.Id = this.designerService.infoRequestId;
          this.subscriptions.add(this.sendEmailService.sendBackForReview(payLoad).subscribe(response => {
            if (response.status === ResponseStatus.Sucess) {
              this.toastr.success(this.translate.instant('screens.project-user.sendBackForReviewSuccessMessage'));
             
            }
            else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
            this.dismiss();
          },
            error => {
              this.dialogService.Open(DialogTypes.Warning, error.message);
            }));
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.designerService.selectedQuestionTitle = [];
    this.designerService.questionIdsViewModel = [];
  }

  dismiss() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).publish("closeRequest");
    if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
      this.sessionStorageService.removeItem(StorageKeys.REDIRECTURLID);
      this.sessionStorageService.removeItem(StorageKeys.PROJECTINCONTEXT);
      window.open(this.location.path.name + '/assets/static-pages/inforequest-en.html', '_self');
    }
    else {
      this.redirectToProjectManagement();
    }
  }

  AccessRights() {
    if (this.designerService.docViewAccessRights) {
      this.userAccessRights = this.designerService.docViewAccessRights;
    }
    this.infoGatheringIcons = new InfoGatheringIcons();
    const project = this.shareDetailService.getORganizationDetail();
    let status = "";
    this.taskService.getuserinformationrequestbyprojectId(project.projectId).subscribe((data) => {
      data.forEach(element => {
        if (this.designerService.infoRequestId != undefined && this.designerService.infoRequestId != '') {
          if (element.informationRequest == this.designerService.infoRequestId) {
            if (element.isAssignTo && this.designerService.infoRequestStatus == InfoRequestStatus.InProgress) {
              this.infoGatheringIcons.EnableSendBackForReview = true;
              this.infoGatheringIcons.EnableForward = true;
              this.infoGatheringIcons.EnableOptionsCheckboxList = true;
            }
            else if (element.isCoReviewer || element.isCreator) {
              if (this.designerService.infoRequestStatus == InfoRequestStatus.Review || this.designerService.infoRequestStatus == InfoRequestStatus.Final) {
                this.infoGatheringIcons.EnableSendBackForAssignee = true;
                this.infoGatheringIcons.EnableFinalze = true;
              }
              else if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress) {
                this.infoGatheringIcons.EnableSendBackForAssignee = true;
                this.infoGatheringIcons.EnableFinalze = true;
                this.infoGatheringIcons.DisablePageForReviewWhenInProgress = true;
              }
            }
          }
        }
      });
    });
  }

  SendBackToAssigneePopUp() {
    if (this.designerService.allowToAssignee) {
      this.nbDialogService.open(SendBackToAssigneeComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: true,
        //context:{section:this.designerService.questionIdsViewModel}
      });
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant("screens.home.notification-screen.allQuestionArePartOfOtherInfoReq"));
    }

  }

  openFinalizeConfirmDialog(fileId): void {
    //as per staging feedback. no confirmation message, it should be just sweet message
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).publish("saveinforequest"));
    this.ConfirmFinalize();
  }

  ConfirmFinalize() {
    let infoRequest = new InformationRequestViewModel();
    infoRequest.Id = this.designerService.infoRequestId;
    this.subscriptions.add(this.taskService.finalize(infoRequest).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        this.toastr.success(this.translate.instant('screens.home.labels.completedSuccessfully'));
  
        this.redirectToLandingPage();
      } else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  redirectToLandingPage() {
    this.designerService.changeIsDocFullView(true);
    this.designerService.changeTabDocumentView(SubMenus.InformationRequest);
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  redirectToProjectManagement() {

    if (this.navigationSource === NavigationSource.MyTask) {
      this.designerService.navigation('');
      this._eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
      this.router.navigate(['pages/project-management/ProjectManagementMain',
        { outlets: { primary: ['tasks'], level2Menu: ['PMTaskLevel2Menu'], topmenu: ['ProjectManagementTopMenu'] } }]);
    } else {
      this.designerService.changeIsDocFullView(true);
      this.designerService.changeTabDocumentView(SubMenus.InformationRequest);
      this.designerService.selectedSubmenus(SubMenus.InformationRequest);
      this.designerService.selecteMenu(0);
      this.designerService.hideOrShowMenus(0);
      this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
    }

  }

}
