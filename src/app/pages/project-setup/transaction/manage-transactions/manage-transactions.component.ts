import { Component, OnInit, ElementRef, OnDestroy  } from '@angular/core';
import { Transaction, TransactionFilterViewModel, TransactionResponseViewModel } from '../../../../@models/transaction';
import { TransactionService } from '../transaction.service';
import { NbDialogService } from '@nebular/theme';
import { AlertService } from '../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { CreateTransactionComponent } from '../../transaction/create-transaction/create-transaction.component';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
declare var $: any;
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { CustomHTML } from '../../../../shared/services/custom-html.service';
import { start } from 'repl';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { DecimalPipe } from '@angular/common';
import { SortEvents } from '../../../../@models/common/valueconstants';
import { DataSource } from '@angular/cdk/table';
import { CommonDataSource } from '../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-manage-transactions',
  templateUrl: './manage-transactions.component.html',
  styleUrls: ['./manage-transactions.component.scss']
})
export class ManageTransactionsComponent implements OnInit,OnDestroy {
  loadComponent = false;
  editComponent = false;
  enableToolbar: string;
  enableEditButton = false;
  EditFlag = false;
  customAction: Array<{ id: string, value: string }> = [];
  selectedRow: any;
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle : '',
      add: false, edit: false, delete: false, select: true, custom: [
        { name: 'Viewmore', title: '<img class="viewMorelessIcon"  src="assets/images/View more.svg">' },
        { name: 'Viewless', title: '<img class="viewMorelessIcon viewLess"  src="assets/images/View less.svg">' }
    
    ],
      position: 'right',
    },
    pager: {
      display: true,
      perPage: 10
    },
    columns: {},
  };
  source:CommonDataSource = new CommonDataSource();
  transactions: Transaction[] = [];
  transactionFilterViewModel = new TransactionFilterViewModel;
  subscriptions: Subscription = new Subscription();

//ngx-ui-loader configuration
loaderId='MangeTransactionLoader';
loaderPosition=POSITION.centerCenter;
loaderFgsType=SPINNER.ballSpinClockwise; 
loaderColor = '#55eb06';



  constructor(private transacionService: TransactionService,
    private dialogService: NbDialogService,
    private ngxLoader: NgxUiLoaderService,
    private alertService: AlertService,
    private shareDetailService: ShareDetailService,  
   private toastr: ToastrService,
    private elRef: ElementRef, private readonly _eventService: EventAggregatorService,
    private dialog: MatDialog, private dialogService1: DialogService, private customHTML: CustomHTML,
    private translate: TranslateService,
    private decimalPipe :DecimalPipe ) { 
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
     
        this.source.refresh();
      }));

      this.setColumnSettings();
      this.source.refresh();
    }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.alertService.clear();
    // this.transactionFilterViewModel.projectID = 'DigiDox3.0';
    const project = this.shareDetailService.getORganizationDetail();
    this.transactionFilterViewModel.projectID = project.projectId;
    this.transactionFilterViewModel.pageIndex = 1;
    this.transactionFilterViewModel.pageSize = this.settings.pager.perPage;
    this.transactionFilterViewModel.entityTransactionCurrency
    this.getTransactionList();

    this.source.onChanged().subscribe((change) => {
      // if (change.action === 'sort') {
      //   this.sortingChange(change.sort);
      // }
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        this.transactionFilterViewModel.pageIndex = change.paging.page;
        this.transactionFilterViewModel.pageSize = change.paging.perPage;
        this.getTransactionsList(this.transactionFilterViewModel);
        this.transactions = [];
        this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
      }
      //block for server side pagination -- ends

      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.transactionFilterViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.transactionFilterViewModel.sortColumn=  change.sort[0].field;
        this.getTransactionsList(this.transactionFilterViewModel);
      }

      this.source["data"].forEach(ele => {
        var action = this.customAction.filter(function (element, index, array) { return element["id"] == ele.uniqueTransactionId });
        if (action[0]['value'] == 'View less') {
          action[0].value = 'View more';
          this.deleteRow(ele.uniqueTransactionId);
        }
      });
    });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.TransactionCRUD).subscribe((payload) => {

      if (payload == "Add" || payload == "Edit" || payload == "Delete")
        this.loadMyChildComponent(payload);
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TransactionFilter).subscribe((payload: TransactionFilterViewModel) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageIndex = this.transactionFilterViewModel.pageIndex;
      payload.pageSize = this.transactionFilterViewModel.pageSize;
      this.transactionFilterViewModel = payload;
      this.getTransactionsList(payload);
      //updating the filter model for server pagination when any filter applied -- ends
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TransactionDownload).subscribe((payload) => {
      this.downloadTransactions(payload);
    }));

    this.transacionService.refreshTransactionGrid.subscribe((refresh) => {
      if(refresh) {
        const project = this.shareDetailService.getORganizationDetail();
        this.transactionFilterViewModel= new TransactionFilterViewModel(); 
        this.transactionFilterViewModel.projectID = project.projectId;
        this.transactionFilterViewModel.pageIndex=1;
        this.transactionFilterViewModel.pageSize=this.settings.pager.perPage;
        this.getTransactionList();
      }
    })
  }
  setColumnSettings() {

    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.actions= {
      columnTitle : this.translate.instant('Actions'),
      add: false, edit: false, delete: false, select: true, custom: [
        { name: 'Viewmore', title: '<img class="viewMorelessIcon"  src="assets/images/View more.svg">' },
        { name: 'Viewless', title: '<img class="viewMorelessIcon viewLess"  src="assets/images/View less.svg">' }
    
    ],
      position: 'right',
    },
    settingsTemp.columns = {
      legalEntityName: {
        title: this.translate.instant('LegalEntity')
      },
      countryName:{
        title:this.translate.instant('LegalCountryName')
      },
      counterpartyLegalEntityName: {
        title: this.translate.instant('CounterpartyLegalEntity')
      },
      counterpartyCountryName:{
        title:this.translate.instant('CounterPartyCountryName')
      },
      transactionTypeResponse: {
        title:this.translate.instant( 'TransactionType')
      },
      counterPartyResponse: {
        title: this.translate.instant('CounterpartyTransactionType')
      },
      entityTransactionAmount: {
        title: this.translate.instant('EntityTransactionAmount'),
        type: 'html',
        valuePrepareFunction: (value, row) => {
          return value?this.decimalPipe.transform(value,'1.2-2') + " " + row.entityTransactionCurrency:"";
        }
      },
      counterpartyTransactionAmount: {
        title:this.translate.instant( 'CounterpartyTransactionAmount'),
        type: 'html',
        valuePrepareFunction: (value, row) => {
          return value?this.decimalPipe.transform(value,'1.2-2') + " " + row.counterpartyTransactionCurrency:"";
        }
      },
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  getTransactionList() {
    this.enableToolbar = "EditDeletetrue";
    this.transacionService.getTransactions(this.transactionFilterViewModel)
      .subscribe((data: TransactionResponseViewModel) => {
        this.source.load(data.transactionList);
        this.source.totalCount = data.totalCount;
        this.transacionService.transactionList=data.transactionList;
        if (data.transactionList.length > 0) {
          this._eventService.getEvent(EventConstants.ManageTransaction).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.ManageTransaction).publish("DisableDownload");
        this.loadComponent = false;
        this.editComponent = false;
        this.source["data"].forEach(element => {
          var obj = { id: element.uniqueTransactionId, value: 'View more' };
          this.customAction.push(obj);
        });
        this._eventService.getEvent(EventConstants.ManageTransaction).publish(data.transactionFilterMenu);
        this.ngxLoader.stopLoaderAll(this.loaderId);
        this._eventService.getEvent(EventConstants.ManageTransaction).publish(this.enableToolbar);
      }),
        (error)=>{
          this.ngxLoader.stopLoaderAll(this.loaderId);
          console.error(error);
        };
      }
    
  getTransactionsList(filterList) {
    this.transacionService.getTransactions(filterList)
      .subscribe((data: TransactionResponseViewModel) => {

        this.source.load(data.transactionList);
        this.source.totalCount = data.totalCount;
        this.transacionService.transactionList=data.transactionList;
        if (data.transactionList.length > 0) {
          this._eventService.getEvent(EventConstants.ManageTransaction).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.ManageTransaction).publish("DisableDownload");
        this.loadComponent = false;
        this.editComponent = false;
        this.source["data"].forEach(element => {
          var obj = { id: element.uniqueTransactionId, value: 'View more' };
          this.customAction.push(obj);
        });

      });

  }
  public onUserRowSelect(event) {

    if (event.selected.length == 1) {
      this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeleteFalse");
    }
    else if (event.selected.length > 1) {
      this._eventService.getEvent(EventConstants.ManageTransaction).publish("OnlyDeleteFalse");
    }
    else if (event.selected.length == 0)
      this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    this.transactions = event.selected;
  }

  //Method will open the popup with input fields to create a transaction
  createEntityPopup() {
    this.dialogService.open(CreateTransactionComponent, {
      closeOnBackdropClick: false // this event is to prevent the mouse click outside the popup
    });
  }

  private dialogTemplate: Dialog;


  openDeleteConfirmDialog(): void {

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTransaction();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  loadMyChildComponent(action) {

    if (action == "Delete") {

      this.openDeleteConfirmDialog();

    }
    if (action == 'Add') {
      this.loadComponent = true;
      this.enableToolbar = "CreateEditfalse";
    }
    else if (action == "Edit") {
      if (this.transactions.length == 0) { }
      else if (this.transactions.length > 1) { }
      else {
        this.editComponent = true;
        this.enableToolbar = "CreateEditfalse";
      }
    }
    this._eventService.getEvent(EventConstants.ManageTransaction).publish(this.enableToolbar);

  }

  CancelTransactionComponent(action) {

    this.loadComponent = false;
    this.editComponent = false;

    if (action == 'CancelEdit') {
      this._eventService.getEvent(EventConstants.ManageTransaction).publish("CancelEdit");
    }
    else if (action == 'CancelCreate') {
      if (this.transactions.length == 0) {
        this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
      }
      else if (this.transactions.length == 1) {
        this._eventService.getEvent(EventConstants.ManageTransaction).publish("CanelEditDeleteTrue");
      }
      else if (this.transactions.length > 1) {
        this._eventService.getEvent(EventConstants.ManageTransaction).publish("CancelCreate");
      }
    }
    // this.getTransactionList();
  }

  editMyChildComponent(action) {

    this.loadComponent = false;
    this.editComponent = true;
    if (action == 'edit') {
      this.EditFlag = true;
      this.editComponent = true;
    }
    else
      this.EditFlag = true;
  }
  deleteTransaction() {
    this.alertService.clear();
    let listIds = new Array();
    this.transactions.forEach(element => {
      listIds.push(element.uniqueTransactionId);
    }
    );
    this.transacionService.deleteTransactionRequest(listIds)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
         this.toastr.success(this.translate.instant('screens.project-setup.transaction.transaction-delete.DeleteTransactionSuccessMessage'));
       
        } else {
            this.dialogService1.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService1.Open(DialogTypes.Error, "Error Occured");
        });
  }

  onCustomAction(event) {
    var transSmartTable = (document.getElementById('transSmartTable'));
    var nodes = this.customHTML.querySelectorAll(transSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    var index = -1;
    for (var i = 0; i < nodes.length; i++) {
      var pager = this.source.getPaging();
      let dataIndex = i;
      var uniqueId = this.source["data"][dataIndex].uniqueTransactionId;
      var tableData = nodes[i].getElementsByTagName("td");
      for (var j = 0; j < tableData.length; j++) {
        if (tableData[j].textContent == event.data.legalEntityName && uniqueId == event.data.uniqueTransactionId) {
          index = i;
          break;
        }
      }
    }

   
    var action = this.customAction.filter(function (element, index, array) { return element["id"] == event.data.uniqueTransactionId });
    this.selectedRow = undefined;
    var nodes = this.customHTML.querySelectorAll(transSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    this.selectedRow = nodes[index];
    if (action[0]['value'] == 'View more') {
      action[0].value = "View less";
     
      this.getRow(index, event.data);
      var _selRow = this.selectedRow;
      setTimeout(function () {
        let value = _selRow.getElementsByClassName('entityViewMore');
        if (value && value.length > 0)
          _selRow.getElementsByClassName('entityViewMore')[0].innerText = "View less";
      });
      this.selectedRow.classList.add("expand");
    }
    else if (action[0]['value'] == 'View less') {
      action[0].value = 'View more';
      this.deleteRow(event.data.uniqueTransactionId);
      this.selectedRow.classList.remove("expand");
    }
  }

  getRow(index, data) {
    var hElement: HTMLElement = this.elRef.nativeElement;
    var transSmartTable = (document.getElementById('transSmartTable'));
    var nodes = this.customHTML.querySelectorAll(transSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    this.selectedRow = nodes[index];
    //this.selectedRow = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.ng-star-inserted")[index];
    var transactions = new Array();
    transactions.push(["", "Transaction In Scope", "Counterparty Transaction In Scope", "Entity Transaction Taxable Year End", "Counterparty Transaction Taxable Year End"]);
    var dataValue = [];   
    dataValue[0] = "";
    dataValue[1] = data.transactionInScope;
    dataValue[2] = data.counterpartyTransactionInScope;
    dataValue[3] = data.entityTransactionTaxableYearEnd?moment(data.entityTransactionTaxableYearEnd).local().format('DD MMM YYYY'): "";
    dataValue[4] = data.counterpartyTransactionTaxableYearEnd?moment(data.counterpartyTransactionTaxableYearEnd).local().format('DD MMM YYYY'): "";
    transactions.push(dataValue);
    var table = document.createElement("TABLE");
    var columnCount = transactions[0].length;
    var row = document.createElement('tr')
    row.setAttribute("class", "thViewmore" + data.uniqueTransactionId);
    for (var i = 0; i < columnCount; i++) {
      var headerCell = document.createElement("TH");
      headerCell.setAttribute("class", "viewMoreTableHeader");
      headerCell.innerHTML = transactions[0][i];
      row.appendChild(headerCell);
    }
    table.appendChild(row);
    row = document.createElement('tr')
    row.setAttribute("class", "trViewmore" + data.uniqueTransactionId);

    for (var i = 1; i < transactions.length; i++) {
      for (var j = 0; j < columnCount; j++) {
        var cell = row.insertCell(-1);
        cell.innerHTML = transactions[i][j];
      }
    }
    table.appendChild(row);
    var divArea = document.createElement("div");
    divArea.setAttribute("class", 'Viewmore');
    divArea.appendChild(table);

    this.selectedRow.insertAdjacentHTML('afterend', divArea.innerHTML);
  }

  deleteRow(id) {
    var hElement: HTMLElement = this.elRef.nativeElement;
    var node = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.thViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[0]).removeChild(node);
    node = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.trViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[0]).removeChild(node);
  }

  sortingChange(change) {

    if (change[0].direction == 'asc')
      this.transactions.sort(function (obj1, obj2) {
        return obj1[change[0].field] - obj2[change[0].field]
      });
    else {
      var b = this.transactions.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return obj2[change[0].field] - obj1[change[0].field]
      });
    }
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  downloadTransactions(payload) {
    let data: TransactionFilterViewModel;
    data = payload;
    if(this.transactions.length >= 0){
    data.TransactionIds = new Array();
    this.transactions.forEach(ele => {
      data.TransactionIds.push(ele.uniqueTransactionId);
    })
  }
  this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.transacionService.download_Transactions(data)
      .subscribe(data => {
        this.downloadFile(this.convertbase64toArrayBuffer(data.content),data.fileName);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
      ),
      error => {
        this.dialogService1.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      },
      () => console.info('OK');
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
  downloadFile(data,fileName) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob,fileName);
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
      this.dialogService1.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.TryAgainTransactionDownload'));
    }

  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
