import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { TemplateViewModel } from '../../../../../../../../@models/projectDesigner/template';
import { IconViewService } from '../../../../services/icon-view.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../../@models/common/dialog';
import { NbDialogRef } from '@nebular/theme';
import { AssignToUsersDataModel } from '../../../../../../../../@models/projectDesigner/block';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../services/designer.service';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../@models/projectDesigner/theming';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DeliverablesInput } from '../../../../../../../../@models/projectDesigner/deliverable';
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
  designer = new Designer();
  section: string = '';
  themingContext: ThemingContext;

  //ngx-ui-loader configuration
  loaderId = 'assignToICloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  reportReview: boolean = false;
  headerTitle: string = '';
  headerMessage = '';
  successfulMessage: string = '';
  failureMessage: string = '';
  subscriptions: Subscription = new Subscription();

  constructor(protected storageService: StorageService, protected ref: NbDialogRef<any>, private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder, private designerService: DesignerService,
    private iconViewService: IconViewService,
    private toastr: ToastrService,
    private readonly eventService: EventAggregatorService,
    private dialogService: DialogService,
    private sharedService: ShareDetailService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService
  ) {
    this.searchUserForm = this.formBuilder.group({
      SearchUser: ['', [Validators.required]],
      DueDate: ['',[Validators.required]],
    });

    this.searchUserForm.controls["SearchUser"].valueChanges
      .subscribe(data => {
        if (data.length >= 3) {
          let userAssignmentModel = new TemplateViewModel();
          this.projectDetails = this.sharedService.getORganizationDetail();
          let projectId = this.projectDetails ? this.projectDetails.projectId : '';
          userAssignmentModel.projectId = projectId;
          if (this.designer.templateDetails != null)
            userAssignmentModel.templateId = this.designer.templateDetails.templateId;
          else
            userAssignmentModel.deliverableId = this.designer.deliverableDetails.entityId;

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
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.setStaticMessages();
  }

  setStaticMessages() {
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
    if (selectedUser !== '') {
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
    model.sectionId = this.designer.templateDetails != null ? this.designer.templateDetails.templateId : this.designer.deliverableDetails.deliverableId;
    model.section = this.designer.templateDetails != null ? 'Template' : this.designer.deliverableDetails != null ? 'Deliverable' : '';

    //Add blocks only in case of block review
    if (!this.reportReview) {
      this.designer.assignToBlockList.forEach(x => {
        model.blockIds.push(x.blockId);
      })
    };
    model.note = this.note;
    model.dueDate = this.getEndDateTime(this.searchUserForm.controls["DueDate"].value);
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.iconViewService.assignBlockUser(model).subscribe(response => {
      if (response) {
        this.toastr.success(this.translate.instant('screens.project-designer.document-view.tasks.blockReviewSuccessMessage'));
       // this.translate.instant('screens.project-designer.document-view.tasks.blockReviewSuccessMessage')
       // this.dialogService.Open(DialogTypes.Success, this.successfulMessage);
        this.ref.close();
        if (this.designer.templateDetails != null) {

          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
        }
        if (this.designer.deliverableDetails != null) {
          var deliverableInput = new DeliverablesInput();
          deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
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
