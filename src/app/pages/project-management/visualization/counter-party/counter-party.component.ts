import { Component, OnInit, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-counter-party',
  templateUrl: './counter-party.component.html',
  styleUrls: ['./counter-party.component.scss']
})
export class CounterPartyComponent implements OnInit {

  value: any;
  row: any;
  cell: any;
  //Index of the row
  index: number;
  counterPartiesAdded: boolean = false;

  //These are the column indexes needed for appending data
  transactionTypeCellIndex = 3;
  transactionAmountCellIndex = 4;

  counterPartiesText='';
  counterPartyText='';

  currentEle;
  smartTableRef;

  content =
    {
      counterParty: '',
      transactionType: '',
      transactionAmount: ''
    };

  constructor(private elRef: ElementRef,
    private translate: TranslateService
    ) { }

  ngOnInit() {
     this.counterPartiesText="Counterparties";//this.translate.instant('screens.Project-Management.Visualization.CounterParties');
     this.counterPartyText="Counterparty";//this.translate.instant('screens.Project-Management.Visualization.CounterParty');
    //this.row = this.value.row;
    //accessing the row data by using value.row.row since value also is being passed in valuePrepare function
    this.row = this.value.row.row.data;
    this.cell = this.value.cell;
    this.index = (this.value.row && this.value.row.row && this.value.row.row.index) ? this.value.row.row.index : 0;
    this.currentEle = this.elRef.nativeElement;
    if (this.currentEle) {
      this.smartTableRef = this.currentEle.ownerDocument.querySelectorAll('ng2-smart-table table tbody')[0];
    }

  }

  onCounterPartySelect(row) {

    let tableRow = this.smartTableRef.querySelectorAll('tr')[this.index];
    let tableDefinitionAll = tableRow.querySelectorAll('td');
    let transactionTypeEle = tableDefinitionAll[this.transactionTypeCellIndex].querySelector('ng2-smart-table-cell table-cell-view-mode div');

    let tranAmountEle = tableDefinitionAll[this.transactionAmountCellIndex].querySelector('ng2-smart-table-cell table-cell-view-mode div');

    if (!this.counterPartiesAdded) {
      //create placeholders
      let transactionTypes = document.createElement('div');
      transactionTypes.setAttribute('id', 'dynamicTranType');

      let tranAmounts = document.createElement('div');
      tranAmounts.setAttribute('id', 'dynamicTranAmount');

      let counterParties = document.createElement('div');
      let content = this.getCounterPartyInfo();

      counterParties.innerHTML = content.counterParty;
      this.currentEle.append(counterParties);

      transactionTypes.innerHTML = content.transactionType;
      transactionTypeEle.append(transactionTypes);

      tranAmounts.innerHTML = content.transactionAmount;
      tranAmountEle.append(tranAmounts);

      this.counterPartiesAdded = true;
    }
    else {
      //TODO: Add code to hide the counter parties based on requirement.
      this.counterPartiesAdded = false;
      let nodeList: NodeList = this.currentEle.childNodes;
      nodeList.forEach(x => {
        if (x['id'] === '') {
          this.currentEle.removeChild(x);
        }
      });

      nodeList = transactionTypeEle.childNodes;
      nodeList.forEach(x => {
        if (x['id'] === 'dynamicTranType') {
          transactionTypeEle.removeChild(x);
        }
      });

      nodeList = tranAmountEle.childNodes;
      nodeList.forEach(x => {
        if (x['id'] === 'dynamicTranAmount') {
          tranAmountEle.removeChild(x);
        }
      });
    }
  }

  getCounterPartyInfo() {
    let counterPartyContent = `<div>`;
    let transactionTypeContent = '<div>';
    let tranAmountContent = '<div>';

    this.row.transactions.forEach(element => {
      counterPartyContent += `<span>${element.counterpartyLegalEntityName}</span><br/>`;

      transactionTypeContent += `<span>${element.transactionTypeResponse}</span><br/>`;

        //TODO: might need to add currency based on requirement
      tranAmountContent += `<span> 
        ${element.counterpartyTransactionAmount} ${element.counterPartyCurrencyName?
          element.counterPartyCurrencyName:''}
          </span><br/>`;
    });

    counterPartyContent += '</div>';
    transactionTypeContent += '</div>';
    tranAmountContent += '</div>';
    this.content.counterParty = counterPartyContent;
    this.content.transactionType = transactionTypeContent;
    this.content.transactionAmount = tranAmountContent;

    return this.content;

  }

}
