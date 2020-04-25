import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'ngx-deliverable-group-info',
  templateUrl: './deliverable-group-info.component.html',
  styleUrls: ['./deliverable-group-info.component.scss']
})
export class DeliverableGroupInfoComponent implements OnInit {

  row: any;
  @Input() rowData: any;
  @Input() value: any;

  //Set this to true when deliverables are loaded
  dataLoaded: boolean = false;
  expanded: boolean = false;

  deliverableHeaderText: string;
  countryHeaderText: string;
  TaxableYearHeaderText: string;

  deliverableNameContent: string;
  countryContent: string;
  TaxableYearContent: string


  currentEle;
  smartTableRef;
  index: number;

  //These are the column indexes needed for appending data
  deliverableNameCellIndex = 1;
  counteyCellIndex = 2;
  taxableYearCellIndex = 3;

  dynamicDeliverableId: string;
  dynamicCountryId: string;
  dynamicTaxableYearId: string;

  constructor(private deliverableService: DeliverableService,
    private elRef: ElementRef,private translate: TranslateService,
    private sharedService: ShareDetailService) { }
  ngOnInit() {
    this.row = this.rowData;
    
    this.deliverableHeaderText = this.translate.instant('screens.project-designer.deliverableGroup.DeliverableName');
    this.countryHeaderText = this.translate.instant('screens.project-designer.deliverableGroup.Country');
    this.TaxableYearHeaderText = this.translate.instant('screens.project-designer.deliverableGroup.TaxbleYearEnd');

    this.deliverableNameContent = `<br/><div class="col-header"><b>${this.deliverableHeaderText}</b></div><br/><div>`;
    this.countryContent = `<br/><div><b>${this.countryHeaderText}</b></div><br/><div>`;
    this.TaxableYearContent = `<br/><div><b>${this.TaxableYearHeaderText}</b></div><br/><div>`;
    
    this.index = (this.value['row'] && this.value['row'].row && this.value['row'].row.index) ? this.value['row'].row.index : 0;
    
    this.dynamicDeliverableId = `temp-deliverable-info${this.index + 1}`;
    this.dynamicCountryId = `temp-country-info${this.index + 1}`;
    this.dynamicTaxableYearId = `temp-taxableyear-info${this.index + 1}`;

  }

  toggleExpansion() {
    this.expanded = !this.expanded;

    if (this.expanded) {
      if (!this.dataLoaded) {
        let projectId = this.sharedService.getORganizationDetail().projectId;
        let groupId = this.row.id;
        this.deliverableService.getGroupDetails(groupId, projectId).subscribe(response => {
          this.renderDeliverableHTML(response);
        });
      }
      else {
        this.showHideDeliverableInfo(true);
      }
    }
    else {
      this.showHideDeliverableInfo(false);
    }
  }


  showHideDeliverableInfo(show: boolean) {

    let deliverableEle: HTMLElement = this.currentEle.ownerDocument.querySelector(`#${this.dynamicDeliverableId}`);
    let countryEle: HTMLElement = this.currentEle.ownerDocument.querySelector(`#${this.dynamicCountryId}`);
    let taxableYearEle: HTMLElement = this.currentEle.ownerDocument.querySelector(`#${this.dynamicTaxableYearId}`);

    if (deliverableEle) {
      deliverableEle.hidden = !show;
    }
    if (countryEle) {
      countryEle.hidden = !show;
    }
    if (taxableYearEle) {
      taxableYearEle.hidden = !show;
    }
  }

  renderDeliverableHTML(deliverableInfo: []) {

    deliverableInfo.forEach(deliverable => {
      this.deliverableNameContent += `<span>${deliverable['entityName']}</span><br/>`;
      this.countryContent += `<span>${deliverable['countryName']}</span><br/>`;
      this.TaxableYearContent += `<span>${ moment(deliverable['taxableYearEnd']).local().format('DD MMM YYYY')}</span><br/>`;
    });

    this.deliverableNameContent += '</div>';
    this.countryContent += '</div>';
    this.TaxableYearContent += '</div>';

    this.currentEle = this.elRef.nativeElement;
    if (this.currentEle) {
      this.smartTableRef = this.currentEle.ownerDocument.querySelector('#deliverableGroupList');
    }
    if (this.smartTableRef) {
      let tableRow = this.smartTableRef.querySelectorAll('tr')[this.index + 1];
      let tableDefinitionAll = tableRow.querySelectorAll('td');
      //Build deliverable Name
      let deliverableEle = tableDefinitionAll[this.deliverableNameCellIndex].querySelector('ng2-smart-table-cell table-cell-view-mode div');

      let deliverableHtml = document.createElement('div');
      deliverableHtml.setAttribute('id', this.dynamicDeliverableId);
      deliverableHtml.innerHTML = this.deliverableNameContent;
      deliverableEle.append(deliverableHtml);

      //Build Country Name
      let countryEle = tableDefinitionAll[this.counteyCellIndex].querySelector('ng2-smart-table-cell table-cell-view-mode div');
      let countryHtml = document.createElement('div');
      countryHtml.setAttribute('id', this.dynamicCountryId);
      countryHtml.innerHTML = this.countryContent;
      countryEle.append(countryHtml);

      //Build taxable Year end
      let taxableYearEle = tableDefinitionAll[this.taxableYearCellIndex].querySelector('ng2-smart-table-cell table-cell-view-mode div');
      let taxableYearHtml = document.createElement('div');
      taxableYearHtml.setAttribute('id', this.dynamicTaxableYearId);
      taxableYearHtml.innerHTML = this.TaxableYearContent;
      taxableYearEle.append(taxableYearHtml);

    }
    this.dataLoaded = true;
  }
}
