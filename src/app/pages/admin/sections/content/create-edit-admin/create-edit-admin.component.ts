import { Component, OnInit, Input ,ElementRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { ManageAdminService } from '../../../services/manage-admin.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { AdminUserModel, SearchViewModel, UserRoleViewModel, AdminUserGridData, AdminUserEventPayload } from '../../../../../@models/admin/manageAdmin';
import { Subscription } from 'rxjs';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { DialogTypes,Dialog } from '../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import { AppliConfigService } from '../../../../../shared/services/appconfig.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'ngx-create-edit-admin',
  templateUrl: './create-edit-admin.component.html',
  styleUrls: ['./create-edit-admin.component.scss']
})
export class CreateEditAdminComponent implements OnInit {
  @Input() editAdminUserFlag: boolean;
  subscriptions: Subscription = new Subscription();
  formSubmitted = false;
  userInvalid = false;
  createAdminUserForm: FormGroup;
  searchUserForm: FormGroup;
  searchUserResult = [];
  isGlobalAdminChecked=false;
  isCountryAdminChecked=false;
  disableCreateButton: boolean = false;
  adminUserData: AdminUserModel = new AdminUserModel();
  searchViewModel: SearchViewModel = new SearchViewModel();
  adminUserEventPayload: AdminUserEventPayload;
  private dialogTemplate: Dialog;
  constructor(
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private manageAdminService: ManageAdminService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private el: ElementRef,
    private translate:TranslateService,
    private appConfigService:AppliConfigService
  ) {

    this.adminUserEventPayload = new AdminUserEventPayload();
    this.searchUserForm = this.formBuilder.group({
      SearchUser: ['', [Validators.required]],
    });

    this.searchUserForm.controls["SearchUser"].valueChanges
      .subscribe(data => {
        this.searchViewModel.Keyword = data;
        if (data.length >= 3) {
          this.manageAdminService.searchInternalUser(this.searchViewModel)
            .subscribe(
              response => {                
                this.searchUserResult = response;
              }),
            error => {
              this.dialogService.Open(DialogTypes.Warning, error.message);
            };
        }
      });

    this.createAdminUserForm = this.formBuilder.group({
      Id: null,
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Email: ['', Validators.required],
      Country: {},
      CountryName: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.editAdminUserFlag) {
      this.populateAdminEditFormData(this.manageAdminService.selectedAdminUserRows);
    } 
   }

  createAdminUser() {
    this.formSubmitted = true;
    this.userInvalid = false;
    this.adminUserData.FirstName = this.createAdminUserForm.controls["FirstName"].value;
    this.adminUserData.LastName = this.createAdminUserForm.controls["LastName"].value;
    this.adminUserData.Email = this.createAdminUserForm.controls["Email"].value;
    //ToDo CountryId should be populated by search results
    this.adminUserData.Country = this.createAdminUserForm.controls["Country"].value;
    this.adminUserData.Roles = new UserRoleViewModel();
    this.adminUserData.Roles.IsGlobalAdmin = $("#roleDiv").find("#globalAdminCheckBox").prop('checked');
    this.adminUserData.Roles.IsCountryAdmin = $("#roleDiv").find("#countryAdminCheckBox").prop('checked');
    this.validateUser();

    if (this.createAdminUserForm.invalid || this.userInvalid) {
      return;
    }
    this.disableCreateButton=true;
    this.subscriptions.add(this.manageAdminService.insertAdminUser(this.adminUserData)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.manage-admin.labels.adminUserCreatedSuccesfully'));
           
            this.closeCreateEditAdminUser();
            this.adminUserEventPayload.Action = "LoadUsers";
            this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
           this. disableCreateButton= false;
          }
          this.manageAdminService.selectedAdminUserRows = [];
          this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  populateAdminEditFormData(selectedAdminUser: AdminUserGridData[]) {
    let adminUser = selectedAdminUser[0];

    let fullName = adminUser["Name"].split(" ");
    let lastName = fullName[fullName.length - 1];
    let firstName = fullName[0];
    for (let index = 1; index < fullName.length - 1; index++) {
      firstName += ' ' + fullName[index];
    }

    let roles = adminUser["Role"];
    if (roles) {
      if (roles.toLowerCase().includes('global'))
        $("#roleDiv").find("#globalAdminCheckBox").prop('checked', true);
      if (roles.toLowerCase().includes('country'))
        $("#roleDiv").find("#countryAdminCheckBox").prop('checked', true);
    }

    this.createAdminUserForm.controls["Id"].setValue(adminUser["Id"]);
    this.createAdminUserForm.controls["LastName"].setValue(lastName);
    this.createAdminUserForm.controls["FirstName"].setValue(firstName);
    this.createAdminUserForm.controls["Email"].setValue(adminUser["Email"]);
    this.createAdminUserForm.controls["CountryName"].setValue(adminUser["Country"]);    
    this.isGlobalAdminChecked=$("#globalAdminCheckBox").is(':checked');    
    this.isCountryAdminChecked=$("#countryAdminCheckBox").is(':checked');
  }

  updateAdminUser() {
    this.formSubmitted = true;
    this.adminUserData.Id = this.createAdminUserForm.controls["Id"].value;
    this.adminUserData.Email = this.createAdminUserForm.controls["Email"].value;
    this.adminUserData.Roles = new UserRoleViewModel();
    this.adminUserData.Roles.IsGlobalAdmin = $("#roleDiv").find("#globalAdminCheckBox").prop('checked');
    this.adminUserData.Roles.IsCountryAdmin = $("#roleDiv").find("#countryAdminCheckBox").prop('checked');
    this.validateUser();

    if (this.userInvalid) {
      return;
    }
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Update;
    this.translate.get(['screens.home.labels.updateConfirmationMsg'])
    .subscribe(translations => {
      this.dialogTemplate.Message=translations['screens.home.labels.updateConfirmationMsg'];      
    });
    // this.dialogTemplate.Message = "Are you sure you want to save your changes?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
    
    this.subscriptions.add(this.manageAdminService.updateAdminUser(this.adminUserData)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.manage-admin.labels.adminUpdatedSuccesfully'));
            this.closeCreateEditAdminUser();
            this.adminUserEventPayload.Action = "LoadUsers";
            this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.manageAdminService.selectedAdminUserRows = [];
          this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
      }
      });
  }

  closeCreateEditAdminUser() {
    this.adminUserEventPayload.Action = "Cancel";
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish("Cancel");
  }

  validateUser() {
    this.userInvalid = false;
    if (!(this.adminUserData.Roles.IsGlobalAdmin || this.adminUserData.Roles.IsCountryAdmin)) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.manage-admin.labels.selectOneRole'));
      this.userInvalid = true;
    }
  }

  get form() { return this.createAdminUserForm.controls; }

  populateUserDetails(item) {
    this.createAdminUserForm.controls["FirstName"].setValue(item.firstName);
    this.createAdminUserForm.controls["LastName"].setValue(item.lastName);
    this.createAdminUserForm.controls["Email"].setValue(item.email);
    this.createAdminUserForm.controls["CountryName"].setValue(item.country.countryName);
    this.createAdminUserForm.controls["Country"].setValue(item.country);
  }
  adminCheckBoxChange(event)
  {  
      this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disable-section");
      this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disabledbutton");
   
  
  }
  
  
}
