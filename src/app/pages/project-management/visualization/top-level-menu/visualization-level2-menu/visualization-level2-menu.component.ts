import { Component, OnInit } from '@angular/core';
import { ProjectManagementService } from '../../../services/project-management.service';
import { visualizationRequest, VisualizationFilterResponse } from '../../../@models/visualization/visualization';
import { VisualizationService } from '../../../services/visualization.service';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-visualization-level2-menu',
  templateUrl: './visualization-level2-menu.component.html',
  styleUrls: ['./visualization-level2-menu.component.scss']
})
export class VisualizationLevel2MenuComponent implements OnInit {

  show: boolean = true;
  imageName: string = this.translate.instant("collapse");
  enableFilter:boolean=false;

  TransactionTypes:any;
  TransactionType:any;
  TransactionTypeSettings:any;

  CountryList:any;
  Country:any;
  CountrySetting:any;

  EntityList:any;
  Entity:any;
  EntitySetting:any;

  selectedTransactionTypes:any[]=[];
  selectedCountries:any[]=[];
  selectedEntities:any[]=[];

  currentSubscriptions:Subscription;

  constructor(private managementService: ProjectManagementService,
    private shareDetailService: ShareDetailService,
    private translate:TranslateService,
    private visualizationService:VisualizationService)
    { 
        this.currentSubscriptions= new Subscription();
    }

  ngOnInit() {
    this.managementService.visualizationFilter$.next(new visualizationRequest());

    this.setFilterSettings();
    this.getFilterData();

    this.currentSubscriptions.add(
      this.managementService.currentVisClearFilter.subscribe(
        enableClearFilter => 
        {
          this.enableFilter=enableClearFilter;
        })
    );
  }

  setFilterSettings()
  {
    this.TransactionTypeSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText:this.translate.instant('selectAll'),
      unSelectAllText:this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.CountrySetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.EntitySetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText:  this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  clearFilters()
  {
    if(this.enableFilter){
    this.enableFilter=false;
    this.TransactionType='';
    this.selectedEntities=[];
    this.TransactionTypes.forEach((element) => { element.checked = false; });

    this.Country='';
    this.selectedCountries=[];
    this.CountryList.forEach((element) => { element.checked = false; });

    this.Entity='';
    this.selectedEntities=[];
    this.EntityList.forEach((element) => { element.checked = false; });

    //Reset the filter
    this.managementService.visualizationFilter$.next(new visualizationRequest());

    //reset the selected country
    this.managementService.changeCurrentEntity(null);
    this.managementService.changeResetStyleCountries(true);
    this.managementService.SetOrResetVisualizationFilter(new visualizationRequest());
  }
  }

  toggleCollapse() {
    this.show = !this.show;
    this.imageName = (this.show) ?this.translate.instant("collapse") :  this.translate.instant("expand");
  }


  getFilterData()
  {
    let projectId= this.shareDetailService.getORganizationDetail().projectId;
    this.visualizationService.getVisualizationFilerMenu(projectId).subscribe((response:VisualizationFilterResponse)=>
      {

        this.CountryList=response.countries;
        this.TransactionTypes=response.transactions;
        this.EntityList=response.entities;
      });
  }

  onTransactionTypeSelect(items)
  {

    if (Array.isArray(items)) {
      this.selectedTransactionTypes=[];
      //element.id should be decided based on API response
      items.forEach((element) => { this.selectedTransactionTypes.push(element); })
    } else {
      //items.id should be decided based on API response
      this.selectedTransactionTypes.push(items);
    }
    this.managementService.visualizationFilter.transactionTypes= this.selectedTransactionTypes;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }

  onTransactionTypeDeSelect(items)
  {
    if (Array.isArray(items) && items.length === 0) {
      this.selectedTransactionTypes = items;
    } else {
      const index = this.selectedTransactionTypes.indexOf(items);
      (index !== -1) ? this.selectedTransactionTypes.splice(index, 1) : this.selectedTransactionTypes;
    }
    this.managementService.visualizationFilter.transactionTypes= this.selectedTransactionTypes;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }



  onCountrySelect(items)
  {
    if (Array.isArray(items)) {
      this.selectedCountries=[];
      //element.id should be decided based on API response
      items.forEach((element) => { this.selectedCountries.push(element.id); })
    } else {
      //items.id should be decided based on API response
      this.selectedCountries.push(items.id);
    }
    this.managementService.visualizationFilter.countries= this.selectedCountries;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }

  onCountryDeSelect(items)
  {
    if (Array.isArray(items) && items.length === 0) {
      this.selectedCountries = items;
    }
    else
    {
      const index = this.selectedCountries.indexOf(items.id);
      (index !== -1) ? this.selectedCountries.splice(index, 1) : this.selectedCountries;
    }
    this.managementService.visualizationFilter.countries= this.selectedCountries;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }

  onEntitySelect(items)
  {
    if (Array.isArray(items)) {
      this.selectedEntities=[];
      //element.id should be decided based on API response
      items.forEach((element) => { this.selectedEntities.push(element.id); })
    } else {
      //items.id should be decided based on API response
      this.selectedEntities.push(items.id);
    }
    this.managementService.visualizationFilter.entities= this.selectedEntities;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }

  onEntityDeSelect(items)
  {
    if (Array.isArray(items) && items.length === 0) {
      this.selectedEntities = items;
    }
    else
    {
      const index = this.selectedEntities.indexOf(items.id);
      (index !== -1) ? this.selectedEntities.splice(index, 1) : this.selectedEntities;
    }
    this.managementService.visualizationFilter.entities= this.selectedEntities;
    this.managementService.SetOrResetVisualizationFilter(this.managementService.visualizationFilter);
    this.toggleClearFilterIcon();
  }

  toggleClearFilterIcon()
  {
    if(this.selectedCountries.length>0 ||
      this.selectedEntities.length>0 ||
      this.selectedTransactionTypes.length > 0
      )
      {
        this.enableFilter=true;
      }
      else
      {
        this.enableFilter=false;
      }

    
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }

}
