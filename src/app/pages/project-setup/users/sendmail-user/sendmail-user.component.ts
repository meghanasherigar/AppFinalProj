import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { DialogTypes } from '../../../../@models/common/dialog';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogService } from '../../../../shared/services/dialog.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { Subscription } from 'rxjs';
import { SendEmailViewModel, SearchViewModel, EmailViewModel } from '../../../../@models/userAdmin';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { NbDialogRef, NbWindowService } from '@nebular/theme';
import '../../../../../assets/ckeditor.loader';
import 'ckeditor';
import { TranslateService } from '@ngx-translate/core';
import { SendEmailService } from '../../../../shared/services/send-email.service';
import MultirootEditor from '../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { DesignerService } from '../../../project-design/services/designer.service';
import { ToastrService } from 'ngx-toastr';

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
  searchViewModel: SearchViewModel = new SearchViewModel();
  searchUserCCResult = [];
  searchUserBCCResult = [];
  emailsCC = [];
  removable = false;
  emailsBCC = [];
  emailViewModel = new EmailViewModel();
  ToAddress: string;
  EmailBody: string;

  constructor(
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private shareDetailService: ShareDetailService,
    private toastr: ToastrService,
    private projectUserService: ProjectUserService,
    private sendEmailService: SendEmailService,
    private windowService: NbWindowService,
    private translate: TranslateService,
    private designerService: DesignerService
  ) {
    this.SendEmailProjectUserForm = this.formBuilder.group({
      ToEmailAddress: [''],
      CCEmailAddress: [''],
      BCCEmailAddress: [''],
      Subject: [''],
      EmailBody: [''],
    });

    this.SendEmailProjectUserForm.controls["CCEmailAddress"].valueChanges
      .subscribe(data => {
        if (data != "") {
          const keys = data.split(' ');
          if (keys.length > 0) {
            this.searchViewModel.Keyword = keys[keys.length - 1];
            if (data.length >= 3) {
              this.projectUserService.sendEmailSearchUser(this.searchViewModel)
                .subscribe(
                  response => {
                    this.searchUserCCResult = response;
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
      });

  }

  ngOnInit() {
    this.EnableBCCBtn = true;
    let data = new EmailViewModel();
    data.EmailIds = new Array();
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
    this.ToAddress = this.emailViewModel.EmailIds.join("; ");
    this.SendEmailProjectUserForm.controls["ToEmailAddress"].setValue(this.ToAddress);
  }

  ngAfterViewInit() {
    let sourceElement: any = {};
    sourceElement["header"] = document.querySelector('#editor');
    MultirootEditor.create1(sourceElement,undefined,undefined,this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
      })
      .catch(err => {
        console.error(err.stack);
      });

  }

  SendEmailProjectUser() {
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName == "header") {
        this.EmailBody = this.editor.getData({ rootName });
      }
    }
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
