import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { CreateTemplateComponent } from '../../templates-deliverables/create-template/create-template.component';
import { NbDialogService } from '@nebular/theme';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { GenerateReportComponent } from '../../report-generation/generate-report/generate-report.component';
import { TemplateService } from '../../../../services/template.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ReportHistoryFilterResponseViewModel, ReportHistoryFilterRequestViewModel, DeleteReportHistoryRequestViewModel } from '../../../../../../@models/projectDesigner/report';
import { UserSearchResult, DocumentViewAccessRights } from '../../../../../../@models/userAdmin';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DesignerService } from '../../../../services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentViewIcons } from '../../../../../../@models/projectDesigner/block';
import { ProjectContext } from '../../../../../../@models/organization';
import { AddDeliverableGroupComponent } from '../../templates-deliverables/deliverable-group/add-deliverable-group/add-deliverable-group.component';
import { deliverableGroupFilter } from '../../../../../../@models/projectDesigner/deliverable';
import { DeliverableService } from '../../../../services/deliverable.service';

@Component({
  selector: 'ngx-template-level2-menu',
  templateUrl: './template-level2-menu.component.html',
  styleUrls: ['./template-level2-menu.component.scss']
})
export class TemplateLevel2MenuComponent implements OnInit, OnDestroy {
  isTemplate: boolean = true;
  isDeliverable: boolean = true;
  isGenerationHistory: boolean = true;
  ddlistTemplateDeliverableNames: any;
  selectedTemplateDeliverableNames = [];
  ddlistReportType: any;
  selectedreportTypes = [];
  ddlistGeneratedBy: any;
  selectedGeneratedBy = [];
  ddlistStatus: any;
  selectedStatus = [];
  dropdownSettings = {};
  dropdownGeneratedBySettings = {};
  subscriptions: Subscription = new Subscription();
  generationHistory = new ReportHistoryFilterRequestViewModel();
  isCreateDisabled: boolean = true;
  isDeleteDisabled: boolean = true;
  deleteToolTip: string = "";
  toolbarIcons = new DocumentViewIcons();
  projectDetails: ProjectContext;
  isGenerateDisabled: boolean = true;

  isDeliverableGroupTab: boolean = false;

  groupDDSettings: any;
  groupDeliverableDDSettings: any;

  selectedGroupDeliverables = [];
  selectedGroups = [];
  groupListData = [];
  groupDeliverableListData = [];

  groupFilterData: deliverableGroupFilter;
  groupFilterSelected: boolean = false;

  show: boolean = true;
  imageName: string = this.translate.instant("expand");

  constructor(private dialogService: NbDialogService, private el: ElementRef, private dialog: MatDialog,
    private shareDetailService: ShareDetailService, private _eventService: EventAggregatorService,
    private deliverableService: DeliverableService,
    private templateService: TemplateService, private designerService: DesignerService, private translate: TranslateService) { }
  ngOnInit() {
    this.projectDetails = this.shareDetailService.getORganizationDetail();
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: this.translate.instant('SelectAll'),
      unSelectAllText: this.translate.instant('UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
    };
    this.dropdownGeneratedBySettings = {
      singleSelection: false,
      idField: 'email',
      textField: 'fullName',
      selectAllText: this.translate.instant('SelectAll'),
      unSelectAllText: this.translate.instant('UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
    };
    this.groupDDSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('SelectAll'),
      unSelectAllText: this.translate.instant('UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
    };
    this.toolbarIcons.enableGenerate = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).subscribe((payload: any) => {
      if (payload.action == "Deliverables") {
        this.isTemplate = this.isGenerationHistory = false;
        this.isDeliverable = true;
        this.isDeliverableGroupTab = false;
        this.designerService.selectedTemplates = undefined;
      }
      if (payload.action == "Templates") {
        this.isTemplate = true;
        this.isDeliverable = this.isGenerationHistory = false;
        this.isDeliverableGroupTab = false;
        this.designerService.selectedDeliverables = undefined;
      }
      if (payload.action == 'Generation History') {
        this.isGenerationHistory = true;
        this.isTemplate = this.isDeliverable = false;
        this.isDeliverableGroupTab = false;
        this.loadReportGenerationFilters();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(this.generationHistory);

      }
      if (payload.action === 'Deliverable Grouping') {
        this.isGenerationHistory = false;
        this.isTemplate = false;
        this.isDeliverable = false;
        this.loadDeliverableGroupFilters();
        this.isDeliverableGroupTab = true;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
      .subscribe((action: string) => {
        let createGroupBtn = this.el.nativeElement.querySelector('#createGroupIcon');
        let deleteGroupBtn = this.el.nativeElement.querySelector('#deleteGroupIcon');
        let editGroupBtn = this.el.nativeElement.querySelector('#editGroupIcon');

        switch (action) {
          case eventConstantsEnum.projectDesigner.deliverableGroup.actionAdd:
            createGroupBtn.classList.remove('disable-section');
            createGroupBtn.classList.remove('disabledbutton');
            deleteGroupBtn.classList.add('disable-section');
            deleteGroupBtn.classList.add('disabledbutton');
            editGroupBtn.classList.add('disable-section');
            editGroupBtn.classList.add('disabledbutton');
            break;
          case eventConstantsEnum.projectDesigner.deliverableGroup.actionDelete:
            deleteGroupBtn.classList.remove('disable-section');
            deleteGroupBtn.classList.remove('disabledbutton');
            createGroupBtn.classList.add('disable-section');
            createGroupBtn.classList.add('disabledbutton');
            editGroupBtn.classList.add('disable-section');
            editGroupBtn.classList.add('disabledbutton');
            break;
          case eventConstantsEnum.projectDesigner.deliverableGroup.actionEdit:
            editGroupBtn.classList.remove('disable-section');
            editGroupBtn.classList.remove('disabledbutton');
            deleteGroupBtn.classList.remove('disable-section');
            deleteGroupBtn.classList.remove('disabledbutton');
            createGroupBtn.classList.add('disable-section');
            createGroupBtn.classList.add('disabledbutton');
            break;
        }
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistoryToolbar).subscribe((payload: any) => {
      let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");
      let deleteTag = this.el.nativeElement.querySelector("#deleteIcon");
      let clearTag = this.el.nativeElement.querySelector("#clearFilterIcon");
      if (payload == "load") {
        downloadTag.classList.add("disable-section");
        downloadTag.classList.add("disabledbutton");
        deleteTag.classList.add("disable-section");
        deleteTag.classList.add("disabledbutton");
      }
      else if (payload == 'enablemanageSection') {
        downloadTag.classList.remove("disable-section");
        downloadTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).subscribe((payload: any = []) => {
      var isDefaultSelected = payload.filter(item => item.isDefault == true);
      if (this.projectDetails.ProjectAccessRight.isCentralUser) {
        if (isDefaultSelected.length > 0) {
          this.isDeleteDisabled = true;
          this.isGenerateDisabled = false;
          this.deleteToolTip = this.translate.instant('screens.project-designer.iconview.errMsgOnDelete');
        }
        else {
          this.isDeleteDisabled = false;
          this.isGenerateDisabled = true;
          this.deleteToolTip = "";
        }

        if (payload.length > 0) {
          this.isCreateDisabled = true;
          this.isGenerateDisabled = false;
        }
        else {
          this.isCreateDisabled = false;
          this.isDeleteDisabled = true;
          this.isGenerateDisabled = true;
        }
      }
      // IF local user and having template access(nned to add template check)
      if (!this.projectDetails.ProjectAccessRight.isCentralUser) {
        this.isCreateDisabled = true;
        this.isDeleteDisabled = true;
        this.isGenerateDisabled = (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.hasProjectTemplateAccess) ? false : true;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).subscribe((payload: DocumentViewIcons) => {
      this.toolbarIcons.enableGenerate = payload.enableGenerate;
    }));
  }
  loadReportGenerationFilters() {
    const project = this.shareDetailService.getORganizationDetail();
    var projectId = project.projectId;

    this.templateService.getReportGenerationHistoryFilter(projectId).subscribe((data: ReportHistoryFilterResponseViewModel) => {
      if (data != null) {
        this.ddlistTemplateDeliverableNames = data.templateOrDeliverableName;
        this.ddlistReportType = data.reportType;
        this.ddlistStatus = data.status;
        data.generatedBy.forEach((x: UserSearchResult) => {
          x.fullName = x.firstName + ' ' + x.lastName;
        })
        this.ddlistGeneratedBy = data.generatedBy;
      }
    })
  }
  createTemplatePopup() {
    this.dialogService.open(CreateTemplateComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  generateReportPopup() {
    this.dialogService.open(GenerateReportComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { isTemplate: this.isTemplate }
    });
  }

  private dialogTemplate: Dialog;
  openDeleteConfirmDialog(): void {

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTemplates();
      }
    });
  }

  deleteTemplates() {
    let payload: any = {};
    payload.action = "delete";
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).publish(payload);
  }

  setClearFilter()
  {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    if ((this.selectedTemplateDeliverableNames == undefined || this.selectedTemplateDeliverableNames.length <= 0) && (this.selectedStatus == undefined || this.selectedStatus.length <= 0) && (this.selectedGeneratedBy == undefined || this.selectedGeneratedBy.length <= 0) &&
      (this.selectedreportTypes == undefined || this.selectedreportTypes.length <= 0) && (!this.generationHistory || (!this.generationHistory.taxableYearEndFrom && !this.generationHistory.taxableYearEndTo)
      && (!this.generationHistory.createdOnFrom && !this.generationHistory.createdOnTo))) {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    else {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
  }

  onItemSelect(item: any) {
    this.setClearFilter();
    this.generationHistory.templateOrDeliverableName = this.selectedTemplateDeliverableNames;
    this.generationHistory.reportType = this.selectedreportTypes;
    this.generationHistory.status = this.selectedStatus;
    this.generationHistory.generatedBy = this.selectedGeneratedBy;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(this.generationHistory);
  }
  onDateSelect(item: any, type: any) {
    if (!item) return;
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);
    if (type == 'TaxableYearDate') {
      this.generationHistory.taxableYearEndFrom = startDateSelected;
      this.generationHistory.taxableYearEndTo = endDateSelected;
    }
    else if (type == 'CreatedDate') {
      this.generationHistory.createdOnFrom = startDateSelected;
      this.generationHistory.createdOnTo = endDateSelected;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(this.generationHistory);
    this.setClearFilter();
  }
  onSelectAll(items: any, index) {
    if (index == 1)
      this.generationHistory.templateOrDeliverableName = items;
    else if (index == 2)
      this.generationHistory.reportType = items;
    else if (index == 3)
      this.generationHistory.status = items;
    else if (index == 4)
      this.generationHistory.generatedBy = items;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(this.generationHistory);
  }
  clearFilters() {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
    this.selectedTemplateDeliverableNames = [];
    this.selectedStatus = [];
    this.selectedGeneratedBy = [];
    this.selectedreportTypes = [];
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    if (datePicker != null)
      datePicker.value = "";
    datePicker = <HTMLInputElement>document.getElementById("createdDate");
    if (datePicker != null)
      datePicker.value = "";
    this.generationHistory = new ReportHistoryFilterRequestViewModel();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(this.generationHistory);
  }
  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }
  deleteHistory() {
    let payload: any;
    payload = "delete";
    this.resetButtons();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(payload);
  }
  downloadReport() {
    let payload: any;
    payload = "downloadReport";
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).publish(payload);
  }
  resetButtons() {
    let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");
    let deleteTag = this.el.nativeElement.querySelector("#deleteIcon");
    if (downloadTag) {
      downloadTag.classList.add("disable-section");
      downloadTag.classList.add("disabledbutton");
    }
    if (deleteTag) {
      deleteTag.classList.add("disable-section");
      deleteTag.classList.add("disabledbutton");
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.deliverableRole && this.designerService.docViewAccessRights.deliverableRole.length > 0) {
      if (this.designerService.docViewAccessRights.deliverableRole.filter(e => e.roles.filter(x => x == roleToCompare)))
        return true;
      else
        return false;
    }
    return false;
  }

  createGroup() {
    this.dialogService.open(AddDeliverableGroupComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  deleteGroup() {
    let eventName = eventConstantsEnum.projectDesigner.deliverableGroup.actionDelete;
    this.subscriptions.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.performAction)
        .publish(eventName));
  }
  editGroup() {
    let eventName = eventConstantsEnum.projectDesigner.deliverableGroup.actionEdit;
    this.subscriptions.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.performAction)
        .publish(eventName));
  }

  clearGroupFilters() {
    this.selectedGroups = [];
    this.selectedGroupDeliverables = [];
    this.generationHistory = new ReportHistoryFilterRequestViewModel();
    this.groupFilterData = new deliverableGroupFilter();
    this.publishDeliverableGroupFilter();
  }

  onGroupItemSelect(items) {
    if (Array.isArray(items)) {
      this.selectedGroups = items;
    }
    else {
      this.selectedGroups.push(items);
    }
    this.groupFilterData.groupFilter =
      (this.selectedGroups && this.selectedGroups.length > 0) ? this.selectedGroups.map(x => x.id) : [];
    this.publishDeliverableGroupFilter();
  }
  onGroupItemDeSelect(items) {
    if (Array.isArray(items)) {
      this.selectedGroups = items;
    }
    else {
      const index = this.selectedGroups.indexOf(items);
      (index !== -1) ? this.selectedGroups.splice(index, 1) : this.selectedGroups;
    }
    this.groupFilterData.groupFilter =
      (this.selectedGroups && this.selectedGroups.length > 0) ? this.selectedGroups.map(x => x.id) : [];
    this.publishDeliverableGroupFilter();
  }
  onGroupDeliverableItemSelect(items) {
    if (Array.isArray(items)) {
      this.selectedGroupDeliverables = items;
    } else {
      this.selectedGroupDeliverables.push(items);
    }
    this.groupFilterData.deliverableFilter =
      (this.selectedGroupDeliverables && this.selectedGroupDeliverables.length > 0) ?
        this.selectedGroupDeliverables.map(x => x.id) : [];
    this.publishDeliverableGroupFilter();
  }
  onGroupDeliverableItemDeSelect(items) {
    if (Array.isArray(items)) {
      this.selectedGroupDeliverables = items;
    } else {
      const index = this.selectedGroupDeliverables.indexOf(items);
      (index !== -1) ? this.selectedGroupDeliverables.splice(index, 1) : this.selectedGroupDeliverables;
    }
    this.groupFilterData.deliverableFilter = this.selectedGroupDeliverables;
    this.publishDeliverableGroupFilter();
  }
  publishDeliverableGroupFilter() {
    this.groupFilterSelected = false;
    if (this.groupFilterData &&
      ((this.groupFilterData.deliverableFilter && this.groupFilterData.deliverableFilter.length > 0)
        || (this.groupFilterData.groupFilter && this.groupFilterData.groupFilter.length > 0))) {
      this.groupFilterSelected = true;
    }
    let eventName = eventConstantsEnum.projectDesigner.deliverableGroup.actionFilter;
    this.subscriptions.add(
      this._eventService.getEvent(eventName).publish(this.groupFilterData));
  }

  loadDeliverableGroupFilters() {
    let projectId = this.shareDetailService.getORganizationDetail().projectId;
    this.deliverableService.getDeliverableGroupFilter(projectId).subscribe(response => {
      this.groupListData = response.groupFilter;
      this.groupDeliverableListData = response.deliverableFilter;
      this.groupFilterData = new deliverableGroupFilter();
    });
  }

  toggleCollapse() {
    this.show = !this.show;
    this.imageName = (this.show) ? this.translate.instant("collapse") : this.translate.instant("expand");
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
