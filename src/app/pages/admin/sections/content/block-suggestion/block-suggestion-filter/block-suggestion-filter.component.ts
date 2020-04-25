import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { BlockFilterDataModel, StackModelFilter } from '../../../../../../@models/projectDesigner/block';
import { manageLibrary, LibraryBlockDetails, FilterManageLibraryModel, LibraryFilter } from '../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../services/designer.service';
import { LibraryService } from '../../../../services/library.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-block-suggestion-filter',
  templateUrl: './block-suggestion-filter.component.html',
  styleUrls: ['./block-suggestion-filter.component.scss']
})
export class BlockSuggestionFilterComponent implements OnInit {

  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  libraryList: any;
  disabledStack: boolean;
  dropdownStackTypeSettings: {};
  dropdownStackLevelSettings: {};
  dropdownStackTransactionSettings: {};
  dropdownBlockTitleSettings: {};
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
  ddlistBlockTitle: any;
  ddlistBlockIndustry: any;
  ddlistBlockStatus: any;
  ddlistBlockCreator: any;
  ddlistBlockOrigin: any;
  ddlistBlockState: any;
  FilterData;
  selectedFilters = new LibraryFilter();
  selectedStackLevel = [];
  selectedStackType = [];
  selectedStackTransaction = [];
  selectedBlockType = [];
  selectedBlockProjectYear = [];
  selectedBlockProjectTitle = [];
  selectedBlockProjectIndustry = [];
  selectedBlockStatus = [];
  selectedBlockCreator = [];
  selectedBlockOrigin = [];
  selectedBlockState = [];
  ddlistBlockStatusSettings: {};
  blockFilter = new BlockFilterDataModel();
  libraryBlockDetails = new LibraryBlockDetails();
  managelibrary = new manageLibrary();
  libraryBlockFilter = new FilterManageLibraryModel();

  constructor(protected ref: NbDialogRef<any>, private translate: TranslateService, private readonly _eventService: EventAggregatorService, 
    private libraryservice: LibraryService, private designerService: DesignerService) { }

  ngOnInit() {
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    this.managelibrary.isGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
    this.managelibrary.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
    this.managelibrary.IsGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
    this.managelibrary.IsCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;

    this.dropdownStackTypeSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackLevelSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'stackLevel',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStateSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTypeSettings = {
      singleSelection: false,
      idField: 'blockTypeId',
      textField: 'blockType',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackTransactionSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTitleSettings = {
      singleSelection: false,
      idField: 'titleId',
      textField: 'titleValue',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockIndustrySettings = {
      singleSelection: false,
      idField: 'Id',
      textField: 'IndustryName',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStatusSettings = {
      singleSelection: false,
      idField: 'blockStatusId',
      textField: 'blockStatus',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockCreatorSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockOriginSettings = {
      singleSelection: false,
      idField: 'blockOrigin',
      textField: 'blockOrigin',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.selectedFilters = this.designerService.LibraryFilters;

    this.selectedStackLevel = this.designerService.LibraryFilters.selectedStackLevel;
    this.selectedStackType = this.designerService.LibraryFilters.selectedStackType;
    this.selectedStackTransaction = this.designerService.LibraryFilters.selectedStackTransactionType;
    this.selectedBlockCreator = this.designerService.LibraryFilters.selectedFilterBlockCreator;
    this.selectedBlockOrigin = this.designerService.LibraryFilters.selectedFilterblockOrigin;
    this.selectedBlockProjectIndustry = this.designerService.LibraryFilters.selectedFilterindustry;
    this.selectedBlockProjectTitle = this.designerService.LibraryFilters.selectedFiltertitle;
    this.selectedBlockState = this.designerService.LibraryFilters.selectedFilterblockState;
    this.selectedBlockStatus = this.designerService.LibraryFilters.selectedFilterblockStatus;
    this.selectedBlockType = this.designerService.LibraryFilters.selectedblockType;


    // TO DO: api integration


  }

  onSelectAllBlockType(item: any) {

    this.designerService.LibraryFilters.selectedblockType = this.blockFilter.blockType = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockTitle(item: any) {
    this.designerService.LibraryFilters.selectedFiltertitle = this.blockFilter.title = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }
  onSelectAllBlockIndustry(item: any) {
    this.designerService.LibraryFilters.selectedFilterindustry = this.blockFilter.industry = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockStatus(item: any) {
    this.designerService.LibraryFilters.selectedFilterblockStatus = this.blockFilter.blockStatus = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockState(item: any) {
    this.designerService.LibraryFilters.selectedFilterblockState = this.blockFilter.blockStatus = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockCreator(item: any) {
    this.designerService.LibraryFilters.selectedFilterBlockCreator = this.blockFilter.BlockCreator = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockOrigin(item: any) {
    this.designerService.LibraryFilters.selectedFilterblockOrigin = this.blockFilter.blockOrigin = item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }

  cancel() {
    this.selectedStackType = [];
    this.selectedStackLevel = [];
    this.selectedStackTransaction = [];
    this.selectedBlockProjectYear = [];
    this.selectedBlockCreator = [];
    this.selectedBlockOrigin = [];
    this.selectedBlockProjectIndustry = [];
    this.selectedBlockProjectTitle = [];
    this.selectedBlockState = [];
    this.selectedBlockStatus = [];
    this.selectedBlockType = [];
    this.ref.close();

  }

  applyFilter() {
    this.libraryBlockFilter.IsCountry = this.managelibrary.IsCountry;
    this.libraryBlockFilter.IsGlobal = this.managelibrary.isGlobal;
    this.libraryBlockFilter.IsCountryTemplate = this.managelibrary.IsCountryTemplate;
    this.libraryBlockFilter.IsGlobalTemplate = this.managelibrary.IsGlobalTemplate;
    if (this.designerService.LibraryFilters.selectedFilterBlockCreator.length === 0 && this.designerService.LibraryFilters.selectedFilterblockOrigin.length === 0 && this.designerService.LibraryFilters.selectedFilterblockState.length === 0
      && this.designerService.LibraryFilters.selectedFilterblockStatus.length === 0 && this.designerService.LibraryFilters.selectedFilterindustry.length === 0 && this.designerService.LibraryFilters.selectedFiltertitle.length === 0
      && this.designerService.LibraryFilters.selectedblockType.length === 0) {

      this.libraryBlockFilter.blockFilterRequestModel = null;
    }
    if (this.designerService.LibraryFilters.selectedStackType.length == 0 && this.designerService.LibraryFilters.selectedStackLevel.length == 0 && this.designerService.LibraryFilters.selectedStackTransactionType.length == 0) {

      this.libraryBlockFilter.stackFilter = null;
    }
    if (this.libraryBlockFilter.stackFilter || this.libraryBlockFilter.blockFilterRequestModel) {

      //  TO DO: API call OR Write an behaviour subject to do API call from Block Suggestion component

      // this.libraryservice.GetFilteredData(this.libraryBlockFilter).subscribe((response: any) => {
      //   this.libraryBlockDetails.blocks = response;
      //   this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
      // });

    } else {
      // TO DO: write an event OR behaviour subejct incase of refresh OR change data
      // this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
    }
    this.ref.close();
  }

  onItemSelect(item: any) {

    if (!this.libraryBlockFilter.stackFilter) {
      this.libraryBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.libraryBlockFilter.blockFilterRequestModel) {
      this.libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
    }
    this.designerService.LibraryFilters.selectedStackType = this.libraryBlockFilter.stackFilter.stackType = this.selectedStackType;
    this.designerService.LibraryFilters.selectedStackLevel = this.libraryBlockFilter.stackFilter.level = this.selectedStackLevel;
    this.designerService.LibraryFilters.selectedStackTransactionType = this.libraryBlockFilter.stackFilter.transactionType = this.selectedStackTransaction;

    this.designerService.LibraryFilters.selectedFilterBlockCreator = this.blockFilter.BlockCreator = this.selectedBlockCreator;
    this.designerService.LibraryFilters.selectedFilterblockOrigin = this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designerService.LibraryFilters.selectedFilterblockState = this.blockFilter.blockState = this.selectedBlockState;
    this.designerService.LibraryFilters.selectedFilterblockStatus = this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designerService.LibraryFilters.selectedFilterindustry = this.blockFilter.industry = this.selectedBlockProjectIndustry;
    this.designerService.LibraryFilters.selectedFiltertitle = this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designerService.LibraryFilters.selectedblockType = this.blockFilter.blockType = this.selectedBlockType;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;

  }

  emptyFilter() {

    this.designerService.LibraryFilters.selectedStackType = this.selectedStackType = [];
    this.designerService.LibraryFilters.selectedStackLevel = this.selectedStackLevel = [];
    this.designerService.LibraryFilters.selectedStackTransactionType = this.selectedStackTransaction = [];
    this.selectedBlockCreator = this.designerService.LibraryFilters.selectedFilterBlockCreator = [];
    this.selectedBlockOrigin = this.designerService.LibraryFilters.selectedFilterblockOrigin = [];
    this.selectedBlockProjectIndustry = this.designerService.LibraryFilters.selectedFilterindustry = [];
    this.selectedBlockProjectTitle = this.designerService.LibraryFilters.selectedFiltertitle = [];
    this.selectedBlockState = this.designerService.LibraryFilters.selectedFilterblockState = [];
    this.selectedBlockStatus = this.designerService.LibraryFilters.selectedFilterblockStatus = [];
    this.selectedBlockType = this.designerService.LibraryFilters.selectedblockType = [];
  }
  onSelectAllStackLevel(item: any) { }
  onSelectAllStackType(item: any) { }
  onSelectAllStackTransaction(item: any) { }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
