import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { AuditTrailService } from '../audit-trail.service';
import { AuditTrailLogFilterViewModel, AuditTrailLogFilterMenuViewModel } from '../../../../@models/audit-trail/audit-trail';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../@models/common/eventConstants';
import { ProjectContext } from '../../../../@models/organization';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { UserUISetting } from '../../../../@models/user';
import { UserService } from '../../../user/user.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-audit-trail-toolbar',
  templateUrl: './audit-trail-toolbar.component.html',
  styleUrls: ['./audit-trail-toolbar.component.scss']
})
export class AuditTrailToolbarComponent implements OnInit, OnDestroy {
  projectDetails: ProjectContext;
  ddlistActionBy: any;
  selectedActionBy: [];
  auditTrailFilter = new AuditTrailLogFilterViewModel();
  enableClearFilter: boolean = false;
  enableDelete: boolean = false;
  enableDownload: boolean = true;
  selectedAuditIds: string[] = [];
  subscriptions: Subscription = new Subscription();
  // To expand/collapse filters
  public show: boolean = false;
  imageKey: string = 'expand';
  imageName: string = this.translate.instant(this.imageKey);
  userUISetting: UserUISetting;

  loaderId = 'CreateBlockLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
    unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
    itemsShowLimit: 1,
    allowSearchFilter: true,
    classes: 'multiselect-dropdown',
  };
  private dialogTemplate: Dialog;
  constructor(
    private el: ElementRef,
    private shareDetailService: ShareDetailService,
    private toastr: ToastrService,
    private auditTrailService: AuditTrailService,
    private _eventService: EventAggregatorService,
    private userservice: UserService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService) {
    this.userUISetting = new UserUISetting();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setLocaleMessages();
      });
  }

  ngOnInit() {
    this.projectDetails = this.shareDetailService.getORganizationDetail();
    this.userUISetting = this.userservice.getCurrentUserUISettings();
    this.auditTrailService.getFilterMenu(this.projectDetails.projectId).subscribe((data: AuditTrailLogFilterMenuViewModel) => {
      if (data) {
        this.ddlistActionBy = data.actionBy;
      }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.enableDisableIcons).subscribe((payload: any) => {
      if (payload.length > 0) {
        this.selectedAuditIds = [];
        payload.forEach(item => {
          this.selectedAuditIds.push(item.id);
        });
        this.enableDownload = false;
        this.enableDelete = true;
      }
      else {
        this.enableDownload = true;
        this.enableDelete = false;
      }
    }));

    if (this.userUISetting.isMenuExpanded) {
      this.toggleCollapse();
    }
  }

  onItemSelect(item) {
    let datePicker = this.el.nativeElement.querySelector("#actionDate");
    if ((this.selectedActionBy == undefined || this.selectedActionBy.length <= 0) && datePicker.value == '') {
      this.enableClearFilter = false;
    }
    else {
      this.enableClearFilter = true;
    }
    if (this.selectedActionBy != undefined) {
      this.auditTrailFilter.actionBy = new Array();
      this.selectedActionBy.forEach((element: never) => {
        this.auditTrailFilter.actionBy.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.auditTrailFilter).publish(this.auditTrailFilter);
  }

  onSelectAllActionBy(items) {
    let datePicker = this.el.nativeElement.querySelector("#actionDate");
    if (items.length > 0) {
      this.enableClearFilter = true;
    }
    else if (datePicker.value == '') {
      this.enableClearFilter = false;
    }
    this.auditTrailFilter.actionBy = new Array();
    items.forEach((element: never) => {
      this.auditTrailFilter.actionBy.push(element["id"]);
    });
    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.auditTrailFilter).publish(this.auditTrailFilter);
  }

  onDateSelect(item: any, type: any) {
    if (!item) return;
    this.enableClearFilter = true;
    var frstDate = item[0];
    var secondDate = this.getEndDateTime(item[1]);
    if (type == 'ActionDate') {
      this.auditTrailFilter.actionMaximumDate = secondDate;
      this.auditTrailFilter.actionMinimumDate = frstDate;
    }
    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.auditTrailFilter).publish(this.auditTrailFilter);
  }

  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }

  openDeleteConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-user.DeleteConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAuditLogs();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }


  deleteAuditLogs() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.auditTrailService.delete(this.selectedAuditIds).subscribe((response) => {
      this.enableDelete = false;
      this.toastr.success(this.translate.instant('screens.project-setup.auditTrail.audit-trail-validation.SuccesDeleteMessage'));
     
      this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.refreshPage).publish(true);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.auditTrail.audit-trail-validation.ErrorDeleteMessage'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  downloadAuditFile() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    var auditTrailLogFilter = new AuditTrailLogFilterViewModel();
    if (this.auditTrailService.logFilterViewModel) {
      auditTrailLogFilter = this.auditTrailService.logFilterViewModel;
    }
    else {
      auditTrailLogFilter.actionMaximumDate = new Date();
      auditTrailLogFilter.actionMinimumDate = new Date();
    }
    auditTrailLogFilter.projectId = this.projectDetails.projectId;

    this.auditTrailService.download(auditTrailLogFilter).subscribe((response: any) => {
      if (response) {
        this.downloadFile(response, 'Audit_TrailLog');
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
    return false;
  }

  private downloadFile(data, fileName) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
      }
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.auditTrail.audit-trail-validation.DownloadErrorMsg'));
    }
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }
  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#auditTrailFilters-section");
    // To change the name of image.
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      transFilterID.classList.remove('collapsed');
      this.imageKey = 'collapse';
      this.imageName = this.translate.instant(this.imageKey);
    }
    else {
      this.userUISetting.isMenuExpanded = false;
      this.imageKey = 'expand';
      this.imageName = this.translate.instant(this.imageKey);
      // filterIcon.classList.show();
      transFilterID.classList.add('collapsed');
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }

  clearFilters() {
    this.enableClearFilter = false;
    this.selectedActionBy = [];
    let datePicker = this.el.nativeElement.querySelector("#actionDate");
    datePicker.value = "";
    this.auditTrailFilter = new AuditTrailLogFilterViewModel();
    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.loadAction).publish(this.auditTrailFilter);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
