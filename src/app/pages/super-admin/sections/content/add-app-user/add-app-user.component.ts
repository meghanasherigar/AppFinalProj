import { Component, NgModule, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppUserAddRequestViewModel, AddAppUserFormControls, ActionOnAppUsers } from '../../../../../@models/super-admin/appUsers';
import { AppUsersService } from '../../../services/app-users.service';
import { Subscription } from 'rxjs';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-add-app-user',
  templateUrl: './add-app-user.component.html',
  styleUrls: ['./add-app-user.component.scss']
})
export class AddAppUserComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  addAppUserForm: FormGroup;
  formSubmitted = false;
  addAppUserRequestModel = new AppUserAddRequestViewModel();
  countryMaster: any;
  isValidAppUser = false;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private appUsersService: AppUsersService,
    private toastrService: ToastrService,
    private simpleDialogService: DialogService,
    private eventService: EventAggregatorService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.getCountryMaster();
  }

  initForm() {
    this.addAppUserForm = this.formBuilder.group({
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      OrganizationName: [''],
      CountryCode: [''],
      IsExternalUser: [false],
      HasAppAccess: [false],
    });
  }

  addNewAppUser() {
    //this.formSubmitted = true;
    this.isValidAppUser = false;
    this.addAppUserRequestModel.FirstName = this.addAppUserForm.controls[AddAppUserFormControls.FirstName].value;
    this.addAppUserRequestModel.LastName = this.addAppUserForm.controls[AddAppUserFormControls.LastName].value;
    this.addAppUserRequestModel.Email = this.addAppUserForm.controls[AddAppUserFormControls.Email].value;
    this.addAppUserRequestModel.OrganizationName = this.addAppUserForm.controls[AddAppUserFormControls.OrganizationName].value;
    this.addAppUserRequestModel.CountryCode = this.addAppUserForm.controls[AddAppUserFormControls.CountryCode].value;
    this.addAppUserRequestModel.IsExternalUser = this.addAppUserForm.controls[AddAppUserFormControls.IsExternalUser].value;
    this.addAppUserRequestModel.HasAppAccess = this.addAppUserForm.controls[AddAppUserFormControls.HasAppAccess].value;   

    this.validateAppUser();

    if (this.addAppUserForm.invalid || !this.isValidAppUser) {
      return;
    }

    this.subscriptions.add(this.appUsersService.insertOneAppUser(this.addAppUserRequestModel)
    .subscribe(
      response => {
        if (response.status === ResponseStatus.Sucess) {
          this.toastrService.success(this.translateService.instant('screens.superAdmin.appUsers.addAppUserSuccessful'));
          this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).publish(ActionOnAppUsers.addSuccessful);
        } else {
          this.simpleDialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      },
      error => {
        this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
        this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  closeAddAppUserComponent() {
    this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).publish(ActionOnAppUsers.cancelAddUser);
  }

  getCountryMaster() {
    this.subscriptions.add(this.appUsersService.getAppUsersCountryMaster()
    .subscribe(
      response => {
        this.countryMaster = response;
      },
      error => {
        this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
        this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  validateAppUser() {
    if (!this.addAppUserRequestModel.FirstName) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.firstNameRequired'));
      return;
    } else if (!this.addAppUserRequestModel.LastName) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.lastNameRequired'));
      return;
    } else if (!this.addAppUserRequestModel.Email) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.emailRequired'));
      return;
    } else if (!this.isValidEmail(this.addAppUserRequestModel.Email)) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.emailInvalid'));
      return;
    } else if (!this.addAppUserRequestModel.OrganizationName) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.organizationNameRequired'));
      return;
    } else if (!this.addAppUserRequestModel.IsExternalUser && !this.addAppUserRequestModel.CountryCode) {
      this.simpleDialogService.Open(DialogTypes.Warning, this.translateService.instant('screens.superAdmin.addAppUser.labels.countryCodeRequiredForInternalUser'));
    }

    this.isValidAppUser = true;
  }

  isValidEmail(email: string) {
    let regexp = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,3}$");

    return regexp.test(email);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
