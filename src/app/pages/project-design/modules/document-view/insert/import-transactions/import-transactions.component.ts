import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { TransactionModel } from '../../../../../../@models/projectDesigner/designer';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-import-transactions',
  templateUrl: './import-transactions.component.html',
  styleUrls: ['./import-transactions.component.scss']
})
export class ImportTransactionsComponent implements OnInit {

  constructor(protected ref: NbDialogRef<any>, private ngxLoader: NgxUiLoaderService, private documentViewService: DocumentViewService, private sharedService: ShareDetailService, private _eventService: EventAggregatorService) { }
  importTrans: any = {};
  projectDetails: ProjectDetails;
  editorId: string = "";
  entityId: string;
  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
  }

  toggleCheckbox(event) {
    if (event.currentTarget.id === 'inScopeCheckBox') {
      if (this.importTrans.checkbox1)
        this.importTrans.checkbox1 = false;
      else
        this.importTrans.checkbox1 = true;
      this.importTrans.checkbox2 = false;
      this.importTrans.checkbox3 = false;

    }
    else if (event.currentTarget.id === 'outScopeCheckBox') {
      if (this.importTrans.checkbox2)
        this.importTrans.checkbox2 = false;
      else
        this.importTrans.checkbox2 = true;
      this.importTrans.checkbox1 = false
      this.importTrans.checkbox3 = false
    }
    else {
      if (this.importTrans.checkbox3)
        this.importTrans.checkbox3 = false;
      else
        this.importTrans.checkbox3 = true;
      this.importTrans.checkbox1 = false;
      this.importTrans.checkbox2 = false;
    }
  }

  importTransaction() {
    this.ngxLoader.startBackgroundLoader("FullViewLoader");
    let transctionScope = this.importTrans.checkbox1 ? true : this.importTrans.checkbox2 ? false : null;
    let payload : any ={};
    payload.projectId = this.projectDetails.projectId;
    payload.transactionScope = transctionScope;
    payload.legalentityid = this.entityId;
    this.documentViewService.coveredTransactionForProject(payload)
      .subscribe((data: any) => {
        let payload: any = {};
        payload.action = ActionEnum.insertTable;
        payload.data = this.createTable(data);
        payload.blockId = this.editorId;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
      });
    this.ref.close();
  }

  createTable(data) {
    var div = document.createElement('DIV');
    var table = document.createElement('TABLE');

    var tHead = document.createElement('THEAD');
    table.appendChild(tHead);

    var tr = document.createElement('TR');
    tHead.appendChild(tr);

    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(TransactionModel.Counterparty));
    tr.appendChild(th);

    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(TransactionModel.TypeOfTransaction));
    tr.appendChild(th);

    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(TransactionModel.TaxJurisdictionCounterParty));
    tr.appendChild(th);

    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(TransactionModel.RelationshipCounterParty));
    tr.appendChild(th);

    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(TransactionModel.AmountPaid));
    tr.appendChild(th);

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    for (var i = 0; i < data.length; i++) {
      var tr = document.createElement('TR');
      tableBody.appendChild(tr);

      var td = document.createElement('TD');
      td.appendChild(document.createTextNode(data[i].projectTransactionTypeName));
      tr.appendChild(td);

      var td = document.createElement('TD');
      td.appendChild(document.createTextNode(data[i].counterPartyProjectTransactionTypeName));
      tr.appendChild(td);

      var td = document.createElement('TD');
      td.appendChild(document.createTextNode(data[i].taxJurisdictionCounterParty));
      tr.appendChild(td);

      var td = document.createElement('TD');
      td.appendChild(document.createTextNode(data[i].relationshipCounterParty));
      tr.appendChild(td);

      var td = document.createElement('TD');
      td.appendChild(document.createTextNode(data[i].amountPaid));
      tr.appendChild(td);
    }
    div.appendChild(table);

    return div.innerHTML;
  }

  dismiss() {
    this.ref.close();
  }

}
