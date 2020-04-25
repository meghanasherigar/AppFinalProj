import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Transaction } from '../../../../@models/transaction';
import { first, filter } from 'rxjs/operators';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { TransactionType, Currency, InScope, LegalAutoSearch, Entities, EntitiesByCountry, DropDownSettings } from '../../../../@models/user';
import { CountryService } from '../../../../shared/services/country.service';
import { DatePipe } from '@angular/common';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { TransactionFilterViewModel, TransactionFilterDataModel,TransactionResponseViewModel } from '../../../../@models/transaction';
import { Entity } from '../../../../@models/entity';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { CountryEntitySearchViewModel } from '../../../../@models/userAdmin';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { element } from '@angular/core/src/render3';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit {
  submitted = false;
  createTransactionForm: FormGroup;
  transactionData: Transaction;
  transactionTypes: TransactionType[];
  transactionCurrency: Currency[];
  searchResult : LegalAutoSearch[];
  counterPartyTransType: TransactionType[];
  inScope = new InScope();
  counterPartyInScope = new InScope();  entityNames : Transaction[];
  transactionFilterViewModel = new TransactionFilterViewModel();  
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() CancelTransaction: EventEmitter<any> = new EventEmitter();
  entityList: any = [];
  counterPartyentityList: any = [];
  entityCountryList = [];
  counterPartyCountryList = [];
  transactionTypeList = [];
  entityFilterList = [];
  transactionTaxableYearEndList = [];
  counterPartyTaxableYearEndList = [];
  transactionTypeMapList:any;
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

  constructor(private formBuilder: FormBuilder, private datepipe: DatePipe, 
    private ngxLoader: NgxUiLoaderService,
    private transactionService: TransactionService, private alertService: AlertService, 
    private countryService: CountryService, private dialogService: DialogService,
    
    private translate: TranslateService,
    private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private el: ElementRef ) {
    const project = this.shareDetailService.getORganizationDetail();
    this.createTransactionForm = this.formBuilder.group({
      uniqueTransactionId: null,
      projectID : project.projectId,
      legalEntityName: ['', Validators.required],
      legalEntityCountry:['',Validators.required],
      counterPartyCountry:[''],
      counterpartyLegalEntityName: [''],
      transactionType: [''],
      counterpartyTransactionType: [''],
      projectTransactionTypeName: ['', [Validators.pattern("[^@,+,=,<,>,-].*")]],
      counterpartyProjectTransactionTypeName: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
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

    this.transactionFilterViewModel.projectID = project.projectId;
    this.transactionFilterViewModel.pageIndex = 1;
    this.transactionFilterViewModel.pageSize = 100;
    
    this.createTransactionForm.controls["counterpartyTransactionCurrency"].valueChanges
      .subscribe(checkedValue => {

        const counterpartyLegalEntityName = this.createTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
          counterpartyLegalEntityName.setValidators(Validators.pattern(/^[,-._ \w\s]*$/));
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      });

    this.createTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.createTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      });

    this.createTransactionForm.controls["counterpartyTransactionInScope"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.createTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      });

    this.createTransactionForm.controls["counterpartyProjectTransactionTypeName"].valueChanges
      .subscribe(checkedValue => {
        const counterpartyLegalEntityName = this.createTransactionForm.get('counterpartyLegalEntityName');
        if (checkedValue) {
          counterpartyLegalEntityName.setValidators(Validators.required);
        }
        else {
          counterpartyLegalEntityName.clearValidators();
        }
        counterpartyLegalEntityName.updateValueAndValidity();
      });
  }

  loaderId='CreateTransactionLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.alertService.clear();
    this.setDefaultValues();
   
    this.countryService.getAllCurrency().subscribe(
      data => {
        this.transactionCurrency = data;
      });
    const project = this.shareDetailService.getORganizationDetail();
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
                if(this.entityCountryList.find(x => x.countryName == element.countryName)){
                }
                else {
                  this.entityCountryList.push(element);
                  this.counterPartyCountryList.push(element);
                }
              })
            }
          });
        this.entityList = this.entityListNew;
        this.counterPartyentityList = this.entityListNew;
        this.entityFilterList = entity;
      });
      this.countryService.getalltransactiontypes().subscribe(data => {
        this.transactionTypeList = data;
      });
      this.countryService.getalltransactiontypesmap().subscribe(data => {
        this.transactionTypeMapList = data;
      });
      this.dropdownSetting();
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

  get form() { return this.createTransactionForm.controls; }

  toggleCheckbox(event) {
    var value = event.currentTarget.checked ? "true" : "";
    this.createTransactionForm.controls["transactionInScopeValid"].setValue(value);
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
      this.createTransactionForm.controls["transactionInScope"].setValue("");
  }
  toggleCounterPartyCheckbox(event) {
    var value = event.currentTarget.checked ? "true" : "";
    this.createTransactionForm.controls["counterpartyTransactionInScope"].setValue(value);
    event.target.id === 'checkbox1' ? (this.counterPartyInScope.checkbox1 = true, this.counterPartyInScope.checkbox2 = false)
      : (this.counterPartyInScope.checkbox2 = true, this.counterPartyInScope.checkbox1 = false);
    this.createTransactionForm.controls["counterpartyTransactionInScope"].setValue(this.counterPartyInScope.checkbox1 == true ? true : (this.counterPartyInScope.checkbox2 == true) ? false : null);

  }

  setDefaultValues() {
    this.createTransactionForm.controls["transactionInScopeValid"].setValue(true);
    this.inScope.checkbox1 = true;
    this.inScope.checkbox2 = false;
  }

  getTransactionTypes(_transactionType: string, lstTransactionType: TransactionType[]): TransactionType[] {
    // The following line does not work
    
    return lstTransactionType.filter(function (element, index, array) { return element.transactionType == _transactionType });
  }
  getLegalEntity(_legalname: string, legalAutoSearch: LegalAutoSearch[]): LegalAutoSearch[] {
    // The following line does not work
    return legalAutoSearch.filter(function (element, index, array) { return element.legalEntityName == _legalname });
  }

  createTransaction() {
    this.alertService.clear();
    if (this.createTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].value == "" && this.createTransactionForm.controls["counterpartyLegalEntityName"].value == "") {
      this.createTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].clearValidators();
      this.createTransactionForm.controls["counterpartyTransactionTaxableYearEnd"].setValue("");
      this.createTransactionForm.updateValueAndValidity();
    }
    let _legalEntityNameValidate = this.createTransactionForm.controls["legalEntityName"].value;
    if (_legalEntityNameValidate.length > 0) {
      const transactionType = this.createTransactionForm.controls["transactionType"].value; //this.createTransactionForm.get('transactionType');
      const projectTransactionTypeName = this.createTransactionForm.get('projectTransactionTypeName');
      if (transactionType.length == 0) {
        if (projectTransactionTypeName.value == "") {
          projectTransactionTypeName.setValidators(Validators.required);
        }
      }
      else {
        projectTransactionTypeName.clearValidators();
        projectTransactionTypeName.setValidators(Validators.pattern("[^@,+,=,<,>,-].*"));
      }
      projectTransactionTypeName.updateValueAndValidity();
    }

    this.submitted = true;
    this.alertService.clear();
    if (this.createTransactionForm.invalid) {
      return;
    }
    this.transactionData = this.createTransactionForm.value;
    let _legalEntityName = this.createTransactionForm.controls["legalEntityName"].value;
    if(_legalEntityName.length > 0){
    this.entityFilterList.forEach(entity =>{
      if(entity.entityId === _legalEntityName[0].entityId){
        this.transactionData.legalEntityName = entity.legalEntityName;
      }
    });
    }

    let _legalEntityNameCountry = this.createTransactionForm.controls["legalEntityCountry"].value;
    if(_legalEntityNameCountry != '' &&  _legalEntityNameCountry != null){
    this.entityFilterList.forEach(entity =>{
      if(entity.countryId === _legalEntityNameCountry){
        this.transactionData.countryName=entity.countryName;
        this.transactionData.countryId=entity.countryId;
      }
    });
    }

    let _counterpartyLegalEntityName = this.createTransactionForm.controls["counterpartyLegalEntityName"].value;
    if(_counterpartyLegalEntityName.length > 0){
    this.entityFilterList.forEach(entity =>{
      if(entity.entityId === _counterpartyLegalEntityName[0].entityId){
        this.transactionData.counterpartyLegalEntityName = entity.legalEntityName;
      }
    });
   }
   else{
    this.transactionData.counterpartyLegalEntityName = '';
   }

   let _counterpartyCountryId = this.createTransactionForm.controls["counterPartyCountry"].value;
   if(_counterpartyCountryId != '' && _counterpartyCountryId != null){
   this.entityFilterList.forEach(entity =>{
     if(entity.countryId === _counterpartyCountryId){
       this.transactionData.counterpartyCountryName=entity.countryName;
       this.transactionData.counterpartyCountryId=entity.countryId;
     }
   });
  }

    if (this.searchResult != undefined) {
      let type: LegalAutoSearch[];
      type = this.getLegalEntity(this.transactionData.legalEntityName, this.searchResult);
      if (type.length > 0)
        this.transactionData.legalEntityName = type[0].legalEntityName;
    }
    let _transType = this.createTransactionForm.controls["transactionType"].value;
    if(_transType.length > 0) {
      this.transactionData.transactionType = _transType[0].id;
    }
    else{
      this.transactionData.transactionType = '';
    }
    let _counterTransType = this.createTransactionForm.controls["counterpartyTransactionType"].value;
    if(_counterTransType.length > 0) {
      this.transactionData.counterpartyTransactionType = _counterTransType[0].id;
    }
    else{
      this.transactionData.counterpartyTransactionType = '';
    }
    let _TransCurrency = this.createTransactionForm.controls["entityTransactionCurrency"].value;
    if(_TransCurrency.length > 0) {
      this.transactionData.entityTransactionCurrency = _TransCurrency[0].id;
    }
    else{
      this.transactionData.entityTransactionCurrency = '';
    }
    let _counterTransCurrency = this.createTransactionForm.controls["counterpartyTransactionCurrency"].value;
    if(_counterTransCurrency.length > 0) {
      this.transactionData.counterpartyTransactionCurrency = _counterTransCurrency[0].id;
    }
    else{
      this.transactionData.counterpartyTransactionCurrency = '';
    }
    this.transactionData.transactionInScope = (this.inScope.checkbox1 == true ? true : (this.inScope.checkbox2 == true) ? false : null);
    this.transactionData.counterpartyTransactionInScope = (this.counterPartyInScope.checkbox1 == true ? true : (this.counterPartyInScope.checkbox2 == true) ? false : null);
    this.transactionData.entityTransactionTaxableYearEnd = this.transactionData.entityTransactionTaxableYearEnd;
    this.transactionData.counterpartyTransactionTaxableYearEnd = (this.transactionData.counterpartyTransactionTaxableYearEnd == null || this.transactionData.counterpartyTransactionTaxableYearEnd == undefined) ? "" : this.transactionData.counterpartyTransactionTaxableYearEnd;
    this.transactionService.createTransaction(this.transactionData)
      .pipe(first())
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.transaction.transaction-create.TransactionCreate'));
          
            this.manageTransaction.emit();

          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        },
        error => {
          this.dialogService.Open(DialogTypes.Error, "Error Occured");
        });
  }

  //method which will close the create transaction popup
  closeCreateTransactionPopup(action) {

    this.CancelTransaction.emit(action);
  }
  getTransactionTypeBasedOnId(_transactionId: string, transactionTypesList: TransactionType[]): TransactionType[] {
    // The following line does not work
    return transactionTypesList.filter(function (element, index, array) { return element["id"] == _transactionId });
  }

  legalNameOnChange(item) {
    let _text = item['legalEntityName'];
    this.transactionTaxableYearEndList = [];
    this.entityCountryList=[];
    this.entityFilterList.forEach(entity =>{
    if(entity.legalEntityName === _text){
      this.entityCountryList.push(entity);
      this.transactionTaxableYearEndList.push(moment(entity.taxableYearEnd).local().format("DD MMM YYYY"));
    }
    });
    if(this.transactionTaxableYearEndList.length === 1){
      this.createTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue(this.transactionTaxableYearEndList[0]);
    }
    else{
      this.createTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue('');
    }

    if(this.entityCountryList.length === 1){
      this.createTransactionForm.controls['legalEntityCountry'].setValue(this.entityCountryList[0].countryId);
    }
    else{
      this.createTransactionForm.controls['legalEntityCountry'].setValue('');
    }

  }
  counterpartyLegalNameOnChange(item) {
    let _text = item['legalEntityName'];
    this.counterPartyTaxableYearEndList = [];
    this.counterPartyCountryList=[];
    this.entityFilterList.forEach(e =>{
    if(e.legalEntityName === _text){
      this.counterPartyCountryList.push(e);
      this.counterPartyTaxableYearEndList.push(moment(e.taxableYearEnd).local().format("DD MMM YYYY"));
    }
    });
    if(this.counterPartyTaxableYearEndList.length === 1){
      this.createTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue(this.counterPartyTaxableYearEndList[0]);
    }
    else{
      this.createTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue('');
    }

    if(this.counterPartyCountryList.length === 1){
      this.createTransactionForm.controls['counterPartyCountry'].setValue(this.counterPartyCountryList[0].countryId);
    }
    else{
      this.createTransactionForm.controls['counterPartyCountry'].setValue('');
    }
  }

  legalCountryChangeOnChange(item){
    let _value = item.target.options[item.target.selectedIndex].value;
    this.createTransactionForm.controls['legalEntityCountry'].setValue(_value);
      this.transactionTaxableYearEndList = [];
      this.entityFilterList.forEach(entity =>{
      if(entity.countryId === _value && entity.legalEntityName === this.selectedLegalEntityName[0].legalEntityName){
        this.transactionTaxableYearEndList.push(moment(entity.taxableYearEnd).local().format("DD MMM YYYY"));
      }
      });
      if(this.transactionTaxableYearEndList.length === 1){
        this.createTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue(this.transactionTaxableYearEndList[0]);
      }
      else{
        this.createTransactionForm.controls['entityTransactionTaxableYearEnd'].setValue('');
      }
    
  }
  counterPartyCountryChangeOnChange(item) {
    let _value = item.target.options[item.target.selectedIndex].value
    this.createTransactionForm.controls['counterPartyCountry'].setValue(_value);
    this.counterPartyTaxableYearEndList = [];
    this.entityFilterList.forEach(e =>{
      if(e.countryId === _value && e.legalEntityName === this.selectedCounterLegalEntityName[0].legalEntityName){
        this.counterPartyTaxableYearEndList.push(moment(e.taxableYearEnd).local().format("DD MMM YYYY"));
      }
    });
    if(this.counterPartyTaxableYearEndList.length === 1){
      this.createTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue(this.counterPartyTaxableYearEndList[0]);
    }
    else{
      this.createTransactionForm.controls['counterpartyTransactionTaxableYearEnd'].setValue('');
    }
  }

  counterpartyTransactionTypeOnChange(item){
    let transactionTypeId=item['id'];
    let tranText= this.transactionTypeList.find(e=>e.id===transactionTypeId);
    let mapValue=tranText?this.transactionTypeMapList[tranText.transactionType]:"";
    this.selectedTransactionType = [];
    if(mapValue)
    {
      let Tran=this.transactionTypeList.find(e=>e.transactionType===mapValue);
      this.selectedTransactionType.push(Tran);
    }
    this.createTransactionForm.controls["transactionType"].setValue(this.selectedTransactionType);
  }
  
  transactionTypeOnChange(item){
    const projectTransactionTypeName = this.createTransactionForm.get('projectTransactionTypeName');
    if (item['id'] != '') {
    projectTransactionTypeName.clearValidators();
    projectTransactionTypeName.setValidators(Validators.pattern("[^@,+,=,<,>,-].*"));
    let transactionTypeId=item['id'];
    let tranText= this.transactionTypeList.find(e=>e.id===transactionTypeId);
    let mapValue=tranText?this.transactionTypeMapList[tranText.transactionType]:"";
    this.selectedCounterTransactionType = [];
    if(mapValue)
    {
      let cTran=this.transactionTypeList.find(e=>e.transactionType===mapValue);
      this.selectedCounterTransactionType.push(cTran);
    }
    this.createTransactionForm.controls["counterpartyTransactionType"].setValue(this.selectedCounterTransactionType);
  }
  else {
    if (projectTransactionTypeName.value == "") {
      projectTransactionTypeName.setValidators(Validators.required);
    }
  }
  projectTransactionTypeName.updateValueAndValidity();
}

  
}



