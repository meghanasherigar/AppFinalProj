import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LocalDataSource, ViewCell } from '../../../../../../@core/components/ng2-smart-table';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { TemplateService } from '../../../../services/template.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import * as moment from 'moment';
import { DialogTypes, Dialog } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { NbDialogService } from '@nebular/theme';
import { AssociateDeliverablesComponent } from '../associate-deliverables/associate-deliverables.component';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { GenerateReportComponent } from '../../report-generation/generate-report/generate-report.component';
import { DesignerService } from '../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { DeliverableDataComponent } from '../../appendices/manage-appendices/manage-appendices.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent implements OnInit, OnDestroy {
  @Input()
  sourceType: any;
  source: CommonDataSource = new CommonDataSource();
  data: any;
  istemplateTab: boolean = true;
  subscriptions: Subscription = new Subscription();
  _pageSize: number = 10;
  _pageIndex: number = 0;
  sortColumn:string;
  sortDirection:string;
  constructor(private sharedService: ShareDetailService,
    private ngxLoader: NgxUiLoaderService,
    private templateService: TemplateService,
    private toastr: ToastrService,
    private designerService: DesignerService,
    private _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private dService: NbDialogService,
    private dialog: MatDialog,
    private translate: TranslateService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));

      this.setColumnSettings();
    }
  selectedTemplateIds: any = [];



  loaderId = 'TemplateListLoader';
  loaderPosition = POSITION.bottomCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).subscribe((payload: any) => {
      if (payload.action == "Templates") {
        this.getAllTemplates();
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).subscribe((payload) => {
      this.getAllTemplates();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).subscribe((payload: any) => {
      if (payload.action == "delete")
        this.deleteTemplates(this.selectedTemplateIds);
    }));
    this.source.onChanged().subscribe((change) => {
      // this.removeViewMore();
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;
        this.getAllTemplates();
      }

      //Server side sorting:start
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.sortDirection= change.sort[0].direction.toUpperCase();
        this.sortColumn= change.sort[0].field;
        this.getAllTemplates();
      }
    });
  }

  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      edit: true,
      class: 'testclass',
      delete: false,
      custom: [
        {
          name: 'remove',
          title: '<img src="assets/images/projectdesigner/header/Remove.svg" class="removeTempIcon smallIcon" title="Remove">'
        },
        {
          name: 'generate',
          title: '<img src="assets/images/DocumentViewNotActive/Generate-inactiveColor.svg" class="smallIcon generateIcon"  title="Generate">'
        },
        {
          name: 'associate',
          title: '<img src="assets/images/projectdesigner/header/Assign_to.svg" class="smallIcon"  title="Assign To">'
        }
      ],
      position: 'right'
    },

    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      templateName: {
        title: this.translate.instant('TemplateName'),
      },
      templateDescription: {
        title: this.translate.instant('TemplateDescription'),
      },
      deliverablesAssociated: {
        title: this.translate.instant('DeliverablesAssociated'),
        editable: false,
        type: 'custom',
        renderComponent: DeliverableDataComponent,
        valuePrepareFunction: (cell, row) => {
          return { cell, row, component: 'TemplateDeliverable' }
        }
      },
      automaticPropagation: {
        title: this.translate.instant('BlockLinking'),
        editable: true,
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [{ value: true, title: "Automatic" }, { value: false, title: "Manual" }],
          },
        },
        valuePrepareFunction: (cell, row) => {
          return cell ? "Automatic" : "Manual";
        }
      },
      createdBy: {
        title: this.translate.instant('CreatedBy'),
        editable: false,
      },
      createdOn: {
        title: this.translate.instant('Createdon'),
        editable: false,
      }
    },
    edit: {
      editButtonContent: '<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon-template"  title="Edit">',
      saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
      cancelButtonContent: '<i class="ion-close smallIcon"></i>',
      confirmSave: true
    },
    mode: 'inline',
    rowClassFunction: (row) => {
      if (row.data.isDefault == true) {
        var element = document.getElementsByClassName("removeTempIcon");
        if(element && element.length && element[element.length - 1]){
          element[element.length - 1].classList.add('hide');
        }
        return '';
      } else {
        return '';
      }
    }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      templateName: {
        title: this.translate.instant('TemplateName'),
      },
      templateDescription: {
        title: this.translate.instant('TemplateDescription'),
      },
      deliverablesAssociated: {
        title: this.translate.instant('DeliverablesAssociated'),
        editable: false,
        type: 'custom',
        renderComponent: DeliverableDataComponent,
        valuePrepareFunction: (cell, row) => {
          return { cell, row, component: 'TemplateDeliverable' }
        }
      },
      automaticPropagation: {
        title: this.translate.instant('BlockLinking'),
        editable: true,
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [{ value: true, title: "Automatic" }, { value: false, title: "Manual" }],
          },
        },
        valuePrepareFunction: (cell, row) => {
          return cell ? "Automatic" : "Manual";
        }
      },
      createdBy: {
        title: this.translate.instant('Createdby'),
        editable: false,
      },
      createdOn: {
        title: this.translate.instant('Createdon'),
        editable: false,
      }
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  prepareRequest() {
    let projectDetails = this.sharedService.getORganizationDetail();
    let request: any = {};
    request.projectId = projectDetails.projectId;
    request.pageIndex = this._pageIndex;
    request.pageSize = this._pageSize;
    request.sortColumn= this.sortColumn;
    request.sortDirection= this.sortDirection;
    return request;
  }

  getAllTemplates() {
    let request = this.prepareRequest();

    if (this.sourceType && this.sourceType === 'template-list') {
      this.templateService.getallpaginatedtemplatelist(request)
        .subscribe((data: any) => {
          data.templates.forEach(item => {
            item.createdOn = moment(item.createdOn).local().format("DD MMM YYYY");
          });
          this.source.load(data.templates);
          this.source.totalCount = data.totalCount;
          this.ngxLoader.stopLoaderAll(this.loaderId);
        }),
        (error) => {
          this.ngxLoader.stopLoaderAll(this.loaderId);
          console.log(error);
        }
    }
    else {
      this.templateService.getalltemplatelist(request)
        .subscribe((data: any) => {
          data.forEach(item => {
            item.createdOn = moment(item.createdOn).local().format("DD MMM YYYY");
          });
          this.source.load(data);
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        }),
        (error) => {
          this.ngxLoader.stopLoaderAll(this.loaderId);
          console.log(error);
        }
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish([]);
  }

  onTemplateSelect(event) {
    if (event.selected) {
      this.designerService.selectedTemplates = [];
      this.selectedTemplateIds = [];
      event.selected.forEach(template => {
        this.selectedTemplateIds.push(template.templateId);
        this.designerService.selectedTemplates.push(template);
      })

      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(event.selected);
    }
  }

  deleteTemplates(selectedTemplateIds) {
    let payload: any = {};
    let projectDetails = this.sharedService.getORganizationDetail();

    payload.templateIds = selectedTemplateIds;
    payload.projectId = projectDetails.projectId;
    payload.projectName= projectDetails.projectName;
    payload.organizationName= projectDetails.organizationName;

    this.templateService.notifyLeadsForTemplateDelete(payload)
      .subscribe((data: any) => {
        if (data.alreadyNotified) {
          this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.iconview.thisActionHasAlreadyBeenNotifiedToLeads'));
        }
        else {
          this.toastr.success(this.translate.instant('screens.project-designer.iconview.notificationSentToLeads'));
        }
      });
  }

  onEditSave(event) {
      if(event.newData.automaticPropagation && !event.data.automaticPropagation)
      {
        this.dialogTemplate = new Dialog();
        this.dialogTemplate.Type = DialogTypes.Confirmation;
        this.dialogTemplate.Message = this.translate.instant("screens.project-designer.iconview.changes-associated-deliverable-lost");
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: this.dialogTemplate
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (!result) {   return true; }
          else{
            this.updateTemplate(event);
          }
        });
      }
      else{
        this.updateTemplate(event);
      }
  }

  updateTemplate(event)
  {
    this.templateService.updatetemplate(event.newData).subscribe((data: any) => {
      if (data.status === ResponseStatus.Sucess) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(undefined);
        this.toastr.success(this.translate.instant('screens.home.labels.templateUpdatedSuccessfully'));
        
        
      }
      else if (data.status === ResponseStatus.Failure) {
        this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
      }
    });
  }

  private dialogTemplate: Dialog;

  openDeleteConfirmDialog(templateId): void {

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var tempIds: any = [];
        tempIds.push(templateId);
        this.deleteTemplates(tempIds);
      }
    });
  }

  customAction(event) {
    if (event.action == "remove") {
      this.openDeleteConfirmDialog(event.data.templateId);
    }
    if (event.action == "associate") {
      this.templateService.selectedTemplate = event.data;
      this.dService.open(AssociateDeliverablesComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    }
    if (event.action == "generate") {
        this.dService.open(GenerateReportComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
        context: { isTemplate: this.istemplateTab }
      });
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

/**
@Component({
  selector: 'button-view',
  template: `
  <ng-template #pop>
  <div *ngFor="let deliverable of associatedDeliverabelData">
    {{deliverable.deliverableData}}
  </div>
  </ng-template>
  <div [ngbPopover]="pop" triggers="mouseenter:mouseleave">
  {{row.associatedDeliverable}}
</div>`
})

export class DeliverableDataComponent implements ViewCell, OnInit {
  row: any;

  public orderDetials: any;
  constructor(private customHTML: CustomHTML) { }

  @Input() rowData: any;
  @Input() value: string | number;
  selectedRow: any;
  isViewMore: boolean;
  isShowHidden = false;
  associatedDeliverabelData :any =[];
  associatedDeliverable: string;

  ngOnInit() {
    this.associatedDeliverabelData =[];
    this.isViewMore = true;
    this.row = this.rowData;
    this.row.associatedDeliverable.forEach(ele => {
       ele.deliverableData = ele.deliverableName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
       this.associatedDeliverabelData.push(ele.deliverableData);
    })
    this.associatedDeliverabelData = this.row.associatedTo;
  // // this.associatedDeliverabelData.toString().split(",").join("");
   this.associatedDeliverable = this.associatedDeliverabelData.toString();
   this.associatedDeliverable= this.associatedDeliverable.split(",").join('');

  }
}
 */