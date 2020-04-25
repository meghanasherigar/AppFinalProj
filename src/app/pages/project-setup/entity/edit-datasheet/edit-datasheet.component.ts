import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { EntitiesService } from '../entity.service';
import { LocalDataSource } from '../../../../@core/components/ng2-smart-table';
import { Entity, EntityContact } from '../../../../@models/entity';
import { CountryService } from '../../../../shared/services/country.service';
import * as moment from 'moment';
import { CountryList } from '../../../../@models/user';
import { element } from '@angular/core/src/render3';
import { EditCountryViewModel } from '../../../../@models/userAdmin';
import { stringify } from 'querystring';
import { first } from 'rxjs/operators';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogService } from '../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../@models/common/dialog';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, FormControl, FormControlDirective, FormControlName } from '@angular/forms';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { NbDialogRef} from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-edit-datasheet',
  templateUrl: './edit-datasheet.component.html',
  styleUrls: ['./edit-datasheet.component.scss']
})
export class EditDatasheetComponent implements OnInit {
  dataSource: LocalDataSource = new LocalDataSource();
  reportTiers: any;
  entityList: Entity[];
  countries: CountryList[];
  dropdownCountrySettings: {};
  selectedItems = [];
  employeeName = [];
  employeeEmail = [];
  entityOthersVisible = [];
  entityForm: FormGroup;
  bulkEntity = [];

  constructor(
    private tservice: EntitiesService,
    private countryService: CountryService,
    private dialogService: DialogService,
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private shareDetailService: ShareDetailService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService, 
    private translate: TranslateService,
  ) { }
  loaderId='EditEntityDataSheetLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.entityForm = this.formBuilder.group({
      entities: this.formBuilder.array([])
    });

    this.dropdownCountrySettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.countryService.getAllCountriesList().subscribe((data) => {
      this.countries = data;
      this.countryService.getAllTiers().subscribe(
        tier => {
          this.reportTiers = tier;

          const Project = this.shareDetailService.getORganizationDetail()
          this.tservice.entityList.forEach((elementi, indexi) => {
            data.forEach((elementj, indexj) => {
              if (elementi.country === elementj.country) {
                let entitycountry = [];
                let selectedCountry = { id: '', country: '' };
                selectedCountry.id = elementj.id;
                selectedCountry.country = elementj.country;
                entitycountry.push(selectedCountry);
                this.selectedItems.push(entitycountry);
              }
            });

            let con = elementi.employeeName.split(';');
            let eName = [];
            for (var i = 0; i < 3; i++) {
              let conArr = new EntityContact();
              conArr.contact = (con[i]) ? con[i] : "";
              conArr.isPrimary = conArr.contact === elementi.primaryContact ? true : false
              eName.push(conArr);
            }
            this.employeeName.push(eName);

            let email = elementi.employeeEmail.split(';');

            let eEmail = [];
            for (var i = 0; i < 3; i++) {
              let emailArr = new EntityContact();
              emailArr.contact = (email[i]) ? email[i] : "";
              emailArr.isPrimary = emailArr.contact === elementi.primaryContactEmail ? true : false
              eEmail.push(emailArr);
            }
            this.employeeEmail.push(eEmail);

            let other = new EntityContact();
            other.contact = "";
            var selectedReportTierName="";
            if (elementi.reportTier) {
              var selectedReportTierId = '';
              selectedReportTierId = elementi.reportTier.id;
              selectedReportTierName = this.reportTiers.filter(item => item.id == selectedReportTierId)[0].reportTier;
              if (selectedReportTierName == "Other") {
                other.contact = elementi.reportTier.reportTier
                other.isPrimary = true;
                this.entityOthersVisible.push(other);

              }
              else {
                other.isPrimary = false;
                this.entityOthersVisible.push(other);
              }
            }
            else {
              other.isPrimary = false;
              this.entityOthersVisible.push(other);
            }

            let fg = this.entityFormGroup();
            fg.controls["Id"].setValue(elementi.id);
            fg.controls["ProjectId"].setValue(Project.projectId);
            fg.controls["LegalEntityName"].setValue(elementi.legalEntityName);
            fg.controls["EntityShortName"].setValue(elementi.entityShortName);
            fg.controls["Country"].setValue(elementi.country);

            if (elementi.reportTier != null) {
              fg.controls["ReportTierId"].setValue(elementi.reportTier.id);
              if (selectedReportTierName == "Other") {
                fg.controls["OtherReportTier"].setValue(elementi.reportTier.reportTier);
              }
            }
            fg.controls["TaxableYearEnd"].setValue(this.toDate(elementi.taxableYearEnd));
            fg.controls["LocalAddress"].setValue(elementi.localAddress);
            fg.controls["TaxOffice"].setValue(elementi.taxOffice);
            fg.controls["TaxOfficeAddress"].setValue(elementi.taxOfficeAddress);
            fg.controls["TaxId"].setValue(elementi.taxId);
            fg.controls["Scope"].setValue(elementi.scope);
            fg.controls["PrimaryContact"].setValue(elementi.primaryContactEmail);
            fg.controls["PrimaryContactEmail"].setValue(elementi.primaryContactEmail);
            this.entities.push(fg);

          });
        });
    });
  }

  entityFormGroup() {
    return this.formBuilder.group({
      Id: null,
      ProjectId: null,
      LegalEntityName: ['', Validators.required],
      EntityShortName: [''],
      Country: ['', Validators.required],
      TaxableYearEnd: ['', Validators.required],
      ReportTierId: {},
      LocalAddress: [''],
      TaxOffice: [''],
      TaxOfficeAddress: [''],
      EmployeeName: [''],
      EmployeeEmail: [''],
      EmployeeName2: [''],
      EmployeeEmail2: [''],
      EmployeeName3: [''],
      EmployeeEmail3: [''],
      TaxId: [''],
      PrimaryContact: [''],
      PrimaryContactEmail: [''],
      Overwrite: false,
      Scope: ['', Validators.required],
      Delete: false,
      OtherReportTier: ['']
    })
  }

  get entities(): FormArray {
    return this.entityForm.get('entities') as FormArray;
  }
  getDate(date) {
    return moment(date).local().format('DD MMM YYYY');
  }
  getContact(data, index) {
    let con = data.split(';');
    return (con[index]) ? con[index] : "";
  }
  others(event, entity, index) {
    var selectedReportTierName = this.reportTiers.filter(item => item.id == this.entities.controls[index].get('ReportTierId').value)[0].reportTier;
    if (selectedReportTierName == "Other")
    {
      this.entityOthersVisible[index].isPrimary = true;
    }
    else
    {
      this.entityOthersVisible[index].isPrimary = false;
      this.entities.controls[index].get('OtherReportTier').setValue("");
    }

    this.updateEntity(event,entity,index,'');
  }
  toDate(dateStr: any) {
    return new Date(moment.utc(dateStr).local().format('DD MMM YYYY'));
  }
  updateEntity(event, entity, index, field) {
    this.validation(index);
    let editEntity = entity.value;

    editEntity.EmployeeName = "";
    editEntity.EmployeeEmail = "";
    editEntity.PrimaryContact = "";
    editEntity.PrimaryContactEmail="";
    for (var i = 0; i < 3; i++) {
      if ((this.employeeName[index])[i].contact != "" && (this.employeeEmail[index])[i].contact != "") {
        editEntity.EmployeeName += (this.employeeName[index])[i].contact + ";";
        editEntity.EmployeeEmail += (this.employeeEmail[index])[i].contact + ";";
        if ((this.employeeEmail[index])[i].contact === this.entities.controls[index].get('PrimaryContact').value) {
          (this.employeeEmail[index])[i].isPrimary = true;
          editEntity.PrimaryContact = (this.employeeName[index])[i].contact;
          editEntity.PrimaryContactEmail = (this.employeeEmail[index])[i].contact;
        }
      }
    }
    if (editEntity.EmployeeName) {
      if (!this.entities.controls[index].get('PrimaryContact').validator)
        this.entities.controls[index].get('PrimaryContact').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('PrimaryContact').clearValidators();
    }
    this.entities.controls[index].get('PrimaryContact').updateValueAndValidity();


    if (!entity['valid']) {
      return;
    }

    this.entities.controls[index].get('PrimaryContact').setValue(editEntity.PrimaryContactEmail);
    this.entities.controls[index].get('PrimaryContactEmail').setValue(editEntity.PrimaryContactEmail);

    editEntity.Country = (this.selectedItems[index])[0].id;

    if (this.entities.controls[index].get('ReportTierId').value.length) {
      editEntity.ReportTier = {};
      editEntity.ReportTier.Id = this.entities.controls[index].get('ReportTierId').value;
      editEntity.ReportTier.ReportTier = this.entities.controls[index].get('OtherReportTier').value;
    }

    const j = this.bulkEntity.findIndex(_item => _item.Id === editEntity.Id);
    if (j > -1) this.bulkEntity[j] = editEntity;
    else this.bulkEntity.push(editEntity);
  }
  validation(index) {
    //Contact 1
    if (this.entities.controls[index].get('EmployeeName').value != "") {
      if (!this.entities.controls[index].get('EmployeeEmail').validator)
        this.entities.controls[index].get('EmployeeEmail').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeEmail').clearValidators();
    }
    this.entities.controls[index].get('EmployeeEmail').updateValueAndValidity();


    if (this.entities.controls[index].get('EmployeeEmail').value != "") {
      if (!this.entities.controls[index].get('EmployeeName').validator)
        this.entities.controls[index].get('EmployeeName').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeName').clearValidators();
    }
    this.entities.controls[index].get('EmployeeName').updateValueAndValidity();


    //Contact 2

    if (this.entities.controls[index].get('EmployeeName2').value != "") {
      if (!this.entities.controls[index].get('EmployeeEmail2').validator)
        this.entities.controls[index].get('EmployeeEmail2').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeEmail2').clearValidators();
    }
    this.entities.controls[index].get('EmployeeEmail2').updateValueAndValidity();


    if (this.entities.controls[index].get('EmployeeEmail2').value != "") {
      if (!this.entities.controls[index].get('EmployeeName2').validator)
        this.entities.controls[index].get('EmployeeName2').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeName2').clearValidators();
    }
    this.entities.controls[index].get('EmployeeName2').updateValueAndValidity();

    //Contact 3

    if (this.entities.controls[index].get('EmployeeName3').value != "") {
      if (!this.entities.controls[index].get('EmployeeEmail3').validator)
        this.entities.controls[index].get('EmployeeEmail3').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeEmail3').clearValidators();
    }
    this.entities.controls[index].get('EmployeeEmail3').updateValueAndValidity();


    if (this.entities.controls[index].get('EmployeeEmail3').value != "") {
      if (!this.entities.controls[index].get('EmployeeName3').validator)
        this.entities.controls[index].get('EmployeeName3').setValidators([Validators.required])
    }
    else {
      this.entities.controls[index].get('EmployeeName3').clearValidators();
    }
    this.entities.controls[index].get('EmployeeName3').updateValueAndValidity();

  }

  bulkSave()
  {
    this.ngxLoader.startBackgroundLoader(this.loaderId); 
    let count=this.bulkEntity.length;
    if(count===0)
    {
      this.onCloseDatasheet();
    }
    this.bulkEntity.forEach((editEntity)=>{
      this.tservice.editEntity(editEntity)
      .pipe(first())
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.entity.entity-create.RecordUpdatedSuccessfully'));
          } else {
            this.toastr.warning(response.errorMessages[0]);
          }
          count--;
          if(count===0)
            this.onCloseDatasheet();
        },
        error => {
          count--;
          if(count===0)
            this.ref.close();
          this.dialogService.Open(DialogTypes.Error, "Error Occured");
        });
    });
  }

  onCloseDatasheet() {
    this.tservice.refreshEntity(true);
    this.ngxLoader.stopBackgroundLoader(this.loaderId); 
    this.ref.close();
  }
  onSaveDatasheet() {
    this.bulkSave();
  }
}
