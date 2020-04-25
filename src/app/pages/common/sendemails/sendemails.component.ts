import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EmailDetails, emailEnum, Email } from '../../../@models/common/commonmodel';
import { DialogService } from '../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { SendEmailService } from '../../../shared/services/send-email.service';
import { DesignerService } from '../../project-design/services/designer.service';
import { TaskService } from '../../project-design/modules/document-view/services/task.service';
import { DialogTypes } from '../../../@models/common/dialog';
import { SearchViewModel, EmailViewModel, SendEmailViewModel } from '../../../@models/userAdmin';
import { ProjectUserService } from '../../admin/services/project-user.service';
import { NbDialogRef } from '@nebular/theme';
import MultirootEditor from '../../../../assets/@ckeditor/ckeditor5-build-classic';
import { InfoRequestSendEmailReminderModel } from '../../../@models/projectDesigner/infoGathering';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { TemplateViewModel } from '../../../@models/projectDesigner/template';
import { eventConstantsEnum, EventConstants } from '../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-sendemails',
  templateUrl: './sendemails.component.html',
  styleUrls: ['./sendemails.component.scss']
})
export class SendemailsComponent implements OnInit {
  public editorValue: string = '';
  editor: any;
  subscriptions: Subscription = new Subscription();
  sendEmailUserForm: FormGroup;
  @Input() emailDetails: EmailDetails;
  isToDisabled: boolean = false;
  isCCDisabled: boolean = false;
  isBCCDisabled: boolean = false;
  emailsCC = [];
  emailsTo = [];
  emailsBCC = [];
  removable = false;
  searchUserToResult = [];
  searchUserCCResult = [];
  searchUserBCCResult = [];
  searchViewModel: SearchViewModel = new SearchViewModel();
  enableBCCControl = false;
  enableBCCBtn = false;
  emailViewModel = new EmailViewModel();
  emailBoady: string
  isInfoReqSendReminder: boolean = false;
  public projectUserSearchModel:TemplateViewModel;

  constructor(private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private sendEmailService: SendEmailService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private taskService: TaskService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService,
    private projectUserService: ProjectUserService,
    protected ref: NbDialogRef<any>) {

    this.sendEmailUserForm = this.formBuilder.group({
      toEmailAddress: [''],
      cCEmailAddress: [''],
      bCCEmailAddress: [''],
      subject: [''],
      emailBody: [''],
    });

    this.sendEmailUserForm.controls["toEmailAddress"].valueChanges.subscribe(data => {
      this.emailSearch(data, this.emailDetails.isToDisabled, emailEnum.to);
    });

    this.sendEmailUserForm.controls["cCEmailAddress"].valueChanges.subscribe(data => {
      //To search users within the project
      if(this.projectUserSearchModel)
      {
        //projectUserSearchModel
      this.searchTemplateDeliverableUsers(data, this.emailDetails.isCCDisabled, emailEnum.cc);
      }
      else{
      this.emailSearch(data, this.emailDetails.isCCDisabled, emailEnum.cc);
    }
    });

    this.sendEmailUserForm.controls["bCCEmailAddress"].valueChanges.subscribe(data => {
      //To search users within the project
      if(this.projectUserSearchModel)
      {
        this.searchTemplateDeliverableUsers(data, this.emailDetails.isBCCDisabled, emailEnum.bcc);
      }
      else{
      this.emailSearch(data, this.emailDetails.isBCCDisabled, emailEnum.bcc);
      }
    });

  }
  loaderId='SendEmailLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';
  ngOnInit() {

    this.isInfoReqSendReminder = this.designerService.isInforeqsendReminder;
    this.isToDisabled = this.emailDetails.isToDisabled;
    this.isCCDisabled = this.emailDetails.isCCDisabled;
    this.isBCCDisabled = this.emailDetails.isBCCDisabled;

    if (this.emailDetails.to.length > 0) {
      if (this.isInfoReqSendReminder || this.emailDetails.isGenericMailer) {
        this.emailsTo = this.distinctEmailIds(this.emailDetails.to);
      }
    }
    if (this.emailDetails.cc.length > 0) {
      if (this.isInfoReqSendReminder) {
        this.emailsCC = this.distinctEmailIds(this.emailDetails.cc);
      }
    }

    if (this.emailDetails.bcc.length > 0) {
      this.searchUserBCCResult = this.emailDetails.bcc;
    }
    if (!this.emailDetails.isBCCDisabled) {
      this.enableBCCBtn = true;
    }
  }

  private distinctEmailIds(emailIdList: Email[]) {
    let emailIds: any = [];
    emailIdList.forEach(x => {
      emailIds.push(x.email);
    });
    return Array.from(new Set(emailIds));
  }

  ngAfterViewInit() {
    let sourceElement: any = {};
    sourceElement["header"] = document.querySelector('#editor-email');
    MultirootEditor.create1(sourceElement,undefined, undefined, this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu-email').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
      })
      .catch(err => {
        console.error(err.stack);
      });
  }

  emailSearch(data, isDisabled, type) {
    if (isDisabled) return;
    const keys = data.split(' ');
    if (keys.length > 0) {
      this.searchViewModel.Keyword = keys[keys.length - 1];
      if (data.length >= 3) {
        this.projectUserService.sendEmailSearchUser(this.searchViewModel).subscribe(
          response => {
            switch (type) {
              case emailEnum.to:
                this.searchUserToResult = response;
                break;
              case emailEnum.cc:
                this.searchUserCCResult = response;
                break;
              case emailEnum.bcc:
                this.searchUserBCCResult = response;
                break;
            }
          }),
          error => {
            this.dialogService.Open(DialogTypes.Warning, error.message);
          };
      }
    }
    else {
      this.searchViewModel.Keyword = data;
      if (data.length >= 3) {
        this.projectUserService.sendEmailSearchUser(this.searchViewModel).subscribe(
          response => {
            switch (type) {
              case emailEnum.to:
                this.searchUserToResult = response;
                break;
              case emailEnum.cc:
                this.searchUserCCResult = response;
                break;
              case emailEnum.bcc:
                this.searchUserBCCResult = response;
                break;
            }
          }),
          error => {
            this.dialogService.Open(DialogTypes.Warning, error.message);
          };
      }
    }
  }


  searchTemplateDeliverableUsers(data, isDisabled, type) {
    if (isDisabled) return;
    const keys = data.split(' ');
    if (keys.length > 0) {
      this.projectUserSearchModel.searchText = keys[keys.length - 1];
      if (data.length >= 3) {
        this.projectUserService.getTemplateDeliverableUsers(this.projectUserSearchModel).subscribe(
          response => {
            switch (type) {
              case emailEnum.to:
                this.searchUserToResult = response;
                break;
              case emailEnum.cc:
                this.searchUserCCResult = response;
                break;
              case emailEnum.bcc:
                this.searchUserBCCResult = response;
                break;
            }
          }),
          error => {
            this.dialogService.Open(DialogTypes.Warning, error.message);
          };
      }
    }
    else {
      this.projectUserSearchModel.searchText = data;
      if (data.length >= 3) {
        this.projectUserService.getTemplateDeliverableUsers(this.projectUserSearchModel).subscribe(
          response => {
            switch (type) {
              case emailEnum.to:
                this.searchUserToResult = response;
                break;
              case emailEnum.cc:
                this.searchUserCCResult = response;
                break;
              case emailEnum.bcc:
                this.searchUserBCCResult = response;
                break;
            }
          }),
          error => {
            this.dialogService.Open(DialogTypes.Warning, error.message);
          };
      }
    }
  }
  getSelectedCCEmailIds(selectedCCEmail, input: HTMLInputElement) {
    this.removable = true;
    if (this.emailsCC.length <= 150) {
      this.emailsCC.push(selectedCCEmail);
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailCCMaxLengthValidation'));
    }
    input.value = '';
  }

  removeCCEmailIds(selectedCCEmail) {
    this.emailsCC.splice(this.emailsCC.indexOf(selectedCCEmail), 1);
  }

  getSelectedToEmailIds(selectedToEmail, input: HTMLInputElement) {
    this.removable = true;
    if (this.emailsTo.length <= 150) {
      this.emailsTo.push(selectedToEmail);
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailCCMaxLengthValidation'));
    }
    input.value = '';
  }

  removeToEmailId(selectedToEmailIds) {
    this.emailsTo.splice(this.emailsTo.indexOf(selectedToEmailIds), 1);
  }

  getSelectedBCCEmailIds(selectedBCCEmailIds, input: HTMLInputElement) {
    this.removable = true;
    if (this.emailsBCC.length <= 150) {
      this.emailsBCC.push(selectedBCCEmailIds);
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailBCCMaxLengthValidation'));
    }
    input.value = '';
  }

  removeBCCEmailId(selectedBCCEmailIds) {
    this.emailsBCC.splice(this.emailsBCC.indexOf(selectedBCCEmailIds), 1);
  }

  enableBCC() {
    this.enableBCCControl = true;
    this.enableBCCBtn = false;
  }
  sendEmail() {
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName == "header") {
        this.emailBoady = this.editor.getData({ rootName });
      }
    }
    if (this.isInfoReqSendReminder) {
      this.sendEmailReminderForInfoReq();
    }
    if (this.emailDetails.isGenericMailer) {
      this.triggerEmail();
    }

  }


  //Method to send email for generic purposes (no bound to any specific business use case)
  triggerEmail() {
    let emailRequest = new SendEmailViewModel();
    emailRequest.BodyContent = this.emailBoady;
    emailRequest.SendTO = this.emailsTo;
    emailRequest.SendCC = this.emailsCC;
    emailRequest.SendBCC = this.emailsBCC;
    emailRequest.Subject = this.sendEmailUserForm.controls["subject"].value;


    this.sendEmailService.sendEmail(emailRequest).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        this.toastr.success(this.translate.instant('screens.project-user.EmailSuccessMessage'));
        this._eventService.getEvent(EventConstants.SendEmail).publish(true);
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
      this.dismiss();
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      })
  }


  sendEmailReminderForInfoReq() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let reminderMails: InfoRequestSendEmailReminderModel[] = [];
    this.designerService.inforequestSendReminder.forEach(x => {
      let sendReminderMail = new InfoRequestSendEmailReminderModel();
      sendReminderMail.informationRequestId = x.infoRequestId;
      sendReminderMail.sentTo = x.assignTo;
      sendReminderMail.cc = x.coReviewer;
      sendReminderMail.content = this.emailBoady;
      sendReminderMail.subject = this.sendEmailUserForm.controls["subject"].value;

      reminderMails.push(sendReminderMail);
    });

    this.subscriptions.add(this.sendEmailService.sendReminderEmail(reminderMails).subscribe(response => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      if (response.status === ResponseStatus.Sucess)
      this.toastr.success(this.translate.instant('screens.project-user.EmailSuccessMessage'));

      else
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      this.dismiss();
    },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  dismiss() {
    this.ref.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.designerService.isInforeqsendReminder = false;
  }

}
