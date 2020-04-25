import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../@models/projectDesigner/template';
import { DesignerService } from '../../../../../../services/designer.service';
import { IconViewService } from '../../../../services/icon-view.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ManageAdminService } from '../../../../../../../admin/services/manage-admin.service';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../../@models/common/dialog';
import { NbDialogRef } from '@nebular/theme';
import { AssignToUsersDataModel } from '../../../../../../../../@models/projectDesigner/block';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-assign-to',
  templateUrl: './assign-to.component.html',
  styleUrls: ['./assign-to.component.scss']
})
export class AssignToComponent implements OnInit, OnDestroy {
  projectDetails: ProjectContext;
  searchUserResult: any = [];
  selectedItem: any;
  searchUserForm: FormGroup;
  selectedUsers: any = [];
  note: string;
  validationMessage: boolean = false;
  dueDateRequired: boolean = false;

  //ngx-ui-loader configuration
  loaderId = 'blockgridloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  reportReview: boolean = false;
  headerTitle: string = '';
  headerMessage = '';
  successfulMessage: string = '';
  failureMessage: string = '';

  templateId: string = '';
  deliverableId: string = '';
  subscriptions: Subscription=new Subscription();

  constructor(protected storageService: StorageService, protected ref: NbDialogRef<any>, private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder, private designerService: DesignerService,
    private iconViewService: IconViewService,
    private readonly eventService: EventAggregatorService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private sharedService: ShareDetailService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
  ) {
    this.searchUserForm = this.formBuilder.group({
      SearchUser: ['', [Validators.required]],
      DueDate: [''],
    });

    this.searchUserForm.controls["SearchUser"].valueChanges
      .subscribe(data => {
        if (data.length >= 3) {
          let userAssignmentModel = new TemplateViewModel();
          this.projectDetails = this.sharedService.getORganizationDetail();
          let projectId = this.projectDetails ? this.projectDetails.projectId : '';
          userAssignmentModel.projectId = projectId;
          userAssignmentModel.templateId = this.templateId;
          userAssignmentModel.deliverableId = this.deliverableId;

          userAssignmentModel.searchText = data;
          this.iconViewService.getUserDetails(userAssignmentModel)
            .subscribe(
              response => {
                this.searchUserResult = response;
              }),
            error => {
              this.dialogService.Open(DialogTypes.Warning, error.message);
            };
        }
      });
  }

  ngOnInit() {

    this.templateId = this.designerService.templateDetails ?
      this.designerService.templateDetails.templateId : '';

    this.deliverableId = this.designerService.deliverableDetails ?
      this.designerService.deliverableDetails.entityId : '';

    this.reportReview = this.designerService.isReportReview;

    this.headerTitle = this.reportReview ?
      this.translate.instant('screens.project-designer.document-view.tasks.reportReviewHeaderTitle') :
      this.translate.instant('screens.project-designer.document-view.tasks.blockReviewHeaderTitle')

    this.successfulMessage = this.reportReview ?
      this.translate.instant('screens.project-designer.document-view.tasks.reportReviewSuccessMessage') :
      this.translate.instant('screens.project-designer.document-view.tasks.blockReviewSuccessMessage');

    this.headerMessage = this.reportReview ?
      this.translate.instant('screens.project-designer.document-view.tasks.reportReviewHeader') :
      this.translate.instant('screens.project-designer.document-view.tasks.blockReviewHeader');

    this.failureMessage = this.translate.instant('screens.project-designer.document-view.tasks.assignToFailureMessage');
  }
  addUsers() {

    let selectedUser = this.searchUserForm.controls["SearchUser"].value;
    if (selectedUser != "") {
      let user = this.searchUserResult.find(x => x.email == selectedUser);
      if (this.selectedUsers.findIndex(x => x.id == user.id) >= 0) {
        this.dialogService.Open(DialogTypes.Warning, "User already added");
        return;
      }
      this.selectedUsers.push(user);
      this.searchUserResult = [];
      //this.searchUserForm.controls["SearchUser"].setValue("");
    }
  }
  remove(user) {
    let idx = this.selectedUsers.indexOf(user);
    this.selectedUsers.splice(idx, 1);
  }

  cancel() {
    this.ref.close();
  }
  assignTo() {
    this.validationMessage = false;
    this.dueDateRequired = false;

    let selectedUser = this.searchUserForm.controls["SearchUser"].value;

    if (!selectedUser) {
      this.validationMessage = true;
      return;
    }
    let userId = this.searchUserResult.find(x => x.email == selectedUser);
    if (this.searchUserForm.controls["DueDate"].value == '') {
      this.dueDateRequired = true;
      return;
    }
    let model = new AssignToUsersDataModel();
    model.userIds.push(userId.id);
    model.AssignAll = this.reportReview;
    model.dueDate = this.getEndDateTime(this.searchUserForm.controls["DueDate"].value);
    model.sectionId = this.templateId ? this.templateId : 
                      this.designerService.deliverableDetails? this.deliverableId:'';

    model.section = (this.templateId) ? 'Template' :
      (this.designerService.deliverableDetails) ? 'Deliverable' : '';

    if (!model.sectionId) {
      this.dialogService.Open(DialogTypes.Error, this.failureMessage);
      return;
    }
    //Add blocks only in case of block review
    if (!this.reportReview) {
      this.designerService.assignToBlockList.forEach(x => {
        model.blockIds.push(x.blockId);
      })
    };
    model.note = this.note;

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.iconViewService.assignBlockUser(model).subscribe(response => {
      if (response) {
        this.toastr.success(this.translate.instant(this.successfulMessage));
         this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
        if (this.designerService.isTemplateSection == true){
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
        }

        if(this.designerService.isDocFullViewEnabled!=null)
        {
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
        }
      }
      else
        this.dialogService.Open(DialogTypes.Error, this.failureMessage);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      (error) => {
        console.error(error);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
  }
  get form() { return this.searchUserForm.controls; }
  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }
  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }
}
