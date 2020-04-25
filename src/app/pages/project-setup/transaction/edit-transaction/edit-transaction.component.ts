import { Component, OnInit, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Transaction } from '../../../../@models/transaction';
import { AlertService } from '../../../../shared/services/alert.service';
import { TransactionService } from '../transaction.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { first, filter } from 'rxjs/operators';
import { TransactionType, Currency, InScope, Entities, EntitiesByCountry, DropDownSettings } from '../../../../@models/user';
import { CountryService } from '../../../../shared/services/country.service';
import { DatePipe } from '@angular/common'
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss']
})
export class EditTransactionComponent implements OnInit {
  submitted = false;
  editTransactionForm: FormGroup;
  transactionData: Transaction;
  transactionType: TransactionType[];
  transactionCurrency:any = [];
  projectID: any;
  counterPartyTransType: TransactionType[];
  inScope = new InScope();
  counterPartyInScope = new InScope();
  @Input() editTransactionRow: Transaction[];
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() CancelTransaction: EventEmitter<any> = new EventEmitter();
  entityList: any = [];
  counterPartyentityList: any = [];
  transactionTypeList = [];
  entityFilterList = [];
  transactionTaxableYearEndList = [];
  counterPartyTaxableYearEndList = [];
  textTransLegalName: string;
  textCounterLegalEntityName: string;
  transactionTypeMapList: any;
  legalEntityCountryList = [];
  counterPartyCountryList = [];
  private legalEntityNameDropdownSetting: any;
  private transactionTypeDropdownSetting: any;
  private transactionCurrencyDropdownSetting: any;
  selectedLegalEntityName = [];
  selectedTransactionType = [];
  selectedTransactionCurrency = [];
  selectedCounterLegalEntityName = [];
  selectedCounterTransactionType = [];
  selectedCounterTransactionCurrency = [];
  entityListNew = new Array<Entities>();
  currencyList= new Array<Currency>();

  constructor(private formBuilder: FormBuilder, private datepipe: DatePipe,
    private dialogService: DialogService, private transactionService: TransactionService,
    private alertService: AlertService, private countryService: CountryService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dialog: MatDialog, private shareDetailService: ShareDetailService,
    private el: ElementRef) {
    const project = this.shareDetailService.getORganizationDetail();
    this.editTransactionForm = this.formBuilder.group({
      uniqueTransactionId: null,
      projectId: project.projectId,
      legalEntityName: ['', Validators.required],
      counterpartyLegalEntityName: [''],
      transactionType: [''],
      counterpartyTransactionType: [''],
      projectTransactionTypeName: [''],
      legalEntityCountry: ['', Validators.required],
      counterPartyCountry: [''],
      counterpartyProjectTransactionTypeName: [''],
      transactionInScopeValid: ['', Validators.required],
      transactionInScope: [''],
      counterpartyTransactionInScope: [''],
      overwrite: [''],
      deleteTransaction: [''],
      deleteCounterpartyTransaction: [''],
      entityTransactionCurrency: [''],
      entityTransactionAmount: ['', [Validators.pattern(/^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/)]],
      counterpartyTransactionCurrency: [''],
      counterpartyTransactionAmount: ['', [Validators.pattern(/^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/)]],
      entityTransactionTaxableYearEnd: ['', Validators.required],
      counterpartyTransactionTaxableYearEnd: [''],
    });
    this.editTransactionForm.controls["transactionType"].valueChanges
      .subscribe(data => {
        this.transactionType = [];
        this.countryService.getAllTransactionTypes(data).subscribe(response => {
          this.transactionType = response;
        });
      });
    this.editTransactionForm.controls["counterpartyTransactionType"].valueChanges
      .debounceTime(400)
      .subscribe(data => {
        this.counterPartyTransType = [];
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (data) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
        if (data) {
          this.countryService.getAllTransactionTypes(data).subscribe(response => {
            this.counterPartyTransType = response;
          });
        }
      });

    this.editTransactionForm.controls["counterpartyTransactionCurrency"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      })
    this.editTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      })

    this.editTransactionForm.controls["counterpartyTransactionInScope"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      })

    this.editTransactionForm.controls["counterpartyProjectTransactionTypeName"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      })



    this.editTransactionForm.controls["counterpartyTransactionAmount"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.editTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      })
  }

  ngOnInit() {
    this.alertService.clear();
    this.countryService.getAllCurrency().subscribe(
      data => {
         this.currencyList= new Array<Currency>();
        data.forEach(e=>{
          let currency= new Currency();
          currency.id= e.id;
          currency.currency=e.currency;
          
        this.currencyList.push(currency);
        });
      });
    const project = this.shareDetailService.getORganizationDetail();
    this.projectID = project.projectId;
    this.countryService.getAllEntities(project.projectId).subscribe(entity => {
      this.entityListNew = new Array<Entities>();
      entity.forEach(e => {
        let entities = new Entities();
        entities.entityId = e.entityId;
        entities.counterpartyLegalEntityName=entities.legalEntityName = e.legalEntityName;
        entities.taxableYearEnd=e.taxableYearEnd;
        entities.counterpartyCountryId= entities.countryId=e.countryId;
        entities.counterpartyCountryName=entities.countryName=e.countryName;
        if(this.entityListNew.find(x => x.legalEntityName == entities.legalEntityName)){
        }
        else {
          this.entityListNew.push(entities);
          this.entityListNew.forEach(element=>{
            if(this.legalEntityCountryList.find(x => x.countryName == element.countryName)){
            }
            else {
              this.legalEntityCountryList.push(element);
              this.counterPartyCountryList.push(element);
            }
          })
        }
      });
    this.entityList = this.entityListNew;
 this.transactionCurrency=this.currencyList;
    this.counterPartyentityList = this.entityListNew;
    this.entityFilterList = entity;
    this.countryService.getalltransactiontypes().subscribe(data => {
      this.transactionTypeList = data;
    });

      this.countryService.getalltransactiontypesmap().subscribe(data => {
        this.transactionTypeMapList = data;
    });
    
    this.dropdownSetting();
   
        this.countryService.getAllTransactionTypes("").subscribe(response => {
          this.transactionType = response;
          this.counterPartyTransType = response;
          this.editTransactionForm.controls["uniqueTransactionId"].setValue(this.editTransactionRow[0].uniqueTransactionId);
          let ent: Entities[];
          let ent1: Entities[];
          ent = this.getEntities(this.editTransactionRow[0].legalEntityName, this.entityList);
          if (ent.length > 0) {
            this.legalEntityCountryList = [];
            this.entityFilterList.forEach(e => {
              if (e.legalEntityName === this.editTransactionRow[0].legalEntityName) {
                let entities = new Entities();
                entities.entityId = e.entityId;
                entities.legalEntityName = e.legalEntityName;
                entities.countryId = e.countryId;
                entities.countryName = e.countryName;
                this.legalEntityCountryList.push(entities);
              }
            });
            this.selectedLegalEntityName=ent;
            this.editTransactionForm.controls["legalEntityName"].setValue(this.selectedLegalEntityName);
            this.editTransactionForm.controls["legalEntityCountry"].setValue(this.editTransactionRow[0].countryId);
            let _legalEntityName = ent[0].legalEntityName;
            let _legalCountryName = ent[0].countryName;

            this.legalNameOnChange(_legalEntityName, "Edit");
            this.editTransactionForm.controls["entityTransactionTaxableYearEnd"].setValue(moment(this.editTransactionRow[0].entityTransactionTaxableYearEnd).local().format("DD MMM YYYY"));
          }
          ent1 = this.getEntities(this.editTransactionRow[0].counterpartyLegalEntityName, this.entityList);
          if (ent1.length > 0) {
            this.counterPartyCountryList = [];
            this.entityFilterList.forEach(e => {
              if (e.legalEntityName === this.editTransactionRow[0].counterpartyCountryName) {
                let entities = new Entities();
                entities.entityId = e.entityId;
                entities.legalEntityName = e.legalEntityName;
                entities.countryId = e.countryId;
                entities.countryName = e.countryName;
                this.counterPartyCountryList.push(entities);
              }
            });
            this.selectedCounterLegalEntityName=ent1;
            this.editTransactionForm.controls["counterpartyLegalEntityName"].setValue(this.selectedCounterLegalEntityName);
            this.editTransactionForm.controls["counterPartyCountry"].setValue(this.editTransactionRow[0].counterpartyCountryId);
            let _counterpartyLegalEntityName = ent1[0].legalEntityName;
            this.counterpartyLegalNameOnChange(_counterpartyLegalEntityName, "Edit");
            this.editTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].setValue(moment(this.editTransactionRow[0].counterpartyTransactionTaxableYearEnd).local().format("DD MMM YYYY"));
            }
          let transType: TransactionType[];
          let cTransType: TransactionType[];
          transType = this.getTransactionTypes(this.editTransactionRow[0].transactionType, this.transactionType);
          this.selectedTransactionType = transType;
            this.editTransactionForm.controls["transactionType"].setValue(this.selectedTransactionType);
          cTransType = this.getTransactionTypes(this.editTransactionRow[0].counterpartyTransactionType, this.counterPartyTransType);
          this.selectedCounterTransactionType = cTransType;
            this.editTransactionForm.controls["counterpartyTransactionType"].setValue(this.selectedCounterTransactionType);
          this.editTransactionForm.controls["projectTransactionTypeName"].setValue(this.editTransactionRow[0].projectTransactionTypeName);
          this.editTransactionForm.controls["counterpartyProjectTransactionTypeName"].setValue(this.editTransactionRow[0].counterpartyProjectTransactionTypeName);
          let curr: Currency[];
          let counterCurr: Currency[];
          curr = this.getCurrency(this.editTransactionRow[0].entityTransactionCurrency, this.transactionCurrency);
          this.selectedTransactionCurrency = curr;
            this.editTransactionForm.controls["entityTransactionCurrency"].setValue(this.selectedTransactionCurrency);
          counterCurr = this.getCurrency(this.editTransactionRow[0].counterpartyTransactionCurrency, this.transactionCurrency);
          this.selectedCounterTransactionCurrency = counterCurr;
            this.editTransactionForm.controls["counterpartyTransactionCurrency"].setValue(this.selectedCounterTransactionCurrency);
          this.editTransactionForm.controls["entityTransactionAmount"].setValue((this.editTransactionRow[0].entityTransactionAmount == '') ? this.editTransactionRow[0].entityTransactionAmount : this.editTransactionRow[0].entityTransactionAmount.replace(/,/g, ""));
          this.editTransactionForm.controls["counterpartyTransactionAmount"].setValue((this.editTransactionRow[0].counterpartyTransactionAmount == '') ? this.editTransactionRow[0].counterpartyTransactionAmount : this.editTransactionRow[0].counterpartyTransactionAmount.replace(/,/g, ""));
          var transacInScope: string = String(this.editTransactionRow[0].transactionInScope);
          this.editTransactionForm.controls["transactionInScope"].setValue(transacInScope);
          this.editTransactionForm.controls["transactionInScopeValid"].setValue(transacInScope);
          if (transacInScope == "Yes") {
            this.inScope.checkbox1 = true;
            this.inScope.checkbox2 = false;
          } else {
            this.inScope.checkbox2 = true;
            this.inScope.checkbox1 = false;
          }
          var cTransacInScope: string = String(this.editTransactionRow[0].counterpartyTransactionInScope);
          this.editTransactionForm.controls["counterpartyTransactionInScope"].setValue(cTransacInScope);
          if (cTransacInScope == "Yes") {
            this.counterPartyInScope.checkbox1 = true;
            this.counterPartyInScope.checkbox2 = false;
          }
          else if (cTransacInScope == "No") {
            this.counterPartyInScope.checkbox2 = true;
            this.counterPartyInScope.checkbox1 = false;
          }
        });
      });
  }
  private dropdownSetting() {
    this.legalEntityNameDropdownSetting = {
      singleSelection: true,
      idField: DropDownSettings.idFieldLegalEntityId,
      textField: DropDownSettings.textFieldLegalEntityName,
      selectAllText: DropDownSettings.selectAllText,
      unSelectAllText: DropDownSettings.unSelectAllText,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: DropDownSettings.classes
    };

    this.transactionTypeDropdownSetting = {
      singleSelection: true,
      idField: DropDownSettings.idFieldTransactionId,
      textField: DropDownSettings.textFieldTransactionName,
      selectAllText: DropDownSettings.selectAllText,
      unSelectAllText:DropDownSettings.unSelectAllText,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: DropDownSettings.classes
    };

    this.transactionCurrencyDropdownSetting = {
      singleSelection: true,
      idField: DropDownSettings.idFieldCurrencyId,
      textField: DropDownSettings.textFieldCurrency,
      selectAllText: DropDownSettings.selectAllText,
      unSelectAllText: DropDownSettings.unSelectAllText,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: DropDownSettings.classes
    };
  }

  get form() { return this.editTransactionForm.controls; }
  setDefaultValues() {
    this.inScope.checkbox1 = true;
    this.inScope.checkbox2 = false;
  }
  toggleCheckbox(event) {
    var value = event.currentTarget.checked ? "true" : "";
    this.editTransactionForm.controls["transactionInScopeValid"].setValue(value);
    if (event.target.id === 'checkbox1') {
      if (this.inScope.checkbox1)
        this.inScope.checkbox1 = false;
      else
        this.inScope.checkbox1 = true;
      this.inScope.checkbox2 = false
    } else {
      if (this.inScope.checkbox2)
        this.inScope.checkbox2 = false;
      else
        this.inScope.checkbox2 = true;

      this.inScope.checkbox1 = false;
    }
    if (this.inScope.checkbox1 == false && this.inScope.checkbox2 == false)
      this.editTransactionForm.controls["transactionInScope"].setValue("");

  }
  toggleCounterPartyCheckbox(event) {
    var value = event.currentTarget.checked ? "true" : "";
    this.editTransactionForm.controls["counterpartyTransactionInScope"].setValue(value);

    event.target.id === 'checkbox1' ? (this.counterPartyInScope.checkbox1 = true, this.counterPartyInScope.checkbox2 = false)
      : (this.counterPartyInScope.checkbox2 = true, this.counterPartyInScope.checkbox1 = false);
  }
  
  getTransactionTypes(_transactionType: string, lstTransactionType: TransactionType[]): TransactionType[] {
    return lstTransactionType.filter(function (element, index, array) { return element.transactionType == _transactionType });
  }
  getTransactionTypesBasedId(_id: string, lstTransactionType: TransactionType[]): TransactionType[] {
    return lstTransactionType.filter(function (element, index, array) { return element.id == _id });
  }
  getCurrency(_cur: string, lstCurrency: Currency[]): Currency[] {
    return lstCurrency.filter(function (element, index, array) { return element.currency == _cur });
  }
  getEntities(_ent: string, lstEntities: Entities[]): Entities[] {
    return lstEntities.filter(function (element, index, array) { return element.legalEntityName == _ent });
  }
  editTransaction() {
    this.alertService.clear();
    if (this.editTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].value == "" && this.editTransactionForm.controls["counterpartyLegalEntityName"].value == "") {
      this.editTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].clearValidators();
      this.editTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].setValue("");
      this.editTransactionForm.updateValueAndValidity();
    }
    let _legalEntityNameValidate = this.editTransactionForm.controls["legalEntityName"].value;
    if (_legalEntityNameValidate.length == 0){
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-setup.transaction.transaction-create-validation.LegalEntityNameValidationMsg'));
      return;
    }
    if (_legalEntityNameValidate.length > 0) {
      const _country = this.editTransactionForm.get('legalEntityCountry');
        if (_country.value == "" || _country.value == null) {
          this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-setup.transaction.transaction-create-validation.CountryValidationMsg'));
          return;
        }
    }
    if (_legalEntityNameValidate.length > 0) {
      const transactionType = this.editTransactionForm.controls["transactionType"].value; //this.editTransactionForm.get('transactionType');
      const projectTransactionTypeName = this.editTransactionForm.get('projectTransactionTypeName');
      if (transactionType.length == 0) {
        if (projectTransactionTypeName.value == "") {
          projectTransactionTypeName.setValidators(Validators.required);
        }
      }
      else {
        projectTransactionTypeName.clearValidators();
      }
      projectTransactionTypeName.updateValueAndValidity();
    }
    let _clegalEntityNameValidate = this.editTransactionForm.controls["counterpartyLegalEntityName"].value;
    if (_clegalEntityNameValidate.length > 0) {
      const counterpartyTransactionType = this.editTransactionForm.controls["counterpartyTransactionType"].value; //this.editTransactionForm.get('counterpartyTransactionType');
      const counterpartyProjectTransactionTypeName = this.editTransactionForm.get('counterpartyProjectTransactionTypeName');
      if (counterpartyTransactionType.length == 0) {
        if (counterpartyProjectTransactionTypeName.value == "") {
          counterpartyProjectTransactionTypeName.setValidators(Validators.required);
        }
      }
      else {
        counterpartyProjectTransactionTypeName.clearValidators();
      }
      counterpartyProjectTransactionTypeName.updateValueAndValidity();
    }
 
    this.submitted = true;
    this.editTransactionrecord(); 
 

    //stop here if form is invalid
    if (this.editTransactionForm.invalid) {
      return;
    }
   
  }
  editTransactionrecord() {
    this.transactionData = this.editTransactionForm.value;
    let _legalEntityName = this.editTransactionForm.controls["legalEntityName"].value;
    if(_legalEntityName.length > 0){
    this.entityFilterList.forEach(entity => {
      if (entity.entityId === _legalEntityName[0].entityId) {
        this.transactionData.legalEntityName = entity.legalEntityName;
      }
    });
    }

    let _legalEntityNameCountry = this.editTransactionForm.controls["legalEntityCountry"].value;
    if(_legalEntityNameCountry != '' &&  _legalEntityNameCountry != null){
    this.entityFilterList.forEach(entity =>{
      if(entity.countryId === _legalEntityNameCountry){
        this.transactionData.countryName=entity.countryName;
        this.transactionData.countryId=entity.countryId;
      }
    });
    }
    let _counterpartyLegalEntityName = this.editTransactionForm.controls["counterpartyLegalEntityName"].value;
    if(_counterpartyLegalEntityName.length > 0){
    this.entityFilterList.forEach(entity => {
      if (entity.entityId === _counterpartyLegalEntityName[0].entityId) {
        this.transactionData.counterpartyLegalEntityName = entity.legalEntityName;
      }
    });
  }
  else{
    this.transactionData.counterpartyLegalEntityName = '';
   }

  let _counterpartyCountryId = this.editTransactionForm.controls["counterPartyCountry"].value;
  if(_counterpartyCountryId != '' && _counterpartyCountryId != null){
  this.entityFilterList.forEach(entity =>{
    if(entity.countryId === _counterpartyCountryId){
      this.transactionData.counterpartyCountryName=entity.countryName;
      this.transactionData.counterpartyCountryId=entity.countryId;
    }
  });
 }

    let _transType = this.editTransactionForm.controls["transactionType"].value;
    if(_transType.length > 0) {
      this.transactionData.transactionType = _transType[0].id;
    }
    else{
      this.transactionData.transactionType = '';
    }
    let _counterTransType = this.editTransactionForm.controls["counterpartyTransactionType"].value;
    if(_counterTransType.length > 0) {
      this.transactionData.counterpartyTransactionType = _counterTransType[0].id;
    }
    else{
      this.transactionData.counterpartyTransactionType = '';
    }
    let _TransCurrency = this.editTransactionForm.controls["entityTransactionCurrency"].value;
    if(_TransCurrency.length > 0) {
      this.transactionData.entityTransactionCurrency = _TransCurrency[0].id;
    }
    else{
      this.transactionData.entityTransactionCurrency = '';
    }
    let _counterTransCurrency = this.editTransactionForm.controls["counterpartyTransactionCurrency"].value;
    if(_counterTransCurrency.length > 0) {
      this.transactionData.counterpartyTransactionCurrency = _counterTransCurrency[0].id;
    }
    else{
      this.transactionData.counterpartyTransactionCurrency = '';
    }
    this.transactionData.transactionInScope = (this.inScope.checkbox1 == true ? true : (this.inScope.checkbox2 == true) ? false : null);
    this.transactionData.counterpartyTransactionInScope = (this.counterPartyInScope.checkbox1 == true ? true : (this.counterPartyInScope.checkbox2 == true) ? false : null);
    this.transactionData.entityTransactionTaxableYearEnd = this.transactionData.entityTransactionTaxableYearEnd;
    this.transactionData.counterpartyTransactionTaxableYearEnd = (this.transactionData.counterpartyTransactionTaxableYearEnd == undefined) ? "" : this.transactionData.counterpartyTransactionTaxableYearEnd;
    this.transactionData.entityTransactionAmount = this.transactionData.entityTransactionAmount.replace(/,/g, "");
    this.transactionService.editTransaction(this.transactionData)
      .pipe(first())
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.transaction.transaction-delete.TransactionUpdatedSuccess'));
            this.manageTransaction.emit();

          } else {
            this.toastr.warning(response.errorMessages[0]);
          }
        },
        error => {
          this.toastr.warning('screens.project-setup.transaction.transaction-delete.ErrorOccuredd');
        });
  }

  //method which will close the edit transaction popup
  closeEditTransactionPopup(action) {
    this.CancelTransaction.emit(action);
  }
  getTransactionTypeBasedOnId(_transactionId: string, transactionTypesList: TransactionType[]): TransactionType[] {
    // The following line does not work
    return transactionTypesList.filter(function (element, index, array) { return element["id"] == _transactionId });
  }
  toDate(dateStr: any) {
    return new Date(moment.utc(dateStr).local().format());
  }

  legalNameOnChange(item, Mode) {
    if (Mode === "Edit") {
      this.textTransLegalName = item;
    }
    else {
      this.textTransLegalName = item['legalEntityName']; //item.target.options[item.target.selectedIndex].text;
    }

    this.transactionTaxableYearEndList = [];
    this.legalEntityCountryList = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === this.textTransLegalName) {
        this.legalEntityCountryList.push(entity);
        this.transactionTaxableYearEndList.push(moment(entity.taxableYearEnd).local().format("DD MMM YYYY"));
      }
    });
    
    if (this.transactionTaxableYearEndList.length === 1) {
      this.editTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue(this.transactionTaxableYearEndList[0]);
    }
    else {
      if (Mode != "Edit") {
        this.editTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue('');
      }
    }

    if (this.legalEntityCountryList.length === 1) {
      this.editTransactionForm.controls['legalEntityCountry'].setValue(this.legalEntityCountryList[0].countryId);
    }
    else {
      if (Mode != "Edit") {
        this.editTransactionForm.controls['legalEntityCountry'].setValue('');
      }
    }

  }

  counterpartyLegalNameOnChange(item, Mode) {
    if (Mode === "Edit") {
      this.textCounterLegalEntityName = item;
    }
    else {
      this.textCounterLegalEntityName = item['legalEntityName']; //item.target.options[item.target.selectedIndex].text;
    }
    this.counterPartyTaxableYearEndList = [];
    this.counterPartyCountryList = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === this.textCounterLegalEntityName) {
        this.counterPartyCountryList.push(entity);
        this.counterPartyTaxableYearEndList.push(moment(entity.taxableYearEnd).local().format("DD MMM YYYY"));
      }
    });
    if (this.counterPartyTaxableYearEndList.length === 1) {
      this.editTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue(this.counterPartyTaxableYearEndList[0]);
    }
    else {
      if (Mode != "Edit") {
        this.editTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue('');
      }
    }

    if (this.counterPartyCountryList.length === 1) {
      this.editTransactionForm.controls['counterPartyCountry'].setValue(this.counterPartyCountryList[0].countryId);
    }
    else {
      if (Mode != "Edit") {
        this.editTransactionForm.controls['counterPartyCountry'].setValue('');
      }
    }

  }

  legalCountryChangeOnChange(item){
    let _value = item.target.options[item.target.selectedIndex].value;
    this.editTransactionForm.controls['legalEntityCountry'].setValue(_value);
      this.transactionTaxableYearEndList = [];
      this.entityFilterList.forEach(entity =>{
      if(entity.countryId === _value && entity.legalEntityName === this.selectedLegalEntityName[0].legalEntityName){
        this.transactionTaxableYearEndList.push(moment(entity.taxableYearEnd).local().format("DD MMM YYYY"));
      }
      });
      if(this.transactionTaxableYearEndList.length === 1){
        this.editTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue(this.transactionTaxableYearEndList[0]);
      }
      else{
        this.editTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue('');
      }
    
  }
  counterPartyCountryChangeOnChange(item) {
    let _value = item.target.options[item.target.selectedIndex].value
    this.editTransactionForm.controls['counterPartyCountry'].setValue(_value);
    this.counterPartyTaxableYearEndList = [];
    this.entityFilterList.forEach(e =>{
      if(e.countryId === _value && e.legalEntityName === this.selectedCounterLegalEntityName[0].legalEntityName){
        this.counterPartyTaxableYearEndList.push(moment(e.taxableYearEnd).local().format("DD MMM YYYY"));
      }
    });
    if(this.counterPartyTaxableYearEndList.length === 1){
      this.editTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue(this.counterPartyTaxableYearEndList[0]);
    }
    else{
      this.editTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue('');
    }
  }

  counterpartyTransactionTypeOnChange(item) {
    let transactionTypeId = item['id']; 
    let tranText = this.transactionTypeList.find(e => e.id === transactionTypeId).transactionType;
    let mapValue = this.transactionTypeMapList[tranText];
    this.selectedTransactionType = [];
    if(mapValue)
    {
      let Tran=this.transactionTypeList.find(e=>e.transactionType===mapValue);
      this.selectedTransactionType.push(Tran);
    }
    this.editTransactionForm.controls["transactionType"].setValue(this.selectedTransactionType);
  }

  transactionTypeOnChange(item) {
    const projectTransactionTypeName = this.editTransactionForm.get('projectTransactionTypeName');
    if (item['id'] != '') {
    projectTransactionTypeName.clearValidators();
    let transactionTypeId = item['id']; 
    let tranText = this.transactionTypeList.find(e => e.id === transactionTypeId).transactionType;
    let mapValue = this.transactionTypeMapList[tranText];
    this.selectedCounterTransactionType = [];
    if(mapValue)
    {
      let cTran=this.transactionTypeList.find(e=>e.transactionType===mapValue);
      this.selectedCounterTransactionType.push(cTran);
    }
    this.editTransactionForm.controls["counterpartyTransactionType"].setValue(this.selectedCounterTransactionType);
  }
  else {
    if (projectTransactionTypeName.value == "") {
      projectTransactionTypeName.setValidators(Validators.required);
    }
  }
  projectTransactionTypeName.updateValueAndValidity();
}
}
