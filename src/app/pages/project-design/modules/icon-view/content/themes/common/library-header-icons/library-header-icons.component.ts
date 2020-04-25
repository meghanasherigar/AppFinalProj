import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../@models/common/eventConstants';
import { blockSelectedModel, projectIcons, BlockDetailsResponseViewModel, ActionOnBlockStack } from '../../../../../../../../@models/projectDesigner/block';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { SearchLibraryViewModel, LibraryBlockDetails } from '../../../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../../services/library.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { FilterLibraryComponent } from '../manage-blocks/filter-library/filter-library.component';
import { DesignerService } from '../../services/designer.service';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';
import { ViewBlockAttributesPopoverComponent } from '../manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component';
import { ViewStackAttributesPopoverComponent } from '../manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { EditBlockAttributesComponent } from '../manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { EditStackAttributesComponent } from '../manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { ProjectContext } from '../../../../../../../../@models/organization';

@Component({
  selector: 'ngx-library-header-icons',
  templateUrl: './library-header-icons.component.html',
  styleUrls: ['./library-header-icons.component.scss']
})
export class LibraryHeaderIconsComponent implements OnInit,OnDestroy {
  subscriptions: Subscription = new Subscription();
  @Input("section") section: any;
  headerIcons: projectIcons;
  requestModel = new SearchLibraryViewModel();
  searchText: string = "";
  searchTextChanged = new Subject<string>();
  libraryBlockDetails = new LibraryBlockDetails();
  selectedLibrary: any;
  isSearchBoxVisible: boolean;
  attributeComponent: any;
  designer = new Designer();
  isStack : boolean;
  projectDetails: ProjectContext;

  constructor(private _eventService: EventAggregatorService, private sharedService: ShareDetailService, private libraryService: LibraryService, private dialogService: NbDialogService, private designerService : DesignerService) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.headerIcons = new projectIcons();

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).subscribe((payload) => {
      if (payload)
        this.headerIcons.disableIconF = true;
      else
        this.headerIcons.disableIconF = false;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.enableIcon).subscribe((payload: blockSelectedModel) => {
      this.showHideIcons();
    }));

    this.subscriptions = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.searchLibrary() });

    this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.updateHeader).subscribe((payload: any) => {
      this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
      if(this.designer.blockDetails != null)
        this.isStack = this.designer.blockDetails.isStack;
    });

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.loadLibrary).subscribe((payload)=>{
      this.LoadCategory();
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).subscribe((isStack: boolean) => {
      if (!isStack) {
        this.dialogService.open(EditBlockAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
          context: { section: this.section }
        });
      }

      if (isStack) {
        this.dialogService.open(EditStackAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
          context: { section: this.section }
        });
      }
    }));

  }

  showHideIcons() {
    var library = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == this.section)[0].library;

    if (library.name == EventConstants.Country || library.name == EventConstants.Global) {
      this.headerIcons.disableIconR = false;
    }
    else if (library.name == EventConstants.BlockCollection || library.name == EventConstants.Organization) {
      this.headerIcons.disableIconR = this.projectDetails.ProjectAccessRight.isCentralUser ? true : false;
      this.headerIcons.disableIconA = true;
      this.headerIcons.disableIconSe = true;
    }
    else if (library.name == EventConstants.User) {
      this.headerIcons.disableIconR = true;
    }
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  deleteBlock() {
    let payLoad = ActionOnBlockStack.delete;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.LibrarySection).publish(payLoad));
  }

  searchLibrary() {
    this.selectedLibrary = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == this.section)[0].library;

    this.requestModel.isGlobal = false;
    this.requestModel.PageIndex = 1;
    this.requestModel.PageSize = 50;
    this.requestModel.searchText = this.searchText;

    if (!this.searchText) {
      this.LoadCategory();
    }
    else {
      if (this.selectedLibrary.name == EventConstants.Global) {
        this.requestModel.isGlobal = true;
        this.libraryService.searchGlobalLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.Country) {
        this.libraryService.searchCountryLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.Organization) {
        this.requestModel.organizationId = this.sharedService.getORganizationDetail().organizationId;
        this.libraryService.searchOrganizationLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.User) {
        this.libraryService.searchUserLibraries(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
      else if (this.selectedLibrary.name == EventConstants.BlockCollection) {
        this.requestModel.organizationId = this.sharedService.getORganizationDetail().organizationId;
        this.libraryService.searchCbcBlockContent(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.libraryBlockDetails.blocks = data;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
        });
      }
    }
  }

  LoadCategory() {
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
    });
  }

  filterPopUp() {
    this.dialogService.open(FilterLibraryComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
