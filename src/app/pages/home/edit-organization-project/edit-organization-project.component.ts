import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';
import { HomeService } from '../home.service';
import { Industry, OrganizationRequest, SubIndustry, OrganizationFilterViewModel, GUP } from '../../../@models/organization';
import { TreeviewItem, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview'
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { ProjectRequest, UseCaseModel, LeadUserModel } from '../../../@models/project';
import { CountryService } from '../../../shared/services/country.service';
import { Country } from '../../../@models/user';
import 'rxjs/add/operator/debounceTime';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { DialogService } from '../../../shared/services/dialog.service';
import { EventConstants, TreeViewConstant } from '../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { ManageAdminService } from '../../admin/services/manage-admin.service';
import { SearchViewModel } from '../../../@models/admin/manageAdmin';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { switchMap, debounceTime, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TreeViewService } from '../../../shared/services/tree-view.service';


@Component({
  selector: 'ngx-edit-organization-project',
  templateUrl: './edit-organization-project.component.html',
  styleUrls: ['./edit-organization-project.component.scss'],
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
export class EditOrganizationProjectComponent implements OnInit {

  @Output() CancelOrg: EventEmitter<any> = new EventEmitter();
  submitted = false;
  gupOthersVisible = false;
  orgIndustryOthersVisible = false;
  projIndustryOthersVisible = false;
  useCaseOthersVisible = false;
  orgData: OrganizationRequest;
  editOrganizationForm: FormGroup;
  industries = [];
  projIndustries = [];
  addBtnDisabled = false;
  countryList = [];
  organizationFilterModel: OrganizationFilterViewModel;
  IsOrganizationVisible = false;
  IsProjectVisible = false;
  useCaseList = [];
  gupList: GUP[];
  searchUserResult = [];
  searchViewModel: SearchViewModel = new SearchViewModel();
  private dialogTemplate: Dialog;
  orgIndustryIndex : number = 0;
  projIndustrySelected : number = 0;
  
  createInput(isRequired): FormGroup {
    if (isRequired)
      return this.formBuilder.group({
        name: ['', [Validators.required, Validators.pattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,3}$")]],
        leadData: []
      });
    else
      return this.formBuilder.group({
        name: ['', [Validators.pattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,3}$")]],
        leadData: []
      });
  }

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private service: HomeService, private countryService: CountryService, private dialogService: DialogService, private readonly eventService: EventAggregatorService, private manageAdminService: ManageAdminService, private translate: TranslateService) {
  }

  orgFormGroup() {
    this.editOrganizationForm = this.formBuilder.group({
      Id: [''],
      //Organization
      OrganizationName: ['', Validators.required],
      GUPId: {},
      Country: ['', Validators.required],
      OrganizationIndustries: [{}],
      OrgIndustryOthers: [''],
      GUPOthers: ['']
    });

    this.editOrganizationForm.controls["Country"].valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((data: string) => {
        if (data.length >= 3) {
          return this.countryService.search_word(data)
        }
      })
    ).subscribe(data => {
      this.countryList = data
    });
  }

  projectFormGroup() {
    this.editOrganizationForm = this.formBuilder.group({
      Id: [''],
      OrganizationId: [''],
      // //Project
      ShortProjectDescription: [''],
      ProjectName: ['', Validators.required],
      ProjectIndustries: [{}, Validators.required],
      ProjIndustryOthers: [''],
      FiscalYear: ['', [Validators.required, Validators.pattern("^[1][9][7-9][0-9]|[2-9][0-9][0-9][0-9]$"),
      Validators.minLength(4)]],
      UseCase: {},
      CountryId: [''],
      RegionId: [''],
      UseCaseOthers: ['']
    });
  }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 135
  }

  ngOnInit() {
    this.enableDisableMenuIcon();
    if (this.service.selectedOrganization) {
      this.orgFormGroup();
      this.IsOrganizationVisible = true;
      this.IsProjectVisible = false;
      this.editOrganizationForm.controls["Id"].setValue(this.service.selectedOrganization.id);
      this.editOrganizationForm.controls["OrganizationName"].setValue(this.service.selectedOrganization.organization);
      this.editOrganizationForm.controls["Country"].setValue(this.service.selectedOrganization.country.country);
      this.getIndustries(this.service.selectedOrganization.industry);
      this.getGupList();
    }
    if (this.service.selectedProject) {
      this.getUseCases();
      this.projectFormGroup();
      this.IsProjectVisible = true;
      this.IsOrganizationVisible = false;
      this.editOrganizationForm.controls["Id"].setValue(this.service.selectedProject.id);
      this.editOrganizationForm.controls["ProjectName"].setValue(this.service.selectedProject.projectName);
      this.editOrganizationForm.controls["ShortProjectDescription"].setValue(this.service.selectedProject.description);
      this.editOrganizationForm.controls["FiscalYear"].setValue(this.service.selectedProject.fiscalYear);
      this.editOrganizationForm.controls["OrganizationId"].setValue(this.service.selectedProject.organizationId);
      this.editOrganizationForm.controls["CountryId"].setValue(this.service.selectedProject.country.id);
      this.editOrganizationForm.controls["RegionId"].setValue(this.service.selectedProject.region.regionId);

      if (this.service.selectedProject.useCase.id != "000000000000000000000000")
        this.editOrganizationForm.controls["UseCase"].setValue(this.service.selectedProject.useCase.id);
      else
        this.editOrganizationForm.controls["UseCase"].setValue('--Select--');

      this.getIndustries(this.service.selectedProject.industryData);
    }
  }

  ngAfterViewInit() {
    //section to set industry to lower case
    var industryButtons = document.querySelectorAll('.home-industry .btn');
    industryButtons.forEach(item => {
      item.classList.add('industry');
    })
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

        if (this.service.selectedOrganization.gupData != null && this.service.selectedOrganization.gupData.gupId != null) {
          this.editOrganizationForm.controls["GUPId"].setValue(this.service.selectedOrganization.gupData.gupId);
          if (this.service.selectedOrganization.gupData.gupId == "Other") {
            this.gupOthersVisible = true;
            this.editOrganizationForm.controls["GUPOthers"].setValue(this.service.selectedOrganization.gupData.gupName);
          }
        }
        else
          this.editOrganizationForm.controls["GUPId"].setValue('--Select--');
      }));
  }

  enableDisableMenuIcon() {
    let homeMenuIcons = this.service.homeMenuIcons;
    homeMenuIcons.IsDeleteEnabled = false;
    homeMenuIcons.IsHideEnabled = false;
    homeMenuIcons.IsUnHideEnabled = false;
    homeMenuIcons.IsViewHiddenEnabled = false;
    homeMenuIcons.IsCreateEnabled = false;
    this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
  }

  getUseCases() {
    var _usecases = [];
    this.service.getUseCases()
      .subscribe((data => {
        data.forEach(element => {
          _usecases.push({ Id: element.id, Name: element.useCase });
        });

        this.useCaseList = Object.assign([], _usecases);

        var selectedUseCase = this.useCaseList.find(s => s.Id == this.editOrganizationForm.get('UseCase').value);

        this.useCaseOthersVisible = false;
        if (selectedUseCase && selectedUseCase.Name == "Other") {
          this.useCaseOthersVisible = true;
          this.editOrganizationForm.controls["UseCaseOthers"].setValue(this.service.selectedProject.useCase.useCase);
        }

      }));
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
          var selectedIndustry = selectedIndustries.filter(item => item.id == element.id);
          if (selectedIndustry && selectedIndustry.length > 0)
            isIndustrySelected = true;

          var subIndustries = [];
          element.subIndustries.forEach(subelement => {
            var isSubIndustrySelected = false;

            if (isIndustrySelected && selectedIndustry[0].subIndustries.length > 0) {
              var subIndustrySelected = selectedIndustry[0].subIndustries.filter(item => item.id == subelement.id);

              if (subIndustrySelected && subIndustrySelected.length > 0)
                isSubIndustrySelected = true;
            }

            subIndustries.push(new TreeviewItem({ checked: isSubIndustrySelected, text: subelement.subIndustry, value: subelement.id }));

          });

          if (!element.subIndustries || element.subIndustries.length == 0) {
            _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industry, value: element.id }));

            if (element && element.industry.indexOf('Other') > -1 && selectedIndustry.length > 0) {
              if (this.editOrganizationForm.controls["ProjIndustryOthers"])
                this.editOrganizationForm.controls["ProjIndustryOthers"].setValue(selectedIndustry[0].industry);
              if (this.editOrganizationForm.controls["OrgIndustryOthers"])
                this.editOrganizationForm.controls["OrgIndustryOthers"].setValue(selectedIndustry[0].industry);
            }
          }
          else {
            _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industry, value: element.id, children: subIndustries }));
          }
        });
        if (this.service.selectedProject)
          this.projIndustries = Object.assign([], _industries);

        if (this.service.selectedOrganization)
          this.industries = Object.assign([], _industries);
      });
  }

  editOrganization() {
    this.submitted = true;

    //stop here if form is invalid
    if (this.editOrganizationForm.invalid) {
      return;
    }

    if (this.IsOrganizationVisible)
      this.updateOrganization();

    if (this.IsProjectVisible)
      this.updateProject();
  }

  getSelectedIndustries(allIndustries, selIndustries, others) {
    var industryList = [];

    if (selIndustries.length > 0) {
      allIndustries.forEach(industry => {
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

  updateProject() {
    var projectData = this.editOrganizationForm.value;
    let project = new ProjectRequest();
    project.Id = projectData.Id;
    project.OrganizationId = projectData.OrganizationId;
    project.ProjectName = projectData.ProjectName;
    project.Description = projectData.ShortProjectDescription;
    project.fiscalyear = projectData.FiscalYear;
    project.Industries = this.getSelectedIndustries(this.projIndustries, projectData.ProjectIndustries, projectData.ProjIndustryOthers);
    let useCaseId = projectData.UseCase == "--Select--" ? "" : projectData.UseCase;

    if (useCaseId != "") {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = useCaseId;
      let useCase = this.useCaseList.filter(id => id.Id == project.UseCase.Id);
      project.UseCase.UseCase = useCase && useCase.length > 0 ? useCase[0].Name : "";

      let selectedUseCase = this.useCaseList.find(s => s.Id == this.editOrganizationForm.get('UseCase').value);

      if (selectedUseCase && selectedUseCase.Name == "Other")
        project.UseCase.UseCase = this.editOrganizationForm.get('UseCaseOthers').value;
    }
    else {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = null;
      project.UseCase.UseCase = null;
    }

    project.CountryId = projectData.CountryId;
    project.RegionId = projectData.RegionId;
    project.IsVisible = true;
    project.CreatedBy = "user@deloitte.com";

    this.service.updateProject(project)
      .pipe(first())
      .subscribe(
        response => {
          this.service.selectedProjectIds = [];
          if (response.status === ResponseStatus.Sucess) {
            this.service.emitMenuEvent();
            this.service.emitOrgChangeEvent(project.OrganizationId);
            this.toastr.success(this.translate.instant('screens.home.labels.projectUpdatedSuccesfully'));
          }
          else {
            this.service.emitMenuEvent();
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);

          }
          this.CancelOrg.emit();
        },
        error => {
          this.service.emitMenuEvent();
          if (error.status === '403')
            this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.labels.updateProjectErrorMessaage'));
          else
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
        });
  }

  updateOrganization() {
    var organizationData = this.editOrganizationForm.value;
    var org = new OrganizationRequest();
    org.id = organizationData.Id;
    org.Organization = organizationData.OrganizationName;
    if (organizationData.GUPId != "--Select--") {
      org.GUPData = new GUP();
      if (organizationData.GUPId == "Other")
        org.GUPData.gupName = organizationData.GUPOthers;
      else
        org.GUPData.gupName = organizationData.GUPId != "" ? this.gupList.find(s => s.gupId == organizationData.GUPId).gupName : "";
      org.GUPData.gupId = organizationData.GUPId;
    }
    else {
      org.GUPData = new GUP();
      org.GUPData.gupName = null;
      org.GUPData.gupId = null;
    }

    org.CreatedBy = "user@deloitte.com";
    let country: Country[];
    country = this.getCountries(organizationData.Country);
    org.CountryId = country[0]["id"];
    org.RegionId = country[0]["regionId"];
    org.Industry = this.getSelectedIndustries(this.industries, organizationData.OrganizationIndustries, organizationData.OrgIndustryOthers);;

    this.service.updateOrganization(org)
      .pipe(first())
      .subscribe(
        response => {
          this.service.selectedOrganizationIds = [];
          if (response.status === ResponseStatus.Sucess) {
            this.service.emitOrgEvent();
            this.service.emitMenuEvent();
            this.toastr.success(this.translate.instant('screens.home.labels.organizationUpdatedSuccesfully'));
          }
          else {
            this.service.emitMenuEvent();
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);

          }
          this.CancelOrg.emit();
        },
        error => {
          if (error.status == "403")
            this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.labels.updateOrganizationErrorMessaage'));
          else
            this.dialogService.Open(DialogTypes.Error, "Error Occured");
          this.service.emitMenuEvent();
        });
  }

  closeEditOrganizationPopup() {
    this.CancelOrg.emit();
  }

  get form() { return this.editOrganizationForm.controls; }  

  onIndustrySelected(event) {
    this.editOrganizationForm.controls["OrganizationIndustries"].setValue(event);
    if(this.orgIndustryIndex > 1)  this.editOrganizationForm.controls["OrganizationIndustries"].markAsDirty();
    this.orgIndustryIndex++;
    this.orgIndustryOthersVisible = false;
    event.forEach(element => {
      this.industries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.orgIndustryOthersVisible = true;
        }
      });
    });
  }

  onProjectIndustrySelected(event) {
    this.editOrganizationForm.controls["ProjectIndustries"].setValue(event);
    if(this.projIndustrySelected > 1)  this.editOrganizationForm.controls["ProjectIndustries"].markAsDirty();
    this.projIndustrySelected++;
    this.projIndustryOthersVisible = false;
    event.forEach(element => {
      this.projIndustries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.projIndustryOthersVisible = true;
        }
      });
    });
  }

  onGUPSelected() {
    if (this.gupList.find(s => s.gupId == this.editOrganizationForm.get('GUPId').value).gupName == "Other")
      this.gupOthersVisible = true;
    else
      this.gupOthersVisible = false;
  }

  onUseCaseChanged() {
    var selectedUseCase = this.useCaseList.find(s => s.Id == this.editOrganizationForm.get('UseCase').value);

    if (selectedUseCase && selectedUseCase.Name == "Other")
      this.useCaseOthersVisible = true;
    else
      this.useCaseOthersVisible = false;
    this.editOrganizationForm.controls["UseCaseOthers"].setValue("");
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
