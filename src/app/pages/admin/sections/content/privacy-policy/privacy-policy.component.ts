import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { PrivacyPolicyService } from '../../../services/privacy-policy.service';
import { PrivacyStatementResponceViewModel, PrivacyStatementViewModel } from '../../../../../@models/admin/privacyPolicy';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { CustomHTML } from '../../../../../shared/services/custom-html.service';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit, AfterViewInit ,OnDestroy{

  responseData: PrivacyStatementResponceViewModel;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;
  userlist: any;
  lastModifiedDate: Date;
  username: string;
  selectedUser: any;
  editor: any;
  lastPublished: PrivacyStatementResponceViewModel;


  constructor(
    private privacyPolicyService: PrivacyPolicyService,
    private alertService: AlertService,
    private toastr: ToastrService,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService,
    private customHTML: CustomHTML,
    private designerService: DesignerService
  ) { }

  loaderId='PrivacyPolicyAdminLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
 
    this.privacyPolicyService.getUserType().subscribe(
      data => {
        this.userlist = data;
        this.selectedUser = this.userlist[0];
        this.getPrivacyPolicyContent(this.selectedUser);
        this.getLastPublishedData(this.selectedUser);
       
      });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.PrivacyPolicy).subscribe((payload) => {
      if (payload == "Save") {
        let privacyViewModel = new PrivacyStatementViewModel;
        privacyViewModel.privacyStatementContent =  this.customHTML.multiRootEditorSetResizedWidth('header', this.editor.getData({ rootName: 'header' })); 
        privacyViewModel.id = this.responseData != undefined ? this.responseData.id : "";
        privacyViewModel.userType = this.selectedUser;

        if (privacyViewModel.privacyStatementContent.trim() != "" && privacyViewModel.privacyStatementContent != undefined) {
          this.subscriptions.add(this.privacyPolicyService.save(privacyViewModel).subscribe(data => {
            if (data['status'] === 1) {
              this.getPrivacyPolicyContent(this.selectedUser);
              this.getLastPublishedData(this.selectedUser);
              this.toastr.success(this.translate.instant('screens.admin.commonMessage.dataSaved'));
             
            }
            else {
              this.dialogService.Open(DialogTypes.Error,  this.translate.instant('screens.admin.commonMessage.errorOccurred'));
            }
          }));
        }
        else
          this.dialogService.Open(DialogTypes.Warning,  this.translate.instant('screens.admin.commonMessage.contentEmpty'));
      }
      else if (payload == "Publish") {
        this.publishPrivacyPolicyContent();
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


  getPrivacyPolicyContent(usertype) {
    this.privacyPolicyService.getPrivacyStatement(usertype).subscribe((data: PrivacyStatementResponceViewModel) => {
      this.responseData = data;
      this.editor.setData({ header: data.privacyStatementContent });
      this.username = data.userName;
      this.lastModifiedDate = data.updatedOn;
      var _parentThis = this;
      setTimeout(function () {
          _parentThis.customHTML.multiRootEditorGetResizedWidth('header', data.privacyStatementContent);
         
      });
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      
    });
  }
  getLastPublishedData(userType) {
    this.privacyPolicyService.getLastPublishedData(userType).subscribe(response => {
      if (response) {
        this.lastPublished = response;
      } else {
        this.lastPublished.isPublishedUser = false;
      }
      
    });
  }

  publishPrivacyPolicyContent() {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.admin.commonMessage.publishQ');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let privacyViewModel = new PrivacyStatementViewModel;
        privacyViewModel.privacyStatementContent = this.editor.getData({ rootName: 'header' });
        privacyViewModel.id = this.responseData != undefined ? this.responseData.id : "";
        privacyViewModel.userType = this.selectedUser;

        if (privacyViewModel.privacyStatementContent.trim() != "" && privacyViewModel.privacyStatementContent != undefined) {
          this.subscriptions.add(this.privacyPolicyService.publish(privacyViewModel).subscribe(data => {
            if (data['status'] === 1) {
              this.toastr.success(this.translate.instant('screens.admin.commonMessage.publish'));
               this.getPrivacyPolicyContent(this.selectedUser);
              this.getLastPublishedData(this.selectedUser);
            }
            else {
              this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.admin.commonMessage.errorOccurred'));
            }
          }));
          dialogRef.close();
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.admin.commonMessage.noContentToPublish'));
        }
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  userTypeChange() {
    this.getPrivacyPolicyContent(this.selectedUser);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
