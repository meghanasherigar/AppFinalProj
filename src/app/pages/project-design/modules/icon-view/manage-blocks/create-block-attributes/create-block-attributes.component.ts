import { TreeViewService } from './../../../../../../shared/services/tree-view.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlockService } from '../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, BlockRequest, SubIndustry, blockSelectedModel } from '../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, OrganizationViewModel, CountryViewModel } from '../../../../../../@models/projectDesigner/library';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../@models/projectDesigner/template';
import { DeliverableViewModel, DeliverablesInput } from '../../../../../../@models/projectDesigner/deliverable';
import { NbDialogRef } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants, TreeViewConstant } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { Subscription } from 'rxjs';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { TemplateService } from '../../../../services/template.service';
import { DeliverableService } from '../../../../services/deliverable.service';
import { GenericResponseModel } from '../../../../../../@models/projectDesigner/common';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { ResponseType } from '../../../../../../@models/ResponseStatus';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-create-block-attributes',
  templateUrl: './create-block-attributes.component.html',
  styleUrls: ['./create-block-attributes.component.scss'],
  providers: [ 
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          return TreeViewService.getText(selection, TreeViewConstant.defaultIndustry);
        },
      }),
    }
  ],
})
export class CreateBlockAttributesComponent implements OnInit {
  projectDetails: ProjectContext;
  showOtherIndustry = false;
  createAttributeForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  attribute: BlockAttribute;
  transactionList: TransactionTypeDataModel[];
  disableCreateButton: boolean = false;
  @Input() submitted: boolean;
  subscriptions: Subscription = new Subscription();
  blockSelectedModel = new blockSelectedModel();
  private dialogBlockImporter: Dialog;

  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>,
    protected service: BlockService, protected designerService: DesignerService,
    protected storageService: StorageService,
    private readonly _eventService: EventAggregatorService,
    private translate: TranslateService,
    private sharedService: ShareDetailService,
    private templateService: TemplateService,
    private deliverableService: DeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {
    this.createAttributeForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockDescription: ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: [''],
      TemplatesUtilized: ['', Validators.required],
      ProjectYear: ['', Validators.required],
      BlockState: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      TransactionType: {}
    });
  }

  get form() { return this.createAttributeForm.controls; }
  //ngx-ui-loader configuration
  loaderId = 'CreateBlockLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    if (this.designerService.isTemplateSection)
      this.createAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.templateDetails.templateName);
    else if (this.designerService.isDeliverableSection)
      this.createAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.deliverabletemplateDetails.templateName);

    if (this.projectDetails != null) {
      this.createAttributeForm.controls["ProjectYear"].setValue(this.projectDetails.fiscalYear);
    }

    this.getBlockAttributes();
  }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
  }

  selectedIndustry(event) {
    if (event.target.value == "other") {
      this.showOtherIndustry = true;
    }
    else {
      this.showOtherIndustry = false;
    }
  }

  getBlockAttributes() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.service.getBlockMasterdata()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;

        let defaultBlockStatus= this.blockStatus.find(s => s.blockStatus === "Draft");
        this.createAttributeForm.controls["BlockStatus"].setValue(defaultBlockStatus);
        this.service.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          this.transactionList = transTypes;
        });
        this.getIndustries(this.projectDetails.industry, data.industry);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  getIndustries(selectedIndustries, data: Industry[]) {
    var _industries = [];
    data.forEach(element => {
      var isIndustrySelected = false;

      if (selectedIndustries) {
        var selectedIndustry = selectedIndustries.filter(item => item.id == element.id);
        if (selectedIndustry && selectedIndustry.length > 0)
          isIndustrySelected = true;
      }

      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        var isSubIndustrySelected = false;

        if (isIndustrySelected && selectedIndustry && selectedIndustry[0].subIndustries.length > 0) {
          var subIndustrySelected = selectedIndustry[0].subIndustries.filter(item => item.id == subelement.id);

          if (subIndustrySelected && subIndustrySelected.length > 0)
            isSubIndustrySelected = true;
        }

        subIndustries.push(new TreeviewItem({ checked: isSubIndustrySelected, text: subelement.subIndustry, value: subelement.id }));

      });

      if (!element.subIndustries || element.subIndustries.length == 0) {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id }));

        if (element && element.industryName.indexOf('Other') > -1 && selectedIndustry && selectedIndustry.length > 0) {
          if (this.createAttributeForm.controls["BlockIndustryOthers"])
            this.createAttributeForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industryName);
        }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    this.blockIndustries = Object.assign([], _industries);
  }

  onIndustrySelected(event) {
    this.createAttributeForm.controls["BlockIndustries"].setValue(event);

    this.showOtherIndustry = false;
    event.forEach(element => {
      this.blockIndustries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.showOtherIndustry = true;
        }
      });
    });
  }

  onBlockTypeChanged(event) {
    if (event.target.selectedIndex == 0)
      this.createAttributeForm.controls["BlockType"].setValue('');
    else {
      var selectedBlockType = this.blockTypes.find(s => s.blockType == event.target.value);
      this.createAttributeForm.controls["BlockType"].setValue(selectedBlockType);
    }
  }

  onBlockStatusChanged(event) {
    if (event.target.selectedIndex == 0)
      this.createAttributeForm.controls["BlockStatus"].setValue('');
    else {
      var selectedBlockStatus = this.blockStatus.find(s => s.blockStatus == event.target.value);
      this.createAttributeForm.controls["BlockStatus"].setValue(selectedBlockStatus);
    }
  }

  createBlock() {

    this.submitted = true;
    this.disableCreateButton = true;
    var prevBlockDetails = this.designerService.blockDetails;
    var data = this.createAttributeForm.value;
    //stop here if form is invalid
    if (this.createAttributeForm.invalid) {
      this.disableCreateButton = false;
      return;
    }


    let request = new BlockRequest();
    var data = this.createAttributeForm.value;
    request.isStack = false;
    request.isCopy = true;
    request.title = data.BlockTitle;
    request.description = data.BlockDescription;
    request.blockContent = null;
    request.blockType = data.BlockType;
    request.blockStatus = data.BlockStatus;
    request.templatesUtilizedIn = data.TemplatesUtilized;
    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];

    if (prevBlockDetails != null && this.designerService.prevTempOrDelId != null && ((this.designerService.isTemplateSection && this.designerService.templateDetails != null && this.designerService.prevTempOrDelId == this.designerService.templateDetails.templateId)
      || (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null && this.designerService.prevTempOrDelId == this.designerService.deliverableDetails.deliverableId))) {
      request.previousId = prevBlockDetails.id;
      request.parentId = prevBlockDetails.parentId;
      request.parentUId = prevBlockDetails.parentUId;
    }
    request.blockOrigin = null; //data.blockOrigin;
    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers);
    request.libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designerService.isTemplateSection == true) {
      request.libraryReference.template = new TemplateViewModel();
      request.libraryReference.template.isDefault = this.designerService.templateDetails.isDefault;
      request.libraryReference.template.templateId = this.designerService.templateDetails.templateId;
      request.libraryReference.template.templateName = this.designerService.templateDetails.templateName;
      request.libraryReference.template.uId = this.designerService.templateDetails.uId;
    }

    // //section to assign deliverable info if a block has been created from deliverable section
    if (this.designerService.isDeliverableSection == true) {
      request.libraryReference.deliverable = new DeliverableViewModel();
      request.libraryReference.deliverable.deliverableId = this.designerService.deliverableDetails.deliverableId;
      request.libraryReference.deliverable.deliverableName = this.designerService.deliverableDetails.deliverableName;
      request.libraryReference.deliverable.templateId = this.designerService.deliverabletemplateDetails.templateId;
      request.libraryReference.deliverable.entityId = this.designerService.deliverableDetails.entityId;
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
    request.libraryReference.organization = this.sharedService.getORganizationDetail();
    // request.libraryReference.organization = new OrganizationViewModel();
    // request.libraryReference.organization.organizationId = "";
    // request.libraryReference.organization.organizationName = "";

    // request.libraryReference.country = new CountryViewModel();
    // request.libraryReference.country.country = "";
    // request.libraryReference.country.countryCode = "";
    // request.libraryReference.country.currency = "";
    // request.libraryReference.country.id = "";

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    
    if (this.designerService.blockImporterSelectedText != null || this.designerService.blockImporterSelectedText != undefined) {
      request.blockContent = "<html><body>";
      request.blockContent += this.designerService.blockImporterSelectedText;
      request.blockContent += "</body></html>";
      var requests: BlockRequest[] = new Array();
      requests.push(request);
      this.service.saveImportedBlocks(requests).subscribe((data: any) => {
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockCreated'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
      });
    }
    else {
      this.service.createBlock(request)
      .subscribe((data: any) => {
        if(data && data.responseType === ResponseType.Mismatch)
        {
          this.toastr.warning(data.errorMessages.toString());
          this.ref.close();
        }
        else{
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockCreated'));
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.ref.close();
          this.designerService.blockDetails = null;
          this.designerService.blockList = [];
          this.designerService.clear();
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          if (this.designerService.isTemplateSection == true) {
            if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value)
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadTemplate).publish(this.designerService.templateDetails);
            else {
              this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails));
              this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish));
            }
          }
          if (this.designerService.isDeliverableSection == true) {
            var payload = new DeliverablesInput();
            payload.templateId = this.designerService.deliverabletemplateDetails.templateId;
            payload.id = this.designerService.entityDetails ? this.designerService.entityDetails[0].entityId : "";
            payload.projectId = this.projectDetails.projectId;
            payload.pushBackBlocks = true;
            // this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).publish(payload));
            this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(payload));
            this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish));

            // this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(dataPublish));

          }
          if (this.designerService.isDocFullViewEnabled != null) {
            this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(dataPublish);
          }
        }
      });
      }
  }

  getSelectedIndustries(allindustries, selIndustries, others) {
    var industryList = [];

    if (selIndustries.length > 0) {
      allindustries.forEach(industry => {
        var _industry = new Industry();
        _industry.id = industry.value;
        _industry.subIndustries = [];
        selIndustries.forEach(element => {

          if (industry.internalChildren && industry.internalChildren.filter(id => id.value == element).length > 0) {
            var _subIndustry = new SubIndustry();
            _subIndustry.id = element;
            _industry.subIndustries.push(_subIndustry);
          }
          else if (industry.value == element) {
            _industry.industryName = others;
          }
        });
        if (_industry.subIndustries.length > 0 || (_industry.industryName && _industry.industryName.length > 0))
          industryList.push(_industry);
      });
    }
    return industryList;
  }

  dismiss() {
    this.ref.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
