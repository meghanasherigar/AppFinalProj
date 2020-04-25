import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HomeService } from '../home.service';
import { TreeviewI18n, TreeviewI18nDefault, TreeviewSelection, TreeviewItem } from 'ngx-treeview';
import { Industry, SubIndustry, OrganizationFilterViewModel } from '../../../@models/organization';
import 'rxjs/add/operator/debounceTime';
import { debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs/operators';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { ManageAdminService } from '../../admin/services/manage-admin.service';
import { SearchViewModel } from '../../../@models/admin/manageAdmin';
import { Subject } from 'rxjs';
import { DialogService } from '../../../shared/services/dialog.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ProjectRequest, UseCaseModel, LeadUserModel, CopyProjectRequest } from '../../../@models/project';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { MatDialog } from '@angular/material';
import { buttonClasses } from '../../../@models/common/eventConstants';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-copy-project',
  templateUrl: './copy-project.component.html',
  styleUrls: ['./copy-project.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          switch (selection.checkedItems.length) {
            case 0:
              return '--Select--';
            case 1:
              return selection.checkedItems[0].text;
            default:
              return selection.checkedItems.length + " options selected";
          }
        }
      })
    }
  ],
})
export class CopyProjectComponent implements OnInit {

  @Output() CancelOrg: EventEmitter<any> = new EventEmitter();
  buttonClass = buttonClasses[0];
  copyProjectForm: FormGroup;
  useCaseList = [];
  useCaseOthersVisible = false;
  industries = [];
  projIndustries = [];
  projIndustryOthersVisible = false;
  organizationFilterModel: OrganizationFilterViewModel;
  IsOrganizationVisible = false;
  IsProjectVisible = false;
  searchUserResult = [];
  searchViewModel: SearchViewModel = new SearchViewModel();
  private dialogTemplate: Dialog;
  fiscalYear: number;
  submitted = false;
  private searchLead = new Subject<string>();

  constructor(  
    private translate: TranslateService,
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private service: HomeService,
    private manageAdminService: ManageAdminService,
    private dialogService: DialogService,
    private ngxLoader: NgxUiLoaderService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 100
  }

  loaderId='CopyProjectLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';
  ngOnInit() {
   
    this.getUseCases();
    this.projectFormGroup();
    this.fiscalYear = this.service.selectedProject.fiscalYear;
    this.fiscalYear = this.fiscalYear +1;
    this.IsProjectVisible = true;
    this.IsOrganizationVisible = false;
    this.copyProjectForm.controls["Id"].setValue(this.service.selectedProject.id);
    this.copyProjectForm.controls["ProjectName"].setValue(this.service.selectedProject.projectName);
    this.copyProjectForm.controls["ShortProjectDescription"].setValue(this.service.selectedProject.description);
    this.copyProjectForm.controls["FiscalYear"].setValue(this.fiscalYear);
    this.copyProjectForm.controls["OrganizationId"].setValue(this.service.selectedProject.organizationId);
    this.copyProjectForm.controls["CountryId"].setValue(this.service.selectedProject.country.id);
    this.copyProjectForm.controls["RegionId"].setValue(this.service.selectedProject.region.regionId);

    if (this.service.selectedProject.useCase.id != "000000000000000000000000")
        this.copyProjectForm.controls["UseCase"].setValue(this.service.selectedProject.useCase.id);
      else
        this.copyProjectForm.controls["UseCase"].setValue('--Select--');

    this.getIndustries(this.service.selectedProject.industryData);
  }

  ngAfterViewInit() {
    //section to set industry to lower case
    var industryButtons = document.querySelectorAll('.home-industry .btn');
    industryButtons.forEach(item => {
      item.classList.add('industry');
    })
  }

  copyProject(){
    this.submitted = true;

    //stop here if form is invalid
    if (this.copyProjectForm.invalid) {
      return;
    }

    if (this.IsProjectVisible)

    this.copyProjectDetails();

  }

  projectFormGroup() {
    this.copyProjectForm = this.formBuilder.group({
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

  getUseCases() {
    var _usecases = [];
    this.service.getUseCases()
      .subscribe((data => {
        data.forEach(element => {
          _usecases.push({ Id: element.id, Name: element.useCase });
        });

        this.useCaseList = Object.assign([], _usecases);

        var selectedUseCase = this.useCaseList.find(s => s.Id == this.copyProjectForm.get('UseCase').value);

        this.useCaseOthersVisible = false;
        if (selectedUseCase && selectedUseCase.Name == "Other") {
          this.useCaseOthersVisible = true;
          this.copyProjectForm.controls["UseCaseOthers"].setValue(this.service.selectedProject.useCase.useCase);
        }

      }));
  }

  onUseCaseChanged() {
    var selectedUseCase = this.useCaseList.find(s => s.Id == this.copyProjectForm.get('UseCase').value);

    if (selectedUseCase && selectedUseCase.Name == "Other")
      this.useCaseOthersVisible = true;
    else
      this.useCaseOthersVisible = false;
    this.copyProjectForm.controls["UseCaseOthers"].setValue("");
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
              if (this.copyProjectForm.controls["ProjIndustryOthers"])
                this.copyProjectForm.controls["ProjIndustryOthers"].setValue(selectedIndustry[0].industry);
              if (this.copyProjectForm.controls["OrgIndustryOthers"])
                this.copyProjectForm.controls["OrgIndustryOthers"].setValue(selectedIndustry[0].industry);
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

  onProjectIndustrySelected(event) {
    this.copyProjectForm.controls["ProjectIndustries"].setValue(event);
    this.projIndustryOthersVisible = false;
    event.forEach(element => {
      this.projIndustries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.projIndustryOthersVisible = true;
        }
      });
    });
  }
  get form() { return this.copyProjectForm.controls; }


  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  copyProjectDetails() {

    var projectData = this.copyProjectForm.value;
    let project = new CopyProjectRequest();
    project.CurrentProjectId = projectData.Id;
    project.OrganizationId = projectData.OrganizationId;
    project.ProjectName = projectData.ProjectName;
    project.Description = projectData.ShortProjectDescription;
    project.fiscalyear = projectData.FiscalYear;
    project.Industries = this.getSelectedIndustries(this.projIndustries, projectData.ProjectIndustries, projectData.ProjIndustryOthers);
    let useCaseId = projectData.UseCase == "--Select--" ? "" : projectData.UseCase;

    if (useCaseId !== '') {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = useCaseId;
      let useCase = this.useCaseList.filter(id => id.Id == project.UseCase.Id);
      project.UseCase.UseCase = useCase && useCase.length > 0 ? useCase[0].Name : '';

      let selectedUseCase = this.useCaseList.find(s => s.Id == this.copyProjectForm.get('UseCase').value);

      if (selectedUseCase && selectedUseCase.Name === 'Other')
        project.UseCase.UseCase = this.copyProjectForm.get('UseCaseOthers').value;
    }
    else {
      project.UseCase = new UseCaseModel();
      project.UseCase.Id = null;
      project.UseCase.UseCase = null;
    }

    project.CountryId = projectData.CountryId;
    project.RegionId = projectData.RegionId;
    project.IsVisible = true;
    
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.service.copyProject(project)
      .pipe(first())
      .subscribe(
        response => {
          this.service.selectedProjectIds = [];
          if (response.status === ResponseStatus.Sucess) {
            this.service.emitMenuEvent();
            this.service.emitOrgChangeEvent(project.OrganizationId);
            //this.dialogService.Open(DialogTypes.Success, "Project copied succesfully");
            this.toastr.success(this.translate.instant('screens.home.labels.ProjectCopiedSuccesfully'));
          } else {
            this.service.emitMenuEvent();
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);

          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.CancelOrg.emit();
          this.dismiss();
        },
        error => {
          this.service.emitMenuEvent();
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.admin.commonMessage.errorOccurred'));
        });
      
  
  }

  dismiss() {
    this.ref.close();
  }


}
