import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BlockService } from '../../../../services/block.service'
import { BlockType, blockSelectedModel } from '../../../../../../@models/projectDesigner/block'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackRequestViewModel, BlockReferenceViewModel, StackLevelViewModel, StackAttributeViewModel } from '../../../../../../@models/projectDesigner/stack';
import { LibraryReferenceViewModel, ProjectDetailsViewModel } from '../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../services/designer.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../@models/projectDesigner/template';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { StackService } from '../../../../services/stack.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { DeliverableViewModel } from '../../../../../../@models/projectDesigner/deliverable';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { GenericResponse, ResponseType } from '../../../../../../@models/ResponseStatus';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-create-stack-attributes',
  templateUrl: './create-stack-attributes.component.html',
  styleUrls: ['./create-stack-attributes.component.scss']
})
export class CreateStackAttributesComponent implements OnInit {
  stackTypes: BlockType[];
  stackLevels: StackLevelViewModel[];
  transactionList: TransactionTypeDataModel[];
  createStackForm: FormGroup;
  submitted: boolean = false;
  projectDetails: ProjectContext;
  isLoaded: boolean = false;
  disableCreateButton : boolean = false;
  subscriptions: Subscription=new Subscription();

  blockSelectedModel = new blockSelectedModel();
  constructor(protected ref: NbDialogRef<any>, private service: BlockService, private ngxLoader: NgxUiLoaderService,private translate: TranslateService,private formBuilder: FormBuilder, private designerService: DesignerService, private storageService: StorageService, 
    private stackService: StackService, private readonly _eventService: EventAggregatorService, private sharedService : ShareDetailService, private toastr: ToastrService) {
    this.createStackForm = this.formBuilder.group({
      StackLevel: {},
      StackType: ['', Validators.required],
      StackDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      TransactionType: {}
    });
  }
  loaderId='CreateStackDocumentViewLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';
   

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();

    this.getStackAttributes();
  }

  get form() { return this.createStackForm.controls; }

  dismiss() {
    this.ref.close();
  }

  getStackAttributes() {
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.isLoaded = true;
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
      });
  }

  onStackTypeChanged() {
  }

  createStack() {
    this.submitted = true;
    this.disableCreateButton = true;

    //  stop here if form is invalid
    if (this.createStackForm.invalid) {
      this.disableCreateButton = false;
      return;
    }

    var data = this.createStackForm.value;
    var request = new StackRequestViewModel();


    request.isCopy = true;
    request.description = data.StackDescription;

    if (data.StackType != "") {
      request.blockType = this.stackTypes.filter(id => id.blockTypeId == data.StackType)[0];
    }

    if (data.StackLevel != "")
      request.stackLevel = this.stackLevels.filter(id => id.id == data.StackLevel)[0];

    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];

    request.isStack = true;
    request.blockOrigin = null;
    let blocks = [];
    this.designerService.blockList = this.designerService.blockList.sort((a, b) => {
      return <any>(a.nodeIndex) - <any>(b.nodeIndex);
    });

    if(this.designerService.assignToBlockList && this.designerService.assignToBlockList.length)
    {
      this.designerService.blockList = this.designerService.assignToBlockList;
    }

    this.designerService.blockList.forEach(item => {
      let block = new BlockReferenceViewModel();
      block.id = item.id;
      block.blockId = item.blockId;
      block.level = item.level;
      block.previousId = item.previousId;
      block.isDeleted = false;
      block.isRemoved = false;
      //added in case of nested blocks
      block.hasChildren = item.hasChildren;
      blocks.push(block);
    });
    let prevBlockDetails = this.designerService.blockList[0];

    request.blocks = blocks;
    request.previousId = prevBlockDetails.previousId;
    request.parentId = prevBlockDetails.parentId;
    request.libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designerService.isTemplateSection == true) {
      request.libraryReference.template = new TemplateViewModel();
      request.libraryReference.template.isDefault = this.designerService.templateDetails.isDefault;
      request.libraryReference.template.templateId = this.designerService.templateDetails.templateId;
      request.libraryReference.template.templateName = this.designerService.templateDetails.templateName;
       //Added for concurrency
       request.libraryReference.template.uId = this.designerService.templateDetails.uId; 
    }

    //section to assign deliverable info if a block has been created from deliverable section
    if (this.designerService.isDeliverableSection == true) {
      request.libraryReference.deliverable = new DeliverableViewModel();
      request.libraryReference.deliverable.deliverableId = this.designerService.deliverableDetails.deliverableId ? this.designerService.deliverableDetails.deliverableId : this.designerService.deliverableDetails.entityId;
      request.libraryReference.deliverable.deliverableName = this.designerService.deliverableDetails.deliverableName;
      request.libraryReference.deliverable.templateId = this.designerService.deliverableDetails.templateId;
      request.libraryReference.deliverable.entityId = this.designerService.deliverableDetails.entityId;
      //Added for concurrency
      request.libraryReference.deliverable.uId = this.designerService.deliverableDetails.uId;
    }

    //section to assgin library info if a block has been created from cbc section
    request.libraryReference.global = false;
    if (this.projectDetails != null) {
      request.libraryReference.project = new ProjectDetailsViewModel();
      request.libraryReference.project.projectId = this.projectDetails.projectId;
      request.libraryReference.project.projectName = this.projectDetails.projectName;
      request.libraryReference.project.projectYear = this.projectDetails.fiscalYear;
    }
    request.libraryReference.organization = this.sharedService.getORganizationDetail();  
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    //TODO: capture the correct value
    //request.libraryReference.Uid= this.designerService.libraryDetails.uId;    

    this.stackService.createStack(request)
      .subscribe((data: GenericResponse) => {
        if(data && data.responseType === ResponseType.Mismatch)
        {
          this.toastr.warning(data.errorMessages.toString());
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.ref.close();
        }
        else{
            this.designerService.blockDetails = null;
            if (this.designerService.isTemplateSection == true)
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
           
            this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.StackCreated'));
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
            this.ref.close();
            
            if(this.designerService.isDocFullViewEnabled!=null)
            {
              this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel) ;
            }
        }
      });

  }

}
