import { Injectable } from '@angular/core';
import { BlockAttributeDetail, BlockRequest, LibraryBlockDetails, LibraryOptions } from '../../../@models/projectDesigner/block';
import { TemplateViewModel } from '../../../@models/projectDesigner/template';
import { StackAttributeDetail } from '../../../@models/projectDesigner/stack';
import { DeliverableViewModel, EntityViewModel } from '../../../@models/projectDesigner/deliverable';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { LibraryDropdownViewModel, DeleteBlockViewModel, manageLibrary, AccessLibraryMenus, LibraryFilter, AdminLibrarySectionViewModel } from '../../../@models/projectDesigner/library';
import { BehaviorSubject } from 'rxjs';
import { definedColors } from '../../../@models/admin/library';
import { SubMenus } from '../../../@models/projectDesigner/designer';
import { OECDOrganizationViewModel } from '../../../@models/admin/library';


@Injectable({
  providedIn: 'root'
})

export class DesignerService {
  isExtendedIconicView: boolean = false;
  blockDetails: LibraryBlockDetails;
  SelectedOption: any;
  acceptORreject: boolean;
  isGLobal: boolean;
  templateDetails: TemplateViewModel;
  blockAttributeDetail: BlockAttributeDetail;
  blockList: LibraryBlockDetails[];
  stackAttributeDetail: StackAttributeDetail;
  deliverableDetails: DeliverableViewModel;
  entityDetails: EntityViewModel[];
  isTemplateSection: boolean = false;
  isDeliverableSection: boolean = false;
  blocksToBeCopied: LibraryBlockDetails[];
  deleteblock: DeleteBlockViewModel;
  isLibrarySection: boolean = false;
  dummyProjectDetails : OECDOrganizationViewModel = new OECDOrganizationViewModel();
  isCopied: boolean = false;
  libraryDetails: LibraryDropdownViewModel;
  selectedSubMenuTab = new BehaviorSubject<SubMenus>(SubMenus.Editor);
  selectedDesignerTab = this.selectedSubMenuTab.asObservable();
  //section for block importer -- starts
  importedBlocks: BlockRequest[];
  selectedImportedBlockId: string;
  biSelectedBlocks: any;
  biAvailableBlocks: any;
  disAbleIcon:boolean;
  Librarymenus = new AccessLibraryMenus();
  LibraryFilters = new LibraryFilter();
  globalLibrarySection = new AdminLibrarySectionViewModel();
  countryLibrarySection = new AdminLibrarySectionViewModel();
  globalOECDSection = new AdminLibrarySectionViewModel();
  countryTemplateSection =  new AdminLibrarySectionViewModel();
  //section for block importer -- ends

  hashTagList: any = [];
  definedColorCodes: any = definedColors;

  canCreateQuestion: boolean;
  isDoubleClicked = new BehaviorSubject<boolean>(false);
  currentDoubleClicked = this.isDoubleClicked.asObservable();

  LibraryMenuAccess$: BehaviorSubject<AccessLibraryMenus> = new BehaviorSubject(this.Librarymenus);
  MenuAccess = this.LibraryMenuAccess$.asObservable();
  selectedAdminDocTab: any;

  constructor(private _eventService: EventAggregatorService) { }

  clear() {
    this.blockDetails = null;
    this.blockAttributeDetail = null;
    this.stackAttributeDetail = null;
    this.blockList = [];
    this.importedBlocks = [];
  }

  filterData() {
    // this.selectedFilterProjectYear = [];
  }
  changeIsDoubleClicked(isDoubleClicked: boolean) {
    this.isDoubleClicked.next(isDoubleClicked);
  }

  changeAccessMenus(libraryMenus: AccessLibraryMenus) {
    this.LibraryMenuAccess$.next(libraryMenus);
  }

  DisableMenus() {
    const menuAccess = new AccessLibraryMenus();
    menuAccess.createStack = false;
    menuAccess.copy = false;
    menuAccess.remove = false;
    menuAccess.ungroup = false;
    menuAccess.attribute = false;
    this.changeAccessMenus(menuAccess);
  }
  changeTabDocumentView(updatedValue: SubMenus) {
    this.selectedSubMenuTab.next(updatedValue);
  }
  getCurrentLibraryPayload(CurrentValue): manageLibrary {
    const managelibrary = new manageLibrary();
    if (CurrentValue === LibraryOptions.Globallibrary) {
      managelibrary.Global = true;
    } else if (CurrentValue === LibraryOptions.Countrylibrary) {
      managelibrary.IsCountryLibrary = true;
    } else if (CurrentValue === LibraryOptions.OECDtemplates) {
      managelibrary.GlobalTemplate = true;
    } else if (CurrentValue === LibraryOptions.Countrytemplates) {
      managelibrary.CountryTemplate = true;
    } else {
      managelibrary.Global = true;
    }
    return managelibrary;
  }

  getLibrarySectionOption(libraryType:LibraryOptions)
  {
      switch(libraryType)
      {
        case LibraryOptions.Globallibrary:
          return this.globalLibrarySection;
          case LibraryOptions.Countrylibrary:
          return this.countryLibrarySection;
          case LibraryOptions.OECDtemplates:
          return this.globalOECDSection;
          case LibraryOptions.Countrytemplates:
          return this.countryTemplateSection;
      }
  }
}