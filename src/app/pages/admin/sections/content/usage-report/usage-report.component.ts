import { Component, OnInit, OnDestroy } from '@angular/core';
import { Ng2SmartTableModule, LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { SharedServiceAggregatorService } from '../../../../../shared/services/shared-service-aggregator.service';
import { UsageReportService } from '../../../services/usage-report.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import * as moment from 'moment';
import { ProjectUsageViewModel, ProjectUsageFilterViewModel, ProjectIndustryViewModel ,ProjectUsageResponseViewModel} from '../../../../../@models/admin/usageReport';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonDataSource } from '../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { SortEvents } from '../../../../../@models/common/valueconstants';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-usage-report',
  templateUrl: './usage-report.component.html',
  styleUrls: ['./usage-report.component.scss']
})
export class ContentUsageReportComponent implements OnInit, OnDestroy {
 
  subscriptions: Subscription = new Subscription();
  source: CommonDataSource = new CommonDataSource(); // add a property to the component
  settings = {
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    filters: false,
    pager: { display: true, perPage: 10 },
    columns: {},
  };
  data = [
    // ... our data here
  ];

  projectUsageFilterViewModel = new ProjectUsageFilterViewModel();
  usageReport: ProjectUsageViewModel[];
 


  constructor(
    private sharedService: SharedServiceAggregatorService,
    private usageReportService: UsageReportService,
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private translate: TranslateService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));

      this.setColumnSettings();
  }
  loaderId='UsageReportLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.alertService.clear();
    this.projectUsageFilterViewModel.pageIndex = 1;
    this.projectUsageFilterViewModel.pageSize = this.settings.pager.perPage;
    

    this.usageReportService.get(this.projectUsageFilterViewModel).subscribe((data: ProjectUsageResponseViewModel) => {

      this.source.load(data.usageReportList);
      this.source.totalCount = data.totalCount;

      if (data.usageReportList.length > 0) {
        this._eventService.getEvent(EventConstants.AdminUsageReport).publish("EnableDownload");
      }
      else
        this._eventService.getEvent(EventConstants.AdminUsageReport).publish("DisableDownload");
    });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.UsageReportFilter).subscribe((payload: ProjectUsageFilterViewModel) => {
       //updating the filter model for server pagination when any filter applied -- starts
       payload.pageIndex = this.projectUsageFilterViewModel.pageIndex;
       payload.pageSize = this.projectUsageFilterViewModel.pageSize;
       this.projectUsageFilterViewModel = payload;
       this.getUsageReport(payload);
       //updating the filter model for server pagination when any filter applied -- ends
    }));

    this.source.onChanged().subscribe((change) => {
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        this.projectUsageFilterViewModel.pageIndex = change.paging.page;
        this.projectUsageFilterViewModel.pageSize = change.paging.perPage;
        this.getUsageReport(this.projectUsageFilterViewModel);
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
         this.projectUsageFilterViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
         this.projectUsageFilterViewModel.sortColumn=  change.sort[0].field;
         this.getUsageReport(this.projectUsageFilterViewModel);
      }
    });
  }

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      organizationName: {
        title: this.translate.instant('screens.admin.tableHeaders.organizationName'),
        filter: false,
        width: '14%',
      },
      gupName: {
        title: this.translate.instant('screens.admin.tableHeaders.gupName'),
        filter: false,
        width: '14%',
      },
      projectName: {
        title: this.translate.instant('screens.admin.tableHeaders.projectName'),
        filter: false,
        width: '14%',
      },
      industryDataKeyPairs: {
        title: this.translate.instant('screens.admin.tableHeaders.projectIndustry'),
        filter: false,
        width: '14%',
        sort:false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          // return '<p class="main-text">' + row.industryDataKeyPairs[0].industry + '</p>' ;
          let indData = "";
          row.industryDataKeyPairs.forEach(el => {
            if(el.industry != null)
            indData += el.industry  + "<br/>" 
          });
          return '<p class="main-text">' + indData + '</p>' ;
       },
      },
      useCaseName: {
        title: this.translate.instant('screens.admin.tableHeaders.useCaseName'),
        filter: false,
        sort:false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<p class="main-text">' + row.useCaseName + '</p>' + '<p class="sub-text"> Internal Users: ' +
            row.useCaseInternalUsers + ',</p><p class="sub-text">External Users: ' +
            row.useCaseExternalUsers + '</p>';
        },
        width: '14%',
      },
      Deliverables: {
        title: this.translate.instant('screens.admin.tableHeaders.Deliverables'),
        filter: false,
        sort:false,
        width: '14%',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<p class="main-text">' + row.entities + '</p>';
        }
      },
      createdByName: {
        title: this.translate.instant('screens.admin.tableHeaders.createdByName'),
        filter: false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<p class="main-text">' + row.createdByName + ', ' +
            row.createdByCountry + '</p>' + '<p class="sub-text">' +
            row.createdByEmail + '</p>';
        },
        width: '14%',
      },
      createdOn: {
        title: this.translate.instant('screens.admin.tableHeaders.createdDate'),
        filter: false,
        width: '20%',
        type: 'date',
        valuePrepareFunction: (date) => {
        if (date) {
          return moment(date).local().format('DD MMM YYYY');
        }
          return null;
        },
      },
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  public getIndustryData(industry: ProjectIndustryViewModel[]) {
    var _industries ="";

    industry.forEach(element => {
      if(element.industry != null){
        _industries+=element.industry+";"
      }
  });
    return _industries;
  }
  getUsageReport(filteredDataModel: any) {
       this.usageReportService
      .get(filteredDataModel)
      
      .subscribe((data: ProjectUsageResponseViewModel) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.source.load(data.usageReportList);
        this.source.totalCount = data.totalCount;
       
        if (data.usageReportList.length > 0) {
          this._eventService.getEvent(EventConstants.AdminUsageReport).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.AdminUsageReport).publish("DisableDownload");
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
