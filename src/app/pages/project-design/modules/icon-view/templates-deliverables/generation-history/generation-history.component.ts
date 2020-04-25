import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import * as moment from 'moment';
import { EntitiesService } from '../../../../../project-setup/entity/entity.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { EntityFilterViewModel, EntityResponseViewModel } from '../../../../../../@models/entity';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { GenerateReportComponent } from '../../report-generation/generate-report/generate-report.component';
import { NbDialogService } from '@nebular/theme';
import { ReportHistoryFilterRequestViewModel, ReportHistoryViewModel, DeleteReportHistoryRequestViewModel, ReportDownloadRequestViewModel } from '../../../../../../@models/projectDesigner/report';
import { TemplateService } from '../../../../services/template.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-generation-history',
  templateUrl: './generation-history.component.html',
  styleUrls: ['./generation-history.component.scss']
})
export class GenerationHistoryComponent implements OnInit,OnDestroy {
  deleteTitle= this.translate.instant('iconviewtooltip.Delete'); 
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      edit: false,
      class: 'testclass',
      delete: false,
      custom: [
        {
          name: 'remove',
          title: `<img src="assets/images/information_Gathering/Remove_clicked.svg" class="smallIcon" title="${this.deleteTitle}">`   
        }
       
      ],
      position: 'right'
    },
    noDataMessage: this.translate.instant('screens.project-designer.deliverableGroup.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: 10
    },
    columns: {},
  };

  source: CommonDataSource = new CommonDataSource();
  generationHistory = new ReportHistoryFilterRequestViewModel();
  reportIds: any[];
  fileNames: any[];
  subscriptions: Subscription = new Subscription();

  constructor(private templateService: TemplateService,private toastr: ToastrService, private translate: TranslateService,private _eventService: EventAggregatorService,
    private shareDetailService: ShareDetailService, private dialog: MatDialog, private dService: NbDialogService,private dialogService: DialogService
  ) {
    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.source.refresh();
    }));

    this.setColumnSettings();
  }

  ngOnInit() {
   
    this.getGenerationHistory(this.generationHistory);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistoryToolbar).publish("load");
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistory).subscribe((payload: any) => {
      if(payload == 'delete')
      this.openDeleteConfirmDialog();
      else if(payload == 'downloadReport')
      this.downloadReport();
      else{
      this.getGenerationHistory(payload);

      this.source.onChanged().subscribe((change) => {
        if (change.action === 'page' || change.action === 'paging') {
          this.generationHistory.pageIndex = change.paging.page;
          this.generationHistory.pageSize = change.paging.perPage;
          this.getGenerationHistory(payload);
        }
        //block for server side pagination -- ends
  
        if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
        {
          this.generationHistory.sortDirection=  change.sort[0].direction.toUpperCase();
          this.generationHistory.sortColumn=  change.sort[0].field;
          this.getGenerationHistory(this.generationHistory);
        }
      });

      }
    }));
  }

  private dialogTemplate: Dialog;
  private basicPayload(generationHistory) {
    const project = this.shareDetailService.getORganizationDetail();
    generationHistory.projectId = project.projectId;
    generationHistory.pageIndex = 1;
    generationHistory.pageSize = this.settings.pager.perPage;
  }

  private getGenerationHistory(generationHistory) {
    this.basicPayload(generationHistory);
    this
      .templateService
      .generationHistory(generationHistory)
      .subscribe((data: ReportHistoryViewModel[]) => {
        
        this.source.load(data);
      });
  }
  onUserRowSelect(event){
    
    if (event.selected) {
      this.reportIds = [];
      this.fileNames = [];
      event.selected.forEach(history => {
        this.reportIds.push(history.id);
        this.fileNames.push(history.fileName);
      })
      if(this.reportIds.length > 0)
      {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistoryToolbar).publish("enablemanageSection");
      }
      else
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.generationHistory.reportHistoryToolbar).publish("load");
    }
   
  }
  openDeleteConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteHistory();
        //this.deleteTemplates(tempIds);
      }
    });
  }
  onCustomAction(event) {
    if (event.action == "remove") {
      this.reportIds = [];
      this.reportIds.push(event.data.id);
      this.openDeleteConfirmDialog();
    }
    if (event.action == "download") {
      this.fileNames = [];
      this.fileNames.push(event.data.fileName);
      this.downloadReport();
    }
  }
  deleteHistory()
  {
    var deleteReportIds = new DeleteReportHistoryRequestViewModel();
    deleteReportIds.reportIds = this.reportIds;
    this.templateService.deleteHistory(deleteReportIds).subscribe(response => {
      this.toastr.success(this.translate.instant('screens.home.labels.generationHistoryDeletedSuccessfully'));
      this.getGenerationHistory(this.generationHistory);
    })
  }
  downloadReport()
  {
    var downloadReportFiles = new ReportDownloadRequestViewModel();
    downloadReportFiles.fileNames = this.fileNames;
    this.templateService.downloadReport(downloadReportFiles).subscribe((response: any) => {
      
      this.downloadFile(response, 'Report_History');
    })
  }
  downloadFile(data,fileName) {
    try {
      const blob = new Blob([data], { type: 'application/zip' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob,fileName + ".zip");
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
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.appendix.messages.ReportdownloadErrorMsg'));
    }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      templateOrDeliverableName:
      {
        title: this.translate.instant('TemplateDeliverable'),
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        type: 'date',
        valuePrepareFunction: (date) => {
          if (date) {
            return moment(date).local().format('L');
          }
          return null;
        },
      },
      reportType:
      {
        title: this.translate.instant('ReportType'),
      },

      status: {
        title: this.translate.instant('Status'),
      },
      'auditTrail.createdBy': {
        title: this.translate.instant('GeneratedBy'),
        valuePrepareFunction: (cell, row) => { return row.auditTrail.createdBy.email }
      },
      'auditTrail.createdOn': {
        title: this.translate.instant('Createdon'),
        valuePrepareFunction: (cell, row) => { 
          if (row.auditTrail.createdOn) {
            return moment(row.auditTrail.createdOn).local().format('L');
          }
          return null;
      }
    }
  };

    this.settings = Object.assign({}, settingsTemp );
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
