import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { BlockService } from '../../../services/block.service';
import { NbDialogService, NbMenuItem, NbPopoverDirective } from '@nebular/theme';
import { CreateBlockAttributesComponent } from '../../content/manage-blocks/create-block-attributes/create-block-attributes.component';
import { CreateStackAttributesComponent } from '../../content/manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { eventConstantsEnum, EventConstants } from '../../../../../@models/common/eventConstants';
import { BlockRequest, BlockPublish, ActionOnBlockStack } from '../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../services/designer.service';
import { DesignerService as DesignerServiceProjDesign } from '../../../../project-design/services/designer.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { DeleteBlockViewModel, LibraryReferenceViewModel, LibraryDropdownViewModel } from '../../../../../@models/projectDesigner/library';
import { FlatTreeControl } from '@angular/cdk/tree';
import { TodoItemFlatNode } from '../../content/region/library/content/content.component';
import { Subscription } from 'rxjs';
import { LibraryEnum } from '../../../../../@models/projectDesigner/common';
import { libraryActions } from '../../../../../@models/admin/library';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN_MENU_ITEMS } from '../../../admin-menu';
import { LibraryService } from '../../../../project-design/services/library.service';
import { SubMenus } from '../../../../../@models/projectDesigner/designer';
import { ValueConstants } from '../../../../../@models/common/valueconstants';
import { ToastrService } from 'ngx-toastr';
enum Menus {
  Global = 'Global Library',
  Country = 'Country Library'
}
@Component({
  selector: 'ngx-editor-level2-menu-library',
  templateUrl: './editor-level2-menu-library.component.html',
  styleUrls: ['./editor-level2-menu-library.component.scss']
})
export class EditorLevel2MenuLibraryComponent implements OnInit, OnDestroy {
  selectedDesignerTab: any = 1;
  menu: NbMenuItem[] = ADMIN_MENU_ITEMS;
  isBlockSelected: boolean = false;
  subscriptions: Subscription = new Subscription();
  @ViewChild('uploader') uploader: any;
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
  EnableAttribute: boolean;
  EnableStack: boolean;
  EnableUngroup: boolean;
  enablePromote: boolean;
  enableDemote: boolean;
  hidePromote: boolean;
  hideDemote: boolean;
  EnableRemove: boolean;
  EnableCopy: boolean;
  selectedBlock: any;
  imageNameFlag: boolean;
  imageName: String = this.translate.instant("collapse");
  show: boolean = true;
  searchedText = '';
  replaceWith = '';

  constructor(private readonly _eventService: EventAggregatorService,
    private dialogPopService: DialogService,
    private blockService: BlockService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private designerServiceProjDesign: DesignerServiceProjDesign,
    private router: Router,
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    this.hideDemote = ((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate)) ? false : true;
    this.hidePromote = ((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate)) ? false : true;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableDisableFormatPainter).subscribe((payloa) => {
      this.designerServiceProjDesign.enableFormatPainter = false;
      this.designerServiceProjDesign.enableDefaultPainter = false;
    }))
    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      this.selectedDesignerTab = this.designerService.selectedAdminDocTab = selectedTab;
      if (this.selectedDesignerTab == SubMenus.Tasks)
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByLibrary).publish(undefined);
    });
    // commented out because it is breaking for QA automation & pushed this snipped of code to header component
    
    // this.libraryService.getDummmyProjectDetails().subscribe(data => {
    //   this.designerService.dummyProjectDetails = data;
    // });
    
    this.initSelectedMenu();
    this.designerServiceProjDesign.LoadAllBlocksDocumentView = true;
    this.designerServiceProjDesign.isLibrarySection = true;
    this.designerServiceProjDesign.manageLibraryDetails = new LibraryDropdownViewModel();
    if (this.designerService.isGLobal)
      this.designerServiceProjDesign.manageLibraryDetails.name = LibraryEnum.global;
    else
      this.designerServiceProjDesign.manageLibraryDetails.name = LibraryEnum.country;

    this.subscriptions.add(
      this._eventService.getEvent(EventConstants.DocumentViewToolBar).subscribe((payload: any) => {
        var tollbarDiv = document.getElementById("toolbar-menu");
        tollbarDiv.innerHTML = payload;
      }));
    this.subscriptions.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.adminAction).subscribe((payload: any) => {
        this.isBlockSelected = payload;
      }));
    //this should get change based on country or global
    this.subscriptions.add(this.designerService.MenuAccess.subscribe((data) => {
      this.selectedBlock = this.designerService.blockDetails;
      const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
      this.hideDemote = ((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate)) ? false : true;
      this.hidePromote = ((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate)) ? false : true;
      if((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate) && this.selectedBlock && !this.selectedBlock.isCategory) {
        if(this.selectedBlock.previousId !== ValueConstants.DefaultId && !this.selectedBlock.isStack && !this.selectedBlock.IsPartOfstack) {
          this.hideDemote = false;
        } else {
          this.hideDemote = true;
        }

        if(this.selectedBlock.parentId !== ValueConstants.DefaultId && !this.selectedBlock.isStack && !this.selectedBlock.IsPartOfstack) {
          this.hidePromote = false;
        } else {
          this.hidePromote = true;
        }
      }
      this.EnableAttribute = data.attribute;
      this.EnableCopy = data.copy;
      this.EnableRemove = data.remove;
      this.EnableStack = data.createStack;
      this.EnableUngroup = data.ungroup;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  isNext() {
    return this.designerServiceProjDesign.isFindNext;
  }

  isPrevious() {
    return (this.designerServiceProjDesign.searchIndex > 1 && this.designerServiceProjDesign.findElements.length > 1 && this.designerServiceProjDesign.searchIndex <= this.designerServiceProjDesign.findElements.length)
  }
  initSelectedMenu() {
    const menuItem = this.menu[3].children.find((x) => {
      return x.url === '/#' + this.router.url;
    });
    if (menuItem && menuItem.title == Menus.Global) {
      this.designerService.isGLobal = true;
    }
    else if (menuItem && menuItem.title == Menus.Country) {
      this.designerService.isGLobal = false;
    }
  }
  uploadFile(files) {
    this.designerServiceProjDesign.selectedFileFormat = '';
    const formData = new FormData();
    var ext = files[0].name.split('.').pop();
    this.designerServiceProjDesign.selectedFileFormat = ext;
    formData.append('importingFile', files[0]);
    var payload: any = {};
    payload.section = "BlockImporter";
    if (this.designerService.isGLobal)
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.editBlockExtendedViewGlobal).publish(payload));
    else
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.editBlockExtendedViewCountry).publish(payload));


    this.blockService.importBlocksFromFile(formData)
      .subscribe((data: BlockRequest[]) => {

        var flatNodes: any = [];
        var index: number = 0;
        data.forEach(node => {
          var flatNode: any = {};
          flatNode.id = index++;
          node.id = flatNode.id;
          flatNode.item = node.title;
          flatNode.content = node.blockContent;
          flatNode.level = 0;
          flatNode.expandable = false;
          flatNodes.push(flatNode);
        });
        this.designerService.importedBlocks = data;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.displayBlocks).publish(flatNodes);
      });
    this.uploader.nativeElement.value = '';
  }

  createBlock() {
    const CreateBlockDialogRef = this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    CreateBlockDialogRef.componentRef.instance.context = { global: true, country: false };
  }

  createStack() {
    const CreateStackDialogRef = this.dialogService.open(CreateStackAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    CreateStackDialogRef.componentRef.instance.context = { global: true, country: false };
  }

  publishBlock() {
    let request = new BlockPublish();
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    request.countryId = null;
    request.isPublished = 1;
    request.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
    request.IsGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
    request.IsCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;
    request.IsGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
    this.blockService.publishBlocks(request).subscribe((response) => {
      if (response.status) {
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.Published'));
        
      }
    });
  }

  DeleteBLocks() {
    let payLoad = ActionOnBlockStack.delete;
    // this.designerService.isGLobal = true; // depends on selected menu
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(payLoad);
  }

  promoteBlock() {
    let payLoad = ActionOnBlockStack.promote;
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(payLoad);
  }

  demoteBlock() {
    let payLoad = ActionOnBlockStack.demote;
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(payLoad);
  }

  copyBlocks() {
    this.designerService.blocksToBeCopied = new Array();
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    // this.designerService.isGLobal = true; //based on selected library
    this.designerService.isCopied = true;
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(this.designerService.isCopied);
  }

  UngroupStack() {
    let payLoad = ActionOnBlockStack.unGroupLibrary;
    // this.designerService.isGLobal = true; //based on selected library
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(payLoad);
  }
  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.imageName=this.translate.instant("collapse");
  
    }
    else {
      this.imageName=this.translate.instant("expand");
     }
  }


  toggleBlockAttributeComponent() {
    // this.designerService.isGLobal = true;//based on selected library
    if (this.designerService.blockDetails !== null) {
      if (!this.designerService.blockDetails.isCategory) {
        if (this.designerService.blockDetails.isStack) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('togglestackckattributecomponent');
        }
        else {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('toggleblockattributecomponent');
        }
      } else {
        this.dialogPopService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SelectBlocks'));
      }
    } else {
      this.dialogPopService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SelectBlocks'));
    }
  }
  findText(event, action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);

  }
  findNext() {
    var payload: any = {};
    payload.action = "FindNext";
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  replaceSelected(event, action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  findPrevious() {
    var payload: any = {};
    payload.action = "FindPrevious";
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  dismiss(action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
    this.searchedText = "";
    this.replaceWith = "";
    this.popover.hide();
  }

  toggleCreateQuestion() {
    // this.designerService.isGLobal = true;//based on selected library
    this.designerServiceProjDesign.blockDetails = this.designerService.blockDetails;
    if (this.designerService.blockDetails !== null) {
      if (!this.designerService.blockDetails.isCategory) {
        if (!this.designerService.blockDetails.isStack) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(libraryActions.CreateQuestion);
        }
      } else {
        this.dialogPopService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SelectBlocks'));
      }
    } else {
      this.dialogPopService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SelectBlocks'));
    }
  }
  saveGlobalLibrary() {
    if (this.designerServiceProjDesign.LoadAllBlocksDocumentView === true) {
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish("saveAll"));
    } else {
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish("save"));
    }
  }
  formatPainter() {
    this.designerServiceProjDesign.enableFormatPainter = true;
    this.designerServiceProjDesign.enableDefaultPainter = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.FormatPainterAddClass).publish(true));
  }
}
