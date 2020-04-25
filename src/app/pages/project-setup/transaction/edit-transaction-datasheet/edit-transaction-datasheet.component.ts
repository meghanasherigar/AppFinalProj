import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { NbDialogRef } from '@nebular/theme';
import { Entities, Currency, TransactionType, Country } from '../../../../@models/user';
import { CountryService } from '../../../../shared/services/country.service';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-edit-transaction-datasheet',
  templateUrl: './edit-transaction-datasheet.component.html',
  styleUrls: ['./edit-transaction-datasheet.component.scss']
})
export class EditTransactionDatasheetComponent implements OnInit {
  transactionForm: FormGroup;
  entityList = [];
  entityFilterList = [];
  transactionTypeList = [];
  transactionTypeMapList: any;
  transactionCurrency: Currency[];
  transactionTaxableYearEndList = [];
  counterPartyTaxableYearEndList = [];
  legalEntityCountryList = [];
  counterPartyCountryList = [];
  bulkTransaction = [];

  constructor(private transacionService: TransactionService,
    private formBuilder: FormBuilder,
    private shareDetailService: ShareDetailService,
    protected ref: NbDialogRef<any>,
    private countryService: CountryService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService, 
    private translate: TranslateService,
  ) { }
  loaderId='EditTransactionDataSheetLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';
  ngOnInit() {
    this.transactionForm = this.formBuilder.group({
      transactions: this.formBuilder.array([])
    });
    const project = this.shareDetailService.getORganizationDetail();
    this.countryService.getAllEntities(project.projectId).subscribe(
      entities => {
        entities.forEach(e => {
          let entity = new Entities();
          entity.entityId = e.entityId;
          entity.legalEntityName = e.legalEntityName;
          if (this.entityList.find(x => x.legalEntityName == entity.legalEntityName)) {
          }
          else {
            this.entityList.push(entity);
          }
        });
        this.entityFilterList = entities;
        this.countryService.getalltransactiontypesmap().subscribe(data => {
          this.transactionTypeMapList = data;
        });
        this.countryService.getalltransactiontypes().subscribe(ttype => {
          this.transactionTypeList = ttype;


          this.countryService.getAllCurrency().subscribe(
            data => {
              this.transactionCurrency = data;
              this.transacionService.transactionList.forEach((element) => {

                let tYear = [];
                this.entityFilterList.forEach(entity => {
                  if (entity.legalEntityName === element.legalEntityName) {
                    let selectedtyear = { year: '' };
                    selectedtyear.year = moment(entity.taxableYearEnd).local().format("DD MMM YYYY");
                    tYear.push(selectedtyear);
                  }
                });
                this.transactionTaxableYearEndList.push(tYear);

                let ctYear = [];
                this.entityFilterList.forEach(entity => {
                  if (entity.legalEntityName === element.counterpartyLegalEntityName) {
                    let selectedtyear = { year: '' };
                    selectedtyear.year = moment(entity.taxableYearEnd).local().format("DD MMM YYYY");
                    ctYear.push(selectedtyear);
                  }
                });
                if (ctYear.length == 0) {
                  let selectedtyear = { year: '' };
                  ctYear.push(selectedtyear);
                }

                this.counterPartyTaxableYearEndList.push(ctYear);

                let tCountry = [];
                this.entityFilterList.forEach(entity => {
                  if (entity.legalEntityName === element.legalEntityName) {
                    let selectedCountry = new Country()
                    selectedCountry.Id = entity.countryId;
                    selectedCountry.Country = entity.countryName;
                    tCountry.push(selectedCountry);
                  }
                });
                this.legalEntityCountryList.push(tCountry);

                let ctCountry = [];
                this.entityFilterList.forEach(entity => {
                  if (entity.legalEntityName === element.counterpartyLegalEntityName) {
                    let selectedCountry = new Country()
                    selectedCountry.Id = entity.countryId;
                    selectedCountry.Country = entity.countryName;
                    ctCountry.push(selectedCountry);
                  }
                });
                if (ctCountry.length == 0) {
                  let selectedCountry = new Country()
                  ctCountry.push(selectedCountry);
                }

                this.counterPartyCountryList.push(ctCountry);

                let fg = this.transactionFormGroup();

                let ent: Entities[];
                let ent1: Entities[];
                ent = this.getEntities(element.legalEntityName, this.entityList);
                if (ent.length > 0) {
                  fg.controls["legalEntityName"].setValue(ent[0].entityId);
                  fg.controls["legalEntityCountry"].setValue(element.countryId);
                  fg.controls["entityTransactionTaxableYearEnd"].setValue(moment(element.entityTransactionTaxableYearEnd).local().format("DD MMM YYYY"));
                }
                ent1 = this.getEntities(element.counterpartyLegalEntityName, this.entityList);
                if (ent1.length > 0) {
                  fg.controls["counterpartyLegalEntityName"].setValue(ent1[0].entityId);
                  fg.controls["counterPartyCountry"].setValue(element.counterpartyCountryId);
                  fg.controls["counterpartyTransactionTaxableYearEnd"].setValue(moment(element.counterpartyTransactionTaxableYearEnd).local().format("DD MMM YYYY"));
                }

                let transType: TransactionType[];
                transType = this.getTransactionTypes(element.transactionType, this.transactionTypeList);
                if (transType.length > 0)
                  fg.controls["transactionType"].setValue(transType[0].id);
                transType = this.getTransactionTypes(element.counterpartyTransactionType, this.transactionTypeList);
                if (transType.length > 0)
                  fg.controls["counterpartyTransactionType"].setValue(transType[0].id);

                fg.controls["uniqueTransactionId"].setValue(element.uniqueTransactionId);
                fg.controls["projectId"].setValue(project.projectId);
                fg.controls["projectTransactionTypeName"].setValue(element.projectTransactionTypeName);
                fg.controls["counterpartyProjectTransactionTypeName"].setValue(element.counterpartyProjectTransactionTypeName);
                fg.controls["transactionInScope"].setValue(element.transactionInScope);
                fg.controls["counterpartyTransactionInScope"].setValue(element.counterpartyTransactionInScope);
                fg.controls["overwrite"].setValue(element.overwrite);
                fg.controls["deleteTransaction"].setValue(element.deleteTransaction);
                fg.controls["deleteCounterpartyTransaction"].setValue(element.deleteCounterpartyTransaction);
                let curr: Currency[];
                curr = this.getCurrency(element.entityTransactionCurrency, this.transactionCurrency);
                if (curr.length > 0)
                  fg.controls["entityTransactionCurrency"].setValue(curr[0].id);
                curr = this.getCurrency(element.counterpartyTransactionCurrency, this.transactionCurrency);
                if (curr.length > 0)
                  fg.controls["counterpartyTransactionCurrency"].setValue(curr[0].id);
                fg.controls["entityTransactionAmount"].setValue(element.entityTransactionAmount);
                fg.controls["counterpartyTransactionAmount"].setValue(element.counterpartyTransactionAmount);

                this.transactions.push(fg);
              });
            });
        });
      });
  }

  transactionFormGroup() {
    return this.formBuilder.group({
      uniqueTransactionId: null,
      projectId: null,
      legalEntityName: ['', Validators.required],
      legalEntityCountry: ['', Validators.required],
      counterPartyCountry: [''],
      counterpartyLegalEntityName: [''],
      transactionType: [''],
      counterpartyTransactionType: [''],
      projectTransactionTypeName: [''],
      counterpartyProjectTransactionTypeName: [''],
      transactionInScope: ['', Validators.required],
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
    })
  }

  get transactions(): FormArray {
    return this.transactionForm.get('transactions') as FormArray;
  }

  onCloseDatasheet() {
    this.transacionService.refreshTransaction(true);
    this.ngxLoader.stopBackgroundLoader(this.loaderId); 
    this.ref.close();
  }
  onSaveDatasheet() {
    this.bulkSave();
  }
  getEntities(_ent: string, lstEntities: Entities[]): Entities[] {
    return lstEntities.filter(function (element, index, array) { return element.legalEntityName == _ent });
  }
  getTransactionTypes(_transactionType: string, lstTransactionType: TransactionType[]): TransactionType[] {
    return lstTransactionType.filter(function (element, index, array) { return element.transactionType == _transactionType });
  }
  getCurrency(_cur: string, lstCurrency: Currency[]): Currency[] {
    return lstCurrency.filter(function (element, index, array) { return element.currency == _cur });
  }
  legalNameOnChange(event, transaction, index) {

    let textTransLegalName = "";
    textTransLegalName = event.target.options[event.target.selectedIndex].text;
    let tYear = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === textTransLegalName) {
        let selectedtyear = { year: '' };
        selectedtyear.year = moment(entity.taxableYearEnd).local().format("DD MMM YYYY");
        tYear.push(selectedtyear);
      }
    });
    this.transactionTaxableYearEndList[index] = tYear;
    if (this.transactionTaxableYearEndList[index].length === 1) {
      this.transactions.controls[index].get('entityTransactionTaxableYearEnd').setValue((this.transactionTaxableYearEndList[index])[0].year);
    }
    else {
      this.transactions.controls[index].get('entityTransactionTaxableYearEnd').setValue('');
    }
    this.updateTransaction(event, transaction, index);

    let tCountry = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === textTransLegalName) {
        let selectedtCountry = new Country()
        selectedtCountry.Id = entity.countryId;
        selectedtCountry.Country = entity.countryName;
        tCountry.push(selectedtCountry);
      }
    });
    this.legalEntityCountryList[index] = tCountry;

    if (this.legalEntityCountryList[index].length === 1) {
      this.transactions.controls[index].get('legalEntityCountry').setValue((this.legalEntityCountryList[index])[0].Id);
    }
    else {
      this.transactions.controls[index].get('legalEntityCountry').setValue('');
    }
    this.updateTransaction(event, transaction, index);
  }
  counterpartyLegalNameOnChange(event, transaction, index) {
    let textTransLegalName = "";
    textTransLegalName = event.target.options[event.target.selectedIndex].text;
    let tYear = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === textTransLegalName) {
        let selectedtyear = { year: '' };
        selectedtyear.year = moment(entity.taxableYearEnd).local().format("DD MMM YYYY");
        tYear.push(selectedtyear);
      }
    });
    this.counterPartyTaxableYearEndList[index] = tYear;
    if (this.counterPartyTaxableYearEndList[index].length === 1) {
      this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').setValue((this.counterPartyTaxableYearEndList[index])[0].year);
    }
    else {
      this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').setValue('');
    }
    this.updateTransaction(event, transaction, index);

    let ctCountry = [];
    this.entityFilterList.forEach(entity => {
      if (entity.legalEntityName === textTransLegalName) {
        let selectedtCountry = new Country()
        selectedtCountry.Id = entity.countryId;
        selectedtCountry.Country = entity.countryName;
        ctCountry.push(selectedtCountry);
      }
    });
    this.counterPartyCountryList[index] = ctCountry;

    if (this.counterPartyCountryList[index].length === 1) {
      this.transactions.controls[index].get('counterPartyCountry').setValue((this.counterPartyCountryList[index])[0].Id);
    }
    else {
      this.transactions.controls[index].get('counterPartyCountry').setValue('');
    }
    this.updateTransaction(event, transaction, index);
  }

  counterpartyTransactionTypeOnChange(event, transaction, index) {
    let transactionTypeId = event.target['value'];
    let tranText = this.transactionTypeList.find(e => e.id === transactionTypeId);
    let mapValue = tranText ? this.transactionTypeMapList[tranText.transactionType] : "";
    if (mapValue) {
      let Tran = this.transactionTypeList.find(e => e.transactionType === mapValue);
      this.transactions.controls[index].get('transactionType').setValue(Tran.id);
    }
    else {
      this.transactions.controls[index].get('transactionType').setValue('');
    }
    this.updateTransaction(event, transaction, index);
  }

  transactionTypeOnChange(event, transaction, index) {
    let transactionTypeId = event.target['value'];
    let tranText = this.transactionTypeList.find(e => e.id === transactionTypeId);
    let mapValue = tranText ? this.transactionTypeMapList[tranText.transactionType] : "";
    if (mapValue) {
      let cTran = this.transactionTypeList.find(e => e.transactionType === mapValue);
      this.transactions.controls[index].get('counterpartyTransactionType').setValue(cTran.id);
    }
    else {
      this.transactions.controls[index].get('counterpartyTransactionType').setValue('');
    }
    this.updateTransaction(event, transaction, index);
  }

  updateTransaction(event, transaction, index) {
    this.validation(index);
    if (!transaction['valid'])
      return;

    let transactionData = transaction.value;

    this.legalEntityCountryList[index].forEach(country => {
      if (country.Id === transactionData.legalEntityCountry) {
        transactionData.countryId = country.Id;
        transactionData.countryName = country.Country;
      }
    });
    this.counterPartyCountryList[index].forEach(country => {
      if (country.Id === transactionData.counterPartyCountry) {
        transactionData.counterpartyCountryId = country.Id;
        transactionData.counterpartyCountryName = country.Country;
      }
    });


    let _legalEntityName = transactionData.legalEntityName;
    this.entityFilterList.forEach(entity => {
      if (entity.entityId === _legalEntityName) {
        transactionData.legalEntityName = entity.legalEntityName;
      }
    });
    let _counterpartyLegalEntityName = transactionData.counterpartyLegalEntityName;
    this.entityFilterList.forEach(entity => {
      if (entity.entityId === _counterpartyLegalEntityName) {
        transactionData.counterpartyLegalEntityName = entity.legalEntityName;
      }
    });

    transactionData.transactionInScope = (transactionData.transactionInScope == "Yes" ? true : (transactionData.transactionInScope == "No") ? false : null);
    transactionData.counterpartyTransactionInScope = (transactionData.counterpartyTransactionInScope == "Yes" ? true : (transactionData.counterpartyTransactionInScope == "No") ? false : null);

    const j = this.bulkTransaction.findIndex(_item => _item.uniqueTransactionId === transactionData.uniqueTransactionId);
    if (j > -1) 
      this.bulkTransaction[j] = transactionData;
    else 
      this.bulkTransaction.push(transactionData);

  }

  validation(index) {
    if (this.transactions.controls[index].get('counterpartyTransactionCurrency').value != ""
      || this.transactions.controls[index].get('counterpartyTransactionInScope').value != ""
      || this.transactions.controls[index].get('counterpartyProjectTransactionTypeName').value != ""
      || this.transactions.controls[index].get('counterpartyTransactionAmount').value != "") {
      if (!this.transactions.controls[index].get('counterpartyLegalEntityName').validator)
        this.transactions.controls[index].get('counterpartyLegalEntityName').setValidators([Validators.required])
    }
    else {
      this.transactions.controls[index].get('counterpartyLegalEntityName').clearValidators();
    }
    this.transactions.controls[index].get('counterpartyLegalEntityName').updateValueAndValidity();

    if (this.transactions.controls[index].get('counterpartyLegalEntityName').value != "") {
      if (!this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').validator)
        this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').setValidators([Validators.required])
      if (!this.transactions.controls[index].get('counterpartyTransactionInScope').validator)
        this.transactions.controls[index].get('counterpartyTransactionInScope').setValidators([Validators.required])
      if (!this.transactions.controls[index].get('counterPartyCountry').validator)
        this.transactions.controls[index].get('counterPartyCountry').setValidators([Validators.required])
    }
    else {
      this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').clearValidators();
      this.transactions.controls[index].get('counterpartyTransactionInScope').clearValidators();
      this.transactions.controls[index].get('counterPartyCountry').clearValidators();
    }
    this.transactions.controls[index].get('counterpartyTransactionTaxableYearEnd').updateValueAndValidity();
    this.transactions.controls[index].get('counterpartyTransactionInScope').updateValueAndValidity();
    this.transactions.controls[index].get('counterPartyCountry').updateValueAndValidity();

    if (this.transactions.controls[index].get('legalEntityName').value != "") {
      const transactionType = this.transactions.controls[index].get('transactionType');
      const projectTransactionTypeName = this.transactions.controls[index].get('projectTransactionTypeName');
      if (transactionType.value == "") {
        if (projectTransactionTypeName.value == "") {
          projectTransactionTypeName.setValidators(Validators.required);
        }
      }
      else {
        projectTransactionTypeName.clearValidators();
      }
      projectTransactionTypeName.updateValueAndValidity();
    }
    if (this.transactions.controls[index].get('counterpartyLegalEntityName').value != "") {
      const counterpartyTransactionType = this.transactions.controls[index].get('counterpartyTransactionType');
      const counterpartyProjectTransactionTypeName = this.transactions.controls[index].get('counterpartyProjectTransactionTypeName');
      if (counterpartyTransactionType.value == "") {
        if (counterpartyProjectTransactionTypeName.value == "") {
          counterpartyProjectTransactionTypeName.setValidators(Validators.required);
        }
      }
      else {
        counterpartyProjectTransactionTypeName.clearValidators();
      }
      counterpartyProjectTransactionTypeName.updateValueAndValidity();
    }

  }
  bulkSave() {
    this.ngxLoader.startBackgroundLoader(this.loaderId); 
    let count=this.bulkTransaction.length;
    if(count===0)
    {
      this.onCloseDatasheet();
    }
    this.bulkTransaction.forEach((transactionData) => {
      this.transacionService.editTransaction(transactionData)
        .pipe(first())
        .subscribe(
          response => {
            if (response.status === ResponseStatus.Sucess) {
              this.toastr.success(this.translate.instant('screens.project-setup.transaction.transaction-delete.TransactionUpdatedSuccess'));
            } else {
              this.toastr.warning(response.errorMessages[0]);
            }
            count--;
            if(count===0)
            {
              this.onCloseDatasheet();
            }
          },
          error => {
            count--;
            if(count===0)
            {
              this.onCloseDatasheet();
            }
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          });
    });
  }

}
