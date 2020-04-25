import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BlockService } from '../../../../../../../services/block.service'
import { BlockType } from '../../../../../../../../../@models/projectDesigner/block'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackRequestViewModel, BlockReferenceViewModel, StackLevelViewModel, StackAttributeViewModel } from '../../../../../../../../../@models/projectDesigner/stack';
import { LibraryReferenceViewModel, ProjectDetailsViewModel } from '../../../../../../../../../@models/projectDesigner/library';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../../@models/projectDesigner/template';
import { StorageService } from '../../../../../../../../../@core/services/storage/storage.service';
import { StackService } from '../../../../../../../services/stack.service';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../../../../@models/transaction';
import { DeliverableViewModel, DeliverablesInput } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../../@models/organization';
import { DesignerService } from '../../../services/designer.service';
import { Subscription } from 'rxjs';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ResponseType } from '../../../../../../../../../@models/ResponseStatus';
import { TranslateService } from '@ngx-translate/core';
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
  subscriptions: Subscription = new Subscription();
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;
  disableCreateButton: boolean = false;
  constructor(protected ref: NbDialogRef<any>, private service: BlockService,private translate: TranslateService, private formBuilder: FormBuilder, private designerService: DesignerService, private storageService: StorageService,
    private stackService: StackService, private readonly _eventService: EventAggregatorService, private sharedService: ShareDetailService, private ngxLoader: NgxUiLoaderService, private toastr:ToastrService) {
    this.createStackForm = this.formBuilder.group({
      StackLevel: {},
      StackType: ['', Validators.required],
      StackDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      TransactionType: {}
    });
  }

  loaderId = 'CreateStackLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.getStackAttributes();
  }

  get form() { return this.createStackForm.controls; }

  dismiss() {
    this.ref.close();
  }

  getStackAttributes() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.isLoaded = true;
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
      },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  onStackTypeChanged() {
  }

  createStack() {
    this.submitted = true;
  this.disableCreateButton=true;
    //  stop here if form is invalid
    if (this.createStackForm.invalid) {
      this.disableCreateButton=false;
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
    this.designer.blockList = this.designer.blockList.sort((a, b) => {
      return <any>(a.nodeIndex) - <any>(b.nodeIndex);
    });

    this.designer.blockList.forEach(item => {
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
    let prevBlockDetails = this.designer.blockList[0];


    request.blocks = blocks;
    request.previousId = prevBlockDetails.previousId;
    request.parentId = prevBlockDetails.parentId;
    request.libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designer.templateDetails != null) {
      request.libraryReference.template = new TemplateViewModel();
      request.libraryReference.template.isDefault = this.designer.templateDetails.isDefault;
      request.libraryReference.template.templateId = this.designer.templateDetails.templateId;
      request.libraryReference.template.templateName = this.designer.templateDetails.templateName;
      request.libraryReference.template.uId = this.designer.templateDetails.uId;
    }

    //section to assign deliverable info if a block has been created from deliverable section
    if (this.designer.deliverableDetails != null) {
      request.libraryReference.deliverable = new DeliverableViewModel();
      request.libraryReference.deliverable.deliverableId = this.designer.deliverableDetails.deliverableId;
      request.libraryReference.deliverable.deliverableName = this.designer.deliverableDetails.deliverableName;
      request.libraryReference.deliverable.templateId = this.designer.deliverableDetails.templateId;
      request.libraryReference.deliverable.entityId = this.designer.deliverableDetails.entityId;
      request.libraryReference.deliverable.uId = this.designer.deliverableDetails.uId;
    }

    //section to assgin library info if a block has been created from cbc section
    request.libraryReference.global = false;
    if (this.projectDetails != null) {
      request.libraryReference.project = new ProjectDetailsViewModel();
      request.libraryReference.project.projectId = this.projectDetails.projectId;
      request.libraryReference.project.projectName = this.projectDetails.projectName;
      request.libraryReference.project.projectYear = this.projectDetails.fiscalYear;
    }

    request.libraryReference.organization = this.sharedService.getORganizationDetail();
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.stackService.createStack(request)
      .subscribe((data: any) => {
        if(data && data.responseType === ResponseType.Mismatch)
        {
          this.toastr.warning(data.errorMessages.toString());
          this.ref.close();
        }
        else{
          if (this.designer.templateDetails != null) {
            this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
          }
          if (this.designer.deliverableDetails != null) {
            var deliverableInput = new DeliverablesInput();
            deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
            deliverableInput.pushBackBlocks = true;
            this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
          }
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.StackCreated'));
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.ref.close();
        }
      },
      error => {
        this.disableCreateButton=false;
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });

  }

  onDestroy()
  {
    this.subscriptions.unsubscribe();
  }

}
