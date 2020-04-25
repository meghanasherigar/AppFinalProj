import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { ProjectManagementService } from '../../services/project-management.service';
import { TranslateService } from '@ngx-translate/core';
import {  DeliverableReport } from '../../@models/deliverable/deliverable';
import { CountryService } from '../../../../shared/services/country.service';
import { ProjectDeliverableService } from '../../services/project-deliverable.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-create-deliverable',
  templateUrl: './create-deliverable.component.html',
  styleUrls: ['./create-deliverable.component.scss']
})
export class CreateDeliverableComponent implements OnInit {

  //ngx-ui-loader configuration
  loaderId = 'CreateDeliverableLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  createDeliverableForm: FormGroup;
  submitted: boolean = false;
  

  //This will be passed as context from deliverable grid list component
  projectId:string;

  matchedCountries = [];
  reportTypes=[];
  deliverableRequest:DeliverableReport;

  constructor(protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private countryService: CountryService,
    private ngxLoader: NgxUiLoaderService,
    private projectManagementService:ProjectDeliverableService,
    private managementService: ProjectManagementService)
    {
    this.createDeliverableForm = 
    this.formBuilder.group(
      {
        DeliverableName: ['', Validators.required],
        Country:[null, Validators.required],
        TaxableYearEnd:['', Validators.required],
        TargetDeliverableIssueDate:['', Validators.required],
        ReportTier:[null, Validators.required],
        FiscalYear:['',[Validators.required,Validators.min(1900) , Validators.max(2999)]]
      });
  }

  get form() { return this.createDeliverableForm.controls; }

  ngOnInit() {
    this.getMasterData();

    this.createDeliverableForm.controls['Country'].valueChanges
    .debounceTime(400)
      .subscribe(data => {
        this.countryService.search_word(data).subscribe(response => {
          this.matchedCountries = response;
        })
      })
  }

  createDeliverable() {
    this.submitted = true;

    //  stop here if form is invalid
    if (this.createDeliverableForm.invalid) {
      return;
    }
    let selectedCountry= this.matchedCountries.find(x=>x.country==this.createDeliverableForm.controls['Country'].value);
    if(!selectedCountry) return;

    this.deliverableRequest= new DeliverableReport();
    
    this.deliverableRequest.countryId= selectedCountry.id;
    this.deliverableRequest.deliverableName= this.createDeliverableForm.controls['DeliverableName'].value;
    this.deliverableRequest.projectId=this.projectId;
    this.deliverableRequest.taxableYearEnd= this.createDeliverableForm.controls['TaxableYearEnd'].value;
    this.deliverableRequest.targetIssueDate= this.createDeliverableForm.controls['TargetDeliverableIssueDate'].value;
    this.deliverableRequest.reportTierId= this.createDeliverableForm.controls['ReportTier'].value;
    this.deliverableRequest.fiscalYear= this.createDeliverableForm.controls['FiscalYear'].value;

    //TODO: Add more columns after confirmation from business like statutory due date, milestone, projectyear

    //TODO: Remove the console log

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectManagementService.createDeliverable(this.deliverableRequest).subscribe(response=>
      {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        this.managementService.changeReloadDeliverableGrid(true);
        this.managementService.changeCreateDeliverableFlag(false);
        this.ref.close();
      }),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      };;

  }

  dismissDialog() {
    this.ref.close();
    this.managementService.changeCreateDeliverableFlag(false);
  }

  getMasterData()
  {
    this.countryService.getAllTiers().subscribe(response=>{
      this.reportTypes= response;
    });

  }
}
