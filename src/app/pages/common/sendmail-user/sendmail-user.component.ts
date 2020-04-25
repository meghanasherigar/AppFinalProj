import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NbDialogRef, NbWindowService} from '@nebular/theme';
import '../../../../assets/ckeditor.loader';
import 'ckeditor';
import { TranslateService } from '@ngx-translate/core';
import { SendEmailViewModel, SearchViewModel, EmailViewModel, InfoReqSendEmailViewModel, ForwardEmailViewModel, UserBasicViewModel, QuestionIdsViewModel } from '../../../@models/userAdmin';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { ProjectUserService } from '../../admin/services/project-user.service';
import { SendEmailService } from '../../../shared/services/send-email.service';
import { DialogTypes } from '../../../@models/common/dialog';
import MultirootEditor from '../../../../assets/@ckeditor/ckeditor5-build-classic';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { Router, NavigationEnd } from '@angular/router';
import { DesignerService } from '../../project-design/services/designer.service';
import { element } from '@angular/core/src/render3';
import { userBasicModel } from '../../../@models/projectDesigner/block';
import { TaskService } from '../../project-design/modules/document-view/services/task.service';
import { ProjectUsersListViewModel } from '../../../@models/projectDesigner/task';
import { eventConstantsEnum } from '../../../@models/common/eventConstants';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { createInfoLabels } from '../../../@models/projectDesigner/infoGathering';
import { UserService } from '../../user/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { StorageService } from '../../../@core/services/storage/storage.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Guid } from "guid-typescript";

@Component({
  selector: 'ngx-sendmail-user',
  templateUrl: './sendmail-user.component.html',
  styleUrls: ['./sendmail-user.component.scss']
})
export class SendmailUserComponent implements OnInit {
  public editorValue: string = '';
  editor: any;
  subscriptions: Subscription = new Subscription();
  SendEmailProjectUserForm: FormGroup;
  EnableBCCControl = false;
  EnableBCCBtn = false;
  sendEmailViewModel: SendEmailViewModel = new SendEmailViewModel();
  infoReqSendEmailViewModel: InfoReqSendEmailViewModel = new InfoReqSendEmailViewModel();
  dropdownModel: ProjectUsersListViewModel = new ProjectUsersListViewModel();
  forwardEmailViewModel: ForwardEmailViewModel = new ForwardEmailViewModel();
  searchViewModel: SearchViewModel = new SearchViewModel();
  searchUserCCResult = [];
  searchUserToResult = [];
  searchUserBCCResult = [];
  globalSearchUserCCResult = [];
  globalSearchUserToResult = [];
  globalSearchUserBCCResult = [];
  emailsCC = [];
  emailsTo = [];
  removable = false;
  emailsBCC = [];
  emailViewModel = new EmailViewModel();
  ToAddress: string;
  EmailBody: string;
  isInfoRequest: boolean = false;
  isReadOnly: boolean = true;
  isForwardMail: boolean;
  section: QuestionIdsViewModel[] = [];
  sendToFullName : string;
  projectName : string;
  userName : string;
  closeCreateRequest: boolean = true; //to close Create Request screen
  redirectUrlId: any;
  constructor(
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private shareDetailService: ShareDetailService,
    private projectUserService: ProjectUserService,
    private sendEmailService: SendEmailService,
    private windowService: NbWindowService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService,
    private designerService: DesignerService,
    private toastr: ToastrService,
    private router: Router,
    private taskService: TaskService,
    private appConfig: AppliConfigService,
    private userService : UserService,
  ) {
   
  }
  loaderId='SendmailUseroader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.SendEmailProjectUserForm = this.formBuilder.group({
      ToEmailAddress: [''],
      CCEmailAddress: [''],
      BCCEmailAddress: [''],
      Subject: [''],
      EmailBody: [''],
    });

    this.SendEmailProjectUserForm.controls["CCEmailAddress"].valueChanges
      .subscribe(data => {
        if (!this.designerService.isForwardMail === true && !this.designerService.InfoReqSendMail === true) {
          const keys = data.split(' ');
          if (keys.length > 0) {
            this.searchViewModel.Keyword = keys[keys.length - 1];
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserCCResult = response;
                    this.globalSearchUserCCResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
          else {
            this.searchViewModel.Keyword = data;
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserCCResult = response;
                    this.globalSearchUserCCResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
        }
        else {

          this.searchUserCCResult = [];
          if (data.length >= 1) {
            this.globalSearchUserCCResult.forEach((entity) => {
              if (entity.email.toLowerCase().includes(data.toLowerCase())) {
                // entity.selected = false;
                this.searchUserCCResult.push(entity);
              }
            });
          }
          else {
            this.globalSearchUserCCResult.forEach((entity) => {
              // entity.selected = false;
              this.searchUserCCResult.push(entity);
            });
          }
        }
      });

    this.SendEmailProjectUserForm.controls["ToEmailAddress"].valueChanges
      .subscribe(data => {
        if (this.designerService.isForwardMail === true && this.designerService.InfoReqSendMail === true) {

          this.searchUserToResult = [];
          if (data.length >= 1) {
            this.globalSearchUserToResult.forEach((entity) => {
              if (entity.email.toLowerCase().includes(data.toLowerCase())) {
                // entity.selected = false;
                this.searchUserToResult.push(entity);
              }
            });
          }
          else {
            this.globalSearchUserToResult.forEach((entity) => {
              // entity.selected = false;
              this.searchUserToResult.push(entity);
            });
          }
        }
        else {
          const keys = data.split(' ');
          if (keys.length > 0) {
            this.searchViewModel.Keyword = keys[keys.length - 1];
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserToResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
          else {
            this.searchViewModel.Keyword = data;
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserToResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
        }
      });



    this.SendEmailProjectUserForm.controls["BCCEmailAddress"].valueChanges
      .subscribe(data => {
        if (this.designerService.isForwardMail === true && this.designerService.InfoReqSendMail === true) {
          this.searchUserBCCResult = [];
          if (data.length >= 1) {
            this.globalSearchUserBCCResult.forEach((entity) => {
              if (entity.email.toLowerCase().includes(data.toLowerCase())) {
                // entity.selected = false;
                this.searchUserBCCResult.push(entity);
              }
            });
          }
          else {
            this.globalSearchUserBCCResult.forEach((entity) => {
              // entity.selected = false;
              this.searchUserBCCResult.push(entity);
            });
          }
        }
        else {
          const keys = data.split(' ');
          if (keys.length > 0) {
            this.searchViewModel.Keyword = keys[keys.length - 1];
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserBCCResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
          else {
            this.searchViewModel.Keyword = data;
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserBCCResult = response;
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
          }
        }
      });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.sendMail).subscribe(() => {
      this.sendMailAfterSave();
    }))
    this.isForwardMail = this.designerService.isForwardMail;
    if (this.designerService.isForwardMail === true || this.designerService.InfoReqSendMail === true) {
      let tmp = this.shareDetailService.getORganizationDetail();
      this.projectName = tmp.projectName;
      this.dropdownModel.ProjectId = tmp.projectId;// this.designerService.questionsFilters.projectId;
      if (this.designerService.isForwardMail === true) {
        if (this.designerService.infoDraftResponseModel.DeliverableId != undefined && this.designerService.infoDraftResponseModel.DeliverableId.length > 0
              && this.designerService.infoDraftResponseModel.DeliverableId !== eventConstantsEnum.emptyGuid) {
          this.dropdownModel.Deliverables.push(this.designerService.infoDraftResponseModel.DeliverableId);
          this.dropdownModel.TemplateId = '';
        }
        else {
          this.dropdownModel.Deliverables = [];
          this.dropdownModel.TemplateId = this.designerService.infoDraftResponseModel.TemplateId;
        }
        this.getSavedToAndCcUsers();
      }
      else {
        //Sending for multiple Entities
        if (this.designerService.isDeliverableSelected) {
          this.designerService.deliverableInformationRequestModel.forEach(x => {
            if (x.DeliverableId != undefined && x.DeliverableId.length > 0) {
              this.dropdownModel.Deliverables.push(x.DeliverableId);
              this.dropdownModel.TemplateId = '';
            }
          });
          this.getSavedToAndCcUsers();
        }
        else {
          this.dropdownModel.Deliverables = [];
          this.dropdownModel.TemplateId = this.designerService.informationRequestModel.TemplateId;
          this.getSavedToAndCcUsers();
        }
      }
    }
    this.designerService.isForwardMail == true ? (this.isReadOnly = false, this.isInfoRequest = true) : '';

    if (this.designerService.DisableBCCBtn === true) {
      this.ToAddress = "";
      this.designerService.AssignToList=[];
      if(this.designerService.isTemplateSelected===true)
      this.designerService.informationRequestModel.AssignTo.forEach(user => {
          this.sendToFullName = user.firstName + ' '+ user.lastName;
          if (!(this.designerService.AssignToList.filter(item => item === user.email).length > 0))
          this.designerService.AssignToList.push(user.email);
          if(this.designerService.AssignToList.length > 1)
          this.sendToFullName = "XX";
      });
      else if(this.designerService.isDeliverableSelected ===true){
        this.designerService.deliverableInformationRequestModel.forEach(element => {
          element.AssignTo.forEach(user=>{
            this.sendToFullName = user.firstName + ' '+ user.lastName;
            if (!(this.designerService.AssignToList.filter(item => item === user.email).length > 0))
            this.designerService.AssignToList.push(user.email);
            if(this.designerService.AssignToList.length > 1)
            this.sendToFullName = "XX";
          });
        });
      }
      this.ToAddress = this.designerService.AssignToList;
      this.SendEmailProjectUserForm.controls["ToEmailAddress"].setValue(this.ToAddress);
      this.designerService.CoReviewerList = [];
      if(this.designerService.selectedEntities != undefined && this.designerService.selectedEntities.length > 0)
      { // If EnableDeliverable      
        this.designerService.deliverableInformationRequestModel.forEach(entity=>{
           entity.CoReviewer.forEach(user=>{
            if (!(this.designerService.CoReviewerList.filter(item => item === user.email).length > 0))
            this.designerService.CoReviewerList.push(user.email);
           });
        });       
      }
      this.emailViewModel.EmailIds = this.emailsCC = this.designerService.CoReviewerList;
      this.isInfoRequest = true;
    }
    else {
      this.EnableBCCBtn = true;
      let data = new EmailViewModel();
      data.EmailIds = new Array();
      this.sendToFullName = "XX";
      if (this.projectUserService.selectedAdminUserRows.length <= 150) {
        this.projectUserService.selectedAdminUserRows.forEach(item => {
          this.emailViewModel.EmailIds.push(item.userEmail);
        });
      }
      else {
        for (var i = 0; i < 150; i++) {
          this.emailViewModel.EmailIds.push(this.projectUserService.selectedAdminUserRows[i].userEmail);
        }
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailToMaxLengthValidation'));
      }
      this.ToAddress = "";
      this.ToAddress = this.emailViewModel.EmailIds.join("; ");
      this.SendEmailProjectUserForm.controls["ToEmailAddress"].setValue(this.ToAddress);
    }

  }

  private getSavedToAndCcUsers() {
    this.taskService.getuserslstonTemplateIdorDelieverables(this.dropdownModel).subscribe(data => {
      data.forEach(x => {
        this.searchUserCCResult.push({ firstName: x.userFirstName, lastName: x.userLastName, email: x.userEmail, checked: false });
        this.searchUserToResult.push({ firstName: x.userFirstName, lastName: x.userLastName, email: x.userEmail, checked: false });
        this.searchUserBCCResult.push({ firstName: x.userFirstName, lastName: x.userLastName, email: x.userEmail, checked: false });
      });
      this.globalSearchUserCCResult = this.searchUserCCResult;
      this.globalSearchUserBCCResult = this.searchUserBCCResult;
      this.globalSearchUserToResult = this.searchUserToResult;
    });
  }

  ngAfterViewInit() {
    let sourceElement: any = {};
    sourceElement["header"] = document.querySelector('#editor-email');
    MultirootEditor.create1(sourceElement,undefined,undefined,this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu-email').appendChild(newEditor.ui.view.toolbar.element);
        this.redirectUrlId = Guid.create().toString();
        let redirectUrl = this.appConfig.RedirectURI() + "?redirecturlid=" + this.redirectUrlId;
        this.editor = newEditor;
        if (this.isForwardMail || this.isInfoRequest)
          this.editor.setData
          ({ 
            header: 
            '<div><p style="margin-top:25px;"> Dear '+ this.sendToFullName + '</p>' +
            '<p>You have been assigned task '+ this.designerService.informationRequestModel.Name  + ', relating to project ' + this.projectName+ ' by ' + this.userService.getLoggedInUser() + ' on TP Digital DoX.  In order to complete this task, please log on to TP Digital DoX via the following link: </p>'+
            '<a href="' + redirectUrl + '" target = "_blank">' + redirectUrl + '</a>' +
            '<p>Please contact XX if you experience issues with logging in.</p> <p>Kind regards,</p> <p>The TP Digital DoX Team</p></div>'
          });
      })
      .catch(err => {
        console.error(err.stack);
      });

  }
  sendMailAfterSave() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft)
      this.infoReqSendEmailViewModel.InformationRequestId = this.designerService.infoDraftResponseModel.Id;
    else
      this.infoReqSendEmailViewModel.InformationRequestId = this.designerService.informationRequestModel.Id;
    
      this.infoReqSendEmailViewModel.redirectUrlId = this.redirectUrlId;
    this.subscriptions.add(this.sendEmailService.inforReq_SendEmail(this.infoReqSendEmailViewModel)
      .subscribe(
        response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          if (response.status === ResponseStatus.Sucess) {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish("Sentmail");
            
            this.toastr.success(this.translate.instant('screens.project-user.informationRequestMessage'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.createInfo).publish("closeInfoRequest");

          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.dismiss();
        },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }
  SendEmailProjectUser() {
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName == "header") {
        this.EmailBody = this.editor.getData({ rootName });
      }
    }
    if (this.isInfoRequest === true) {
      //Multiple Entities information requests
      if (this.designerService.isDeliverableSelected) {
        this.closeCreateRequest = false;
        this.designerService.deliverableInformationRequestModel.forEach((x, index) => {
          if (index == this.designerService.deliverableInformationRequestModel.length - 1)
            this.closeCreateRequest = true;
          this.designerService.informationRequestModel = x;
          this.designerService.AssignToList = x.AssignTo;
          this.AssignEmailData();
        });
      }
      else
        this.AssignEmailData();
    }
    else {

      // this.sendEmailViewModel.ProjectId = 'DigiDox3.0';
      //this.sendEmailViewModel.ProjectId = this.shareDetailService.getprojectId();
      this.sendEmailViewModel.SendTO = this.emailViewModel.EmailIds;
      this.sendEmailViewModel.SendCC = this.emailsCC;
      this.sendEmailViewModel.SendBCC = this.emailsBCC;
      this.sendEmailViewModel.Subject = this.SendEmailProjectUserForm.controls["Subject"].value;
      this.sendEmailViewModel.BodyContent = this.EmailBody;
      if (this.sendEmailViewModel.Subject != "" && this.sendEmailViewModel.BodyContent != "") {
        this.subscriptions.add(this.sendEmailService.sendEmail(this.sendEmailViewModel)
          .subscribe(
            response => {
              if (response.status === ResponseStatus.Sucess) {
                this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish(response.status);
                this.toastr.success(this.translate.instant('screens.project-user.EmailSuccessMessage'));
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
        this.toastr.success(this.translate.instant('screens.project-user.EmailValidation'));
       
        return
      }
    }
  }
  AssignEmailData() {
    this.infoReqSendEmailViewModel.InformationRequestId = this.designerService.informationRequestModel.Id;
    this.infoReqSendEmailViewModel.SentTo = [];
    if (!this.designerService.isDeliverableSelected) {
      this.designerService.AssignToList.forEach(element => {
        var to = new UserBasicViewModel();
        to.Email = element;
        let result = this.searchUserToResult.find(x => x.email == element);
        if (result != null) {
          to.FirstName = result.firstName;
          to.LastName = result.lastName;
        }
        this.infoReqSendEmailViewModel.SentTo.push(to);
      });
    }
    else
      this.infoReqSendEmailViewModel.SentTo = (this.designerService.AssignToList);
    this.infoReqSendEmailViewModel.CC = [];
    this.emailsCC.forEach(element => {
      var cc = new UserBasicViewModel();
      cc.Email = element;
      let result = this.searchUserCCResult.find(x => x.email == element);
      if (result != null) {
        cc.FirstName = result.firstName;
        cc.LastName = result.lastName;
      }
      this.infoReqSendEmailViewModel.CC.push(cc);
    });
    this.infoReqSendEmailViewModel.Subject = this.SendEmailProjectUserForm.controls["Subject"].value;
    this.infoReqSendEmailViewModel.Content = this.EmailBody;
    if (this.infoReqSendEmailViewModel.Subject != "" && this.infoReqSendEmailViewModel.Content != "") {
      if (this.designerService.isForwardMail === true) {
        if (this.emailsTo.length > 1) {
          this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.ForwardMsgSendToValidation'));
          return
        }
        if (this.designerService.infoRequestId != null)
          this.infoReqSendEmailViewModel.InformationRequestId = this.designerService.infoRequestId;
        this.infoReqSendEmailViewModel.SentTo = [];
        this.emailsTo.forEach(element => {
          var to = new UserBasicViewModel();
          to.Email = element;
          let result = this.searchUserToResult.find(x => x.email == element);
          if (result != null) {
            to.FirstName = result.firstName;
            to.LastName = result.lastName;
          }
          this.infoReqSendEmailViewModel.SentTo.push(to);
        });
        this.infoReqSendEmailViewModel.BCC = [];
        this.emailsBCC.forEach(element => {
          var bcc = new UserBasicViewModel();
          bcc.Email = element;
          let result = this.searchUserToResult.find(x => x.email == element);
          if (result != null) {
            bcc.FirstName = result.firstName;
            bcc.LastName = result.lastName;
          }
          this.infoReqSendEmailViewModel.BCC.push(bcc);
        });
        this.forwardEmailViewModel.InformationRequestId = this.designerService.infoRequestId;
        this.forwardEmailViewModel.EmailDetails = this.infoReqSendEmailViewModel;
        this.section.forEach(item => {
          let questionIdMdl = new QuestionIdsViewModel();
          questionIdMdl.QuestionId = item.QuestionId;
          questionIdMdl.QuestionnarieId = item.QuestionnarieId;
          this.forwardEmailViewModel.QuestionsId.push(questionIdMdl);
        });
        if (this.designerService.isTemplateSection === true || this.designerService.isTemplateSelected === true) {
          this.forwardEmailViewModel.IsTemplate = true;
          this.forwardEmailViewModel.TemplateOrDeliverableId = this.designerService.templateDetails.templateId;
        }
        else if (this.designerService.isDeliverableSection === true) {
          this.forwardEmailViewModel.IsTemplate = false;
          this.forwardEmailViewModel.TemplateOrDeliverableId = this.designerService.deliverableDetails.deliverableId;
        }
        this.subscriptions.add(this.sendEmailService.forwardMail(this.forwardEmailViewModel)
          .subscribe(response => {
            if (response.status === ResponseStatus.Sucess) {
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish(response.status);
              this.toastr.success(this.translate.instant('screens.project-user.forwardSuccessMessage'));
            
            } else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
            this.dismiss();
          },
            error => {
              this.dialogService.Open(DialogTypes.Warning, error.message);
            }));
      }
      else if (this.designerService.isForwardMail === false) {
        if (this.designerService.infoDraftResponseModel.Id == '' || this.designerService.infoDraftResponseModel.Id == null) {
          if (this.designerService.informationRequestModel.Id == undefined || this.designerService.informationRequestModel.Id == '') {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.createInfo).publish("sendMail");
          }
          else {
            this.sendMailAfterSave();
          }
        }
        else {
          this.sendMailAfterSave();
        }
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailValidation'));
        return
      }
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.EmailValidation'));
      return
    }
  }
  dismiss() {
    this.ref.close();
  }

  EnableBCC() {
    this.EnableBCCControl = true;
    this.EnableBCCBtn = false;
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

  removeEmailIds(selectedCCEmail) {
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toolbar = [
    // { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
    // { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste'] },
    { name: 'styles', items: ['Font', 'FontSize', 'lineheight'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
    { name: 'insert', items: ['SpecialChar'] },
    { name: 'link', items: ['Link'] },
    { name: 'editing', items: ['Find'] }, '/',
    { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Superscript', '-', 'RemoveFormat'] },
    { name: 'tools', items: ['Maximize', 'Zoom'] },
    { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates', 'zoom'] },
    { name: 'colors', items: ['TextColor', 'BGColor'] },
    { name: 'insert', items: ['SpecialChar'] },
    // { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
  ];

  config = { toolbar: this.toolbar, height: '400', width: '100%' };


}
