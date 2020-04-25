import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
// import { NbDialogRef } from '@nebular/theme';
import { CountryService } from '../../../../shared/services/country.service';
import { Country, Employees, ReportTier } from '../../../../@models/user';
import { Entity } from '../../../../@models/entity';
import { AlertService } from '../../../../shared/services/alert.service';
import { EntitiesService } from '../entity.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { first, filter } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DatePipe } from '@angular/common'
import 'rxjs/add/operator/debounceTime';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
declare var $: any;
import { DialogService } from '../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';




@Component({
  moduleId: module.id,
  selector: 'ngx-create-edit-entity',
  templateUrl: './create-edit-entity.component.html',
  styleUrls: ['./create-edit-entity.component.scss']
})
export class CreateEditEntityComponent implements OnInit {
  private subject = new Subject<Country[]>();
  @Input() editEntityRow: Entity[];
  @Input() editChildFlag: string;
  @Output() manageEntity: EventEmitter<any> = new EventEmitter();
  @Output() CancelEntity: EventEmitter<any> = new EventEmitter();
  creatEnityForm: FormGroup;//form name for entity
  submitted = false;//added local variable submitted to check whether the value is valid or not

  countries: Country[];
  reportTiers: any;
  selectedValue: string;
  searchResult = [];
  entityData: Entity;
  employees: any = [];
  obj: Employees;
  contactName: any;
  contactEmail: any;
  countid = 0;
  countVal: any;
  reportTierSelected: ReportTier;
  entityOthersVisible: boolean;
  selectedReportTier: string;

  constructor(
    private datepipe: DatePipe,
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    private alertService: AlertService,
    private entitiesService: EntitiesService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private readonly _eventService: EventAggregatorService,
    private el: ElementRef,
    private ngxLoader: NgxUiLoaderService,
    private shareDetailService: ShareDetailService,
    private dialogService: DialogService,
    private dialog: MatDialog
      ) {

    const Project = this.shareDetailService.getORganizationDetail()

    this.creatEnityForm = this.formBuilder.group({
      Id: null,
      // ProjectId: 'DigiDox3.0',
      ProjectId: Project.projectId,
      LegalEntityName: ['',[Validators.required, Validators.pattern("[^@,+,=,<,>,-].*")]],
      EntityShortName: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
      Country: ['', Validators.required],
      TaxableYearEnd: ['', Validators.required],
      ReportTierId: {},
      LocalAddress: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
      TaxOffice: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
      TaxOfficeAddress: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
      EmployeeName: ['', [Validators.pattern("[^@,+,=,<,>,-].*")]],
      EmployeeEmail: ['', [Validators.pattern("[^@,+,=,<,>,-].*")]],
      TaxId: ['',[Validators.pattern("[^@,+,=,<,>,-].*")]],
      PrimaryContact: [''],
      PrimaryContactEmail: [''],
      Overwrite: false,
      Scope: ['', Validators.required],
      Delete: false,
      OtherReportTier: ['']
    });
    this.creatEnityForm.controls["Country"].valueChanges
      .subscribe(data => {
        this.countryService.search_word(data).subscribe(response => {
          this.searchResult = response
        })
      })

  }
  loaderId='CreateEditEntityLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    
    // this.alertService.clear();
    this.countryService.getAllTiers().subscribe(
      data => {
        this.reportTiers = data;
        if (this.editChildFlag) {
          this.entityData = this.creatEnityForm.value;
          this.creatEnityForm.controls["Id"].setValue(this.editEntityRow[0]["id"]);
          this.creatEnityForm.controls["LegalEntityName"].setValue(this.editEntityRow[0]["legalEntityName"]);
          this.creatEnityForm.controls["Country"].setValue(this.editEntityRow[0]["country"]);
          if (this.editEntityRow[0].reportTier != null) {
            this.creatEnityForm.controls["ReportTierId"].setValue(this.editEntityRow[0].reportTier.id);
            this.creatEnityForm.controls["OtherReportTier"].setValue(this.editEntityRow[0].reportTier.reportTier);
            this.others();
            if (!this.entityOthersVisible) {
              this.creatEnityForm.controls["OtherReportTier"].setValue("");
            }
          }
          this.creatEnityForm.controls["TaxableYearEnd"].setValue(this.toDate(this.editEntityRow[0]["taxableYearEnd"]));
          this.creatEnityForm.controls["EntityShortName"].setValue(this.editEntityRow[0]["entityShortName"]);
          this.creatEnityForm.controls["LocalAddress"].setValue(this.editEntityRow[0]["localAddress"]);
          this.creatEnityForm.controls["TaxOffice"].setValue(this.editEntityRow[0]["taxOffice"]);
          this.creatEnityForm.controls["TaxOfficeAddress"].setValue(this.editEntityRow[0]["taxOfficeAddress"]);
          this.creatEnityForm.controls["TaxId"].setValue(this.editEntityRow[0]["taxId"]);
          this.creatEnityForm.controls["Scope"].setValue(this.editEntityRow[0]["scope"]);
          this.creatEnityForm.controls["PrimaryContact"].setValue(this.editEntityRow[0]["primaryContact"]);
          this.creatEnityForm.controls["PrimaryContactEmail"].setValue(this.editEntityRow[0]["primaryContactEmail"]);
          if (this.editEntityRow[0]["employeeName"] != "") {
            var employees = this.editEntityRow[0]["employeeName"].split(";");
            var employeeEmails = this.editEntityRow[0]["employeeEmail"].split(";");
            this.creatEnityForm.controls["EmployeeName"].setValue(employees[0]);
            this.creatEnityForm.controls["EmployeeEmail"].setValue(employeeEmails[0]);
            if (employeeEmails[0] == this.editEntityRow[0]["primaryContactEmail"]) {
              $("#rowDiv").find("#checkboxid").prop('checked', true);
            }
            for (var i = 1; i < employees.length; i++) {
              this.addEmployees();
              $("#txtEmployeeName" + this.countVal).val(employees[i]);
              $("#txtEmployeeEmail" + this.countVal).val(employeeEmails[i]);
              if (employeeEmails[i] == this.editEntityRow[0]["primaryContactEmail"]) {
                $("#dynamicDiv" + (i == 0 ? "" : i)).find("#checkboxid").prop('checked', true);
              }
            }
          }
        }
        else {
          // this.creatEnityForm.controls.clear.reset();

        }
      });


  }
  private dialogTemplate : Dialog;
  openEditConfirmDialog(): void {
    this.editEntityRecord();
  }

  getCountries(_countryName: string): Country[] {
    // The following line does not work
    return this.searchResult.filter(function (element, index, array) { return element["country"] == _countryName });
  }

  getCountriesBasedonId(_countryId: string): Country[] {
    // The following line does not work
    return this.searchResult.filter(function (element, index, array) { return element["id"] == _countryId });
  }
  getReportTier(_tierName: string): ReportTier[] {
    // The following line does not work
    return this.reportTiers.filter(function (element, index, array) { return element["reportTier"] == _tierName });
  }

  //method which will close the create entity popup
  closeCreateEntityPopup() {
    this.CancelEntity.emit();
  }

  // convenience getter for easy access to form fields in html for validations
  get form() { return this.creatEnityForm.controls; }


  // on submit or button click of create entity 
  // form elements will be send to entity service when it is valid
  createEntity() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    // this.alertService.clear();
    this.submitted = true;
    //stop here if form is invalid
    if (this.creatEnityForm.invalid) {
      return;
    }
    this.entityData = this.creatEnityForm.value;
    let country: Country[];
    country = this.getCountries(this.entityData["Country"]);
    if (country.length > 0)
      this.entityData["Country"] = country[0]["id"];
    else {
      country = this.getCountriesBasedonId(this.entityData["Country"]);
      if (country.length <= 0) {
        this.dialogService.Open(DialogTypes.Warning, "Please select valid country");
        return;
      }
    }
    if (this.entityData["ReportTierId"].length != undefined) {
      var selectedReportTierId = '';
      selectedReportTierId = this.creatEnityForm.controls["ReportTierId"].value;

      if (selectedReportTierId != "" && selectedReportTierId != undefined)
        var selectedReportTierName = this.reportTiers.filter(item => item.id == selectedReportTierId)[0].reportTier;
      this.entityData.reportTier = {};
      this.entityData.reportTier.id = selectedReportTierId;

      if (selectedReportTierName == "Other") {
        let otherTierValue = this.el.nativeElement.querySelector("#txtOtherReportTier").value;
        this.entityData.reportTier.reportTier = otherTierValue;
      }
    }
    // To send the dynamic emp name and email with comma seperated to service
    this.entityData = this.creatEnityForm.value;

    let employeeNames: string = '';
    let employeeEmails: string = '';
    this.creatEnityForm.controls["PrimaryContact"].setValue('');
    this.creatEnityForm.controls["PrimaryContactEmail"].setValue('');
    this.contactName='';
    this.contactEmail='';
    let checkboxes;
    let countValue = (this.countVal != undefined ? this.countVal : 0);
    var primarySelected = false;
    for (let i = 0; i <= countValue; i++) {
      if (!$("#txtEmployeeName" + (i == 0 ? "" : i)).val())
        continue;
      if (employeeEmails.indexOf($("#txtEmployeeEmail" + (i == 0 ? "" : i)).val()) > -1) {
        this.dialogService.Open(DialogTypes.Warning, "Please add distinct employee");
        return;
      }
      employeeNames += $("#txtEmployeeName" + (i == 0 ? "" : i)).val() + ";";
      employeeEmails += $("#txtEmployeeEmail" + (i == 0 ? "" : i)).val() + ";";

      // To get the primary contact name and email
      let initialChkbox = $("#rowDiv").find("#checkboxid");
      checkboxes = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#checkboxid");
      if (checkboxes.prop('checked')) {
        primarySelected = true;
        this.contactName = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#txtEmployeeName" + (i == 0 ? "" : i)).val();
        this.contactEmail = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#txtEmployeeEmail" + (i == 0 ? "" : i)).val();
        //this.checkbox = true;
        //$("#dynamicDiv" + (i == 0 ? "" : i)).find("#checkboxid").prop('checked',true);
      }
      else if (initialChkbox.prop('checked')) {
        primarySelected = true;
        this.contactName = $("#rowDiv").find("#txtEmployeeName").val();
        this.contactEmail = $("#rowDiv").find("#txtEmployeeEmail").val();
        //this.checkPrimary = true;
        //$("#rowDiv").find("#checkboxid").prop('checked', true);
      }
     
    }
    if (!primarySelected && countValue > -1 && employeeEmails != '') {
      this.dialogService.Open(DialogTypes.Warning, "Please select Primary Contact");
      return;
    }
    employeeNames = employeeNames.replace(/;\s*$/, "");
    employeeEmails = employeeEmails.replace(/;\s*$/, "");
    this.entityData["EmployeeName"] = employeeNames;
    this.entityData["EmployeeEmail"] = employeeEmails;
    this.entityData["PrimaryContact"] = this.contactName;
    this.entityData["PrimaryContactEmail"] = this.contactEmail;
    this.entityData["TaxableYearEnd"] = this.entityData["TaxableYearEnd"];

    this.entitiesService.createEntity(this.entityData)
      .pipe(first())

      .subscribe(
        response => {

          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.entity.entity-create.RecordCreatedSuccessfully'));
            this.manageEntity.emit();

          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            //this.toastr.warning(response.errorMessages[0]);
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        },
        
        error => {
          this.dialogService.Open(DialogTypes.Error, "Error Occured");
        });


    //this.ref.close();
  }
  editEntity() {
    this.alertService.clear();

    this.submitted = true;
    // stop here if form is invalid
    if (this.creatEnityForm.invalid) {
      return;
    }
    this.openEditConfirmDialog();
  }
    editEntityRecord(){
    this.entityData = this.creatEnityForm.value;
    let country: Country[];
    country = this.getCountries(this.entityData["Country"]);
    if (country.length > 0)
      this.entityData["Country"] = country[0]["id"];
    else {
      country = this.getCountriesBasedonId(this.entityData["Country"]);
      if (country.length <= 0) {
      this.dialogService.Open(DialogTypes.Warning, "Please select valid country");
      return;
    }
  }
    if (this.entityData["ReportTierId"].length != undefined) {
      var selectedReportTierId = '';
      selectedReportTierId = this.creatEnityForm.controls["ReportTierId"].value;
      var selectedReportTierName = this.reportTiers.filter(item => item.id == selectedReportTierId)[0].reportTier;

      this.entityData.reportTier = {};
      this.entityData.reportTier.id = selectedReportTierId;

      if (selectedReportTierName == "Other") {
        let otherTierValue = this.el.nativeElement.querySelector("#txtOtherReportTier").value;
        this.entityData.reportTier.reportTier = otherTierValue;
      }
    }


    let employeeNames: string = '';
    let employeeEmails: string = '';
    let checkboxes;
    var primarySelected = false;

    let countValue = (this.countVal != undefined ? this.countVal : 0);
    for (let i = 0; i <= countValue; i++) {

      if (!$("#txtEmployeeName" + (i == 0 ? "" : i)).val())
        continue;
      if (employeeEmails.indexOf($("#txtEmployeeEmail" + (i == 0 ? "" : i)).val()) > -1) {
        this.dialogService.Open(DialogTypes.Warning, "Please add distinct employee");
        return;
      }
      employeeNames += $("#txtEmployeeName" + (i == 0 ? "" : i)).val() + ";";
      employeeEmails += $("#txtEmployeeEmail" + (i == 0 ? "" : i)).val() + ";";

      // To get the primary contact name and email
      let initialChkbox = $("#rowDiv").find("#checkboxid");
      checkboxes = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#checkboxid");
      if (checkboxes.prop('checked')) {
        primarySelected = true;
        this.contactName = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#txtEmployeeName" + (i == 0 ? "" : i)).val();
        this.contactEmail = $("#dynamicDiv" + (i == 0 ? "" : i)).find("#txtEmployeeEmail" + (i == 0 ? "" : i)).val();
      }
      else if (initialChkbox.prop('checked')) {
        primarySelected = true;
        this.contactName = $("#rowDiv").find("#txtEmployeeName").val();
        this.contactEmail = $("#rowDiv").find("#txtEmployeeEmail").val();
      }
    }
    if (!primarySelected && countValue > -1 && employeeEmails != '') {
      this.dialogService.Open(DialogTypes.Warning, "Please select Primary Contact");
      return;
    }
    employeeNames = employeeNames.replace(/;\s*$/, "");
    employeeEmails = employeeEmails.replace(/;\s*$/, "");
    this.entityData["EmployeeName"] = employeeNames;
    this.entityData["EmployeeEmail"] = employeeEmails;
    this.entityData["PrimaryContact"] = this.contactName;
    this.entityData["PrimaryContactEmail"] = this.contactEmail;
    this.entitiesService.editEntity(this.entityData)
      .pipe(first())
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
           // this.dialogService.Open(DialogTypes.Success, "Record(s) updated succesfully");
           this.toastr.success(this.translate.instant('screens.project-setup.entity.entity-create.RecordUpdatedSuccessfully'));
           this.manageEntity.emit();
            //this.router.navigate(['/userList']);
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            //this.toastr.warning(response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Error, "Error Occured");
         // this.toastr.danger(this.translate.instant('screens.home.labels.errorMessage'));	
        });


    //this.ref.close();
  }

  //To add the employee name and email dynamically
  addEmployees() {
    var txt_name = $("#txtEmployeeName" + (this.countid == 0 ? "" : this.countid)).val();
    var txt_email = $("#txtEmployeeEmail" + (this.countid == 0 ? "" : this.countid)).val();

    if ((txt_name != "") && (txt_email != "")) {
      this.countVal = this.countid = this.countid + 1;

      if (this.countVal <= 2) {
        $("#dynamicDiv").clone().attr('id', 'dynamicDiv' + this.countVal).insertBefore("#addEmpBtn");
        $("#dynamicDiv" + this.countVal).find("#txtEmployeeName").attr('id', 'txtEmployeeName' + this.countVal);
        $("#dynamicDiv" + this.countVal).find("#txtEmployeeEmail").attr('id', 'txtEmployeeEmail' + this.countVal);
        $("#txtEmployeeName" + this.countVal).attr("formControlName", "EmployeeName" + this.countVal);
        $("#txtEmployeeEmail" + this.countVal).attr("formControlName", "EmployeeEmail" + this.countVal);
        $("#txtEmployeeName" + this.countVal).val("");
        $("#txtEmployeeEmail" + this.countVal).val("");
        // To unhighlight the textbox fields
        $("#dynamicDiv" + this.countVal).find("#txtEmployeeName" + this.countVal).on('keypress', function () {
          $(this).removeClass("highlight");
        });
        $("#dynamicDiv" + this.countVal).find("#txtEmployeeEmail" + this.countVal).on('keypress', function () {
          $(this).removeClass("highlight");
        });
        // for primary contact checkbox
        $("#dynamicDiv" + this.countVal).find("#checkboxid").click(this.checkOnlyOne);
        $("#rowDiv").find("#checkboxid").click(this.checkOnlyOne);

        if (this.countVal == 2) {
          $("#addEmpBtn").attr("disabled", "true").addClass("cursorStyle");
        }
      }
      $("#dynamicDiv" + this.countVal).removeAttr('style');
    }
    else {
      if (txt_name == "") {
        $("#txtEmployeeName" + (this.countid == 0 ? "" : this.countid)).addClass("highlight");
      }
      if (txt_email == "") {
        $("#txtEmployeeEmail" + (this.countid == 0 ? "" : this.countid)).addClass("highlight");
      }
    }
  }

  removeHighlight(e) {
    $("#txtEmployeeName" + (this.countid == 0 ? "" : this.countid)).removeClass("highlight");
    $("#txtEmployeeEmail" + (this.countid == 0 ? "" : this.countid)).removeClass("highlight");
  }


  // To check the unique primary contact
  checkOnlyOne(checkbox) {
    $('.check').not(this).prop('checked', false);
  }

  others() {
    var selectedReportTierId = '';
    selectedReportTierId = this.creatEnityForm.controls["ReportTierId"].value;
    var selectedReportTierName = this.reportTiers.filter(item => item.id == selectedReportTierId)[0].reportTier;

    if (selectedReportTierName == "Other")
      this.entityOthersVisible = true;
    else
      this.entityOthersVisible = false;
  }

  toDate(dateStr:any) {
    return new Date(moment.utc(dateStr).local().format());
  }
}
