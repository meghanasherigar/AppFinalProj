import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ThemingContext, ThemeOptions, ThemeSection, ThemeCollection, SelectedSection } from '../../../../../../../../../@models/projectDesigner/theming';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { BlockDetailsResponseViewModel, StackModelFilter, BlockFilterDataModel } from '../../../../../../../../../@models/projectDesigner/block';
import { LibraryService } from '../../../../../../../services/library.service';
import { LibraryBlockDetails, FilterLibraryModel } from '../../../../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { BlockService } from '../../../../../../../services/block.service';

@Component({
  selector: 'ngx-library-header',
  templateUrl: './theme2-library-header.component.html',
  styleUrls: ['./theme2-library-header.component.scss']
})
export class Theme2LibraryHeaderComponent implements OnInit {
  themingContext: ThemingContext;
  selectedThemeOption: ThemeOptions;
  @Input("section") section: string;
  @Input("data") sectionData: [];
  @Output() viewLoaded = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  selectedLibrary1: any;
  selectedLibrary2: any;

  blockCollection: any = [];
  selectedIds: any = [];
  section1List: any = [];
  section2List: any = [];
  libraryBlockDetails = new LibraryBlockDetails();
  designer = new Designer();
  previousThemeLibraryData:any;
  librarylist: any;

  constructor(private _eventService: EventAggregatorService, private sharedService: ShareDetailService, private libraryService: LibraryService, private designerService : DesignerService, 
    private ngxLoader: NgxUiLoaderService, private blockService: BlockService) { }

  ngOnInit() {
    this.loadLibrary();

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).subscribe((payload) => {
       this.loadLibraryContent();
    }));
  }

  loadLibrary() {
    this.themingContext = this.sharedService.getSelectedTheme();
    // var libraryList: any = this.sectionData;

    let libraryList: any = this.designerService.libraryList;

    if (libraryList.filter(item => item.id == 5).length == 0) {
      let blockList = { 'id': 5, name: "Blocks", isActive: true, index: libraryList.length };
      libraryList.push(blockList);
    }
    this.librarylist = libraryList;
    let otherThemes = this.themingContext.themeOptions.filter(item => item.name != this.section);

    otherThemes.forEach(item => {
      if (item.library)
        this.selectedIds.push(item.library.id);
    });

    let selectedData;

    this.previousThemeLibraryData = this.themingContext.themeOptions.filter(item => item.name == this.section)[0];

    if (this.selectedIds.length == 0) {
      selectedData = libraryList[0];
      this.selectedIds.push(selectedData.id);
    }
    else {
      var _items = libraryList.filter(x => !this.selectedIds.find(id => id == x.id));

      if (_items.length == 0)
        _items = this.blockCollection.filter(x => !this.selectedIds.find(id => id == x.id));

      if (_items.length > 0)
      {
        if(this.previousThemeLibraryData && this.previousThemeLibraryData.library)
        {
          selectedData= this.previousThemeLibraryData.library;
        }
        else
        {
          selectedData = _items[0];
        }
      }
    }

    //this is not really global library but the selected library
    let globalLib = libraryList.find(x => x.name == selectedData.name);
    globalLib.checked = true;

    this.selectedThemeOption = this.themingContext.themeOptions.filter(item => item.name == this.section)[0];
    this.selectedThemeOption.library = globalLib;
    this.sharedService.setSelectedTheme(this.themingContext);

    if (this.section == ThemeSection.Theme2_1) {
      this.section1List = libraryList;
      this.selectedLibrary1 = this.selectedThemeOption.library;
    }
    if (this.section == ThemeSection.Theme2_2) {
      this.section2List = libraryList;
      this.selectedLibrary2 = this.selectedThemeOption.library;
    }
   
    this.designerService.setDesignerService();
    this.loadLibraryContent();
  }

  libraryChange1(event) {
    let designer = new Designer();
    this.designerService.clear(this.section);
    let selectedItem = this.section1List.filter(id => id.index == event.target.selectedIndex)[0];
    let selectedTheme = this.sharedService.getSelectedTheme();
    let selectedSection = selectedTheme.themeOptions.filter(id => id.name == ThemeSection.Theme2_1)[0];
    selectedSection.library = selectedItem;
    selectedSection.designerService = designer;
    this.sharedService.setSelectedTheme(selectedTheme);
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((false)));
    let options = document.getElementById("ddlForLibrary2").getElementsByTagName('option');
    for (let i = 0; i < options.length; i++) options[i].disabled = false;
    document.getElementById("ddlForLibrary2").getElementsByTagName('option')[selectedItem.index].disabled = true;
    this.loadLibraryContent();
    
    
  }

  libraryChange2(event) {
    let designer = new Designer();
    let selectedItem = this.section2List.filter(id => id.index == (event.target.selectedIndex))[0];
    let selectedTheme = this.sharedService.getSelectedTheme();
    let selectedSection = selectedTheme.themeOptions.filter(id => id.name == ThemeSection.Theme2_2)[0];
    selectedSection.library = selectedItem;
    selectedSection.designerService = designer;
    this.sharedService.setSelectedTheme(selectedTheme);

    let options = document.getElementById("ddlForLibrary1").getElementsByTagName('option');
    for (let i = 0; i < options.length; i++) options[i].disabled = false;
    document.getElementById("ddlForLibrary1").getElementsByTagName('option')[selectedItem.index].disabled = true;
    this.loadLibraryContent();
  }

  loadLibraryContent() {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    let filterApplied = this.sharedService.getSelectedTheme().themeOptions.find(x=>x.name== this.section).designerService;
    this.ngxLoader.startBackgroundLoader('LibraryLoader_' + this.section);
    if (filterApplied.selectedFilterProjectYear.length > 0
      || filterApplied.selectedFilterBlockCreator.length > 0
      || filterApplied.selectedFilterblockOrigin.length > 0
      || filterApplied.selectedFilterblockState.length > 0
      || filterApplied.selectedFilterblockStatus.length > 0
      || filterApplied.selectedFilterindustry.length > 0
      || filterApplied.selectedFiltertitle.length > 0
      || filterApplied.selectedblockType.length > 0
      || filterApplied.selectedStackLevel.length > 0
      || filterApplied.selectedStackTransactionType.length > 0
      || filterApplied.selectedStackType.length > 0) {
      this.checkIfFilterDataExists(filterApplied);
    } else {
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.library = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == this.section)[0].library;
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
      var payload : any = {};
      payload.section = this.section;
      payload.selectedSection = SelectedSection.Library;
      this.subscriptions.add(this._eventService.getEvent(this.section).publish(payload));
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.enableIcon).publish(true));
    });
  }
  }

  checkIfFilterDataExists(filterApplied) {
    let libraryBlockFilter = new FilterLibraryModel();
    if (filterApplied.libraryDetails.name == EventConstants.Country)
      libraryBlockFilter.isCountry = true;
    if (filterApplied.libraryDetails.name == EventConstants.Organization)
      libraryBlockFilter.isOrganization = true;
    if (filterApplied.libraryDetails.name == EventConstants.Global)
      libraryBlockFilter.isGlobal = true;
    if (filterApplied.libraryDetails.name == EventConstants.User)
      libraryBlockFilter.isPersonal = true;

    if(filterApplied.selectedStackType.length > 0 ||  filterApplied.selectedStackLevel.length > 0 || filterApplied.selectedStackTransactionType.length > 0)
    {
      libraryBlockFilter.stackFilter = new StackModelFilter();
      libraryBlockFilter.stackFilter.stackType = filterApplied.selectedStackType;
      libraryBlockFilter.stackFilter.level = filterApplied.selectedStackLevel;
      libraryBlockFilter.stackFilter.transactionType = filterApplied.selectedStackTransaction;

    } else {
      libraryBlockFilter.blockFilterRequestModel = new BlockFilterDataModel();
      libraryBlockFilter.blockFilterRequestModel.projectYear = filterApplied.selectedFilterProjectYear;
      libraryBlockFilter.blockFilterRequestModel.BlockCreator = filterApplied.selectedFilterBlockCreator;
      libraryBlockFilter.blockFilterRequestModel.blockOrigin = filterApplied.selectedFilterblockOrigin;
      libraryBlockFilter.blockFilterRequestModel.blockState = filterApplied.selectedFilterblockState;
      libraryBlockFilter.blockFilterRequestModel.blockStatus = filterApplied.selectedFilterblockStatus;
      libraryBlockFilter.blockFilterRequestModel.industry = filterApplied.selectedFilterindustry;
      libraryBlockFilter.blockFilterRequestModel.title = filterApplied.selectedFiltertitle;
      libraryBlockFilter.blockFilterRequestModel.blockType = filterApplied.selectedblockType;
    }

    this.blockService.LibrarySelectedFilter(libraryBlockFilter).subscribe((response: any) => {
      var payload = new LibraryBlockDetails();
      payload.blocks = response;
      payload.library = this.designer.libraryDetails;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((true)));
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish((payload)));
    });

  }

  ngAfterViewInit() {
    this.viewLoaded.next(true);
    let index;
    let section;
    if (this.section == ThemeSection.Theme2_1)
    {
      section = this.themingContext.themeOptions.find(x => x.name === ThemeSection.Theme2_2);
      index = (section.library) ? section.library.index : 1;
      document.getElementById("ddlForLibrary1").getElementsByTagName('option')[index].disabled = true;
    }
      
    if (this.section == ThemeSection.Theme2_2) {
      section = this.themingContext.themeOptions.find(x => x.name === ThemeSection.Theme2_1);
      index = (section.library) ? section.library.index : 0;
      document.getElementById("ddlForLibrary2").getElementsByTagName('option')[index].disabled = true;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
