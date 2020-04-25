import { Component, OnInit, Input, EventEmitter, Output, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { SearchViewModel, UserAdminGridData, AdminUserEventPayload, InScope, InExternal, RegionViewModel, ProjectUserRightViewModel, EntityRoleViewModel, CountryEntitySearchViewModel, OtherCountryViewModel, EditRegionViewModel, EditCountryViewModel, EditEntityViewModel, ProjectTemplateViewModel, IndiviualEntityViewModel, RegionCountrySearchViewModel } from '../../../../@models/userAdmin';
import { DialogService } from '../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { Country } from '../../../../@models/common/country';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { element } from '@angular/core/src/render3';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'ngx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})

export class EditUserComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  formSubmitted = false;
  userInvalid = false;
  createUserAdminForm: FormGroup;
  searchEntityForm: FormGroup;
  searchEntityResult = [];
  adminUserData: ProjectUserRightViewModel = new ProjectUserRightViewModel();
  searchViewModel: SearchViewModel = new SearchViewModel();
  entityRole: EntityRoleViewModel = new EntityRoleViewModel();
  adminUserEventPayload: AdminUserEventPayload;
  otherCountryViewModel = new OtherCountryViewModel();
  countryEntitySearchViewModel = CountryEntitySearchViewModel;
  IsLocalUserEnable: boolean = false;
  IsCentralUserEnabled: boolean = false;
  entitySelection:boolean=false;
  searchUserFlag: boolean = false;
  inScope = new InScope();
  inExternal = new InExternal();
  isChecked = new EntityRoleViewModel();
  regionList = [];
  selectedItems: any[];
  countryList = [];
  entityList = [];
  regionDetail = [];
  projectTemplateList = [];
  countryDetail: any = [];
  entityDetail = [];
  indiviualEntityDetails = [];
  private regionDropdownSetting: any;
  private countryDropdownSetting: any;
  private entitiesDropdownSetting: any;
  private templateDropdownSetting: any;
  selectedRegionItems = [];
  selectedCountryItems = [];
  selectedEntityItems = [];
  selectedProjectTemplate = [];
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() CancelTransaction: EventEmitter<any> = new EventEmitter();
  editCountryList = [];
  editEntityList = [];
  private dialogTemplate: Dialog;
  removable = true;
  selectable = true;
  multiple = false;
  SelectedEntityIds = [];
  selectedType: String;
  indiviualEntityRightsAssigned = new Array<EntityRoleViewModel>();
  IsEnableTemplateAccess: boolean = false;
  projectTemplate = [];
  isProjectCreator: boolean;
  // To expand/collapse filters
  public show: boolean = false;
  public imageName: any = 'Show more';
  public EnableShowMore: boolean = false;
  newName: String;
  projectLead: boolean;
  projectLeadOriginalValue: boolean;

  constructor(
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private projectUserService: ProjectUserService,
    private dialogService: DialogService,
    private shareDetailService: ShareDetailService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private el: ElementRef,
    private elRef: ElementRef,
    private toastr: ToastrService
  ) {
    this.searchEntityForm = this.formBuilder.group({
      EntitySearch: [''],
    });

    this.searchEntityForm.controls["EntitySearch"].valueChanges
      .subscribe(data => {
        this.searchEntityResult = [];
        this.indiviualEntityDetails = [];
        if (data.length >= 3) {
          this.entityDetail.forEach((entity) => {
            if (entity.legalEntityName.toLowerCase().includes(data.toLowerCase())) {
              //this.searchEntityResult.push(entity);
              entity.selected = false;
              this.indiviualEntityDetails.push(entity);
              this.EnableShowMore = false;
            }
          });
        }
        else {
          this.entityDetail.forEach((entity) => {
            entity.selected = false;
            if (this.indiviualEntityDetails.length < 10) {
              this.indiviualEntityDetails.push(entity);
            }
          });
          if (this.entityDetail.length > 10) {
            this.EnableShowMore = true;
          }
          else {
            this.EnableShowMore = false;
          }
        }
      });

    this.adminUserEventPayload = new AdminUserEventPayload();
    this.createUserAdminForm = this.formBuilder.group({
      DeloitteUser: [''],
      ClientUser: [''],
      Id: null,
      FirstName: [''],
      LastName: [''],
      Email: [''],
      CentralUser: [''],
      LocalUser: [''],
      IsLead: [''],
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
      EntitySelection: [''],
      ProjectTemplate: [''],
    });
  }

  ngOnInit() {
    this.multipleSelectDropdownSetting();
    const project = this.shareDetailService.getORganizationDetail();
    this.projectUserService.getAllProjectTemplate(project.projectId).subscribe(result => {
      this.projectTemplate = result;
    });
    this.projectUserService.getAllRegions(project.projectId).subscribe(regions => {
      this.regionList = regions;
      this.populateAdminEditFormData(this.projectUserService.selectedAdminUserRows);
    });
    let updateTag = this.el.nativeElement.querySelector("#btnCreateEntity");
  }

  populateAdminEditFormData(selectedAdminUser: UserAdminGridData[]) {
    const project = this.shareDetailService.getORganizationDetail();
    let adminUser = selectedAdminUser[0];
    if (adminUser["isExternalUser"]) {
      this.inExternal.checkbox3 = false;
      this.inExternal.checkbox4 = true;
    }
    else {
      this.inExternal.checkbox3 = true;
      this.inExternal.checkbox4 = false;
    }

    let firstName = adminUser["userFirstName"].split(" ")[0];
    this.createUserAdminForm.controls["Id"].setValue(adminUser["id"]);
    this.createUserAdminForm.controls["LastName"].setValue(adminUser["userLastName"]);
    this.createUserAdminForm.controls["FirstName"].setValue(firstName);
    this.createUserAdminForm.controls["Email"].setValue(adminUser["userEmail"]);
    this.isProjectCreator = (adminUser.userEmail == project.projectCreator);
    this.createUserAdminForm.controls['IsLead'].setValue(adminUser['IsLead']);

    if (adminUser["isCentralUser"]) {
      this.inScope.checkbox1 = true;
      this.inScope.checkbox2 = false;
      this.IsLocalUserEnable = false;
      this.IsCentralUserEnabled = true;
    }
    else {
      this.inScope.checkbox1 = false;
      this.inScope.checkbox2 = true;
      this.IsLocalUserEnable = true;
    }

    if (adminUser.regionData.length > 0) {
      adminUser.regionData.forEach((regionId) => {
        let selectedReg = new EditRegionViewModel();
        selectedReg.regionId = regionId.regionId;
        selectedReg.regionName = regionId.regionName;
        this.selectedRegionItems.push(selectedReg);
      });
    }
    this.projectLead = adminUser['isLead'];
    this.projectLeadOriginalValue = adminUser['isLead'];
    this.createUserAdminForm.controls["Region"].setValue(this.selectedRegionItems);

    const regiondalIds = []
    this.selectedRegionItems.forEach(element => {
      regiondalIds.push(element.regionId);
    });

    if (regiondalIds != null) {
      this.onAllRegionItemSelect(regiondalIds, 1, "Edit");
    }
    else {
      this.onAllRegionItemSelect(regiondalIds, 0, "Edit");
    }

    if (adminUser.countryData.length > 0) {
      adminUser.countryData.forEach((id) => {
        let selectedCountry = new EditCountryViewModel();
        selectedCountry.id = id.id;
        selectedCountry.country = id.country;
        this.selectedCountryItems.push(selectedCountry);
      });
    }
    this.createUserAdminForm.controls["Country"].setValue(this.selectedCountryItems);

    const countryIds = []
    this.selectedCountryItems.forEach(element => {
      countryIds.push(element.id);
    });

    if (countryIds != null) {
      this.onAllCountryItemSelect(countryIds, 1, "Edit");
    }
    else {
      this.onAllCountryItemSelect(countryIds, 0, "Edit");
    }

    if (adminUser.projectTemplate.length > 0) {
      adminUser.projectTemplate.forEach((template) => {
        let selectedTemplate = new ProjectTemplateViewModel();
        selectedTemplate.templateId = template.templateId;
        selectedTemplate.templateName = template.templateName;
        this.selectedProjectTemplate.push(selectedTemplate);
      });
    }
    this.createUserAdminForm.controls["ProjectTemplate"].setValue(this.selectedProjectTemplate);
    this.onTemplateSelect(this.selectedProjectTemplate, 1);

    if (adminUser.entityRole.length > 0) {
      adminUser.entityRole.forEach((entityId) => {
        let selectedEntities = new EditEntityViewModel();
        selectedEntities.entityId = entityId.entityId;
        selectedEntities.legalEntityName = entityId.entityName;
        selectedEntities.fullName = entityId.entityName + ' ' + moment(entityId.taxableYearEnd).local().format("DD MMM YYYY");
        selectedEntities.taxableYearEnd = entityId.taxableYearEnd;
        this.selectedEntityItems.push(selectedEntities);
      });
    }

    adminUser.entityRole.forEach((entity) => {
      var entityModel = new EntityRoleViewModel();
      entityModel.entityId = entity.entityId;
      entityModel.entityName = entity.entityName;
      entityModel.taxableYearEnd = entity.taxableYearEnd;
      entityModel.read = (entity.read) ? true : false;
      entityModel.copy = (entity.copy) ? true : false;
      entityModel.remove = (entity.remove) ? true : false;
      entityModel.formatting = (entity.formatting) ? true : false;
      entityModel.edit = (entity.edit) ? true : false;
      entityModel.created = (entity.created) ? true : false;
      entityModel.reArrange = (entity.reArrange) ? true : false;
      entityModel.reportGeneration = (entity.reportGeneration) ? true : false;
      this.indiviualEntityRightsAssigned.push(entityModel);
    });

    this.createUserAdminForm.controls["Entities"].setValue(this.selectedEntityItems);

    if (this.selectedEntityItems != null) {
      this.onAllEntityItemsSelectAll(this.selectedEntityItems, 1);
    }
    else {
      this.onAllEntityItemsSelectAll(this.selectedEntityItems, 0);
    }

    this.elRef.nativeElement.querySelector("#localUserCheckBox").focus();
  }

  updateAdminUser() {
    this.formSubmitted = true;
    this.userInvalid = false;
    this.adminUserData.id = this.createUserAdminForm.controls["Id"].value;
    const project = this.shareDetailService.getORganizationDetail();
    this.adminUserData.projectId = project.projectId;
    this.adminUserData.userFirstName = this.createUserAdminForm.controls["FirstName"].value;
    this.adminUserData.userLastName = this.createUserAdminForm.controls["LastName"].value;
    this.adminUserData.userEmail = this.createUserAdminForm.controls["Email"].value;
    this.adminUserData.region = this.regionDetail;
    this.adminUserData.country = this.countryDetail;
    this.adminUserData.projectTemplate = this.projectTemplateList;

    this.adminUserData.isLead = this.projectLead;
    this.adminUserData.wasLead = this.projectLeadOriginalValue;

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

    this.adminUserData.userCountry = null;
    this.validateUser();

    if (this.userInvalid) {
      return;
    }

    this.subscriptions.add(this.projectUserService.updateProjectUser(this.adminUserData)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.Users.ValidaionMessages.Updated.Success'));
            this.manageTransaction.emit();
            this.closeEditTransactionPopup('CancelEdit');
          } else {
            //this.toastr.warning(response.errorMessages[0]);
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));

  }

  CancelConfirmationDialog(action): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.project-setup.Users.Confirmation.CancleConfirm');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.closeEditTransactionPopup(action);
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  //method which will close the edit transaction popup
  closeEditTransactionPopup(action) {
    this.CancelTransaction.emit(action);
  }

  validateUser() {
    if (!(this.inScope.checkbox2 === true || this.inScope.checkbox1 === true)) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.Updated.SelectCentaralOrLocal'));
      this.userInvalid = true;
    }
    if (this.inScope.checkbox2 === true) {
      if (this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.Updated.EntityRequired'));
        this.userInvalid = true;
        return
      }
      if (this.indiviualEntityRightsAssigned.length <= 0) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.Updated.AssignEntityRights'));
        this.userInvalid = true;
        return
      }
    }
  }

  get form() { return this.createUserAdminForm.controls; }


  toggleLeadMode() {
    this.formClick();
    this.projectLead = !this.projectLead;
    this.createUserAdminForm.controls['IsLead'].setValue(this.projectLead);
  }
  loadAllEntity()
  {
    const project = this.shareDetailService.getORganizationDetail();
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
  toggleCheckbox(event, Mode) {
    this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disable-section");
    this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disabledbutton");
    var value = event.currentTarget.checked ? "true" : "";
    if (Mode == "1") {
      if (event.target.id === 'centralUserCheckBox') {
        if (this.inScope.checkbox1)
          this.inScope.checkbox1 = false;
        else
          this.inScope.checkbox1 = true;
        this.inScope.checkbox2 = false
        this.IsLocalUserEnable = false;
        this.IsCentralUserEnabled = value === 'true';
      }
      else {
        this.IsCentralUserEnabled = false;

        if (this.inScope.checkbox2)
          this.inScope.checkbox2 = false;
        else
          this.inScope.checkbox2 = true;
        this.inScope.checkbox1 = false;
        if (value == 'true') {
          this.IsLocalUserEnable = true;
          this.loadAllEntity();
        }
        else {
          this.IsLocalUserEnable = false;
        }
      }
    }
    else {
      if (event.target.id === 'deloitteUserCheckBox') {
        if (this.inExternal.checkbox3)
          this.inExternal.checkbox3 = false;
        else
          this.inExternal.checkbox3 = true;
        this.inExternal.checkbox4 = false
      }
      else {
        if (this.inExternal.checkbox4)
          this.inExternal.checkbox4 = false;
        else
          this.inExternal.checkbox4 = true;
        this.inExternal.checkbox3 = false;
      }
      this.createUserAdminForm.reset();
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
    this.formChanged();
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
    // if((this.selectedCountryItems.length==0)||(this.selectedRegionItems.length==0))
    // {
    //  this.allEntityLoad();
    // }
  }

  onAllRegionItemSelect(items: any, Mode, Page) {
    this.regionDetail = [];
    if (Mode == "1") {
      if (Page != "Edit") {
        this.formChanged();
        items.forEach(element => {
          this.regionDetail.push(element.regionId);
        });
      }
      else {
        items.forEach(element => {
          this.regionDetail.push(element);
        });
      }
    }
    let reg = new RegionCountrySearchViewModel();
    reg.regionIds = this.regionDetail;
    const project = this.shareDetailService.getORganizationDetail();
    reg.ProjectId = project.projectId;
    this.projectUserService.getCountriesByRegion(reg).subscribe(country => {
      this.countryList = country;
      if (Page != "Edit") {
        this.selectedCountryItems = [];
        this.selectedEntityItems = [];
        this.indiviualEntityDetails = [];
      }
    });
    // if((this.selectedCountryItems.length==0)||(this.selectedRegionItems.length==0))
    // {
    //  this.allEntityLoad();
    // }
  }

  onTemplateSelect(items: any, Mode) {
    this.formChanged();
    this.projectTemplateList = [];
    if (this.selectedProjectTemplate != undefined) {
      this.selectedProjectTemplate.forEach((element: never) => {
        this.projectTemplateList.push(element);
      });
    }
  }

  onAllTemplateSelect(items: any, Mode, Page) {
    this.projectTemplateList = [];
    if (Mode == "1") {
      if (Page != "Edit") {
        this.formChanged();
        items.forEach(element => {
          this.projectTemplateList.push(element);
        });
      }
      else {
        items.forEach(element => {
          this.projectTemplateList.push(element);
        });
      }
    }
  }

  onCountryItemSelect(items: any, Mode) {
    this.formChanged();
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
        ele.taxableYearEnd = ele.taxableYearEnd;
      });
      this.selectedEntityItems = [];
      this.indiviualEntityDetails = [];
    });
    if((this.countryDetail.length==0)||(this.regionDetail.length==0))
    {
     this.loadAllEntity();
    }
  }

  onAllCountryItemSelect(items: any, Mode, Page) {
    this.countryDetail = [];
    if (Mode == "1") {
      if (Page != "Edit") {
        this.formChanged();
        items.forEach(element => {
          this.countryDetail.push(element.id);
        });
      }
      else {
        items.forEach(element => {
          this.countryDetail.push(element);
        });
      }
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
        ele.taxableYearEnd = ele.taxableYearEnd;
      });
      if (Page != "Edit") {
        this.selectedEntityItems = [];
        this.indiviualEntityDetails = [];
      }
    });
  }

  onEntityItemSelect(item: any, Mode) {
  
    this.formChanged();
    this.entityDetail = [];
    this.indiviualEntityDetails=[];
    if (this.selectedEntityItems != undefined) {
     
      this.selectedEntityItems.forEach((element) => {
        this.entityDetail.push(element);
        if (this.indiviualEntityDetails.length < 10) {
          let data = new IndiviualEntityViewModel();
          data.entityId = element['entityId'];
          data.selected = false;
          data.legalEntityName = this.entityList.filter(e => e.entityId == data.entityId)[0].legalEntityName;
          data.taxableYearEnd = this.entityList.filter(e => e.entityId == data.entityId)[0].taxableYearEnd;
          this.indiviualEntityDetails.push(data);
        }
      });
    
  
      if (this.entityDetail.length > 10) {
        this.EnableShowMore = true;
      }
      else {
        this.EnableShowMore = false;
      }
    }
  

  }

  onAllEntityItemsSelectAll(item: any, Mode) {
    this.entityDetail = [];
    this.indiviualEntityDetails = [];
    if (Mode == 1) {
      item.forEach(element => {
        this.entityDetail.push(element);
        if (this.entityList.length == 0) {
          this.entityList = item;
        }
        let data = new IndiviualEntityViewModel();
        data.entityId = element.entityId;
        data.selected = false;
        data.legalEntityName = this.entityList.filter(e => e.entityId == element.entityId)[0].legalEntityName;
        if (this.indiviualEntityDetails.length < 10) {
          this.indiviualEntityDetails.push(data);
        }
        if (this.entityDetail.length > 10) {
          this.EnableShowMore = true;
        }
        else {
          this.EnableShowMore = false;
        }
      });
    }
    this.ClearAssignEntityRights();
  }

  RemoveEntityTags(item: any) {
    let data = new IndiviualEntityViewModel();
        data.entityId = item.entityId;
        data.selected = false;
        data.legalEntityName = this.entityList.filter(e => e.entityId == item.entityId)[0].legalEntityName;
        this.indiviualEntityDetails.forEach((element,index)=>{
          if(element.legalEntityName===data.legalEntityName)
          {
            this.indiviualEntityDetails.splice(index, 1);
            this.indiviualEntityRightsAssigned = this.indiviualEntityRightsAssigned.filter(i => i.entityId != item.entityId);
            this.selectedEntityItems.splice(index, 1);
            this.createUserAdminForm.controls["Entities"].setValue(this.selectedEntityItems);
            this.ClearAssignEntityRights();
          }
        })
  
    if(this.indiviualEntityDetails.length>0){
      this.entitySelection=true;
    }
    else
    {
      this.entitySelection=false;
    }
    
  }

  SelectAllOrDeselectAll(Mode) {
    this.indiviualEntityDetails.forEach((element, i) => {
      if (Mode === 'SelectAll') {
        this.multiple = true;
        this.entitySelection=true;
        element.selected = true;
      } else {
        this.multiple = false;
        this.entitySelection=true;
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
            this.AssignRightsOnEntities(element.entityId);
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

  AssignRightsOnEntities(SelectedEntityId) {
    let adminUser = this.projectUserService.selectedAdminUserRows[0];
    let existingEntityRights = [];
    let entityRights = adminUser.entityRole.filter(e => e.entityId == SelectedEntityId);
    if (this.indiviualEntityRightsAssigned.length > 0) {
      if (entityRights && entityRights.length > 0) {
        entityRights.forEach(ele => {
          existingEntityRights = this.indiviualEntityRightsAssigned.filter(e => e.entityId == ele.entityId);
        });
        if (existingEntityRights.length == 0) {
          existingEntityRights = entityRights;
        }
      }
    }
    else {
      existingEntityRights = entityRights;
    }
    if (existingEntityRights && existingEntityRights.length > 0 && entityRights && entityRights.length > 0) {
      if (JSON.stringify(existingEntityRights) === JSON.stringify(entityRights))
        this.getAssignedRights(entityRights[0]);
      else
        this.getAssignedRights(existingEntityRights[0]);
    }
    else {
      entityRights = this.indiviualEntityRightsAssigned.filter(e => e.entityId == SelectedEntityId);
      if (entityRights && entityRights.length > 0)
        this.getAssignedRights(entityRights[0]);
    }
  }

  getAssignedRights(data) {
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
       
        //this.SelectAllOrDeselectAll('');
      }
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.Users.ValidaionMessages.PleaseSelectEntity'));
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
  }


  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.elRef.nativeElement.querySelector("#entityFilters-section");
    this.indiviualEntityDetails = [];
    // To change the name of image.
    if (this.show) {
      transFilterID.classList.remove('collapsed');
      this.imageName = "Show less";
      this.entityDetail.forEach(element => {
        element.selected = false;
        element.legalEntityName = this.entityList.filter(e => e.entityId == element.entityId)[0].legalEntityName;
        element.taxableYearEnd = this.entityList.filter(e => e.entityId == element.entityId)[0].taxableYearEnd;
        this.indiviualEntityDetails.push(element);
      });
    }
    else {
      this.imageName = "Show more";
      transFilterID.classList.add('collapsed');
      this.entityDetail.forEach(element => {
        if (this.indiviualEntityDetails.length < 10) {
          element.selected = false;
          element.legalEntityName = this.entityList.filter(e => e.entityId == element.entityId)[0].legalEntityName;
          element.taxableYearEnd = this.entityList.filter(e => e.entityId == element.entityId)[0].taxableYearEnd;
          this.indiviualEntityDetails.push(element);
        }
      });
    }
  }
  formChanged() {
    this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disable-section");
    this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disabledbutton");
    this.isChecked.read = (this.isChecked.copy || this.isChecked.formatting || this.isChecked.edit || this.isChecked.remove || this.isChecked.reArrange
      || this.isChecked.created || this.isChecked.reportGeneration) ? true : false;
  }

  formClick() {
    let updateBtn = this.el.nativeElement.querySelector("#btnCreateEntity");
    if (updateBtn) {
      updateBtn.classList.remove('disable-section');
      updateBtn.classList.remove('disabledbutton');
    }
    // this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disable-section");
    // this.el.nativeElement.querySelector("#btnCreateEntity").classList.remove("disabledbutton");
  }

}
