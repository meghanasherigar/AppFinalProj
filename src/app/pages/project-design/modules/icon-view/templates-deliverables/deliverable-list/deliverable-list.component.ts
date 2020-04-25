import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { NbDialogService } from '@nebular/theme';
import { MatDialog } from '@angular/material';
import { DeliverableService } from '../../../../services/deliverable.service';
import { LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import * as moment from 'moment';
import { DesignerService } from '../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { DocumentViewAccessRights, ProjectDeliverableRightViewModel, DeliverableRoleViewModel } from '../../../../../../@models/userAdmin';
import { DocumentViewIcons } from '../../../../../../@models/projectDesigner/block';
import { DeliverableMileStone, DeliverableCreateGroupRequestModel } from '../../../../../../@models/projectDesigner/deliverable';
import { ProjectUserService } from '../../../../../admin/services/project-user.service';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { DesignerService as newDesignerService } from '../../content/themes/services/designer.service'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-deliverable-list',
  templateUrl: './deliverable-list.component.html',
  styleUrls: ['./deliverable-list.component.scss']
})
export class DeliverableListComponent implements OnInit, OnDestroy {
 
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  @Input()
  sourceType: any;
  subscriptions: Subscription = new Subscription();
  source: CommonDataSource = new CommonDataSource();
  data: any;
  selectedDeliverables: any = [];
  toolbarIcons = new DocumentViewIcons();
  Description: [];
  mileStone: any = [];
  _pageSize: number = 10;
  _pageIndex: number = 0;
  _sortColumn?: string;
  _sortDirection?: string;
  templates: any = [];
  dialogTemplate: Dialog;
  projectUserRightsData: ProjectDeliverableRightViewModel;
  accessRights: DeliverableRoleViewModel[];
  constructor(private sharedService: ShareDetailService, private deliverableService: DeliverableService, private designerService: DesignerService, private toastr: ToastrService,
    private _eventService: EventAggregatorService, private dialogService: DialogService, private dService: NbDialogService,
    private dialog: MatDialog, private projectUserService: ProjectUserService, private translate: TranslateService,
    private newDesignerService: newDesignerService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));

      this.setColumnSettings();
    }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).subscribe((payload: any) => {
      if (payload.action == "Deliverables") {
        this.getAllDeliverables();
      }
    }));
    this.source.onChanged().subscribe((change) => {
      // this.removeViewMore();
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;

        this.deliverableListPaginated(this.prepareRequest());
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting) {
        this._sortDirection = change.sort[0].direction.toUpperCase();
        this._sortColumn = change.sort[0].field;
        this.deliverableListPaginated(this.prepareRequest());
      }
    });
  }

  editTitle =this.translate.instant('screens.project-setup.transaction.transaction-toolbar.Edit');
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      edit: true,
      class: 'testclass',
      delete: false,
      position: 'right'
    },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      entityName: {
        title: this.translate.instant('Deliverable'),
        editable: false,
      },
      templateId: {
        title: this.translate.instant('AssociatedTemplate'),
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [],
          },
        },
        valuePrepareFunction: (cell) => {
          let template = this.templates.find(x => x.value == cell);
          return template ? template.title : "";
        }
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        editable: false,
        // type: 'html',
        // valuePrepareFunction: (cell, row) => {
        //   return moment(row.taxableYearEnd).local().format("DD MMM YYYY");
        // }
      },

      milestone: {
        title: this.translate.instant('Milestones'),
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [],
          },
        },
        valuePrepareFunction: (cell) => {
          let milestone = this.mileStone.find(x => x.value == cell);
          return milestone ? milestone.title : "";
        }
      },
      createdBy: {
        title: this.translate.instant('CreatedBy'),
        editable: false,
      },
      createdOn: {
        title: this.translate.instant('Createdon'),
        editable: false,
        // type: 'html',
        // valuePrepareFunction: (cell, row) => {
        //   return moment(row.createdOn).local().format("DD MMM YYYY");
        // }
      }
    },
    edit: {
      editButtonContent: `<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon-template hideEdit" title="${this.editTitle}">`, 
      saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
      cancelButtonContent: '<i class="ion-close smallIcon"></i>',
      confirmSave: true
    },

    mode: 'inline',
    rowClassFunction: (row) => {
      this.projectUserRightsData = this.newDesignerService.projectUserRightsData;
      this.accessRights = [];
      if(this.projectUserRightsData){
      this.accessRights = this.projectUserRightsData.deliverableRole.filter(e => e.entityId == row.data.deliverableId);
        if((this.accessRights.length > 0) && !this.accessRights[0].canEditAttribute)
        {
        var element = document.getElementsByClassName("hideEdit");
        if (element && element.length && element[element.length - 1])
          element[element.length - 1].classList.add('hide');
     
        }
      }
    }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      entityName: {
        title: this.translate.instant('Deliverable'),
        editable: false,
      },
      templateId: {
        title: this.translate.instant('AssociatedTemplate'),
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [],
          },
        },
        valuePrepareFunction: (cell) => {
          let template = this.templates.find(x => x.value == cell);
          return template ? template.title : "";
        }
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        editable: false,
        // type: 'html',
        // valuePrepareFunction: (cell, row) => {
        //   return moment(row.taxableYearEnd).local().format("DD MMM YYYY");
        // }
      },

      milestone: {
        title: this.translate.instant('Milestones'),
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [],
          },
        },
        valuePrepareFunction: (cell) => {
          let milestone = this.mileStone.find(x => x.value == cell);
          return milestone ? milestone.title : "";
        }
      },
      createdBy: {
        title: this.translate.instant('CreatedBy'),
        editable: false,
      },
      createdOn: {
        title: this.translate.instant('Createdon'),
        editable: false,
        // type: 'html',
        // valuePrepareFunction: (cell, row) => {
        //   return moment(row.createdOn).local().format("DD MMM YYYY");
        // }
      }
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  deliverableListPaginated(request) {
    request.pageIndex = this._pageIndex;
    request.pageSize = this._pageSize;

    this.deliverableService.getAllPaginatedDeliverables(request)
      .subscribe((data: any) => {
        if (data) {
          this.formatDates(data.deliverables);
          this.source.load(data.deliverables);
          this.source.totalCount = data.totalCount;
        }
      });
  }
  prepareRequest() {
    let projectDetails = this.sharedService.getORganizationDetail();
    let request: any = {};
    request.projectId = projectDetails.projectId;
    request.pageIndex = this._pageIndex;
    request.pageSize = this._pageSize;
    request.sortColumn = this._sortColumn;
    request.sortDirection = this._sortDirection;
    return request;
  }

  getAllDeliverables() {
    let request = this.prepareRequest();

    this.deliverableService.getProjectMilestones().subscribe((data: any) => {
      this.mileStone = data.map(item => {
        return {
          value: item.id,
          title: item.description
        }
      });
      this.settings.columns.milestone.editor.config.list = this.mileStone;
      this.settings = Object.assign({}, this.settings);

    });
    if (this.sourceType && this.sourceType === 'deliverable-list') {
      this.deliverableListPaginated(request);
    }
    else {
      this.deliverableService.getAllDeliverables(request)
        .subscribe((data: any) => {
          this.source.load(data);
        });
    }
    let project = this.sharedService.getORganizationDetail();
    this.projectUserService.getAllProjectTemplate(project.projectId).subscribe((data: any) => {
      this.templates = [];
      this.templates.push({ value: eventConstantsEnum.emptyGuid, title: EventConstants.Unassociated });
      this.templates = this.templates.concat(data.map(item => {
        return {
          value: item.templateId,
          title: item.templateName,
          automaticPropagation: item.automaticPropagation
        }
      }));
      this.settings.columns.templateId.editor.config.list = this.templates;
      this.settings = Object.assign({}, this.settings);
    });
  }

  onDeliverableSelect(event) {
    if (event.selected) {
      this.toolbarIcons = new DocumentViewIcons();
      this.designerService.selectedDeliverables = [];
      event.selected.forEach(deliverable => {
        this.selectedDeliverables.push(deliverable.entityId);
        this.designerService.selectedDeliverables.push(deliverable);
      });

      if (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.isCentralUser) {
        if (event.selected.length > 0) {
          this.toolbarIcons.enableGenerate = true;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
        }
        else {
          this.toolbarIcons.enableGenerate = false;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
        }
      }
      else if (this.designerService.docViewAccessRights && !this.designerService.docViewAccessRights.isCentralUser) {
        if (event.selected.length == 1) {
          if (this.designerService.docViewAccessRights.deliverableRole && this.designerService.docViewAccessRights.deliverableRole.length > 0) {
            let selectedDeliverable = this.designerService.docViewAccessRights.deliverableRole.filter(e => this.designerService.selectedDeliverables.find(id => id.entityId == e.entityId));
            if (selectedDeliverable) {
              this.toolbarIcons.enableGenerate = selectedDeliverable[0].roles.filter(x => x == DocumentViewAccessRights.CanGenerate).length > 0 ? true : false;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
            }
          }
        }
        if (event.selected.length > 1) {
          for (let i = 0; i < this.designerService.selectedDeliverables.length; i++) {
            if (this.designerService.docViewAccessRights.deliverableRole.filter(id => id.entityId ==
              this.designerService.selectedDeliverables[i].entityId && id.roles.filter(r => r != (DocumentViewAccessRights.CanGenerate))).length > 0) {
              this.toolbarIcons.enableGenerate = false;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
            }
            else {
              this.toolbarIcons.enableGenerate = true;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
            }
          }
        }
        if (event.selected.length == 0) {
          this.toolbarIcons.enableGenerate = false;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverablesTab.manageDeliverables).publish(this.toolbarIcons);
        }
      }
    }
  }

  onEditSave(event) {
    let existingGroupReq = new DeliverableCreateGroupRequestModel();
    existingGroupReq.projectId = event.data.projectId;
    existingGroupReq.templateId = event.newData.templateId;
    existingGroupReq.deliverableIds = [];
    existingGroupReq.deliverableIds.push(event.newData.entityId);

    this.deliverableService.checkExistingDeliverableGroup(existingGroupReq).subscribe((response) => {
      if (response.status == ResponseStatus.Failure) {
        this.toastr.warning(response.errorMessages[0]);
        return false;
      }
      else {
        let deliverableMileStone: DeliverableMileStone =
        {
          deliverableId: event.newData.deliverableId,
          milestone: event.newData.milestone,
          templateId: event.newData.templateId,
          automaticTemplate: this.templates.find(x => x.value == event.newData.templateId).automaticPropagation,
          templateAssociationRequired: event.data.templateId != event.newData.templateId,
          automaticToManual: this.templates.find(x => x.value == event.data.templateId).automaticPropagation && !this.templates.find(x => x.value == event.newData.templateId).automaticPropagation
        }
        if (deliverableMileStone.templateAssociationRequired) {
          this.dialogTemplate = new Dialog();
          this.dialogTemplate.Type = DialogTypes.Confirmation;
          this.dialogTemplate.Message = this.translate.instant("screens.project-designer.iconview.changes-deliverable-lost");
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: this.dialogTemplate
          });

          dialogRef.afterClosed().subscribe(result => {
            if (!result) { return true; }
            else {
              this.deliverableService.updateDeliverable(deliverableMileStone).subscribe(() => {
                this.toastr.success(this.translate.instant('screens.home.labels.deliverableUpdatedSuccessfully'));
                this.updateSelectedTheme(event.newData);

                this.getAllDeliverables();
              });
            }
          });

        }
        else {
          this.deliverableService.updateDeliverable(deliverableMileStone).subscribe(() => {
            this.toastr.success(this.translate.instant('screens.home.labels.deliverableUpdatedSuccessfully'));
            this.getAllDeliverables();
          });
        }

      }
    });
  }

  updateSelectedTheme(data)
  {
    let selectedTheme = this.sharedService.getSelectedTheme();
    let selectedDeliverable = selectedTheme.themeOptions.find(x => x.data && x.data.deliverable != undefined);
    if(selectedDeliverable){
    selectedDeliverable["data"].deliverable.templateId = data.templateId;
    selectedDeliverable["data"].deliverable.templateName = this.templates.find(x => x.value == data.templateId).title;
    this.sharedService.setSelectedTheme(selectedTheme);
    }
  }

  formatDates(data)
  {
    data.forEach(item => {
      item.createdOn = moment(item.createdOn).local().format("DD MMM YYYY");
      item.taxableYearEnd = moment(item.taxableYearEnd).local().format("DD MMM YYYY");
    });
  }
}
