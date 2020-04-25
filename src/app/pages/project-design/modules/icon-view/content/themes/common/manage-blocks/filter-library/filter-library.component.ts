import { Component, OnInit, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { BlockFilterDataModel, BlockFilterRequestDataModel, DeliverableRequestViewModel, ActionOnBlockStack, BlockDetailsResponseViewModel, StackModelFilter, BlockDetails } from '../../../../../../../../../@models/projectDesigner/block';
import { Subscription } from 'rxjs';
import { IconViewService } from '../../../../../services/icon-view.service';
import { BlockService } from '../../../../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../../@models/projectDesigner/template';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../../@models/common/eventConstants';
import { LibraryService } from '../../../../../../../../admin/services/library.service';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, SearchLibraryViewModel, manageLibrary, FilterLibraryModel } from '../../../../../../../../../@models/projectDesigner/library';


@Component({
  selector: 'ngx-filter-library',
  templateUrl: './filter-library.component.html',
  styleUrls: ['./filter-library.component.scss']
})
export class FilterLibraryComponent implements OnInit, OnDestroy {

  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  libraryList: any;

  dropdownStackTypeSettings: {};
  dropdownStackLevelSettings: {};
  dropdownStackTransactionSettings: {};
  dropdownBlockProjectYearSettings: {};
  dropdownBlockTitleSettings: {};
  dropdownBlockDescriptionSettings:{};
  dropdownBlockIndustrySettings: {};
  dropdownBlockStatusSettings: {};
  dropdownBlockCreatorSettings: {};
  dropdownBlockOriginSettings: {};
  dropdownBlockTypeSettings: {};
  dropdownBlockStateSettings: {};

  ddlistStackLevel: any;
  ddlistStackType: any;
  ddlistStackTransaction: any;
  ddlistBlockType: any;
  ddlistBlockProjectYear: any;
  ddlistBlockTitle: any;
  ddlistBlockDescription:any;
  ddlistBlockIndustry: any;
  ddlistBlockStatus: any;
  ddlistBlockCreator: any;
  ddlistBlockOrigin: any;
  ddlistBlockState: any;
  selectedStackLevel = [];
  selectedStackType = [];
  selectedStackTransaction = [];
  selectedBlockType = [];
  selectedBlockProjectYear = [];
  selectedBlockProjectTitle = [];
  selectedBlockProjectDescription=[];
  selectedBlockProjectIndustry = [];
  selectedBlockStatus = [];
  selectedBlockCreator = [];
  selectedBlockOrigin = [];
  selectedBlockState = [];
  ddlistBlockStatusSettings: {};
  selectedTemplate: TemplateViewModel;
  blockFilter = new BlockFilterDataModel();

  selectedLibrary: LibraryDropdownViewModel;
  blockExpandData: any;
  blockCollection: any = [];
  libraryBlockDetails = new LibraryBlockDetails();
  requestModel = new SearchLibraryViewModel();
  libraryBlockFilter = new FilterLibraryModel();
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;
  disabledStack: boolean;

  constructor(private blockService: BlockService, private service: IconViewService, private libraryService: LibraryService, private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private el: ElementRef, protected ref: NbDialogRef<any>, private designerService: DesignerService, private sharedService: ShareDetailService) { }
  ngOnInit() {
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.selectedStackLevel = this.designer.selectedStackLevel;
    this.selectedStackType = this.designer.selectedStackType;
    this.selectedStackTransaction = this.designer.selectedStackTransactionType;
    this.selectedBlockProjectYear = this.designer.selectedFilterProjectYear;
    this.selectedBlockCreator = this.designer.selectedFilterBlockCreator;
    this.selectedBlockOrigin = this.designer.selectedFilterblockOrigin;
    this.selectedBlockProjectIndustry = this.designer.selectedFilterindustry;
    this.selectedBlockProjectTitle = this.designer.selectedFiltertitle;
    this.selectedBlockProjectDescription=this.designer.selectedFilterDescription;
    this.selectedBlockState = this.designer.selectedFilterblockState;
    this.selectedBlockStatus = this.designer.selectedFilterblockStatus;
    this.selectedBlockType = this.designer.selectedblockType;

    if (this.designer.libraryDetails && this.designer.libraryDetails.name == EventConstants.BlockCollection)
      this.disabledStack = true;
    else
      this.disabledStack = false;

    this.AssignPreviouslySelectedFilter();

    this.dropdownStackTypeSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackLevelSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'stackLevel',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStateSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTypeSettings = {
      singleSelection: false,
      idField: 'blockTypeId',
      textField: 'blockType',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackTransactionSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockProjectYearSettings = {
      singleSelection: false,
      idField: 'projectYear',
      textField: 'projectYear',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTitleSettings = {
      singleSelection: false,
      idField: 'titleId',
      textField: 'titleValue',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockDescriptionSettings = {
      singleSelection: false,
      idField: 'descriptionId',
      textField: 'descriptionValue',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockIndustrySettings = {
      singleSelection: false,
      idField: 'Id',
      textField: 'IndustryName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStatusSettings = {
      singleSelection: false,
      idField: 'blockStatusId',
      textField: 'blockStatus',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockCreatorSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockOriginSettings = {
      singleSelection: false,
      idField: 'blockOrigin',
      textField: 'blockOrigin',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.libraryBlockFilter.isCountry = this.designer.libraryDetails.name == EventConstants.Country;
    this.libraryBlockFilter.isOrganization = this.designer.libraryDetails.name == EventConstants.Organization;
    this.libraryBlockFilter.isGlobal = this.designer.libraryDetails.name == EventConstants.Global;
    this.libraryBlockFilter.isPersonal = this.designer.libraryDetails.name == EventConstants.User;
    let storageData = this.sharedService.getORganizationDetail();
    this.libraryBlockFilter.organizationId = storageData.organizationId;
    this.libraryBlockFilter.projectId = storageData.projectId;
    this.libraryBlockFilter.isCBC = this.designer.libraryDetails.name == EventConstants.BlockCollection;
    this.blockService.getBlockFilterDropdownData(this.libraryBlockFilter).subscribe((response: BlockFilterDataModel) => {

      //TODO: Bind the response with the data model
      // console.log(response);
      if (response) {

        this.ddlistStackLevel = response.stackLevel != undefined ? response.stackLevel.map(x => x.stackLevel) : null;
        this.ddlistStackTransaction = response.transactionType != undefined ? response.transactionType.map(x => x.transactionType) : null;
        this.ddlistStackType = response.blockType != undefined ? response.blockType.map(x => x.blockType) : null;
        this.ddlistBlockType = response.blockType != undefined ? response.blockType.map(x => x.blockType) : null;

        this.ddlistBlockProjectYear = response.projectYear.map(String);
        this.ddlistBlockTitle = response.title.map(String);
        this.ddlistBlockDescription=response.description.map(String);
        this.ddlistBlockIndustry = response.industry != undefined ? response.industry.map(x => x.industryName) : null;
        this.ddlistBlockStatus = response.blockStatus;
        this.ddlistBlockState = response.blockState != undefined ? response.blockState.map(x => x.blockState) : null;
        this.ddlistBlockOrigin = response.blockOrigin;
        this.ddlistBlockCreator = response.BlockCreator;
      }
    });

  }

  AssignPreviouslySelectedFilter()
  {
    let currentDesignerService= this.themingContext.themeOptions.find(x => x.name == this.section).designerService;

    if(currentDesignerService && currentDesignerService.libraryDetails)
    {
      this.selectedStackLevel = currentDesignerService.selectedStackLevel;
      this.selectedStackType = currentDesignerService.selectedStackType;
      this.selectedStackTransaction = currentDesignerService.selectedStackTransactionType;
      this.selectedBlockProjectYear = currentDesignerService.selectedFilterProjectYear;
      this.selectedBlockCreator = currentDesignerService.selectedFilterBlockCreator;
      this.selectedBlockOrigin = currentDesignerService.selectedFilterblockOrigin;
      this.selectedBlockProjectIndustry = currentDesignerService.selectedFilterindustry;
      this.selectedBlockProjectTitle = currentDesignerService.selectedFiltertitle;
      this.selectedBlockProjectDescription=currentDesignerService.selectedFilterDescription;
      this.selectedBlockState = currentDesignerService.selectedFilterblockState;
      this.selectedBlockStatus = currentDesignerService.selectedFilterblockStatus;
      this.selectedBlockType = currentDesignerService.selectedblockType;
    }
  }

  onItemSelect(item: any) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.libraryBlockFilter.isCountry = this.designer.libraryDetails.name == EventConstants.Country;
    this.libraryBlockFilter.isOrganization = this.designer.libraryDetails.name == EventConstants.Organization;
    this.libraryBlockFilter.isGlobal = this.designer.libraryDetails.name == EventConstants.Global;
    this.libraryBlockFilter.isPersonal = this.designer.libraryDetails.name == EventConstants.User;
    let storageData = this.sharedService.getORganizationDetail();
    this.libraryBlockFilter.organizationId = storageData.organizationId;
    this.libraryBlockFilter.projectId = storageData.projectId;
    this.libraryBlockFilter.isCBC = this.designer.libraryDetails.name == EventConstants.BlockCollection;

    if (!this.libraryBlockFilter.stackFilter) {
      this.libraryBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.libraryBlockFilter.blockFilterRequestModel) {
      this.libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
    }
    this.designer.selectedStackType = this.libraryBlockFilter.stackFilter.stackType = this.selectedStackType;
    this.designer.selectedStackLevel = this.libraryBlockFilter.stackFilter.level = this.selectedStackLevel;
    this.designer.selectedStackTransactionType = this.libraryBlockFilter.stackFilter.transactionType = this.selectedStackTransaction;

    this.designer.selectedFilterProjectYear = this.blockFilter.projectYear = this.selectedBlockProjectYear;
    this.designer.selectedFilterBlockCreator = this.blockFilter.BlockCreator = this.selectedBlockCreator;
    this.designer.selectedFilterblockOrigin = this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designer.selectedFilterblockState = this.blockFilter.blockState = this.selectedBlockState;
    this.designer.selectedFilterblockStatus = this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designer.selectedFilterindustry = this.blockFilter.industry = this.selectedBlockProjectIndustry;
    this.designer.selectedFiltertitle = this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designer.selectedFilterDescription=this.blockFilter.description=this.selectedBlockProjectDescription;
    this.designer.selectedblockType = this.blockFilter.blockType = this.selectedBlockType;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllStackLevel(item: any){
    if (!this.libraryBlockFilter.stackFilter) {
      this.libraryBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.libraryBlockFilter.blockFilterRequestModel) {
      this.libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
    }
    this.designer.selectedStackLevel=this.libraryBlockFilter.stackFilter.level=item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllStackType(item: any) {
    if (!this.libraryBlockFilter.stackFilter) {
      this.libraryBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.libraryBlockFilter.blockFilterRequestModel) {
      this.libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
    }
    this.designer.selectedStackType=this.libraryBlockFilter.stackFilter.stackType=item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }
  onSelectAllStackTransaction(item: any) {
    if (!this.libraryBlockFilter.stackFilter) {
      this.libraryBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.libraryBlockFilter.blockFilterRequestModel) {
      this.libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
    }
    this.designer.selectedStackTransactionType = this.libraryBlockFilter.stackFilter.transactionType = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }
  onSelectAllBlockType(item: any) {
    this.designer.selectedblockType = this.blockFilter.blockType = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockProjectYear(item: any) {
    this.designer.selectedFilterProjectYear = this.blockFilter.projectYear = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }
  onSelectAllBlockTitle(item: any) {
    this.designer.selectedFiltertitle = this.blockFilter.title = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }
  onSelectAllBlockDescription(item: any){
    this.designer.selectedFilterDescription = this.blockFilter.description = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockIndustry(item: any) {
    this.designer.selectedFilterindustry = this.blockFilter.industry = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockStatus(item: any) {
    this.designer.selectedFilterblockStatus = this.blockFilter.blockStatus = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockState(item: any) {
    this.designer.selectedFilterblockState = this.blockFilter.blockStatus = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockCreator(item: any) {
    this.designer.selectedFilterBlockCreator = this.blockFilter.BlockCreator = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockOrigin(item: any) {
    this.designer.selectedFilterblockOrigin = this.blockFilter.blockOrigin = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }

  apply() {
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((true)));

    if (this.designer.selectedFilterProjectYear.length == 0 && this.designer.selectedFilterBlockCreator.length == 0 && this.designer.selectedFilterblockOrigin.length == 0 && this.designer.selectedFilterblockState.length == 0
      && this.designer.selectedFilterblockStatus.length == 0 && this.designer.selectedFilterindustry.length == 0 && this.designer.selectedFiltertitle.length == 0 && this.designer.selectedFilterDescription.length == 0
      && this.designer.selectedblockType.length == 0) {

      this.libraryBlockFilter.blockFilterRequestModel = null;
    }
    if (this.designer.selectedStackType.length == 0 && this.designer.selectedStackLevel.length == 0 && this.designer.selectedStackTransactionType.length == 0) {

      this.libraryBlockFilter.stackFilter = null;
    }
    
    if (this.designer.selectedFilterProjectYear.length == 0 && this.designer.selectedFilterBlockCreator.length == 0 && this.designer.selectedFilterblockOrigin.length == 0 && this.designer.selectedFilterblockState.length == 0
      && this.designer.selectedFilterblockStatus.length == 0 && this.designer.selectedFilterindustry.length == 0 && this.designer.selectedFiltertitle.length == 0 && this.designer.selectedFilterDescription.length == 0
      && this.designer.selectedblockType.length == 0 && this.designer.selectedStackType.length == 0 && this.designer.selectedStackLevel.length == 0 && this.designer.selectedStackTransactionType.length == 0) {
      this.emptyFilter();
    } else {
      this.saveThemeContext();
      this.designer.blockDetails = null;
      this.designer.blockList = [];
    this.blockService.LibrarySelectedFilter(this.libraryBlockFilter).subscribe((response: any) => {
      var payload = new LibraryBlockDetails();
      payload.blocks = response;
      payload.library = this.designer.libraryDetails;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish((payload)));
    });
  }
    this.ref.close();
  }
  emptyFilter() {
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((false)));
    this.designer.selectedStackType = this.selectedStackType = [];
    this.designer.selectedStackLevel = this.selectedStackLevel = [];
    this.designer.selectedStackTransactionType = this.selectedStackTransaction = [];
    this.selectedBlockProjectYear = this.designer.selectedFilterProjectYear = [];
    this.selectedBlockCreator = this.designer.selectedFilterBlockCreator = [];
    this.selectedBlockOrigin = this.designer.selectedFilterblockOrigin = [];
    this.selectedBlockProjectIndustry = this.designer.selectedFilterindustry = [];
    this.selectedBlockProjectTitle = this.designer.selectedFiltertitle = [];
    this.selectedBlockProjectDescription=this.designer.selectedFilterDescription=[];
    this.selectedBlockState = this.designer.selectedFilterblockState = [];
    this.selectedBlockStatus = this.designer.selectedFilterblockStatus = [];
    this.selectedBlockType = this.designer.selectedblockType = [];
    let payLoad = ActionOnBlockStack.cancelFilter;
    this.saveThemeContext();
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true));
  }
  cancel() {
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((false)));
    this.designer.selectedStackType = this.selectedStackType = [];
    this.designer.selectedStackLevel = this.selectedStackLevel = [];
    this.designer.selectedStackTransactionType = this.selectedStackTransaction = [];
    this.selectedBlockProjectYear = this.designer.selectedFilterProjectYear = [];
    this.selectedBlockCreator = this.designer.selectedFilterBlockCreator = [];
    this.selectedBlockOrigin = this.designer.selectedFilterblockOrigin = [];
    this.selectedBlockProjectIndustry = this.designer.selectedFilterindustry = [];
    this.selectedBlockProjectTitle = this.designer.selectedFiltertitle = [];
    this.selectedBlockProjectDescription=this.designer.selectedFilterDescription=[];
    this.selectedBlockState = this.designer.selectedFilterblockState = [];
    this.selectedBlockStatus = this.designer.selectedFilterblockStatus = [];
    this.selectedBlockType = this.designer.selectedblockType = [];
    this.saveThemeContext();
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true));
    this.ref.close();
  }

  saveThemeContext()
  {
    this.themingContext = this.sharedService.getSelectedTheme();
    this.themingContext.themeOptions.find(x => x.name == this.section).designerService = this.designer;
    this.sharedService.setSelectedTheme(this.themingContext);
  } 

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}