import { Component, OnInit, OnDestroy } from '@angular/core';
import { LibraryService } from '../../../../../services/library.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, manageLibrary, SearchLibraryViewModel, LibraryFilter } from '../../../../../../../@models/projectDesigner/library';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { Subscription, Subject } from 'rxjs';
import { EventConstants, eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { viewAttributeModel, regions, LibraryEnum } from '../../../../../../../@models/projectDesigner/common';
import { BlockDetailsResponseViewModel, LibraryOptions } from '../../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../../services/designer.service';
import { DesignerService as DesignerServiceProjectDesigner } from '../../../../../../project-design/services/designer.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { FilterManageLibraryComponent } from '../../../manage-blocks/filter-manage-library/filter-manage-library.component';
import { DocumentViewService } from '../../../../../../project-design/services/document-view.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-Icon-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  selectedLibrary: any;
  libraryList: any;
  isEnableAttribute: boolean;
  disabled = true;
  libraryBlockDetails = new LibraryBlockDetails();
  searchText: string = "";
  searchTextChanged = new Subject<string>();
  isSearchBoxVisible: boolean = false;
  subscription = new Subscription();
  loaderId = 'manageLibraryLoader';

  constructor(private libraryService: LibraryService, private dialogService: NbDialogService, private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService, private designerService: DesignerService,
    private designerServiceProjectDesigner: DesignerServiceProjectDesigner, private documentViewService: DocumentViewService) { }

  ngOnInit() {
    this.isEnableAttribute = false;
    this.designerServiceProjectDesigner.libraryDetails = new LibraryDropdownViewModel();
    this.designerServiceProjectDesigner.isGlobalTemplate = null;
    this.designerServiceProjectDesigner.layoutStyles = [];

    let globalLib;
    this.libraryService.getAdminLibraryTypes(this.designerService.isGLobal).subscribe((data) => {
      this.libraryList = data;
      globalLib = this.libraryList.find(x => x.name == this.designerService.SelectedOption);
      this.selectedLibrary = globalLib;
      this.libraryBlockDetails.library = globalLib;
    });

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.searchLibrary() });

    this.selectedLibrary = globalLib;
    this.libraryBlockDetails.library = globalLib;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).subscribe(() => {
      const managelibrary = new manageLibrary();
      if (this.designerService.SelectedOption === LibraryOptions.OECDtemplates || this.designerService.SelectedOption === LibraryOptions.Countrytemplates) {
        const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
        managelibrary.isGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
        managelibrary.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
        managelibrary.IsGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
        managelibrary.IsCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;

        this.libraryService.getLibraries(managelibrary).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      } else {
        this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
    }));

  }


  async libraryChange(event) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let library = this.libraryList[event.target.selectedIndex];
    this.designerService.SelectedOption = library.name;
    let libraryData = this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    libraryData.expandedCategories = [];
    libraryData.expandedStacks = [];
    this.designerService.blockDetails = null;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.selectedAdminLibaryDropdown).publish(this.designerService.SelectedOption);
    this.designerService.LibraryFilters = new LibraryFilter();
    this.designerServiceProjectDesigner.globalOrCountryTemplateId = library.id;
    const managelibrary = new manageLibrary();
    this.designerService.DisableMenus();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.adminAction).publish(false);
    this.designerServiceProjectDesigner.isGlobalTemplate = null;
    this.designerServiceProjectDesigner.layoutStyles = [];
    if (this.designerService.SelectedOption === LibraryOptions.OECDtemplates || this.designerService.SelectedOption === LibraryOptions.Countrytemplates) {
      const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
      managelibrary.isGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
      managelibrary.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
      managelibrary.IsGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
      managelibrary.IsCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;
      await this.getDocumentLayoutStyle(library.id, library.layoutStyleId);

      await this.libraryService.getDummmyProjectDetails().then(data => {
        this.designerService.dummyProjectDetails = data;
      });
      
      this.libraryService.getLibraries(managelibrary).subscribe((data: BlockDetailsResponseViewModel[]) => {
        this.libraryBlockDetails.blocks = data;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);

        if (this.designerService.SelectedOption === LibraryOptions.OECDtemplates)
          this.designerServiceProjectDesigner.manageLibraryDetails.name = LibraryEnum.globaloecd;
        else if (this.designerService.SelectedOption === LibraryOptions.Countrytemplates)
          this.designerServiceProjectDesigner.manageLibraryDetails.name = LibraryEnum.countrytemplate;

        if (managelibrary.IsGlobalTemplate || managelibrary.IsCountryTemplate) {
          library.isGlobalTemplate = managelibrary.IsGlobalTemplate ? true : false;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).publish(library);
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
      });
    } else {
      this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
        this.libraryBlockDetails.blocks = data;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        if (this.designerService.SelectedOption === LibraryOptions.Globallibrary)
          this.designerServiceProjectDesigner.manageLibraryDetails.name = LibraryEnum.global;
        else if (this.designerService.SelectedOption === LibraryOptions.Countrylibrary)
          this.designerServiceProjectDesigner.manageLibraryDetails.name = LibraryEnum.country;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).publish(undefined);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
      });
    }

  }

  showAttributeView() {
    this.isEnableAttribute = true;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.library;
    this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad);
  }

  hideAttributeView() {
    this.isEnableAttribute = false;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  searchLibrary() {
    // search in manage library
    let requestModel: SearchLibraryViewModel = new SearchLibraryViewModel()
    requestModel.PageIndex = 1;
    requestModel.PageSize = 50;
    requestModel.searchText = this.searchText;
    const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    requestModel.IsGlobal = (libraryOptions.Global) ? libraryOptions.Global : false;
    requestModel.IsGlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
    requestModel.IsCountry = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
    requestModel.IsCountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
    if (!this.searchText) {
      this.LoadCategory();
    } else {
      this.libraryService.SearchManageLibraries(requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
        this.libraryBlockDetails.blocks = data;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
      });
    }
  }

  LoadCategory() {
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
    });
  }


  filterPopUp() {
    const CreateBlockDialogRef = this.dialogService.open(FilterManageLibraryComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });

  }

  async getDocumentLayoutStyle(id, selectedLayoutStyleId) {
    this.designerServiceProjectDesigner.layoutStyles = [];
    await this.documentViewService.getLayoutStylesSync(id, false).then(layoutStyles => {
      this.designerServiceProjectDesigner.layoutStyles = layoutStyles;
      this.designerServiceProjectDesigner.selectedLayoutStyleId = selectedLayoutStyleId;
    });
  }
}
