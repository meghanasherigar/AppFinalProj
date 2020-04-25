import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderSummary, ColorSummaryConstants } from '../../@models/common/header-summary';
import { ProjectManagementService } from '../../services/project-management.service';
import { NbDialogService, NbDateService } from '@nebular/theme';
import { DeliverableColumnListComponent } from '../deliverable-column-list/deliverable-column-list.component';
import { CreateDeliverableComponent } from '../create-deliverable/create-deliverable.component';
import { ProjectDeliverableService } from '../../services/project-deliverable.service';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { DeliverableReportRequestModel, UserGrid, GridColumn } from '../../@models/deliverable/deliverable-columns';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { GridCustomColumnComponent } from '../../shared/grid-custom-column/grid-custom-column.component';
import { Subscription, Subject } from 'rxjs';
import { CountryService } from '../../../../shared/services/country.service';
import { LocalDataSource } from '../../../../@core/components/ng2-smart-table';
import { deliverableFilterViewModel } from '../../@models/deliverable/deliverable';
import * as moment from 'moment';
import { ProjectManagementConstants } from '../../@models/Project-Management-Constants';
import { Menus } from '../../@models/common/Project-Management-menu';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { downloadFile } from '../../@models/common/common-helper';
import { CommonService } from '../../services/common.service';
import { SortEvents } from '../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-deliverable-list',
  templateUrl: './deliverable-list.component.html',
  styleUrls: ['./deliverable-list.component.scss']
})
export class DeliverableListComponent implements OnInit, OnDestroy {
  summaryOptions: HeaderSummary;
  //ngx-ui-loader configuration
  loaderId = 'deliverableGridLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  reportTiers: any;
  projectMilestones: any;

  _pageSize: number = 10;
  _pageIndex: number = 0;
  _sortColumn:string;
  _sortDirection:string;



  currentSubscriptions: Subscription;
  httpSubject: Subject<void> = new Subject<void>();
  selectedDeliverables = [];

  colorArray = [
    ColorSummaryConstants.darkblue,
    ColorSummaryConstants.blue,
    ColorSummaryConstants.teal,
    ColorSummaryConstants.lightgreen,
    ColorSummaryConstants.orange,
    ColorSummaryConstants.green,
    ColorSummaryConstants.yellow,
    ColorSummaryConstants.skyblue
  ];

  columnSettings: any = {};
  gridsettings: any =
    {
      selectMode: 'multi',
      hideSubHeader: true,
      pager: {
        display: true,
        perPage: this._pageSize,
      },
      columns: {},
      actions: false,
      edit: true

    };
  dataSource: CommonDataSource = new CommonDataSource();
  deliverableFilter: deliverableFilterViewModel;

  constructor(private managementService: ProjectManagementService,
    private dialogService: NbDialogService,
    private projectDeliverableService: ProjectDeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private countryService: CountryService,
    private translate: TranslateService,
    private commonService:CommonService,
    private shareDetailService: ShareDetailService) {
    this.currentSubscriptions = new Subscription();
    this.currentSubscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadDeliverableGrid();
      this.dataSource.refresh();
    }));

    this.loadDeliverableGrid();
  }

  ngOnInit() {
    this.getUserRights();
    this.getDeliverableSummary();
    this.loadMasterData();
    this.subscriptions();
    this.managementService.changeCurrentTab(Menus.Deliverable);

    this.dataSource.onChanged().subscribe((change) => {
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this._sortDirection= change.sort[0].direction.toUpperCase();
        this._sortColumn= change.sort[0].field;
        this.loadDeliverableGrid();
      }
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;
        this.loadDeliverableGrid();
      }
    });
  }

  getUserRights()
  {
    this.commonService.getUserRights().subscribe(userRights=>
      {
        if (userRights) {
          this.managementService.changeCurrentUserRights(userRights);
        }
      });
  }

  onCustomAction(event) {
  }
  loadDeliverableGrid() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.gridsettings.columns = {};

    this.projectDeliverableService.userGridColumns().pipe(takeUntil(this.httpSubject)).subscribe((data) => {
      if (data && data.userGridColumns && data.userGridColumns.length) {

        data.userGridColumns.forEach(x => {
          let title = { "title": this.translate.instant(x.columnName), "editable": x.editable, "type": x.type };
          if (x.type === 'custom') {
            title['type'] = 'custom';
            title['valuePrepareFunction'] = (cell, row) => {
              return {
                cell, row, component: x.columnName,
                reportTiers: this.reportTiers,
                milestones: this.projectMilestones
              }
            },
              title["renderComponent"] = GridCustomColumnComponent;
          }
          //todo: see if the below specific conditions can be optimized
          if (x.type === 'date') {
            title['valuePrepareFunction'] = (date) => {
              if (date) {
                return moment(date).local().format('DD MMM YYYY');
              }
            }
          }
          if (x.columnName === 'reportTier') {
            title['valuePrepareFunction'] = (reportTier) => {
              //Return tier from object reportTier
              return reportTier.tier;
            }
          }
          if (x.columnName === 'country') {
            title['valuePrepareFunction'] = (country) => {
              //Return name from object country
              return country.country;
            }
          }
          this.gridsettings.columns[x.columnName] = title;
        });
        this.gridsettings = Object.assign({}, this.gridsettings);

      }
      this.projectDeliverableService.getDeliverablesList(this.prepareDeliverableRequestModel()).pipe(takeUntil(this.httpSubject))
        .subscribe((data: any) => {
          if (data) {
            this.dataSource.load(data.deliverables);
            this.dataSource.totalCount = data.totalCount
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        }),
        (error) => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          console.log(error);
        };
      this.managementService.changeReloadDeliverableGrid(false);
    }, (error) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      console.log(error);
    })
  }

  subscriptions() {
    this.currentSubscriptions.add(
      this.managementService.currentCreateDeliverableFlag.subscribe(value => {
        if (value) {
          const createDeliverableRef = this.dialogService.open(CreateDeliverableComponent, {
            closeOnBackdropClick: false,
            closeOnEsc: false,
          });
          createDeliverableRef.componentRef.instance.projectId =
            this.shareDetailService.getORganizationDetail().projectId;
        }
      }));
    this.currentSubscriptions.add(
      this.managementService.currentReloadDeliverableGrid.subscribe(reloadGrid => {
        if (reloadGrid) {
          //Reload the summary bar after addition of deliverable
          this.getDeliverableSummary();
          this.loadDeliverableGrid();
        }
      }));

      this.currentSubscriptions.add(
        this.managementService.currentDeliverableGridRefresh.subscribe(refresh=>
          {
            if(refresh)
            {
              this.dataSource.refresh();
              this.managementService.changeDeliverableGridRefresh(false);
            }
          })
        );

    this.currentSubscriptions.add(
      this.managementService.currentReloadDeliverableSummary.subscribe(reloadSummary => {
        if (reloadSummary) {
          this.getDeliverableSummary();
          this.dataSource.refresh();
        }
      }));

    this.currentSubscriptions.add(
      this.managementService.currentApplyDeliverableFilter.subscribe(isFilterActive => {

        //Load the data only when the filter is applied/reset
        if (isFilterActive) {

          this.loadDeliverableGrid();
        }
      })
    );
    this.currentSubscriptions.add(
      this.managementService.currentDownloadDeliverableFlag.subscribe(downloadReport => {
        if (downloadReport) {
          this.downloadDeliverableReport();
        }
      }));

    this.currentSubscriptions.add(
      this.managementService.CurrentDeliverableFilter.subscribe(filter => {
        this.deliverableFilter = filter;
      })
    );
  }

  downloadDeliverableReport() {
    let deliverableRequest: deliverableFilterViewModel =
    {
      projectId: this.shareDetailService.getORganizationDetail().projectId,
      pageIndex: 0,
      pageSize: 0,
      sortColumn:'',
      sortDirection:''
    };

    //Add grid selected deliverables if any
    if (this.selectedDeliverables.length > 0) {
      deliverableRequest.deliverableName = this.selectedDeliverables.map(({ deliverableName}) =>deliverableName);
    }

    this.projectDeliverableService.downloadDeliverable(deliverableRequest).pipe(takeUntil(this.httpSubject)).subscribe(response =>
      {
      if(response)
      {
        downloadFile(response['content'], response['fileName']);
      }
      //reset the value until download is clicked again
      this.managementService.changeDownloadDeliverableFlag(false);
    }),
    (error)=>
    {
      console.error(`error downloading report: ${error}`);
      this.managementService.changeDownloadDeliverableFlag(false);
    };

  }

  //Method to invoke the API to load deliverable summary header
  getDeliverableSummary() {
    this.summaryOptions = new HeaderSummary();

    this.projectDeliverableService.getDeliverableSummary
      (this.prepareDeliverableSummaryRequestModel()).pipe(takeUntil(this.httpSubject))
      .subscribe((response: HeaderSummary) => {
        if (response) {
          //this.summaryOptions = new HeaderSummary();
          this.summaryOptions = response;
          this.summaryOptions.header = this.translate.instant('screens.Project-Management.Summary.Deliverables');
          this.summaryOptions.colorArray = this.colorArray;
        }
      });
  }

  loadMasterData() {
    this.countryService.getAllTiers().flatMap((reportTierResponse: any) => {
      this.reportTiers = reportTierResponse;
      return this.projectDeliverableService.getAllMilestones();
    }).pipe(takeUntil(this.httpSubject)).subscribe(response => {
      this.projectMilestones = response;
      this.loadDeliverableGrid();
    });
  }

  private prepareDeliverableRequestModel() {
    let deliverableReportRequestModel: deliverableFilterViewModel =
    {
      projectId: this.shareDetailService.getORganizationDetail().projectId,
      pageIndex: this._pageIndex,
      pageSize: this._pageSize,
      deliverableName: this.deliverableFilter.deliverableName,
      cbcNotificationStartDate: (!this.deliverableFilter.cbcNotificationStartDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.cbcNotificationStartDate,
      cbcNotificationEndDate: (!this.deliverableFilter.cbcNotificationEndDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.cbcNotificationEndDate,
      targetDeliverableIssueStartDate: (!this.deliverableFilter.targetDeliverableIssueStartDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.targetDeliverableIssueStartDate,
      targetDeliverableIssueEndDate: (!this.deliverableFilter.targetDeliverableIssueEndDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.targetDeliverableIssueEndDate,
      statutoryDueDateStartDate: (!this.deliverableFilter.statutoryDueDateStartDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.statutoryDueDateStartDate,
      statutoryDueDateEndDate: (!this.deliverableFilter.statutoryDueDateEndDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.statutoryDueDateEndDate,
      taxableYearStartDate: (!this.deliverableFilter.taxableYearStartDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.taxableYearStartDate,
      taxableYearEndDate: (!this.deliverableFilter.taxableYearEndDate) ? ProjectManagementConstants.DefaultDate : this.deliverableFilter.taxableYearEndDate,
      countries: this.deliverableFilter.countries,
      reportTiers: this.deliverableFilter.reportTiers,
      milestones: this.deliverableFilter.milestones,
      sortColumn:this._sortColumn,
      sortDirection: this._sortDirection
    }
    return deliverableReportRequestModel;
  }


  //This is redundant
  private prepareDeliverableSummaryRequestModel() {
    let deliverableSummaryRequestModel: DeliverableReportRequestModel =
    {
      projectId: this.shareDetailService.getORganizationDetail().projectId,
      pageIndex: this._pageIndex,
      pageSize: this._pageSize
    }
    return deliverableSummaryRequestModel;
  }
  onDeliverableRowSelect(event) {
    this.selectedDeliverables = event.selected;
    let selectedDeliverableIds = event.selected.map(({ id }) => id);
    this.managementService.changeDeliverableIdsForEdit(selectedDeliverableIds);
  }

  onMilestoneSelection(milestone) {
    let selectedMilestones = [];
    if (milestone) {
      let selectedMilestone = this.projectMilestones.find(x => x.description == milestone.displayText);
      if (selectedMilestone)
        selectedMilestones.push(selectedMilestone.id);
    }
    else {
      selectedMilestones = [];
    }
    let deliverableRequest = this.prepareDeliverableRequestModel();
    deliverableRequest.milestones = selectedMilestones;

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDeliverableService.getDeliverablesList(deliverableRequest)
    .pipe(takeUntil(this.httpSubject)).subscribe((data: any) => {
        if (data) {
          this.dataSource.load(data.deliverables);
          this.dataSource.totalCount = data.totalCount
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      };
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
    this.httpSubject.next();
    this.httpSubject.complete();  }
}