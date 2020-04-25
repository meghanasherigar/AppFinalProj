import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { BlockService } from '../../../services/block.service';
import { NbDialogService } from '@nebular/theme';
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
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-global-library-level2',
  templateUrl: './global-library-level2.component.html',
  styleUrls: ['./global-library-level2.component.scss']
})
export class GlobalLibraryLevel2Component implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  @ViewChild('uploader') uploader: any;
  EnableAttribute: boolean;
  EnableStack: boolean;
  EnableUngroup: boolean;
  EnableRemove: boolean;
  EnableCopy: boolean;
  imageNameFlag: boolean;
  imageName:String=this.translate.instant("collapse");
  show: boolean = true;
  constructor(private readonly _eventService: EventAggregatorService,
    private dialogPopService: DialogService,
    private blockService : BlockService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private designerServiceProjDesign:DesignerServiceProjDesign) { }

  ngOnInit() {
    this.designerServiceProjDesign.LoadAllBlocksDocumentView=true;
    this.designerServiceProjDesign.isLibrarySection =true;
    this.designerServiceProjDesign.manageLibraryDetails=new LibraryDropdownViewModel();
    this.designerServiceProjDesign.manageLibraryDetails.name=LibraryEnum.global;
    this.subscriptions.add(
    this._eventService.getEvent(EventConstants.DocumentViewToolBar).subscribe((payload:any) => {
      var tollbarDiv = document.getElementById("toolbar-menu");
      tollbarDiv.innerHTML = payload;
      }));

    this.subscriptions.add(this.designerService.MenuAccess.subscribe((data) => {
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

  
  uploadFile(files) {
    const formData = new FormData();
    formData.append('importingFile', files[0]);
    var payload: any = {};
    payload.section = "BlockImporter";
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockExtendedView).publish(payload));

    this.blockService.importBlocksFromFile(formData)
      .subscribe((data: BlockRequest[]) => {

        var flatNodes: any = [];
        var index: number = 0;
        data.forEach(node => {
          var flatNode: any = {};
          flatNode.id = index++;
          node.id = flatNode.id;
          flatNode.item = node.title;
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
    CreateBlockDialogRef.componentRef.instance.context = { global: true, country: false};
  }

  createStack() {
    const CreateStackDialogRef = this.dialogService.open(CreateStackAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    CreateStackDialogRef.componentRef.instance.context = { global: true, country: false};
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
      if(response.status) {
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.Published'));
       
      }
    });
  }

  DeleteBLocks() {
    let payLoad = ActionOnBlockStack.delete;
    this.designerService.isGLobal = true;
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(payLoad);
  }

  copyBlocks() {
    this.designerService.blocksToBeCopied =  new Array();
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    this.designerService.isGLobal = true;
    this.designerService.isCopied = true;
    this._eventService.getEvent(EventConstants.ManageLibrarySection).publish(this.designerService.isCopied);
  }

  UngroupStack() {
    let payLoad = ActionOnBlockStack.unGroupLibrary;
    this.designerService.isGLobal = true;
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
    this.designerService.isGLobal = true;
    if(this.designerService.blockDetails !== null)  {
      if(!this.designerService.blockDetails.isCategory){
        if(this.designerService.blockDetails.isStack) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('togglestackckattributecomponent');
        } else {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('toggleblockattributecomponent');
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
}
