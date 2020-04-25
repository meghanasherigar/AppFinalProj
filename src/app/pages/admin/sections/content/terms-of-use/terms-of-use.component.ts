import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { TermsOfUseService } from '../../../services/terms-of-use.service';
import { TermsofUseResponceViewModel, TermsofUseViewModel } from '../../../../../@models/admin/termsofuse';
import { PrivacyPolicyService } from '../../../services/privacy-policy.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { CustomHTML } from '../../../../../shared/services/custom-html.service';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit, AfterViewInit,OnDestroy {

  termsofuseResponse: TermsofUseResponceViewModel;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;
  userlist: any;
  lastModifiedDate: Date;
  username: string;
  selectedUser: any;
  editor: any;
  lastPublished: TermsofUseResponceViewModel;

  constructor(
    private termsOfUseService: TermsOfUseService,
    private privacyPolicyService: PrivacyPolicyService,
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private customHTML : CustomHTML,
    private ngxLoader: NgxUiLoaderService,
    private designerService: DesignerService
  ) { }

  loaderId='TermsOfUseLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.privacyPolicyService.getUserType().subscribe(
      data => {
        this.userlist = data;
        this.selectedUser = this.userlist[0];
        this.getTermsofUseContent(this.selectedUser);
        this.getLastPublishedData(this.selectedUser);
      });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.TermsOfUse).subscribe((payload) => {
      if (payload == "Save") {
        let termsofUseViewModel = new TermsofUseViewModel;
        termsofUseViewModel.termsOfUseContent = this.customHTML.multiRootEditorSetResizedWidth('header', this.editor.getData({ rootName: 'header' })); 
        termsofUseViewModel.id = this.termsofuseResponse != undefined ? this.termsofuseResponse.id : "";
        termsofUseViewModel.userType = this.selectedUser;
    
        if (termsofUseViewModel.termsOfUseContent.trim() != "" && termsofUseViewModel.termsOfUseContent != undefined) {
          this.subscriptions.add(this.termsOfUseService.save(termsofUseViewModel).subscribe(data => {
              if (data['status'] === 1) {
                this.getTermsofUseContent(this.selectedUser);
                this.getLastPublishedData(this.selectedUser);
                this.toastr.success(this.translate.instant('screens.admin.commonMessage.dataSaved'));
               
              }
              else {
                this.dialogService.Open(DialogTypes.Error, "Error Occured");
              }
            }));
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.admin.commonMessage.contentEmpty'));
        }
      }
      else if (payload == "Publish") {
        this.publishTermsofUseContent();
      }
    }));
  }

  ngAfterViewInit() {
    var sourceElement = {
      header: document.querySelector('#editor')
    };
    MultirootEditor.create1(sourceElement,undefined,undefined,this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
      })
      .catch(err => {
        console.error(err.stack);
      });
  }

  getTermsofUseContent(userType) {
    this.termsOfUseService.getTermsofUse(userType).subscribe((data: TermsofUseResponceViewModel) => {
      this.termsofuseResponse = data;
      this.editor.setData({ header: data.termsOfUseContent });
      this.username = data.userName;
      this.lastModifiedDate = data.updatedOn;

      var _parentThis = this;
      setTimeout(function () {
          _parentThis.customHTML.multiRootEditorGetResizedWidth('header', data.termsOfUseContent);
      });
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }
  getLastPublishedData(userType) {
    this.termsOfUseService.getLastPublishedData(userType).subscribe(response => {
      if (response) {
        this.lastPublished = response;
      } else {
        this.lastPublished.isPublishedUser = false;
      }
    });
  }

  publishTermsofUseContent() {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.admin.commonMessage.publishQ');
   

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let termsofUseViewModel = new TermsofUseViewModel;
        termsofUseViewModel.termsOfUseContent = this.editor.getData({ rootName: 'header' });
        termsofUseViewModel.id = this.termsofuseResponse != undefined ? this.termsofuseResponse.id : "";
        termsofUseViewModel.userType = this.selectedUser;
        if (termsofUseViewModel.termsOfUseContent.trim() != "" && termsofUseViewModel.termsOfUseContent != undefined) {
          this.subscriptions.add(this.termsOfUseService.publish(termsofUseViewModel).subscribe(data => {
            if (data['status'] === 1) {
              this.toastr.success(this.translate.instant('screens.admin.commonMessage.publish'));
   
              this.getTermsofUseContent(this.selectedUser);
              this.getLastPublishedData(this.selectedUser);
            }
            else {
              this.dialogService.Open(DialogTypes.Error, "Error Occured");
            }
          }));
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, "No content to publish");
        }
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  userTypeChange() {
    this.getTermsofUseContent(this.selectedUser);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
