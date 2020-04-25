import { Component, OnInit, ElementRef } from '@angular/core';
import { ProjectManagementService } from '../../../services/project-management.service';
import { Menus } from '../../../@models/common/Project-Management-menu';
import { VisualizationGridResponseModel, visualizationRequest } from '../../../@models/visualization/visualization';
import { LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { country } from '../../../@models/deliverable/deliverable';
import { GridCustomColumnComponent } from '../../../shared/grid-custom-column/grid-custom-column.component';
import { CustomColumns } from '../../../@models/Project-Management-Constants';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
import { Subscription } from 'rxjs';
import { VisualizationService } from '../../../services/visualization.service';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import * as moment from 'moment';
import { CounterPartyComponent } from '../../counter-party/counter-party.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CommonDataSource } from '../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { SortEvents } from '../../../../../@models/common/valueconstants';


@Component({
  selector: 'ngx-visualization-content',
  templateUrl: './visualization-content.component.html',
  styleUrls: ['./visualization-content.component.scss']
})
export class VisualizationContentComponent implements OnInit {

  //ngx-ui-loader configuration
  loaderId = 'taskGridloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  counterPartyCss='counter-party-country';
  countryCss='project-country';

  counterPartyColor='skyblue';
  countryColor='#55eb06';

  response: VisualizationGridResponseModel[];
  gridDataSource: CommonDataSource = new CommonDataSource();
  currentSubscriptions: Subscription;

  //Variable to cappture the previous selected entity
  previousSelectedEntity: any;
  selectedCountry: string;

  selectedEntity:any;

  projectCountries: string[]=[];

  counterPartyIconTop: number = 0;
  counterPartyIconLeft: number = 0;
  _sortDirection: string;
  _sortColumn: string;

  //Filter requests
  transactionTypes = [];
  countries = [];
  entities = [];

  PlaceholderText='';

  counterPartiesText='';
  counterPartyText='';


  gridSettings = {
    //selectMode: 'multi',
    noDataMessage: this.translate.instant('Noentitiesfound'),
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };

  constructor(private managementService: ProjectManagementService,
    private elRef: ElementRef, private visualizationService: VisualizationService,
    private shareDetailService: ShareDetailService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService) {
    this.currentSubscriptions = new Subscription();
    this.currentSubscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.gridDataSource.refresh();
    }));

    this.setColumnSettings();
  }

  ngOnInit() {

     this.counterPartiesText="CounterParties";//this.translate.instant('screens.Project-Management.Visualization.CounterParties');
     this.counterPartyText="CounterParty";//this.translate.instant('screens.Project-Management.Visualization.CounterParty');

    this.ngxLoader.startBackground(this.loaderId);
    this.gridDataSource = new CommonDataSource();
    this.getCounterPartyIconAttributes();
    this.managementService.changeCurrentTab(Menus.Visualization);
    this.activeSubscriptions();
    this.getVisualizationData();
    this.sorting();
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.gridSettings));
    settingsTemp.columns = {
      countryName: {
        title: this.translate.instant('Country')
      },
      entity: {
        title: this.translate.instant('PartyEntity'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return {
              cell, row, component: CustomColumns.Entity
            }
          }
      },
      counterParty: {
        title: this.translate.instant('CounterParty'),
        type:'custom',
        sort:false,
        renderComponent: CounterPartyComponent,
        valuePrepareFunction:
        (value,cell, row) => {
          return {cell, row}
        }
      },
      transactionType: {
        title:this.translate.instant('TransactionType'),
        type: 'html',
        sort:false,
        valuePrepareFunction:
          (row) => {
            return '--';
          }
      },
      transactionAmount: {
        title: this.translate.instant('TransactionAmount'),
        type:'html',
        sort:false,
        valuePrepareFunction:
        (cell,row) => {
          return '--';
        }
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        type: 'html',
        valuePrepareFunction:
          (cell, row) => {
            return moment(cell).local().format("DDMMMYYYY");
          }
      }
    };

    this.gridSettings = Object.assign({}, settingsTemp );
  }
  getVisualizationData() {
    let req = this.prepareRequestModel();

    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.visualizationService.getVisualizationData(req).subscribe(response => {
      if (response) {
        this.gridDataSource.load(response);
        this.projectCountries = response.map(({ countryName }) => countryName);
        this.highlightProjectCountries();

        //reset the counter party icon
        this.displayCounterParties('', false);
      }
      this.ngxLoader.stopBackground(this.loaderId);
      this.ngxLoader.stopLoaderAll(this.loaderId);
    }),
      (error) => {
        console.error(error);
        this.ngxLoader.stopBackground(this.loaderId);
        this.ngxLoader.stopLoaderAll(this.loaderId);
      };

  }

  prepareRequestModel() {
    let request: visualizationRequest = {
      projectId: this.shareDetailService.getORganizationDetail().projectId,
      countries: this.countries,
      entities: this.entities,
      sortColumn:this._sortColumn,
      sortDirection:this._sortDirection,
      transactionTypes: this.transactionTypes
    };
    return request;
  }

  activeSubscriptions() {
    this.currentSubscriptions.add(
      this.managementService.currentEntity.subscribe(selectedEntity => {
        
        if (selectedEntity) {
          this.selectedEntity=selectedEntity;
          this.selectedCountry = selectedEntity.countryName;
          this.managementService.changeCurrentEntity(null);
          
          //enable clear filter button 
          this.managementService.changeToggleVisClearFilter(true);
          this.resetCountryHighlight();
          this.setSelectedCountryStyle(this.selectedCountry, true);
          this.displayCounterParties(this.selectedCountry, true);
        }
      })
    );

    this.currentSubscriptions.add(
      this.managementService.currentCountriesResetStyle.subscribe(resetStyle => {
        if (resetStyle) {
          this.displayCounterParties('', false);
          this.resetCountryHighlight();
          this.highlightProjectCountries();
          //reset the counter party icon
          
        }
      })
    );

    this.currentSubscriptions.add(this.managementService.currentApplyVisFilter.subscribe(applyFilter => {
      if (applyFilter) {
        //Invoke api call
        this.resetCountryHighlight();
        this.getVisualizationData();
      }
    }));

    this.currentSubscriptions.add(this.managementService.currentVisualizationFilter.subscribe(filter => {
      this.transactionTypes = filter.transactionTypes;
      this.countries = filter.countries;
      this.entities = filter.entities;
    })
    );
  }


  getCounterPartyIconAttributes() {
    let counterPartyElementRef = this.elRef.nativeElement.querySelector(`#counterParty`);
    if (counterPartyElementRef) {
      this.counterPartyIconTop = counterPartyElementRef.clientHeight;
      this.counterPartyIconLeft = counterPartyElementRef.clientWidth;
    }
  }
sorting()
{
  this.gridDataSource.onChanged().subscribe((change) => {
        
    if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
    {
      this._sortDirection=  change.sort[0].direction.toUpperCase();
      this._sortColumn= change.sort[0].field;
      this.prepareRequestModel();
      this.getVisualizationData();
    }
  });
}

  displayCounterParties(countryId: string, set: boolean = true) {
    let counterPartyElementRef = this.elRef.nativeElement.querySelector(`#counterParty`);
    //counterParty
    if (set) {
      if (counterPartyElementRef) {
        counterPartyElementRef.style.visibility = 'visible';
        this.PlaceholderText= `${this.selectedEntity.transactions?this.selectedEntity.transactions.length:0} 
        ${ this.selectedEntity.transactions.length===1 ?this.counterPartyText :this.counterPartiesText}`;
        

        let countrySelector=this.selectedCountry.replace(/[^\w]/g, '');
        let currentCountryElement = this.elRef.nativeElement.querySelector(`#${countrySelector}`);
        if (currentCountryElement) {
          let pageX = window.pageXOffset + currentCountryElement.getBoundingClientRect().left;
          let pageY = window.pageYOffset + window.scrollY + currentCountryElement.getBoundingClientRect().top;
          let topEle =this.elRef.nativeElement.querySelector('#analyticSvg');

          let elementTop=topEle.getBoundingClientRect().top;
          
          document.getElementById('analyticSvg').offsetTop;
          let divTop = currentCountryElement.getBoundingClientRect().top;
          
          let elementRelativeTop = divTop-elementTop;
          // let pageX = window.scrollX + document.querySelector('#elementId').currentCountryElement.getBoundingClientRect().left
          // let pageY = window.scrollY + document.querySelector('#elementId').currentCountryElement.getBoundingClientRect().top
          let eleY = pageY - ((this.counterPartyIconTop+180) - 30);
          
          let eleX = pageX - ((this.counterPartyIconLeft+300) / 2);
          counterPartyElementRef.style.top = (elementRelativeTop-110).toString() + 'px';
          counterPartyElementRef.style.left = eleX.toString() + 'px';
        }
      }
    }
    else {
      this.PlaceholderText='';
      if (counterPartyElementRef) {
       counterPartyElementRef.style.visibility = 'hidden';
      }
    }
  }


  onCounterPartySelection() 
  {
    this.selectedEntity.transactions.forEach(tran => {
    this.setSelectedCountryStyle(tran.countryName,true, this.counterPartyColor);
    });

  }

  onRowSelect(event) { }

  highlightProjectCountries() {
    this.projectCountries.forEach(c => {
      this.setSelectedCountryStyle(c, true);
    });

  }

  resetCountryHighlight() {
    this.projectCountries.forEach(c => {
      this.setSelectedCountryStyle(c, false);
    });
  }

  setSelectedCountryStyle(country: string, set: boolean = false,className='') {
    let selectorId = country.replace(/[^\w]/g, '');
    let currentCountryElement = this.elRef.nativeElement.querySelector(`#${selectorId}`);
    if (currentCountryElement) {

      if(set && className==='')
      {
        currentCountryElement.classList.remove(this.countryCss);
        currentCountryElement.classList.remove(this.counterPartyCss);

        currentCountryElement.classList.add(this.countryCss);  
      }
      else if(set && className!=='')
      {
        currentCountryElement.classList.remove(this.countryCss);
        currentCountryElement.classList.remove(this.counterPartyCss);

        currentCountryElement.classList.add(this.counterPartyCss); 
      }
      else
      {
        currentCountryElement.classList.remove(this.countryCss);
        currentCountryElement.classList.remove(this.counterPartyCss);
      }
    }
  }

  onCustomAction(event) {
  }
}