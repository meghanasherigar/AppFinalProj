import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AlertService } from '../../../shared/services/alert.service';
import { Country, Region, Entity } from '../../../@models/user';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { RegionService } from '../../../shared/services/region.service';
import { CountryService } from '../../../shared/services/country.service';
import { EntityService } from '../../../shared/services/entity.service';
import { UserService } from '../user.service';


@Component({
  selector: 'ngx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  createUserForm: FormGroup;
  regions: Region[];
  countries: Country[];
  entities: Entity[];
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private regionService: RegionService,
    private countryService: CountryService,
    private entityService: EntityService,
    private alertService: AlertService) { }

  ngOnInit() {
    this.countryService.getAllCountries().subscribe(
      data => {
        this.countries = data;
        this.createUserForm.controls['countryControl'].patchValue(
          this.countries[0]);
      }, error => this.alertService.error('Error: Get countries failed'));

    this.entityService.getAllEntities('').subscribe(
      data => {
        this.entities = data;
        this.createUserForm.controls['entityControl'].patchValue(
          this.entities[0]);
      }, error => this.alertService.error('Error: Get entities failed'));

      this.regionService.getAllRegions('').subscribe(
        data => {
          this.regions = data;
          this.createUserForm.controls['regionControl'].patchValue(
            this.regions[0]);
        }, error => this.alertService.error('Error: Get regions failed'));

    this.createUserForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      email: ['', [Validators.required, Validators.email]],
      isCentralUser: [''],
      isLocalUser: [''],
      Country: {},
      regionControl: {},
      entityControl: {},
      regions: this.formBuilder.array([]),
      entities: this.formBuilder.array([]),
      countries: this.formBuilder.array([]),
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.createUserForm.controls; }

  // countryChanged(filterVal: any) {
  //   if (filterVal == "0")
  //     this.forecasts = this.cacheForecasts;
  //   else
  //     this.forecasts = this.cacheForecasts.filter((item) => item.summary == filterVal);
  // }

  countryChanged(filterVal: any) {
  }

  entityChanged(filterVal: any) {
  }

  regionChanged(filterVal: any) {
  }

  addMessage() {
    this.alertService.error('Error: Get regions failed');
  }

  onSubmit() {
    this.alertService.clear();
    this.submitted = true;
    // stop here if form is invalid
    if (this.createUserForm.invalid) {
            return;
    }

    this.loading = true;
    this.userService.createUser(this.createUserForm.value)
            .pipe(first())
            .subscribe(
                response => {
                    if (response.status === ResponseStatus.Sucess) {
                      this.alertService.success(response.errorMessages[0]);
                      this.router.navigate(['/userList']);
                    } else {
                      this.alertService.success(response.errorMessages[0]);
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

  ngOnDestroy() {

  }
}
