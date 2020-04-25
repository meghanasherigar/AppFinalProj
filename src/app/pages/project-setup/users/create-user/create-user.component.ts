import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { SearchViewModel, UserAdminGridData, AdminUserEventPayload, InScope, InExternal, RegionViewModel, ProjectUserRightViewModel, EntityRoleViewModel, CountryEntitySearchViewModel, OtherCountryViewModel, ProjectTemplateViewModel, IndiviualEntityViewModel, RegionCountrySearchViewModel, SearchProjectExternalUser, UserSearchOption, SearchProjectIinternalUser } from '../../../../@models/userAdmin';
import { DialogService } from '../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { Country } from '../../../../@models/common/country';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatAutocompleteSelectedEvent } from '@angular/material';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { CurrentSettings, ProjectSettings } from '../../../../@models/project-settings/project-settings';
import { END } from '@angular/cdk/keycodes';
import { element } from '@angular/core/src/render3';
import { ProjectSettingService } from '../../services/project-setting.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { typeSourceSpan } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'ngx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {


  //ngx-ui-loader configuration
  loaderId = 'cerateUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  @Input() editAdminUserFlag: boolean;
  IsEnableProjectUserForm: boolean = false;
  newUser:boolean;
  IsEnableLink: boolean = false;
  IsEnableClientUserLink: boolean = false;
  subscriptions: Subscription = new Subscription();
  formSubmitted = false;
  userInvalid = false;
  disabledSearch:boolean;
  txtFirstName:any;
  disabledSearchService:boolean=false;
  splittedString:string;
  emailDominPresence:boolean;
  entitySelection:boolean=false;
  deloitteSection:boolean=true;
  userAdminRolesForm: FormGroup;
  searchUserForm: FormGroup;
  searchEntityForm: FormGroup;
  createUserAdminForm: FormGroup;
  searchUserResult = [];
  domainData = [];
  searchEntityResult = [];
  adminUserData: ProjectUserRightViewModel = new ProjectUserRightViewModel();
  searchViewModel: SearchViewModel = new SearchViewModel();
  searchProjectIinternalUser:SearchProjectIinternalUser=new SearchProjectIinternalUser();
  searchProjectExternalUser: SearchProjectExternalUser = new SearchProjectExternalUser();
  adminUserEventPayload: AdminUserEventPayload;
  countryEntitySearchViewModel = CountryEntitySearchViewModel;
  otherCountryViewModel = new OtherCountryViewModel();
  IsLocalUserEnable: boolean = false;
  IsCentralUserEnabled: boolean = false;
  projectLead: boolean = false;
  searchUserFlag: boolean = false;
  inScope = new InScope();
  inExternal = new InExternal();
  isChecked = new EntityRoleViewModel();
  regionList = [];
  countryList = [];
  entityList = [];
  regionDetail = [];
  projectTemplateList = [];
  countryDetail: any = [];
  entityDetail = [];
  indiviualEntityDetails = [];
  disableCreateButton: boolean = true;
  isenitySelectChip: boolean = false;
  private regionDropdownSetting: any;
  private countryDropdownSetting: any;
  private entitiesDropdownSetting: any;
  private templateDropdownSetting: any;
  lookUpTypeList=[];
  selectedRegionItems: [];
  selectedCountryItems: [];
  selectedEntityItems: [];
  selectedProjectTemplate = [];
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() CancelTransaction: EventEmitter<any> = new EventEmitter();
  private dialogTemplate: Dialog;
  removable = true;
  selectable = true;
  multiple = false;
  SelectedEntityIds = [];
  selectedType: String;
  indiviualEntityRightsAssigned = new Array<EntityRoleViewModel>();
  checked: boolean = false;
  projectTemplate = [];
  ref: any;
  newName: String;
  savebuttonClicked: boolean = true;
  cancelbuttonClicked: boolean = true;
  lookUpType:any;
  constructor(
    private projectSettingService: ProjectSettingService,
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private projectUserService: ProjectUserService,
    private dialogService: DialogService,
    private el: ElementRef,
    private dialog: MatDialog,
    private translate: TranslateService,
    private shareDetailService: ShareDetailService,
    private ngxLoader: NgxUiLoaderService,
     private toastr: ToastrService
  ) {
    this.lookUpTypeList.push(this.translate.instant('screens.project-user.Placeholders.LastName'));
    this.lookUpTypeList.push(this.translate.instant('screens.project-user.Placeholders.Email'));
    this.adminUserEventPayload = new AdminUserEventPayload();
    this.searchUserForm = this.formBuilder.group({
      SearchUser: ['', [Validators.required]],
      lookUpType:['']
    });

    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lookUpTypeList=[];
      this.lookUpTypeList.push(this.translate.instant('screens.project-user.Placeholders.LastName'));
      this.lookUpTypeList.push(this.translate.instant('screens.project-user.Placeholders.Email'));
    
    }));
    this.searchProjectIinternalUser.SearchOption=this.searchProjectExternalUser.SearchOption= UserSearchOption.LastName;
    this.searchUserForm.controls["lookUpType"].setValue(this.translate.instant('screens.project-user.Placeholders.LastName'));
    this.searchUserForm.controls["SearchUser"].valueChanges.distinctUntilChanged().debounceTime(300)
      .subscribe(data => {
        if(data===this.txtFirstName)
        this.disabledSearchService=true;
        else
        this.disabledSearchService=false;
        this.searchProjectIinternalUser.Keyword = data;
        this.searchProjectExternalUser.Keyword = data;
       
        //Set minimum legnth based on email or last name
        let minSearchLength=this.searchProjectIinternalUser.SearchOption==0?1:3;

        this.searchProjectExternalUser.ProjectId = this.shareDetailService.getORganizationDetail().projectId;
        if (data.length > 0) {
          if (data.length >= minSearchLength) {
            //setTimeout(() => {
            if (this.ref) {
              this.ref.unsubscribe();
            }
            if (this.deloitteSection && !this.disabledSearchService) {
              this.searchUserResult = [];

              this.ref = this.projectUserService.searchUser(this.searchProjectIinternalUser, this.searchUserFlag)
                .subscribe(
                  response => {
                    if (response.length > 0) {
                      this.searchUserResult = [];
                      this.searchUserResult = response;
                      this.IsEnableLink = false;
                      this.IsEnableClientUserLink = false;
                      this.IsEnableProjectUserForm = true;
                    this.newUser=false;
                    }
                    else {
                      this.disabledSearch=false;
                      this.newUser=true;
                      //const selected: any = [{ firstName: '', lastName:'', email : 'No data found'}];
                      this.searchUserResult = [];
                      //this.searchUserResult = selected;
                      this.IsEnableLink = true;
                      if (!this.searchUserFlag) {
                        this.IsEnableClientUserLink = true;
                      }
                      else {
                        this.IsEnableClientUserLink = false;
                      }
                      this.IsEnableProjectUserForm = false;
                    }
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
            else if (!this.deloitteSection && !this.disabledSearchService)
            {
              this.searchUserResult = [];
              this.ref = this.projectUserService.searchProjectExternalUser(this.searchProjectExternalUser)
                .subscribe(
                  response => {
                    if (response.length > 0) {
                      this.searchUserResult = [];
                      this.searchUserResult = response;
                      this.newUser=false;
                      this.IsEnableLink = false;
                      this.IsEnableClientUserLink = false;
                      this.IsEnableProjectUserForm = true;
                    }
                    else {
                      this.disabledSearch=false;
                      //const selected: any = [{ firstName: '', lastName:'', email : 'No data found'}];
                      this.searchUserResult = [];
                      //this.searchUserResult = selected;
                     this.newUser=true;
                      this.IsEnableLink = true;
                      if (!this.searchUserFlag) {
                        this.IsEnableClientUserLink = true;
                      }
                      else {
                        this.IsEnableClientUserLink = false;
                      }
                      this.IsEnableProjectUserForm = false;
                    }
                  }),
                error => {
                  this.dialogService.Open(DialogTypes.Warning, error.message);
                };
            }
            //}, 1000);
          }
        }
        else {
          this.searchUserResult = [];
          this.createUserAdminForm.reset();
          this.IsEnableProjectUserForm = false;
          this.IsEnableLink = false;
             this.newUser=false;
        }
      });

    this.searchEntityForm = this.formBuilder.group({
      EntitySearch: [''],
    });

    this.searchEntityForm.controls["EntitySearch"].valueChanges
      .subscribe(data => {
        this.searchEntityResult = [];
        this.indiviualEntityDetails = [];
        if (data.length >= 1) {
          this.entityDetail.forEach((entity) => {
            if (entity.legalEntityName.toLowerCase().includes(data.toLowerCase())) {
              //this.searchEntityResult.push(entity);
              entity.selected = false;
              this.indiviualEntityDetails.push(entity);
            }
          });
        }
        else {
          this.entityDetail.forEach((entity) => {
            entity.selected = false;
            this.indiviualEntityDetails.push(entity);
          });
        }
      });

    this.createUserAdminForm = this.formBuilder.group({
      DeloitteUser: [''],
      ClientUser: [''],
      Id: null,
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Email:  ['',[Validators.required, checkingDomain(this.domainData)]],
      CentralUser: [''],
      LocalUser: [''],
      Region: [''],
      Country: [''],
      Entities: [''],
      Read: [''],
      Copy: [''],
      Remove: [''],
      Formatting: [''],
      Edit: [''],
      Create: [''],
      ReArrange: [''],
      ReportGeneration: [''],
      selectedRegionItems: [''],
      selectedCountryItems: [''],
      selectedEntityItems: [''],
      SearchEntitySelected: [''],
      EntitySelection: [''],
      ProjectTemplate: [''],
    });

  }

  ngOnInit() {
  
    this.inExternal.checkbox3 = true;
    this.searchUserFlag = true;
    this.multipleSelectDropdownSetting();
    const project = this.shareDetailService.getORganizationDetail();
    if((this.selectedRegionItems==undefined)&&(this.selectedCountryItems==undefined))
    {
      this.projectUserService.getAllEntities(project.projectId).subscribe(data => {
        this.entityList = data;
        this.entityList.forEach(ele => {
          ele.legalEntityName = ele.legalEntityName;
          ele.fullName = this.formatEntityName(ele.legalEntityName,ele.taxableYearEnd,"DD MMM YYYY",'(');
        });
        this.selectedEntityItems = [];
        this.indiviualEntityDetails = [];
      });
    }
   
    this.projectUserService.getAllRegions(project.projectId).subscribe(regions => {
      this.regionList = regions;
    });
    this.projectUserService.getAllProjectTemplate(project.projectId).subscribe(result => {
      this.projectTemplate = result;
    });
    let projectDetail = this.shareDetailService.getORganizationDetail();
    if(projectDetail && projectDetail.projectId)
    {
    this.projectSettingService.getProjectManagementSettings().subscribe((response: ProjectSettings) => {
      let domain = response.currentSettings.filter(sett => sett.type === 4);
      domain.forEach(element => {
        this.domainData.push(element.name);
      });
    });
    }
  }

  createAdminUser() {
    this.formSubmitted = true;
    this.userInvalid = false;
    this.savebuttonClicked = false;
    this.cancelbuttonClicked = false;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    const project = this.shareDetailService.getORganizationDetail();

    this.adminUserData = new ProjectUserRightViewModel();
    this.adminUserData.projectId = project.projectId;
    this.adminUserData.userFirstName = this.createUserAdminForm.controls["FirstName"].value;
    this.adminUserData.userLastName = this.createUserAdminForm.controls["LastName"].value;
    this.adminUserData.userEmail = this.createUserAdminForm.controls["Email"].value;
    if (this.adminUserData.userEmail && this.adminUserData.userEmail.length > 0) {
      this.splittedString = this.adminUserData.userEmail.substring(this.adminUserData.userEmail.indexOf('@'), END);
    }

    this.adminUserData.region = this.regionDetail;
    this.adminUserData.country = this.countryDetail;
    this.adminUserData.projectTemplate = this.projectTemplateList;
    this.adminUserData.isLead = this.projectLead;

    if (this.inExternal.checkbox3)
      this.adminUserData.isExternalUser = false;
    else
      this.adminUserData.isExternalUser = true;
    if (this.inScope.checkbox1)
      this.adminUserData.isCentralUser = true;
    else
      this.adminUserData.isCentralUser = false;
    this.adminUserData.entityRole = new Array<EntityRoleViewModel>();
    this.indiviualEntityRightsAssigned.forEach((entity) => {
      this.adminUserData.entityRole.push(entity);
    });

    this.adminUserData.userCountry = this.otherCountryViewModel;
  if(this.newUser){
    this.validateUser();

    if (this.createUserAdminForm.invalid || this.userInvalid) {

    //  this.disableCreateButton = true;
      this.savebuttonClicked = true;
      this.cancelbuttonClicked = true;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      return;
    }
    
  }

    this.subscriptions.add(this.projectUserService.insertProjectUser(this.adminUserData)
      .subscribe(
        response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          if (response.status === ResponseStatus.Sucess) {
           this.toastr.success(this.translate.instant('screens.project-setup.Users.Created'));
           this.manageTransaction.emit();
            this.closeCreateTransactionPopup('CancelCreate');
          } else {
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
            this.savebuttonClicked = true;
            this.cancelbuttonClicked = true;
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            this.createUserAdminForm.reset();
            this.indiviualEntityDetails = [];
           // this.disableCreateButton = false;
            this.createUserAdminForm.controls["CentralUser"].reset();
            this.createUserAdminForm.controls["LocalUser"].reset();
            this.IsLocalUserEnable = false;
            this.IsCentralUserEnabled = false;
            this.disableCreateButton=true;
            this.projectLead = false;
          }
        },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Warning, error.message);
          this.savebuttonClicked = true;
          this.cancelbuttonClicked = true;
          
        }));
  }


  CancelConfirmationDialog(action): void {
    this.savebuttonClicked = true;
    this.cancelbuttonClicked = true;
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.project-setup.Users.Confirmation.CancleConfirm');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.closeCreateTransactionPopup(action);
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  //method which will close the create transaction popup
  closeCreateTransactionPopup(action) {
    this.CancelTransaction.emit(action);
  }

  validateUser() {
    if (!(this.inScope.checkbox2 === true || this.inScope.checkbox1 === true)) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.SelectCentaralOrLocal'));
      this.userInvalid = true;
    }
    if (this.inScope.checkbox2 === true) {
      //ToDo
      // if (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) {
      //   this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired'));
      //   this.userInvalid = true;
      //   return
      // }
      // if (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) {
      //   this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.CountryRequired'));
      //   this.userInvalid = true;
      //   return
      // }
      if (this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.EntityRequired'));
        this.userInvalid = true;
        return
      }
      if (this.indiviualEntityRightsAssigned.length <= 0) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.AssignEntityRights'));
        this.userInvalid = true;
        return
      }
    }
  }

  get form() { return this.createUserAdminForm.controls; }

  lookuPTypeOnChange(event){
    
    this.lookUpType=event.target['value'];
    let lookupTypeVal= event.target.selectedIndex;
    if( this.lookUpType)
    {
      this.searchUserForm.controls["SearchUser"].setValue('');
      this.searchUserForm.controls["lookUpType"].setValue(this.lookUpType);
      
      this.searchProjectIinternalUser.SearchOption=lookupTypeVal;
      this.searchProjectExternalUser.SearchOption=lookupTypeVal;
    }
    else
    {
      this.searchUserForm.controls["lookUpType"].setValue('');
    }
  }
  populateUserDetails(item) {
    this.disabledSearchService=true;
  
    let txtFirstName = this.el.nativeElement.querySelector("#txtFirstName");
    let txtLastName = this.el.nativeElement.querySelector("#txtLastName");
    this.txtFirstName=item.firstName;
    let txtEmail = this.el.nativeElement.querySelector("#txtEmail");
    if (item != null && item.firstName != "") {
      this.createUserAdminForm.controls["FirstName"].setValue(item.firstName);
      this.createUserAdminForm.controls["LastName"].setValue(item.lastName);
      this.createUserAdminForm.controls["Email"].setValue(item.email);
      this.otherCountryViewModel = item.country;
      txtFirstName.classList.add("disable-section");
      txtFirstName.classList.add("disabledbutton");
      txtLastName.classList.add("disable-section");
      txtLastName.classList.add("disabledbutton");
      txtEmail.classList.add("disable-section");
      txtEmail.classList.add("disabledbutton");
    }
    else {
      txtFirstName.classList.remove("disable-section");
      txtFirstName.classList.remove("disabledbutton");
      txtLastName.classList.remove("disable-section");
      txtLastName.classList.remove("disabledbutton");
      txtEmail.classList.remove("disable-section");
      txtEmail.classList.remove("disabledbutton");
      this.otherCountryViewModel = null;
    }
  }

  toggleCheckbox(event, Mode) {
    var value = event.currentTarget.checked ? "true" : "";
    if (Mode == "1") {
      if (event.target.id === 'centralUserCheckBox') {
        if (this.inScope.checkbox1)
          {
            this.inScope.checkbox1 = false;
            this.disableCreateButton=true;
          }
        else
          this.inScope.checkbox1 = true;
        this.inScope.checkbox2 = false
        this.IsLocalUserEnable = false;

        this.IsCentralUserEnabled = value === 'true';
        if( this.IsCentralUserEnabled)
        this.disableCreateButton=false;
        else
        this.disableCreateButton=true;
      }
      else {
        this.IsCentralUserEnabled = false;
        this.disableCreateButton=true;
        if (this.inScope.checkbox2)
          this.inScope.checkbox2 = false;
        else
          this.inScope.checkbox2 = true;
        this.inScope.checkbox1 = false;
        if (value == 'true') {
          this.IsLocalUserEnable = true;
          this.disableCreateButton=true;

        }
        else {
          this.IsLocalUserEnable = false;
      
        }
      }
    }
    else {
      if (event.target.id === 'deloitteUserCheckBox') {
        this.disabledSearchService=false;
        this.searchUserForm.controls["SearchUser"].setValue('');
        this.searchUserForm.controls["lookUpType"].setValue(this.translate.instant('screens.project-user.Placeholders.LastName'));
        this.searchProjectIinternalUser.SearchOption=this.searchProjectExternalUser.SearchOption= UserSearchOption.LastName;
        this.deloitteSection = true;
        this.searchUserFlag = true;
        this.projectUserService.searchUser(this.searchProjectIinternalUser, this.searchUserFlag)
          .subscribe(
            response => {
              if (response.length > 0) {
                this.searchUserResult = [];
                this.searchUserResult = response;
                this.IsEnableLink = false;
                this.IsEnableClientUserLink = false;
                this.IsEnableProjectUserForm = true;
              }
            });
        this.disabledSearch = false;
        if (this.inExternal.checkbox3)
          this.inExternal.checkbox3 = false;
        else
          this.inExternal.checkbox3 = true;
        this.inExternal.checkbox4 = false
      }
      else {
        this.disabledSearchService=false;
        this.searchUserForm.controls["SearchUser"].setValue('');
        this.searchUserForm.controls["lookUpType"].setValue(this.translate.instant('screens.project-user.Placeholders.LastName'));
        this.searchProjectIinternalUser.SearchOption= this.searchProjectExternalUser.SearchOption= UserSearchOption.LastName;
        this.deloitteSection = false;
        this.projectUserService.searchProjectExternalUser(this.searchProjectExternalUser)
          .subscribe(
            response => {
              if (response.length > 0) {
                this.searchUserResult = [];
                this.searchUserResult = response;
                this.IsEnableLink = false;
                this.IsEnableClientUserLink = false;
                this.IsEnableProjectUserForm = true;
              }
            });
        if (this.inExternal.checkbox4)
          this.inExternal.checkbox4 = false;
        else
          this.inExternal.checkbox4 = true;
        this.inExternal.checkbox3 = false;
        if (this.inExternal.checkbox4) {
          //todo
          this.projectUserService.getWhiteListedDomains().subscribe((Response: CurrentSettings[]) => {
            if (Response) {
              if (Response.length != 0) {
                this.disabledSearch = false;

              }
              else {
                this.disabledSearch = true;
                this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.DomainList'));

              }

            }
          });
        }
      }
      if (value == "") {
        this.inExternal.checkbox3 = true;
      }
      if (this.inExternal.checkbox3) {
        this.searchUserFlag = true;
      }
      else {
        this.searchUserFlag = false;
      }
      this.createUserAdminForm.reset();
      this.IsEnableLink = false;
      this.IsEnableProjectUserForm = false;
    }
  }

  private multipleSelectDropdownSetting() {
    this.regionDropdownSetting = {
      singleSelection: false,
      idField: 'regionId',
      textField: 'regionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.countryDropdownSetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.entitiesDropdownSetting = {
      singleSelection: false,
      idField: 'entityId',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.templateDropdownSetting = {
      singleSelection: false,
      idField: 'templateId',
      textField: 'templateName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  onRegionItemSelect(items: any, Mode) {
    this.regionDetail = [];
    if (this.selectedRegionItems != undefined) {
      this.selectedRegionItems.forEach((element: never) => {
        this.regionDetail.push(element["regionId"]);
      });
    }
    let reg = new RegionCountrySearchViewModel();
    reg.regionIds = this.regionDetail;
    const project = this.shareDetailService.getORganizationDetail();
    reg.ProjectId = project.projectId;
    this.projectUserService.getCountriesByRegion(reg).subscribe(country => {
      this.countryList = country;
      this.selectedCountryItems = [];
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });
    this.loadAllEntity();
  }

  loadAllEntity() {
  if(this.selectedCountryItems.length == 0 || this.selectedRegionItems.length == 0) {
  const project = this.shareDetailService.getORganizationDetail();
  if((this.selectedCountryItems !=undefined)||(this.selectedRegionItems !=undefined))
  {
    this.projectUserService.getAllEntities(project.projectId).subscribe(entity => {
      this.entityList = entity;
      this.entityList.forEach(ele => {
        ele.legalEntityName = ele.legalEntityName;
        ele.fullName = ele.legalEntityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });
  }
}
}
  onAllRegionItemSelect(items: any, Mode) {
    this.regionDetail = [];
    if (Mode == 1) {
      items.forEach(element => {
        this.regionDetail.push(element.regionId);
      });
    }
    let reg = new RegionCountrySearchViewModel();
    reg.regionIds = this.regionDetail;
    const project = this.shareDetailService.getORganizationDetail();
    reg.ProjectId = project.projectId;
    this.projectUserService.getCountriesByRegion(reg).subscribe(country => {
      this.countryList = country;
      this.selectedCountryItems = [];
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });
    this.loadAllEntity();
  }

  onTemplateSelect(items: any, Mode) {
    this.projectTemplateList = [];
    if (this.selectedProjectTemplate != undefined) {
      this.selectedProjectTemplate.forEach((element: never) => {
        this.projectTemplateList.push(element);
      });
    }
  }

  onAllTemplateSelect(items: any, Mode) {
    this.projectTemplate = [];
    if (Mode == 1) {
      items.forEach(element => {
        this.projectTemplate.push(element);
      });
    }
  }

  onCountryItemSelect(items: any, Mode) {
    this.countryDetail = [];
    if (this.selectedCountryItems != undefined) {
      this.selectedCountryItems.forEach((element: never) => {
        this.countryDetail.push(element["id"]);
      });
    }
    var countryEntitySearchViewModel = new CountryEntitySearchViewModel();
    countryEntitySearchViewModel.CountryIds = this.countryDetail;
    const project = this.shareDetailService.getORganizationDetail();
    countryEntitySearchViewModel.ProjectId = project.projectId;
    this.projectUserService.getEntitiesByCountry(countryEntitySearchViewModel).subscribe(entity => {
      this.entityList = entity;
      this.entityList.forEach(ele => {
        ele.legalEntityName = ele.legalEntityName;
        ele.fullName = ele.legalEntityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });

    this.loadAllEntity();
  }

  onAllCountryItemSelect(items: any, Mode) {
    this.countryDetail = [];
    if (Mode == 1) {
      items.forEach(element => {
        this.countryDetail.push(element.id);
      });
    }
    var countryEntitySearchViewModel = new CountryEntitySearchViewModel();
    countryEntitySearchViewModel.CountryIds = this.countryDetail;
    const project = this.shareDetailService.getORganizationDetail();
    countryEntitySearchViewModel.ProjectId = project.projectId;
    this.projectUserService.getEntitiesByCountry(countryEntitySearchViewModel).subscribe(entity => {
      this.entityList = entity;
      this.entityList.forEach(ele => {
        ele.legalEntityName = ele.legalEntityName;
        ele.fullName = ele.legalEntityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });
  }

  onEntityItemSelect(item: any, Mode) {
   
    this.entityDetail = [];
    this.indiviualEntityDetails = [];
    if (this.selectedEntityItems != undefined) {
      this.selectedEntityItems.forEach((element) => {
        this.entityDetail.push(element);
        let data = new IndiviualEntityViewModel();
        data.entityId = element['entityId'];
        data.selected = false;
        data.legalEntityName = this.entityList.filter(e => e.entityId == data.entityId)[0].legalEntityName;
        data.taxableYearEnd = this.entityList.filter(e => e.entityId == data.entityId)[0].taxableYearEnd;
        this.indiviualEntityDetails.push(data);
        this.isenitySelectChip = true;
      });
    }
    if( this.selectedEntityItems.length < 1){
      this.isenitySelectChip = false;
    }
    
  }

  RemoveEntityTags(item: any) {
   
    this.indiviualEntityDetails.splice(this.indiviualEntityDetails.indexOf(item), 1);
    if(this.indiviualEntityDetails.length>0){
      this.entitySelection=true;
    }
    else
    {
      this.entitySelection=false;
    }
    this.selectedEntityItems.splice(this.indiviualEntityDetails.indexOf(item), 1);
    this.createUserAdminForm.controls["Entities"].setValue(this.selectedEntityItems);
  }

  onAllEntityItemsSelectAll(item: any, Mode) {
    this.entityDetail = [];
    this.indiviualEntityDetails = [];
    if (Mode == 1) {
      item.forEach(element => {
        this.entityDetail.push(element);
        element.selected = false;
        element.legalEntityName = this.entityList.filter(e => e.entityId == element.entityId)[0].legalEntityName;
        element.taxableYearEnd = this.entityList.filter(e => e.entityId == element.entityId)[0].taxableYearEnd;
        this.indiviualEntityDetails.push(element);
        this.isenitySelectChip = true;
      });
    }
    else{
      this.isenitySelectChip = false;
    }
    this.ClearAssignEntityRights();
    
    
  }

  SelectAllOrDeselectAll(Mode) {
    this.indiviualEntityDetails.forEach((element, i) => {
      if (Mode === 'SelectAll') {
        this.entitySelection=true;
        this.multiple = true;
        element.selected = true;
      } else {
        this.entitySelection=false;
        this.multiple = false;
        element.selected = false;
      }
    });
    this.ClearAssignEntityRights();
  }

  OnSelectedType(event) {
    if (event.target.value === "Multiple") {
      this.multiple = true;
    }
    else {
      this.multiple = false;
    }
    this.indiviualEntityDetails.forEach((element) => {
      element.selected = false;
    });
    this.ClearAssignEntityRights();
  }

  selectedEntityTags(index) {
    if(this.indiviualEntityDetails.length>0){
      this.entitySelection=true;
    }
    else
    {
      this.entitySelection=false;
    }
    this.ClearAssignEntityRights();
    this.indiviualEntityDetails.forEach((element, i) => {
      if (this.multiple == false) {
        if (index === i) {
          if (element.selected === true) {
            element.selected = false;
          } else {
            element.selected = true;
            this.AssignSelectedEntityRights(element.entityId);
          }
        }
        else {
          element.selected = false;
        }
      }
      else {
        if (index === i) {
          if (element.selected === true) {
            element.selected = false;
          } else {
            element.selected = true;
          }
        }
      }
    });
  }

  getIndexOfData(_id: string, listOfData): number {
    return listOfData.findIndex(record => record.id === _id);
  }

  onCheckboxSelect() {
    this.isChecked.read = true;
  }

  AssignEntityRights() {
    if (this.indiviualEntityDetails.find(e => e.selected === true)) {
      if (!this.isChecked.read && !this.isChecked.copy && !this.isChecked.remove && !this.isChecked.formatting
        && !this.isChecked.edit && !this.isChecked.created && !this.isChecked.reArrange
        && !this.isChecked.reportGeneration) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.SelectRights'));
      }
      else {
        this.indiviualEntityDetails.forEach((element, i) => {
          if (element.selected === true) {
            let entityModel = new EntityRoleViewModel();
            entityModel.entityId = element.entityId;
            entityModel.entityName = element.legalEntityName;
            entityModel.taxableYearEnd = element.taxableYearEnd;
            entityModel.read = (this.isChecked.read) ? true : false;
            entityModel.copy = (this.isChecked.copy) ? true : false;
            entityModel.remove = (this.isChecked.remove) ? true : false;
            entityModel.formatting = (this.isChecked.formatting) ? true : false;
            entityModel.edit = (this.isChecked.edit) ? true : false;
            entityModel.created = (this.isChecked.created) ? true : false;
            entityModel.reArrange = (this.isChecked.reArrange) ? true : false;
            entityModel.reportGeneration = (this.isChecked.reportGeneration) ? true : false;
            const exist = this.indiviualEntityRightsAssigned.filter((e) => e.entityId === element.entityId);
            if (exist.length > 0) {
              this.indiviualEntityRightsAssigned[i] = entityModel;
            } else {
              this.indiviualEntityRightsAssigned.push(entityModel);
            }
          }
        });
         this.toastr.success(this.translate.instant('screens.project-setup.Users.ValidaionMessages.AssignRightsSuccess'));
        
        this.disableCreateButton=false;
        //this.SelectAllOrDeselectAll('');
      }
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.PleaseSelectEntity'));
      this.disableCreateButton=false;
    }
  }

  ClearAssignEntityRights() {
    this.createUserAdminForm.controls["Read"].reset();
    this.createUserAdminForm.controls["Copy"].reset();
    this.createUserAdminForm.controls["Create"].reset();
    this.createUserAdminForm.controls["Edit"].reset();
    this.createUserAdminForm.controls["Formatting"].reset();
    this.createUserAdminForm.controls["ReArrange"].reset();
    this.createUserAdminForm.controls["Remove"].reset();
    this.createUserAdminForm.controls["ReportGeneration"].reset();
    this.disableCreateButton=true;
  }

  EnableProjectUserForm() {
    this.IsEnableLink = false;
    this.IsEnableProjectUserForm = true;
  }

  AssignSelectedEntityRights(SelectedEntityTag) {
    this.indiviualEntityRightsAssigned.forEach((data) => {
      if (data.entityId == SelectedEntityTag) {
        if (data.read) {
          this.createUserAdminForm.controls["Read"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Read"].setValue(false);
        }
        if (data.copy) {
          this.createUserAdminForm.controls["Copy"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Copy"].setValue(false);
        }
        if (data.remove) {
          this.createUserAdminForm.controls["Remove"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Remove"].setValue(false);
        }
        if (data.formatting) {
          this.createUserAdminForm.controls["Formatting"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Formatting"].setValue(false);
        }
        if (data.edit) {
          this.createUserAdminForm.controls["Edit"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Edit"].setValue(false);
        }
        if (data.created) {
          this.createUserAdminForm.controls["Create"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["Create"].setValue(false);
        }
        if (data.reArrange) {
          this.createUserAdminForm.controls["ReArrange"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["ReArrange"].setValue(false);
        }
        if (data.reportGeneration) {
          this.createUserAdminForm.controls["ReportGeneration"].setValue(true);
        }
        else {
          this.createUserAdminForm.controls["ReportGeneration"].setValue(false);
        }

      }
    });
  }
  formatEntityName(entityName,taxableYearEnd,dateFormat,delimiter='-')
  {
    taxableYearEnd=moment(taxableYearEnd).local().format(dateFormat);
     if(delimiter='(')
     {
    return `${entityName}  (${taxableYearEnd})`;
     }
     else
     {
      return `${entityName}  - ${taxableYearEnd}`;
     }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

function checkingDomain(domainName: any[]) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let userEmail = control.value == null ? control.value : control.value.toLowerCase();
    let checked: boolean = false;
    let regex = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,3}$");

    if (userEmail) {
      let splittedString = userEmail.substring(userEmail.indexOf('@'), END);

        domainName.forEach(element => {
          if (splittedString === element)
            checked = true;
        });
    
      }

    if((checked)&&(regex.test(userEmail)))
    {
      return null;
    }
    else
      return { 'checkingDomain': true };
  }
}