import { Component, OnInit, ElementRef } from '@angular/core';
import { ProjectSettingService } from '../services/project-setting.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ProjectSettings, CurrentSettings } from '../../../@models/project-settings/project-settings';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { EventConstants } from '../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { DialogTypes } from '../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/debounceTime';
import { switchMap, debounceTime, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SearchViewModel } from '../../../@models/userAdmin';
import { ManageAdminService } from '../../admin/services/manage-admin.service';
import { element } from '@angular/core/src/render3';
import { Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { DesignerService } from '../../project-design/services/designer.service';
import { ProjectSettigns } from '../../project-management/@models/Project-Management-Constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-project-setting',
  templateUrl: './project-setting.component.html',
  styleUrls: ['./project-setting.component.scss']
})
export class ProjectSettingComponent implements OnInit {
  currentSubscriptions: Subscription = new Subscription();
  projectSettingsHeaders: any;
  milestoneSetting: CurrentSettings[];
  domainData: any;
  domain: CurrentSettings;
  domainDataArray = new Array;
  addBtnDisabled = true;
  contactEmail: any;
  datainput: any;
  dataModified:boolean;
  domainName: FormArray;
  ref: any;
  disabledButton: boolean = false;
  show: boolean = true;
  submitted: boolean = false;
  domainDisplay = [];
  createOrganizationForm: FormGroup;
  ExternalUserAccessControlForm: FormGroup;
  countid = 0;
  countVal: any;
  searchViewModel: SearchViewModel = new SearchViewModel();
  searchUserResult = [];
  //ngx-ui-loader configuration
  loaderId = 'ProjectSettingLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  isExternalUser: boolean;
  isProjectManagment: boolean;
  originalSettings:any;

  constructor(private projectSettingService: ProjectSettingService,
    private _formBuilder: FormBuilder,
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private el: ElementRef,
    private readonly manageAdminService: ManageAdminService,
    private router: Router,
    private userService: UserService,
    private designerService: DesignerService,
  ) {


  }
  ngOnInit() {
    this.checkIsExternalUser();
    this.ExternalUserAccessControlForm = this.formBuilder.group({
      domainAdd: this.formBuilder.array([])
    });
    this.currentSubscriptions.add(this._eventService.getEvent(EventConstants.ProjectSettingsSave).subscribe((payload) => {
      if (payload) {
        this.updateProjectManagementSettings();
      }
    }));
    this.projectSettingsHeaders = {
      projectId: '',
      value: 'Project Management',
      domainSetting: [],
      generalSetting: [],
      automaticEmailsSetting: [],
      milestoneSettings: [],
      alertSettings: [],
      externalUserSetting: []
    };
    this.getProjectManagementSettings();
  }
  get form() { return this.ExternalUserAccessControlForm.controls; }
  getProjectManagementSettings() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectSettingService.getProjectManagementSettings().subscribe((response: ProjectSettings) => {
      if (response) {
        this.projectSettingsHeaders.projectId = response.projectId;
        this.milestoneSetting = response.currentSettings;
        this.originalSettings=JSON.parse(JSON.stringify(response.currentSettings))
        if (response.currentSettings && response.currentSettings.length > 0) {
          let generalData = response.currentSettings.filter(sett => sett.type === 0);
          let automaticEmailsData = response.currentSettings.filter(sett => sett.type === 1);
          let milestonesData = response.currentSettings.filter(sett => sett.type === 2);
          let alertsData = response.currentSettings.filter(sett => sett.type === 3);
          let domainData = response.currentSettings.filter(sett => sett.type === 4);
          this.domainData = response.currentSettings.filter(sett => sett.type === 4);
          let externalUserData = response.currentSettings.filter(sett => sett.type === ProjectSettigns.ExternalUserSetting);
          this.projectSettingsHeaders.domainSetting = domainData;
          this.projectSettingsHeaders.milestoneSettings = milestonesData;
          this.projectSettingsHeaders.alertSettings = alertsData;
          this.projectSettingsHeaders.generalSetting = generalData;
          this.projectSettingsHeaders.automaticEmailsSetting = automaticEmailsData;
          this.projectSettingsHeaders.externalUserSetting = externalUserData;
        }
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }
  
 compareData(){
   this.dataModified=false;
   this.update();
 this.originalSettings.forEach((element,i)=>{
  if(!this.dataModified){
  this.projectSettingsHeaders.currentSettings.forEach(sett=>{
    if(element.id===sett.id){
      this.dataModified= !(JSON.stringify(element) === JSON.stringify(sett));
    }
  })
 }
});
   this.currentSubscriptions.add(this._eventService.getEvent(EventConstants.ProjectSettingsValueAnyChange).publish(this.dataModified));
 }
  toggleExternalUserSettings(entry, index) {
    this.projectSettingsHeaders.externalUserSetting.forEach((element, i) => {
      if (element.description === index.description)
        this.projectSettingsHeaders.externalUserSetting[i].value = entry;
    });
    this.compareData();
  }

  update()
  {
    this.ExternalUserAccessControlForm.value.domainAdd.forEach(element => {
      let domain = new CurrentSettings;
      domain.name = element.ExternalUserAccessControl.toLowerCase();
      domain.id = "000000000000000000000000";
      domain.type = 4;
      domain.value = 1;
      domain.description = this.translate.instant('screens.project-setting.ExternalUserAccessControl');
      this.projectSettingsHeaders.domainSetting.push(domain);
    });
    this.currentSubscriptions.add(this._eventService.getEvent(EventConstants.ProjectSettingsSave).publish(false));

    let count = 0;
    let countValue = 0;
    this.projectSettingsHeaders.generalSetting.forEach((element, index) => {

      this.projectSettingsHeaders.generalSetting[index].value = parseInt(element.value);
    });
    this.projectSettingsHeaders.automaticEmailsSetting.forEach((element, index) => {

      this.projectSettingsHeaders.automaticEmailsSetting[index].value = parseInt(element.value);
    });
    this.projectSettingsHeaders.externalUserSetting.forEach((ele, index) => {
      this.projectSettingsHeaders.externalUserSetting[index].value = parseInt(ele.value);
    })
    this.projectSettingsHeaders.alertSettings.forEach((ele, index) => {
      this.projectSettingsHeaders.alertSettings[index].value = parseInt(ele.value);
    })
    this.projectSettingsHeaders.milestoneSettings.forEach((element, index) => {
      if ((element.description.length === 0 || element.value.toString().length === 0) && element.type === 2) {
        element.value = 0;
      }
      else if (element.description.length !== 0 && element.value.toString().length === 0 && element.type === 2) {
        //in order to avoid showing multiple pop-ups for multiple empty milestone percentage
        count += 1;
      }
      else
      {
        this.projectSettingsHeaders.milestoneSettings[index].value = parseInt(element.value);
      }
    });
    countValue = this.projectSettingsHeaders.milestoneSettings.filter(element => {
      return parseInt(element.value) === 100;
    }).length;
    if (countValue == 0) {
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-setup.Users.ValidaionMessages.AtleastOneMilestoneShouldBe100'));
      return;
    }
    else if (countValue > 1) {
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-setup.Users.ValidaionMessages.MoreThanOneMilestoneHave100'));
      return;
    }
    if (count > 0) {
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-setup.Users.ValidaionMessages.MilestonesShouldHaveValidPercentage'));
      return;
    }

    let currentSettings = [];
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.generalSetting);
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.automaticEmailsSetting);
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.alertSettings);
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.milestoneSettings);
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.domainSetting);
    currentSettings = currentSettings.concat(this.projectSettingsHeaders.externalUserSetting);
    this.projectSettingsHeaders.currentSettings = currentSettings;
  }
  updateProjectManagementSettings() {
this.update();
this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectSettingService.updateProjectManagementSettings(this.projectSettingsHeaders).subscribe(response => {
      this.projectSettingsHeaders.milestoneSettings.milestonesData = '';
      this.projectSettingsHeaders.alertSettings.alertsData = '';
      this.projectSettingsHeaders.generalSetting.generalData = '';
      this.projectSettingsHeaders.automaticEmailsSetting.automaticEmailsData = '';
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.toastr.success(this.translate.instant('screens.project-setting.SuccessfulUpdate'));

      this.getProjectManagementSettings();
    });
    this.ExternalUserAccessControlForm.value.domainAdd.forEach((element, i) => {
      (<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).removeAt(i);
    });
    (<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).removeAt(this.ExternalUserAccessControlForm.value.domainAdd.length - 1);
    this.getProjectManagementSettings();

  }
  onGeneralSelection(entry, index): void {
    this.projectSettingsHeaders.generalSetting.forEach((element, i) => {
      if (element.description === index.description)
        this.projectSettingsHeaders.generalSetting[i].value = entry;
    });
  }
  onRead() {
    this.show = false;
    if (this.ExternalUserAccessControlForm.status === "INVALID") {
      this.disabledButton = true;
      this.designerService.disabledButton = true;
    }
    else {
      this.disabledButton = false;
      this.designerService.disabledButton = false;
    }
  }
  removeDomainById(i) {
    (<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).removeAt(i);
    if ((<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).length == 0) {
      this.disabledButton = false;
      this.designerService.disabledButton = false;
    }
    this.dataModified=false;
    this.compareData();
   
  }
  onAutoEmailsSelection(entry, index): void {
    this.projectSettingsHeaders.automaticEmailsSetting.forEach((element, i) => {
      if (element.description === index.description)
        this.projectSettingsHeaders.automaticEmailsSetting[i].value = entry;
 
    });
    this.compareData();
  }
  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling
    const expansionIndicatorClass = 'nb-arrow-down';

    //To modify later
    // if (!this._isExpansionIndicator(event.target, expansionIndicatorClass)
    //   && !this._isExpansionIndicator(event.target, 'textAreawidth') && matExpansionPanel) {
    //   if (!matExpansionPanel.collapsedValue)
    //     matExpansionPanel.close(); // Here's the magic
    //   else
    //     matExpansionPanel.open();
    // }
  }
  deleteDomain(it) { 
    this.domainData.forEach((element, i) => {
      if (element.id === it.id) {
        this.projectSettingsHeaders.domainSetting.splice(i, 1);
        this.domainData.splice(i, 1);
      }
    });
    this.setDataModified();
  }

  setDataModified()
  {
    this.dataModified=true;
    this._eventService.getEvent(EventConstants.ProjectSettingsValueAnyChange).publish(this.dataModified);
  }
  onKeyPress(event: any) {
    this.show = true;
    if (this.ExternalUserAccessControlForm.status === "INVALID") {
      this.disabledButton = true;
      this.designerService.disabledButton = true;
    }
    else {
      this.disabledButton = false;
      this.designerService.disabledButton = false;
    }
    if(this.ExternalUserAccessControlForm.valueChanges) {
      this.setDataModified();
    }
  }
  addButtonClick() {
    this.submitted = true;
    (<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).push(this.addAnother());
    if (this.ExternalUserAccessControlForm.value.domainAdd[(<FormArray>this.ExternalUserAccessControlForm.get('domainAdd')).length - 1].ExternalUserAccessControl.length == 0) {
      this.disabledButton = true;
      this.designerService.disabledButton = true;
    }
    this.setDataModified();
  }
  addAnother(): FormGroup {
    this.setDataModified();
    return this.formBuilder.group({
      ExternalUserAccessControl: ['', [Validators.required, Validators.pattern("@[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$")]],
    });

  }

  private _isExpansionIndicator(target: EventTarget, expansionIndicatorClass): boolean {
    return (target['classList'] && target['classList'].contains(expansionIndicatorClass));
  }

  checkIsExternalUser() {
    this.userService.isExternalUser().subscribe((response: boolean) => {
      this.isExternalUser = response
    });
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }
}
