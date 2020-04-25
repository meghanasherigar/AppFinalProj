import { Component, OnInit, OnDestroy } from '@angular/core';
import { LibraryService } from '../../../../../../services/library.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, SearchLibraryViewModel } from '../../../../../../../../@models/projectDesigner/library';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { Subscription, Subject } from 'rxjs/Rx';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { viewAttributeModel, regions } from '../../../../../../../../@models/projectDesigner/common';
import { BlockDetailsResponseViewModel, ActionOnBlockStack } from '../../../../../../../../@models/projectDesigner/block';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../../../services/designer.service';
import { ProjectDeliverableRightViewModel } from '../../../../../../../../@models/userAdmin';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { NbDialogService } from '@nebular/theme';
import { FilterLibraryComponent } from '../../../../manage-blocks/filter-library/filter-library.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { projectIcons } from '../../../../../../../../@models/projectDesigner/block';
import { Router } from '@angular/router';
import { ViewBlockAttributesPopoverComponent } from '../../../../manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component';
import { ViewStackAttributesPopoverComponent } from '../../../../manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { SubMenus } from '../../../../../../../../@models/projectDesigner/designer';

@Component({
  selector: 'ngx-Icon-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit,OnDestroy {
  subscriptions: Subscription = new Subscription();
  selectedLibrary: any;
  libraryList: any;
  isEnableAttribute: boolean;
  isSearchBoxVisible: boolean;
  searchText: string = "";
  headerIcons: projectIcons;
  disabled = true;
  libraryBlockDetails = new LibraryBlockDetails();
  shareDetailService: ShareDetailService
  requestModel = new SearchLibraryViewModel();
  blockCollection: any = [];
  projectId: any;
  projectUserRightsData: ProjectDeliverableRightViewModel;
  accessRights: any;
  searchTextChanged = new Subject<string>();
  subscription = new Subscription();
  attributeComponent: any;

  constructor(private libraryService: LibraryService,
    private readonly _eventService: EventAggregatorService, private dialogService: NbDialogService, private _shareDetailService: ShareDetailService, private designerService: DesignerService, private projectUserService: ProjectUserService
    , private router: Router) {
    this.shareDetailService = this._shareDetailService;
  }

  ngOnInit() {

    this.headerIcons = new projectIcons();
    this.headerIcons.disableIconF = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).subscribe((payload) => {
      if (payload)
        this.headerIcons.disableIconF = true;
      else
        this.headerIcons.disableIconF = false;
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deletedLibrary).subscribe((payload) => {
      if (payload) {
        this.libraryChange(event);
      }
    }));
    this.projectId = this.shareDetailService.getORganizationDetail().projectId;
    // To get the access rights and roles per user
    this.projectUserService.getProjectUserRights(this.projectId).subscribe((rolesData: ProjectDeliverableRightViewModel) => {
      if (rolesData) {
        this.projectUserRightsData = this.designerService.projectUserRightsData = rolesData;
        this.isEnableAttribute = false;
        this.libraryService.getlibrarytypes().subscribe((data: LibraryDropdownViewModel[]) => {
          if (this.projectUserRightsData && this.projectUserRightsData.isExternalUser == false) {
            this.libraryList = data;
            let globalLib = this.libraryList.find(x => x.name == EventConstants.Global);
            this.selectedLibrary = globalLib;
            this.designerService.libraryDetails = this.selectedLibrary;
            this.libraryBlockDetails.library = globalLib;
            this.requestModel.isGlobal = true;
            this.requestModel.PageIndex = 1;
            this.requestModel.PageSize = 50;
            this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
              this.libraryBlockDetails.blocks = data;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
            });
          }
          else if (this.projectUserRightsData && this.projectUserRightsData.isExternalUser == true) {
            this.libraryList = data;
            let globalLib = this.libraryList.find(x => x.name == EventConstants.Global);
            let countryLib = this.libraryList.find(x => x.name == EventConstants.Country);
            this.libraryList.splice(globalLib, 1);
            this.libraryList.splice(countryLib, 1);
            let orgLib = this.libraryList.find(x => x.name == EventConstants.Organization);
            this.selectedLibrary = orgLib;
            this.designerService.libraryDetails = this.selectedLibrary;
            this.requestModel.isGlobal = false;
            this.requestModel.PageIndex = 1;
            this.requestModel.PageSize = 50;
            this.requestModel.organizationId = this.shareDetailService.getORganizationDetail().organizationId;
            this.libraryService.getOrgTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
              this.libraryBlockDetails.library = orgLib;
              this.libraryBlockDetails.blocks = data;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
            });
          }
          let blockList = { 'id': 4, name: "Blocks", isActive: true };
          this.blockCollection.push(blockList);
        });
      }
    });

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.searchLibrary() });

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewLibrarySection.updateHeader).subscribe((template: any) => {
      this.attributeComponent = (this.designerService.blockDetails != null && this.designerService.blockDetails.isStack == false) ? ViewBlockAttributesPopoverComponent : ViewStackAttributesPopoverComponent;
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewLibrarySection.loadLibrary).subscribe((payload)=>{
      this.LoadCategory();
    }));

  }

  libraryChange(event) {
    this.designerService.clear();
    this.designerService.filterLibraryModel.isCountry = false;
    this.designerService.filterLibraryModel.isGlobal = false;
    this.designerService.filterLibraryModel.isOrganization = false;
    this.designerService.filterLibraryModel.isPersonal = false;
    let library = this.selectedLibrary;
    if (library.name == EventConstants.Country)
      this.designerService.filterLibraryModel.isCountry = true;
    else if (library.name == EventConstants.Global)
      this.designerService.filterLibraryModel.isGlobal = true;
    else if (library.name == EventConstants.Organization)
      this.designerService.filterLibraryModel.isOrganization = true;
    else if (library.name == EventConstants.User)
      this.designerService.filterLibraryModel.isPersonal = true;
    if (library.name == EventConstants.Country || library.name == EventConstants.Global) {

      this.headerIcons.disableIconCopy = false;
      this.headerIcons.disableIconR = false;

    }
    else if (library.name == "Blocks") {
      this.headerIcons.disableIconR = true;
      this.headerIcons.disableIconA = true;
      this.headerIcons.disableIconSe = true;
      this.headerIcons.disableIconCopy = false;
    }
    else {

      this.headerIcons.disableIconCopy = true;
      this.headerIcons.disableIconR = true;
    }
    if (event.target.selectedIndex == 4) {
      var blockCollection = this.blockCollection.find(id => id = event.target.selectedIndex);
    }
    this.designerService.libraryDetails = library;
    this.requestModel.isGlobal = false;
    this.requestModel.PageIndex = 1;
    this.requestModel.PageSize = 50;
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.library = library;
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
    });
    this.designerService.libraryDetails = this.selectedLibrary;
  }

  deleteBlock() {
    let payLoad = ActionOnBlockStack.delete;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad);
  }
  showAttributeView() {
    this.isEnableAttribute = true;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.library;
    this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad);
  }
  filterPopUp() {
    this.dialogService.open(FilterLibraryComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }

  hideAttributeView() {
    this.isEnableAttribute = false;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad);
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  searchLibrary() {
    this.requestModel.isGlobal = false;
    this.requestModel.PageIndex = 1;
    this.requestModel.PageSize = 50;
    this.requestModel.searchText = this.searchText;
    if (!this.searchText) {
      this.LoadCategory();
    } else {
      if (this.selectedLibrary.name == EventConstants.Global) {
        this.requestModel.isGlobal = true;
        this.libraryService.searchGlobalLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.Country) {
        this.libraryService.searchCountryLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.Organization) {
        this.requestModel.organizationId = this.shareDetailService.getORganizationDetail().organizationId;
        this.libraryService.searchOrganizationLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.User) {
        this.libraryService.searchUserLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.BlockCollection) {
        this.requestModel.organizationId = this.shareDetailService.getORganizationDetail().organizationId;
        this.libraryService.searchCbcBlockContent(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
    }
  }


  LoadCategory() {
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
    });
  }

  displayDocumentView() {
    this.designerService.LoadAllBlocksDocumentView = true;
    this.designerService.isDeliverableSection = false;
    this.designerService.isLibrarySection = true;
    this.designerService.selecteMenu(0);
    this.designerService.selectedSubmenus(SubMenus.Editor);
    this.designerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.hideOrShowMenus(0);
    //TODO: Fetch the selected template from the drop down instead of 0th index Id
    // let library = this.libraryBlockDetails;
    // if (library != null && library != undefined) {
    // this.designerService.libraryDetails
    // this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails)
    //   .publish(this.libraryBlockDetails);
    this.designerService.changeIsDocFullView(true);

    this.navigateToEditor();
  }

  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
