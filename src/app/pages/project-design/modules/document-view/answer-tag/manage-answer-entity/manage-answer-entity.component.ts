import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { AnswertagService } from '../../../../services/answertag.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import { EntityVariableResponseViewModel, EntityVariableFilterViewModel, EntityVariableResultViewModel, EntityVariableDownloadViewModel } from '../../../../../../@models/projectDesigner/answertag';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import * as moment from 'moment';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
@Component({
  selector: 'ngx-manage-answer-entity',
  templateUrl: './manage-answer-entity.component.html',
  styleUrls: ['./manage-answer-entity.component.scss']
})
export class ManageAnswerEntityComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  sourceEntity: CommonDataSource = new CommonDataSource();
  data: any;
  entityVariableResponseViewModel: EntityVariableResponseViewModel = new EntityVariableResponseViewModel();
  entityVariableFilterViewModel: EntityVariableFilterViewModel = new EntityVariableFilterViewModel();
  entityVariableResultViewModel: EntityVariableResultViewModel = new EntityVariableResultViewModel();
  entityVariableDownloadViewModel: EntityVariableDownloadViewModel = new EntityVariableDownloadViewModel();

  settingsEntity = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      add: false, edit: false, delete: false, select: true,
      position: 'right',
    },
    filters: false,
    noDataMessage: this.translate.instant('screens.project-designer.document-view.info-request.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };
  //ngx-ui-loader configuration
  loaderId = 'ManageUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  constructor(private _eventService: EventAggregatorService,
    private customHTML: CustomHTML,
    private dialogService: DialogService,
    private ansTagService: AnswertagService,
    private shareDetailService: ShareDetailService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService, ) { 
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.sourceEntity.refresh();
      }));
      this.setColumnSettings();
    }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    const project = this.shareDetailService.getORganizationDetail();
    this.ansTagService.selectedEntityVariableRows = [];
    this.entityVariableFilterViewModel.ProjectId = project.projectId;
    this.entityVariableFilterViewModel.pageIndex = 1;
    this.entityVariableFilterViewModel.pageSize = this.settingsEntity.pager.perPage;
    this.loadEntityVariableGrid();

    this.sourceEntity.onChanged().subscribe((change) => {
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        const project = this.shareDetailService.getORganizationDetail();
        this.entityVariableFilterViewModel.ProjectId = project.projectId;
        this.entityVariableFilterViewModel.pageIndex = change.paging.page;
        this.entityVariableFilterViewModel.pageSize = change.paging.perPage;
        this.getEntityVariableDataOnPageSize(this.entityVariableFilterViewModel);

      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.entityVariableFilterViewModel.sortDirection= change.sort[0].direction.toUpperCase();
        this.entityVariableFilterViewModel.sortColumn=  change.sort[0].field;
        this.getEntityVariableDataOnPageSize(this.entityVariableFilterViewModel);
      }
      //block for server side pagination -- ends
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).subscribe((payload: EntityVariableFilterViewModel) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageSize = this.entityVariableFilterViewModel.pageSize;
      payload.pageIndex = this.entityVariableFilterViewModel.pageIndex;
      payload.ProjectId = this.entityVariableFilterViewModel.ProjectId;
      this.entityVariableFilterViewModel = payload;
      this.loadEntityVariableGrid();
      //updating the filter model for server pagination when any filter applied -- ends
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).subscribe((payload) => {
      if (payload == "DownloadEntity") {
        this.downloadTransactions();
      }
    }));
  }

  public loadEntityVariableGrid() {
    this.subscriptions.add(this.ansTagService.getentityvariables(this.entityVariableFilterViewModel).subscribe(
      response => {
        this.entityVariableResponseViewModel = response;
        this.loadEntityGrid(this.entityVariableResponseViewModel);
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  getEntityVariableDataOnPageSize(filterData: EntityVariableFilterViewModel) {
    this.subscriptions.add(this.ansTagService.getentityvariables(this.entityVariableFilterViewModel).subscribe(
      response => {
        this.entityVariableResponseViewModel = response;
        this.loadEntityGrid(this.entityVariableResponseViewModel);
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  loadEntityGrid(data: EntityVariableResponseViewModel) {
    let userGridList: EntityVariableResultViewModel[] = [];
    this.ansTagService.selectedEntityVariableRows = [];
    data.entityVariableList.forEach(element => {
      this.entityVariableResultViewModel = new EntityVariableResultViewModel();
      this.entityVariableResultViewModel.legalEntityName = element.legalEntityName;
      this.entityVariableResultViewModel.taxableYearEnd = element.taxableYearEnd;
      this.entityVariableResultViewModel.entityShortName = element.entityShortName;
      this.entityVariableResultViewModel.countryName = element.countryName;
      userGridList.push(this.entityVariableResultViewModel);
    });
    this.sourceEntity.totalCount = data.totalEntityVariableCount;
    this.sourceEntity.load(userGridList);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  public onUserRowSelectEntity(event) {
    this.ansTagService.selectedEntityVariableRows = event.selected;
    if(this.ansTagService.selectedEntityVariableRows.length > 0){
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createAnswer).publish('DeleteRecord');
    }
    else{
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createAnswer).publish(undefined);
    }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settingsEntity));
    settingsTemp.columns = {
      legalEntityName: {
        title: this.translate.instant('LegalEntityName'),
        filter: false,
        //  width: '2%',
      },
      entityShortName: {
        title: this.translate.instant('ShortName'),
        filter: false,
        // width: '2%',
      },
      countryName: {
        title: this.translate.instant('Country'),
        filter: false,
        // width: '2%',
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        filter: false,
        valuePrepareFunction: (date) => {
          if (date) {
            return moment(date).local().format("DD MMM YYYY");
          }
          return "";
        },
        // width: '2%',
      },
    },
    this.settingsEntity = Object.assign({}, settingsTemp );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  downloadTransactions() {
    const project = this.shareDetailService.getORganizationDetail();
    this.entityVariableDownloadViewModel.ProjectId = project.projectId;
    this.entityVariableDownloadViewModel.EntityIds = this.entityVariableFilterViewModel.EntityIds;
    this.entityVariableDownloadViewModel.CountryIds = this.entityVariableFilterViewModel.CountryIds;
    this.entityVariableDownloadViewModel.EntityShortNames = this.entityVariableFilterViewModel.EntityShortNames;
    this.entityVariableDownloadViewModel.TaxableYearStart = this.entityVariableFilterViewModel.TaxableYearStart;
    this.entityVariableDownloadViewModel.TaxableYearEnd = this.entityVariableFilterViewModel.TaxableYearEnd;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.ansTagService.downloadentityvariables(this.entityVariableDownloadViewModel).subscribe(data => {
      this.downloadFile(this.convertbase64toArrayBuffer(data.content), data.fileName);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      },

      () => console.info('OK');
    return false;
  }

  convertbase64toArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  onCustomAction(item: any) {}
  downloadFile(data, fileName) {
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
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DownloadFailureMessage'));
    }
  }


}
