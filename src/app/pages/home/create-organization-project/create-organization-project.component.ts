import { Component, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';
import { HomeService } from '../home.service';
import { Industry, NewOrganizationRequest, OrganizationRequest, SubIndustry, OrganizationFilterViewModel, GUP } from '../../../@models/organization';
import { first } from 'rxjs/operators';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { ProjectRequest, UseCaseModel } from '../../../@models/project';
import { CountryService } from '../../../shared/services/country.service';
import { Country } from '../../../@models/user';
import { SearchViewModel } from '../../../@models/admin/manageAdmin';
import 'rxjs/add/operator/debounceTime';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { DialogTypes } from '../../../@models/common/dialog';
import { DialogService } from '../../../shared/services/dialog.service';
import { EventConstants, TreeViewConstant } from '../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { ManageAdminService } from '../../admin/services/manage-admin.service';
import { switchMap, debounceTime, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TreeViewService } from '../../../shared/services/tree-view.service';

@Component({
  selector: 'ngx-create-organization-project',
  templateUrl: './create-organization-project.component.html',
  styleUrls: ['./create-organization-project.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          return TreeViewService.getText(selection, TreeViewConstant.select);
        },
      }),
    }
  ],
})
export class CreateOrganizationProjectComponent implements OnInit {
  @Output() CancelOrg: EventEmitter<any> = new EventEmitter();
  submitted = false;
  gupOthersVisible = false;
  useCaseOthersVisible = false;
  orgIndustryOthersVisible = false;
  projIndustryOthersVisible = false;
  orgData: NewOrganizationRequest;
  createOrganizationForm: FormGroup;
  industries = [];
  projIndustries = [];
  addBtnDisabled = false;
  countryList = [];
  useCaseList = [];
  OrganizationNameList = [];
  organizationFilterModel: OrganizationFilterViewModel;
  gupList: GUP[];
  searchUserResult = [];
  searchViewModel: SearchViewModel = new SearchViewModel();
  countryNotFound:boolean=false;
  value: any;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private service: HomeService, private countryService: CountryService, private treeView: TreeviewI18n, private dialogService: DialogService, private readonly eventService: EventAggregatorService, 
    private readonly manageAdminService: ManageAdminService) {
    this.value = treeView;
    this.createOrganizationForm = this.formBuilder.group({
      Id: null,
      //Organization
      OrganizationName: ['', [Validators.required, Validators.pattern("[^@,+,=,<,>,-].*")]],
      GUPId: {},
      Country: ['', Validators.required],
      OrganizationIndustries: [{}],
      OrgIndustryOthers: [''],
      // //Project
      ShortProjectDescription: ['', [Validators.pattern("[^@,+,=,<,>,-].*")]],
      ProjectName: ['', [Validators.required, Validators.pattern("[^@,+,=,<,>,-].*")]],
      ProjectIndustries: [{}, Validators.required],
      ProjIndustryOthers: [''],
      FiscalYear: ['', [Validators.required, Validators.pattern("^[1][9][7-9][0-9]|[2-9][0-9][0-9][0-9]$"),
      Validators.minLength(4)]],
      UseCase: {},
      UseCaseOthers: [''],
      GUPOthers: []
    });

    this.createOrganizationForm.controls["Country"].valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((data: string) => {       
        this.countryNotFound=false;
        this.countryList=[];
        if (data.length >= 3) {          
          return this.countryService.search_word(data)
        }
      })
    ).subscribe(response => {        
          if(!response|| response.length===0)
          {
            this.countryNotFound=true;
            return;           
          }
          this.countryList = response
      });         
      }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
  }
  loaderId='CreateOrganizationProjetLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';

  ngOnInit() {
    this.enableDisableMenuIcon();
    if (this.service.selectedOrganization) {

      this.createOrganizationForm.controls["Id"].setValue(this.service.selectedOrganization.id);
      this.createOrganizationForm.controls["OrganizationName"].setValue(this.service.selectedOrganization.organization);
      this.createOrganizationForm.controls["Country"].setValue(this.service.selectedOrganization.country.country);
      this.getIndustries(this.service.selectedOrganization.industry);
    }
    else {
      this.getIndustries(undefined);
    }

    this.getUseCases();
    this.getGupList();

    //section to set industry to lower case
    var industryButtons = document.querySelectorAll('.home-industry .btn');
    industryButtons.forEach(item => {
      item.classList.add('industry');
    });
  }

  ngAfterViewInit() {
    this.createOrganizationForm.controls["UseCase"].setValue("--Select--");

    if (this.service.selectedOrganization) {
      this.disableOrganization();

      if (this.service.selectedOrganization.gupData != null && this.service.selectedOrganization.gupData.gupId == "Other")
        this.gupOthersVisible = true;


      setTimeout(function () {
        var gupOthers = document.getElementById("GUPOthers");
        gupOthers.setAttribute("style", "opacity:0.5");
      });
    }
  }

  enableDisableMenuIcon() {
    var homeMenuIcons = this.service.homeMenuIcons;
    homeMenuIcons.IsDeleteEnabled = false;
    homeMenuIcons.IsHideEnabled = false;
    homeMenuIcons.IsUnHideEnabled = false;
    homeMenuIcons.IsViewHiddenEnabled = false;
    homeMenuIcons.IsEditEnabled = false;
    this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
  }

  getCountries(_countryName: string): Country[] {
    // The following line does not work
    return this.countryList.filter(function (element, index, array) { return element["country"] == _countryName });
  }

  getIndustries(selectedIndustries) {
    var _industries = [];
    this.service.getIndustries()
      .subscribe((data: Industry[]) => {
        data.forEach(element => {
          var isIndustrySelected = false;
          var selectedIndustry = selectedIndustries ? selectedIndustries.filter(item => item.id == element.id) : undefined;
          if (selectedIndustry && selectedIndustry.length > 0)
            isIndustrySelected = true;

          var subIndustries = [];
          element.subIndustries.forEach(subelement => {
            var isSubIndustrySelected = false;

            if (isIndustrySelected && selectedIndustry && selectedIndustry[0].subIndustries.length > 0) {
              var subIndustrySelected = selectedIndustry[0].subIndustries.filter(item => item.id == subelement.id);

              if (subIndustrySelected && subIndustrySelected.length > 0)
                isSubIndustrySelected = true;
            }

            subIndustries.push(new TreeviewItem({ checked: isSubIndustrySelected, text: subelement.subIndustry, value: subelement.id }));

          });

          if (!element.subIndustries || element.subIndustries.length == 0) {
            _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industry, value: element.id }));

            if (element && element.industry.indexOf('Other') > -1 && selectedIndustry && selectedIndustry.length > 0) {
              if (this.createOrganizationForm.controls["ProjIndustryOthers"])
                this.createOrganizationForm.controls["ProjIndustryOthers"].setValue(selectedIndustry[0].industry);
              if (this.createOrganizationForm.controls["OrgIndustryOthers"])
                this.createOrganizationForm.controls["OrgIndustryOthers"].setValue(selectedIndustry[0].industry);
            }
          }
          else {
            _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industry, value: element.id, children: subIndustries }));
          }
        });

        if (this.service.selectedOrganization)
          this.industries = Object.assign([], _industries);
        else
          this.industries = Object.assign([], _industries);

        this.projIndustries = Object.assign([], _industries);

      });
  }

  getGupList() {
    var _gupList = [];
    this.service.getAllGups()
      .subscribe((data => {
        // _gupList.push({ gupId: "GUP", gupName: "GUP" });
        data.forEach(element => {
          _gupList.push({ gupId: element.gupId, gupName: element.gupName });
        });

        this.gupList = Object.assign([], _gupList);

        if (this.service.selectedOrganization && this.service.selectedOrganization.gupData != null && this.service.selectedOrganization.gupData.gupId != null) {
          this.createOrganizationForm.controls["GUPId"].setValue(this.service.selectedOrganization.gupData.gupId);
          if (this.service.selectedOrganization.gupData.gupId == "Other") {
            this.gupOthersVisible = true;
            this.createOrganizationForm.controls["GUPOthers"].setValue(this.service.selectedOrganization.gupData.gupName);
          }
        }
        else
          this.createOrganizationForm.controls["GUPId"].setValue('--Select--');
      }));
  }

  getUseCases() {
    var _usecases = [];
    this.service.getUseCases()
      .subscribe((data => {
        data.forEach(element => {
          _usecases.push({ Id: element.id, Name: element.useCase });
        });

        this.useCaseList = Object.assign([], _usecases);
      }));
  }
  getSelectedIndustries(allindustries, selIndustries, others) {
    var industryList = [];

    if (selIndustries.length > 0) {
      allindustries.forEach(industry => {
        var _industry = new Industry();
        _industry.id = industry.value;
        _industry.subIndustries = [];
        selIndustries.forEach(element => {

          if (industry.internalChildren && industry.internalChildren.filter(id => id.value == element).length > 0) {
            var _subIndustry = new SubIndustry();
            _subIndustry.id = element;
            _industry.subIndustries.push(_subIndustry);
          }
          else if (industry.value == element) {
            _industry.industry = others;
          }
        });
        if (_industry.subIndustries.length > 0 || (_industry.industry && _industry.industry.length > 0))
          industryList.push(_industry);
      });
    }
    return industryList;
  }


  createOrganization() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.alertService.clear();
    this.submitted = true;
    this.enableOrganization();

    //stop here if form is invalid
    if (this.createOrganizationForm.invalid) {
      return;
    }

    var organizationData = this.createOrganizationForm.value;

    this.orgData = new NewOrganizationRequest();
    var org = new OrganizationRequest();
    org.Organization = organizationData.OrganizationName;
    this.service.searchOrganization(org.Organization).subscribe(response => {
      this.OrganizationNameList = response
  
    if (organizationData.GUPId != null && organizationData.GUPId != "--Select--") {
      org.GUPData = new GUP();
      if (organizationData.GUPId == "Other")
        org.GUPData.gupName = organizationData.GUPOthers;
      else
        org.GUPData.gupName = organizationData.GUPId != "" ? this.gupList.find(s => s.gupId == organizationData.GUPId).gupName : "";
      org.GUPData.gupId = organizationData.GUPId;
    }
    else {
      org.GUPData = new GUP();
      org.GUPData.gupId = null;
      org.GUPData.gupName = null;
    }

    org.CreatedBy = "user@deloitte.com";
    let country: Country[];
    country = this.getCountries(organizationData.Country);
    org.CountryId = country[0]["id"];
    org.RegionId = country[0]["regionId"];

    org.Industry = this.getSelectedIndustries(this.industries, organizationData.OrganizationIndustries, organizationData.OrgIndustryOthers);

    if(this.service.selectedOrganization)
      org.id = this.service.selectedOrganization.id;

    var project = new ProjectRequest();
    project.ProjectName = organizationData.ProjectName;
    project.Description = organizationData.ShortProjectDescription;
    project.fiscalyear = organizationData.FiscalYear;

    var useCaseId = organizationData.UseCase == "--Select--" ? "" : organizationData.UseCase;

    if (useCaseId != "") {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = useCaseId;
      var useCase = this.useCaseList.filter(id => id.Id == project.UseCase.Id);
      project.UseCase.UseCase = useCase && useCase.length > 0 ? useCase[0].Name : "";

      var selectedUseCase = this.useCaseList.find(s => s.Id == this.createOrganizationForm.get('UseCase').value);

      if (selectedUseCase && selectedUseCase.Name == "Other")
        project.UseCase.UseCase = this.createOrganizationForm.get('UseCaseOthers').value;
    }
    else {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = null;
      project.UseCase.UseCase = null;
    }

    project.IsVisible = true;
    project.CountryId = org.CountryId;
    project.RegionId = org.RegionId;
    project.CreatedBy = "user@deloitte.com";
    project.Industries = this.getSelectedIndustries(this.projIndustries, organizationData.ProjectIndustries, organizationData.ProjIndustryOthers);
    project.OrganizationId = org.id;
    this.orgData.Organization = org;
    this.orgData.Project = project;

    this.service.createOrganizationProject(this.orgData)
      .pipe(first())
      .subscribe(
        response => {
          var _parentthis = this;
          if (response.status === ResponseStatus.Sucess) {
            if (this.service.selectedOrganization) {
              var orgId = this.service.selectedOrganization.id;
              this.service.selectedOrganization = null;
              this.service.selectedOrganizationIds = [];
              this.service.emitOrgEvent();
              if (orgId) {
                this.service.emitOrgChangeEvent(orgId);
              }

              var _parentthis = this;
              this.toastr.success(this.translate.instant('screens.home.labels.projectCreatedSuccesfully'));
            
            }
            else {
              this.service.selectedOrganization = null;
              this.service.selectedOrganizationIds = [];
              this.service.emitOrgEvent();
              this.service.emitOrgChangeEvent(undefined);
              var _parentthis = this;
              this.toastr.success(this.translate.instant('screens.home.labels.organizationCreatedSuccesfully'));
          
            }
            this.service.emitMenuEvent();
            this.CancelOrg.emit();
          } else {
            this.alertService.warn(response.errorMessages[0]);
            var _parentthis = this;
            setTimeout(function () {
              _parentthis.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            });
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        },
        error => {
          this.dialogService.Open(DialogTypes.Error, "Error Occured");
        });
      });
  }

  closeCreateOrganizationPopup() {
    var homeMenuIcons = this.service.homeMenuIcons;
    homeMenuIcons.IsCreateEnabled = true;
    this.CancelOrg.emit();
  }

  get form() { return this.createOrganizationForm.controls; }

  onIndustrySelected(event) {
    this.createOrganizationForm.controls["OrganizationIndustries"].setValue(event);
    this.createOrganizationForm.controls["ProjectIndustries"].setValue(event);
    this.orgIndustryOthersVisible = false;
    event.forEach(element => {
      this.industries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.orgIndustryOthersVisible = true;
          setTimeout(function () {
            var orgIndustryOthers = document.getElementById("OrgIndustryOthers");
            orgIndustryOthers.setAttribute("style", "opacity:0.5");
          });
        }
      });
    });
    this.projIndustries = Object.assign([], this.projIndustries);
  }

  onProjectIndustrySelected(event) {
    this.createOrganizationForm.controls["ProjectIndustries"].setValue(event);
    this.createOrganizationForm.controls["OrganizationIndustries"].setValue(event);
    this.projIndustryOthersVisible = false;
    event.forEach(element => {
      this.projIndustries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.projIndustryOthersVisible = true;
        }
      });
    });
    this.industries = Object.assign([], this.industries);
  }

  onGUPSelected() {
    if (this.gupList.find(s => s.gupId == this.createOrganizationForm.get('GUPId').value).gupName == "Other")
      this.gupOthersVisible = true;
    else
      this.gupOthersVisible = false;
  }

  onUseCaseChanged() {
    var selectedUseCase = this.useCaseList.find(s => s.Id == this.createOrganizationForm.get('UseCase').value);

    if (selectedUseCase && selectedUseCase.Name == "Other")
      this.useCaseOthersVisible = true;
    else
      this.useCaseOthersVisible = false;
    this.createOrganizationForm.controls["UseCaseOthers"].setValue("");
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  disableOrganization() {
    this.createOrganizationForm.get('OrganizationName').disable();
    this.createOrganizationForm.get('GUPId').disable();
    this.createOrganizationForm.get('GUPOthers').disable();
    this.createOrganizationForm.get('OrganizationIndustries').disable();
    this.createOrganizationForm.get('OrgIndustryOthers').disable();
    this.createOrganizationForm.get('Country').disable();

    var txtOrgName = document.getElementById("txtOrgName");
    txtOrgName.setAttribute("style", "opacity:0.5");

    var GUPId = document.getElementById("ddlGUP");
    GUPId.setAttribute("style", "opacity:0.5");

    var OrgIndustry = document.getElementById("hdnOrgIndustry");
    OrgIndustry.setAttribute("style", "opacity:0.5");

    var txtCountry = document.getElementById("txtCountry");
    txtCountry.setAttribute("style", "opacity:0.5");

    var industryButtons = document.querySelectorAll('.org-industry .btn');

    if (industryButtons && industryButtons.length > 0) {
      industryButtons.forEach(item => {
        item.setAttribute('disabled', 'true');
      })
    }
  }

  enableOrganization() {
    this.createOrganizationForm.get('OrganizationName').enable();
    this.createOrganizationForm.get('GUPId').enable();
    this.createOrganizationForm.get('OrganizationIndustries').enable();
    this.createOrganizationForm.get('Country').enable();
  }

  onOrgOtherIndustryEnter(event) {
    this.createOrganizationForm.controls["ProjIndustryOthers"].setValue(this.createOrganizationForm.controls["OrgIndustryOthers"].value);
  }

  onProjOtherIndustryEnter(event) {
    this.createOrganizationForm.controls["OrgIndustryOthers"].setValue(this.createOrganizationForm.controls["ProjIndustryOthers"].value);
  }
}
