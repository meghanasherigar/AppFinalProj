import { Component, OnInit, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { TransactionFilterViewModel, TransactionFilterDataModel, TransactionTypeDataModel } from '../../../../@models/transaction';
declare var $: any;
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { TransactionService } from '../transaction.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { UserUISetting } from '../../../../@models/user';
import { StorageService, StorageKeys } from '../../../../@core/services/storage/storage.service';
import { UserService } from '../../../user/user.service';
import { NbDialogService } from '@nebular/theme';
import { EditTransactionDatasheetComponent } from '../edit-transaction-datasheet/edit-transaction-datasheet.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-manage-transactions-toolbar',
  templateUrl: './manage-transactions-toolbar.component.html',
  styleUrls: ['./manage-transactions-toolbar.component.scss']
})
export class ManageTransactionsToolbarComponent implements OnInit,OnDestroy {
  subscriptions: Subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  projectId: string = "DigiDox3.0";
  entityNamesList: any;
  counterpartyEntityNamesList: any;
  selectedEntityItems = [];
  selectedCounterPartyEntityItems = [];
  transAmountList: any;
  transCounterpartyAmountList: any;
  selectedTransAmountItems = [];
  selectedCTransAmountItems = [];
  transTypeList: any;
  counterpartyTransTypeList: any;
  selectedtransTypeItems = [];
  selectedCTransTypeItems = [];
  transInScopeList: any;
  counterpartyInScopeList: any;
  selectedTransInscopeItems = [];
  selectedCTransInscopeItems = [];
  transCurrencyList: any;
  counterpartTransCurrencyList: any;
  selectedCurrencyItems = [];
  selectedCounterpartyCurrencyItems = [];

  dropdownCurrencySettings = {};
  dropdownSettings = {};
  dropdownTransactionTypeSettings = {};
  TaxableYearStart: Date;
  userUISetting: UserUISetting;
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() loadChildComp: EventEmitter<any> = new EventEmitter();


  // To expand/collapse filters
  public show: boolean = false;
  imageKey: string = 'expand';
  imageName: string = this.translate.instant(this.imageKey);

  transactionFilterViewModel = new TransactionFilterViewModel();

  constructor(
    private translate: TranslateService,
    private transactionService: TransactionService,
    private alertService: AlertService,
    private el: ElementRef,
    private shareDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService,
    private datepipe: DatePipe,
    private storageService: StorageService, private userservice: UserService,
    private dialogService: NbDialogService
  ) {
    this.userUISetting = new UserUISetting();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setLocaleMessages();
      });
   }


  ngOnInit() {
    this.alertService.clear();
    // this.transactionFilterViewModel.projectID = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    this.projectId = project.projectId;
    this.transactionFilterViewModel.projectID = project.projectId;
    this.userUISetting = this.userservice.getCurrentUserUISettings();

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageTransaction).subscribe((payload) => {
      let transactionTag = this.el.nativeElement.querySelector("#transactionFilters-section");
      let createTag = this.el.nativeElement.querySelector("#createSection");
      let ManageTag = this.el.nativeElement.querySelector("#manageSection");
      let filterTag = this.el.nativeElement.querySelector("#filterSection");
      let editTag = this.el.nativeElement.querySelector("#editIcon");
      let deleteTag = this.el.nativeElement.querySelector("#deleteIcon");
      let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
      let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");

      if (payload == "EditDeletetrue") {
        transactionTag.classList.remove("disable-section");
        transactionTag.classList.remove("disabledbutton");
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.add("disable-section");
        deleteTag.classList.add("disabledbutton");
        createTag.classList.remove("disable-section");
        createTag.classList.remove("disabledbutton");
      }
      else if (payload == "CreateEditfalse") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
        transactionTag.classList.add("disable-section");
        transactionTag.classList.add("disabledbutton");
      }
      else if (payload == "EditDeleteFalse") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
        createTag.classList.add("disable-section");
        createTag.classList.add("disabledbutton");
      }
      else if (payload == "OnlyDeleteFalse") {
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelCreate") {
        transactionTag.classList.remove("disable-section");
        transactionTag.classList.remove("disabledbutton");
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CanelEditDeleteTrue") {
        transactionTag.classList.remove("disable-section");
        transactionTag.classList.remove("disabledbutton");
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelEdit") {
        transactionTag.classList.remove("disable-section");
        transactionTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "EnableDownload") {
        downloadTag.classList.remove("disable-section");
        downloadTag.classList.remove("disabledbutton");
      }
      else if (payload == "DisableDownload") {
        downloadTag.classList.add("disable-section");
        downloadTag.classList.add("disabledbutton");
      }
      else {
        this.getFiltersData(payload);
      }

    }));

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownTransactionTypeSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'transactionType',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownCurrencySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'currency',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    if(this.userUISetting.isMenuExpanded){
      this.toggleCollapse();
   }

  }
  getFiltersData(payload) {
    for (var i = 0; i < payload.legalEntityName.length; i++) {
      if (payload.legalEntityName[i] == '')
      payload.legalEntityName[i] = 'Blank';
    };
    if(payload.legalEntityName.find(a => a == "Blank")){
      let blankIndex = payload.legalEntityName.indexOf("Blank");
      payload.legalEntityName.splice(blankIndex, 1)
      payload.legalEntityName.unshift("Blank");
    }
    this.entityNamesList = payload.legalEntityName;

    for (var i = 0; i < payload.counterpartyLegalEntityName.length; i++) {
      if (payload.counterpartyLegalEntityName[i] == '')
      payload.counterpartyLegalEntityName[i] = 'Blank';
    };
    if(payload.counterpartyLegalEntityName.find(a => a == "Blank")){
      let blankIndex = payload.counterpartyLegalEntityName.indexOf("Blank");
      payload.counterpartyLegalEntityName.splice(blankIndex, 1)
      payload.counterpartyLegalEntityName.unshift("Blank");
    }
    this.counterpartyEntityNamesList = payload.counterpartyLegalEntityName;

    if (payload.transactionType != undefined) {
      payload.transactionType.forEach((element: any) => {
        element["id"] = element["transactionType"] + ";" + element["id"];
      });
    }
    this.transTypeList = payload.transactionType;

    if (payload.counterpartyTransactionType != undefined) {
      payload.counterpartyTransactionType.forEach((element: any) => {
        element["id"] = element["transactionType"] + ";" + element["id"];
      });
    }
    this.counterpartyTransTypeList = payload.counterpartyTransactionType;

    for (var i = 0; i < payload.transactionType.length; i++) {
      if (payload.transactionType[i]["transactionType"] == ''){
        payload.transactionType[i].transactionType = 'Blank';
      }
    };
    this.transTypeList = payload.transactionType;

    for (var i = 0; i < payload.counterpartyTransactionType.length; i++) {
      if (payload.counterpartyTransactionType[i]["transactionType"] == ''){
        payload.counterpartyTransactionType[i].transactionType = 'Blank';
      }
    };
    this.counterpartyTransTypeList = payload.counterpartyTransactionType;

    for (var i = 0; i < payload.transactionInScope.length; i++) {
      if (payload.transactionInScope[i] == '')
      payload.transactionInScope[i] = 'Blank';
    };
    if(payload.transactionInScope.find(a => a == "Blank")){
      let blankIndex = payload.transactionInScope.indexOf("Blank");
      payload.transactionInScope.splice(blankIndex, 1)
      payload.transactionInScope.unshift("Blank");
    }
    this.transInScopeList = payload.transactionInScope;

    for (var i = 0; i < payload.counterpartyTransactionInScope.length; i++) {
      if (payload.counterpartyTransactionInScope[i] == '')
      payload.counterpartyTransactionInScope[i] = 'Blank';
    };
    if(payload.counterpartyTransactionInScope.find(a => a == "Blank")){
      let blankIndex = payload.counterpartyTransactionInScope.indexOf("Blank");
      payload.counterpartyTransactionInScope.splice(blankIndex, 1)
      payload.counterpartyTransactionInScope.unshift("Blank");
    }
    this.counterpartyInScopeList = payload.counterpartyTransactionInScope;

    for (var i = 0; i < payload.entityTransactionCurrency.length; i++) {
      if (payload.entityTransactionCurrency[i]["currency"] == '')
      payload.entityTransactionCurrency[i].currency = 'Blank';
    };
    if(payload.entityTransactionCurrency.find(a => a == "Blank")){
      let blankIndex = payload.entityTransactionCurrency.indexOf("Blank");
      payload.entityTransactionCurrency.splice(blankIndex, 1)
      payload.entityTransactionCurrency.unshift("Blank");
    }
    this.transCurrencyList = payload.entityTransactionCurrency;

    for (var i = 0; i < payload.counterpartyTransactionCurrency.length; i++) {
      if (payload.counterpartyTransactionCurrency[i]["currency"] == '')
      payload.counterpartyTransactionCurrency[i].currency = 'Blank';
    };
    if(payload.counterpartyTransactionCurrency.find(a => a == "Blank")){
      let blankIndex = payload.counterpartyTransactionCurrency.indexOf("Blank");
      payload.counterpartyTransactionCurrency.splice(blankIndex, 1)
      payload.counterpartyTransactionCurrency.unshift("Blank");
    }
    this.counterpartTransCurrencyList = payload.counterpartyTransactionCurrency;

    for (var i = 0; i < payload.entityTransactionAmount.length; i++) {
      if (payload.entityTransactionAmount[i] == '')
      payload.entityTransactionAmount[i] = 'Blank';
    };
    if(payload.entityTransactionAmount.find(a => a == "Blank")){
      let blankIndex = payload.entityTransactionAmount.indexOf("Blank");
      payload.entityTransactionAmount.splice(blankIndex, 1)
      payload.entityTransactionAmount.unshift("Blank");
    }
    this.transAmountList = payload.entityTransactionAmount;

    for (var i = 0; i < payload.counterpartyTransactionAmount.length; i++) {
      if (payload.counterpartyTransactionAmount[i] == '')
      payload.counterpartyTransactionAmount[i] = 'Blank';
    };
    if(payload.counterpartyTransactionAmount.find(a => a == "Blank")){
      let blankIndex = payload.counterpartyTransactionAmount.indexOf("Blank");
      payload.counterpartyTransactionAmount.splice(blankIndex, 1)
      payload.counterpartyTransactionAmount.unshift("Blank");
    }
    this.transCounterpartyAmountList = payload.counterpartyTransactionAmount;
    this.emptyFilters();
  }
  onItemSelect(item: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    else {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }

    for (var i = 0; i < this.selectedEntityItems.length; i++) {
      if (this.selectedEntityItems[i] == 'Blank')
      this.selectedEntityItems[i] = '';
    };
    this.transactionFilterViewModel.legalEntityName = this.selectedEntityItems;

    for (var i = 0; i < this.selectedCounterPartyEntityItems.length; i++) {
      if (this.selectedCounterPartyEntityItems[i] == 'Blank')
      this.selectedCounterPartyEntityItems[i] = '';
    };
    this.transactionFilterViewModel.counterpartyLegalEntityName = this.selectedCounterPartyEntityItems;

    for (var i = 0; i < this.selectedTransAmountItems.length; i++) {
      if (this.selectedTransAmountItems[i] == 'Blank')
      this.selectedTransAmountItems[i] = '';
    };
    this.transactionFilterViewModel.entityTransactionAmount = this.selectedTransAmountItems;

    for (var i = 0; i < this.selectedCTransAmountItems.length; i++) {
      if (this.selectedCTransAmountItems[i] == 'Blank')
      this.selectedCTransAmountItems[i] = '';
    };
    this.transactionFilterViewModel.counterpartyTransactionAmount = this.selectedCTransAmountItems;

    for (var i = 0; i < this.selectedTransInscopeItems.length; i++) {
      if (this.selectedTransInscopeItems[i] == 'Blank')
      this.selectedTransInscopeItems[i] = '';
    };
    this.transactionFilterViewModel.transactionInScope = this.selectedTransInscopeItems;

    for (var i = 0; i < this.selectedCTransInscopeItems.length; i++) {
      if (this.selectedCTransInscopeItems[i] == 'Blank')
      this.selectedCTransInscopeItems[i] = '';
    };
    this.transactionFilterViewModel.counterpartyTransactionInScope = this.selectedCTransInscopeItems;

    if (this.selectedtransTypeItems != undefined) {
      this.transactionFilterViewModel.transactionType = new Array();
      this.selectedtransTypeItems.forEach((element: any) => {
        let transType = new TransactionTypeDataModel();
        var splitData = element['id'].split(";");
        transType.id = splitData[1];
        transType.transactionType = element['transactionType'];
        this.transactionFilterViewModel.transactionType.push(transType);
      });
    }
    if (this.selectedCTransTypeItems != undefined) {
      this.transactionFilterViewModel.counterpartyTransactionType = new Array();
      this.selectedCTransTypeItems.forEach((element: any) => {
        let transType = new TransactionTypeDataModel();
        var splitData = element['id'].split(";");
        transType.id = splitData[1];
        transType.transactionType = element['transactionType'];
        this.transactionFilterViewModel.counterpartyTransactionType.push(transType);
      });
    }
    if (this.selectedCurrencyItems != undefined) {
      this.transactionFilterViewModel.entityTransactionCurrency = new Array();
      this.selectedCurrencyItems.forEach((element: never) => {
        this.transactionFilterViewModel.entityTransactionCurrency.push(element["id"]);
      });
    }
    if (this.selectedCounterpartyCurrencyItems != undefined) {
      this.transactionFilterViewModel.counterpartyTransactionCurrency = new Array();
      this.selectedCounterpartyCurrencyItems.forEach((element: never) => {
        this.transactionFilterViewModel.counterpartyTransactionCurrency.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onDateSelect(item: any, type) {
    if (!item) return;
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);

    if (type == 'ETaxableYearDate') {
      this.transactionFilterViewModel.eTaxableYearStart = startDateSelected;
      this.transactionFilterViewModel.eTaxableYearEnd = endDateSelected;
    }
    else if (type == 'CTaxableYearDate') {
      this.transactionFilterViewModel.cTaxableYearStart = startDateSelected;
      this.transactionFilterViewModel.cTaxableYearEnd = endDateSelected;
    }
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllTransactions(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    for (var i = 0; i < this.selectedCTransAmountItems.length; i++) {
      if (this.selectedCTransAmountItems[i] == 'Blank')
      this.selectedCTransAmountItems[i] = '';
    };
    this.transactionFilterViewModel.counterpartyTransactionAmount = this.selectedCTransAmountItems;
    this.transactionFilterViewModel.legalEntityName = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllAmounts(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    for (var i = 0; i < items.length; i++) {
      if (items[i] == 'Blank')
      items[i] = '';
    };
    this.transactionFilterViewModel.entityTransactionAmount = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllCAmounts(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    for (var i = 0; i < items.length; i++) {
      if (items[i] == 'Blank')
      items[i] = '';
    };
    this.transactionFilterViewModel.counterpartyTransactionAmount = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllCEntityNames(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    for (var i = 0; i < items.length; i++) {
      if (items[i] == 'Blank')
      items[i] = '';
    };
    this.transactionFilterViewModel.counterpartyLegalEntityName = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllTransInscopes(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.transactionInScope = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllCTransInscopes(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.counterpartyTransactionInScope = items;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllTranstypes(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.transactionType = new Array();
    items.forEach((element: any) => {
      let transType = new TransactionTypeDataModel();
      var splitData = element['id'].split(";");
      transType.id = splitData[1];
      transType.transactionType = element['transactionType'];
      this.transactionFilterViewModel.transactionType.push(transType);
    });
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllCounterPartyTranstypes(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0) && (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.counterpartyTransactionType = new Array();
    items.forEach((element: any) => {
      let CtransType = new TransactionTypeDataModel();
      var splitData = element['id'].split(";");
      CtransType.id = splitData[1];
      CtransType.transactionType = element['transactionType'];
      this.transactionFilterViewModel.counterpartyTransactionType.push(CtransType);
    });
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectAllCurrency(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      &&
      (this.selectedCounterpartyCurrencyItems == undefined || this.selectedCounterpartyCurrencyItems.length <= 0)
      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.entityTransactionCurrency = new Array();
    items.forEach((element: never) => {
      this.transactionFilterViewModel.entityTransactionCurrency.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }

  onSelectCounterPartyCurr(items: any) {
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedCounterPartyEntityItems == undefined || this.selectedCounterPartyEntityItems.length <= 0) &&
      (this.selectedTransAmountItems == undefined || this.selectedTransAmountItems.length <= 0) &&
      (this.selectedCTransAmountItems == undefined || this.selectedCTransAmountItems.length <= 0) &&
      (this.selectedTransInscopeItems == undefined || this.selectedTransInscopeItems.length <= 0) &&
      (this.selectedCTransInscopeItems == undefined || this.selectedCTransInscopeItems.length <= 0)
      && (this.selectedtransTypeItems == undefined || this.selectedtransTypeItems.length <= 0) && (this.selectedCTransTypeItems == undefined || this.selectedCTransTypeItems.length <= 0)
      && (this.selectedCurrencyItems == undefined || this.selectedCurrencyItems.length <= 0)

      && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.transactionFilterViewModel.counterpartyTransactionCurrency = new Array();
    items.forEach((element: never) => {
      this.transactionFilterViewModel.counterpartyTransactionCurrency.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);

  }

  loadMyChildComponent(action) {
    this.loadChildComp.emit(action);
    this._eventService.getEvent(EventConstants.TransactionCRUD).publish(action);
  }

  clearFilters() {
    this.emptyFilters();
    this._eventService.getEvent(EventConstants.ManageTransaction).publish("EditDeletetrue");
    this.transactionFilterViewModel = new TransactionFilterViewModel();
    // this.transactionFilterViewModel.projectID = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    this.transactionFilterViewModel.projectID = project.projectId;
    this._eventService.getEvent(EventConstants.TransactionFilter).publish(this.transactionFilterViewModel);
  }
  emptyFilters() {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
    this.selectedEntityItems = [];
    this.selectedCounterPartyEntityItems = [];
    this.selectedTransAmountItems = [];
    this.selectedCTransAmountItems = [];
    this.selectedtransTypeItems = [];
    this.selectedCTransTypeItems = [];
    this.selectedTransInscopeItems = [];
    this.selectedCTransInscopeItems = [];
    this.selectedCurrencyItems = [];
    this.selectedCounterpartyCurrencyItems = [];
    let datePicker = <HTMLInputElement>document.getElementById("eTaxableYearDate");
    datePicker.value = '';
    datePicker = <HTMLInputElement>document.getElementById("cTaxableYearDate");
    datePicker.value = '';
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }
  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#transactionFilters-section");
    // To change the name of image.
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      transFilterID.classList.remove('collapsed');
      this.imageKey = 'collapse';
      this.imageName = this.translate.instant(this.imageKey);
    }
    else {
      this.userUISetting.isMenuExpanded = false;
      this.imageKey = 'expand';
      this.imageName = this.translate.instant(this.imageKey);
      // filterIcon.classList.show();
      transFilterID.classList.add('collapsed');
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }
  downloadTransactions() {
    this._eventService.getEvent(EventConstants.TransactionDownload).publish(this.transactionFilterViewModel);
  }
  getEndDateTime(date: any): any
  {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }
  loadDatasheet() {
    const editDatasheet = this.dialogService.open(EditTransactionDatasheetComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
}
