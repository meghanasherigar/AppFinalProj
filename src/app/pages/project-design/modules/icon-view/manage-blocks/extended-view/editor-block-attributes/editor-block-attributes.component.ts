//editor component.ts

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import '../../../../../../../../assets/ckeditor.loader';
import 'ckeditor';
import { BlockService } from '../../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, BlockAttributeDetail, SubIndustry, BlockAttributeRequest, blockSelectedModel, DocumentViewIcons, StackLevelDataModel } from '../../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, ColorCode, EventConstants } from '../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../../services/designer.service';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { TransactionTypeDataModel } from '../../../../../../../@models/transaction';
import { TemplateService } from '../../../../../services/template.service';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { Subscription } from 'rxjs';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../@models/organization';
import { DocumentViewAccessRights } from '../../../../../../../@models/userAdmin';
import { StackService } from '../../../../../services/stack.service';
import { ResponseType } from '../../../../../../../@models/ResponseStatus';
import { DeliverablesInput } from '../../../../../../../@models/projectDesigner/deliverable';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-editor-block-attributes',
  templateUrl: './editor-block-attributes.component.html',
  styleUrls: ['./editor-block-attributes.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          switch (selection.checkedItems.length) {
            case 0:
              return '--Select--';
            case 1:
              return selection.checkedItems[0].text;
            default:
              return selection.checkedItems.length + " options selected";
          }
        }
      })
    }
  ],
})
export class EditorBlockAttributesComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  submitted: boolean = false;
  showOtherIndustry = false;
  editBlockAttributeForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  stackLevel: any = [];
  transactionList: TransactionTypeDataModel[];
  blockIndustries = [];
  attribute: BlockAttribute;
  isLoaded: boolean = false;
  isStack: boolean;
  subscriptions: Subscription = new Subscription();
  blockSelectedModel = new blockSelectedModel();
  toolbarIcons = new DocumentViewIcons();
  projectDetails: ProjectContext;
  deliverablesInput = new DeliverablesInput();

  constructor(private formBuilder: FormBuilder, protected service: BlockService
    , private readonly _eventService: EventAggregatorService, private designerService: DesignerService,private translate: TranslateService, 
    private dialogService: DialogService, private templateService: TemplateService, 
    private deliverableService: DeliverableService, private sharedService: ShareDetailService,
    private stackService : StackService, private toastr: ToastrService) {
    this.editBlockAttributeForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockContent: [''],
      BlockDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: ['', Validators.required],
      TemplatesUtilized: ['', Validators.required],
      ProjectYear: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      BlockState: [''],
      TransactionType: {},
      BlockOrigin: [''],
      StackLevel:['']
    });
  }

  get form() { return this.editBlockAttributeForm.controls; }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.getBlockAttributes();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editorBlockAttributes).subscribe((payload: any) => {
      this.getBlockAttributes();
    }));
    //To restrict edit attribute for Global/Country/Organization library in full document view
    if (this.designerService.isLibrarySection && (this.designerService.libraryDetails.name != EventConstants.User || this.designerService.libraryDetails.name != EventConstants.BlockCollection)
      && this.designerService.libraryDetails.isActive) {
      this.toolbarIcons.enableEditAttribute = false;
    }
    else {
      this.toolbarIcons.enableEditAttribute = this.projectDetails.ProjectAccessRight.isCentralUser ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditAttribute);
    }
  }



  getBlockAttributes() {
    this.editBlockAttributeForm.markAsPristine();
    var selectedBlockId: any;
    if (this.designerService.blockDetails == null && this.designerService.blockList.length > 0) {
      var selectedBlocks = this.designerService.blockList.length;
      let lastSelectedBlock = this.designerService.blockList[selectedBlocks - 1];
      selectedBlockId = lastSelectedBlock.blockId;
      this.isStack = lastSelectedBlock.isStack;
    }
    else if (this.designerService.blockDetails) {
      selectedBlockId = this.designerService.blockDetails.blockId;
      this.isStack = this.designerService.blockDetails.isStack;
    }
    if (selectedBlockId) {
      this.service.getBlockDetail(selectedBlockId)
        .subscribe((data: BlockAttributeDetail) => {
          this.isLoaded = true;
          this.designerService.blockAttributeDetail = data;
          this.stackService.getstackattributedetail().subscribe((data:any)=>{
              this.stackLevel=data.stackLevel;
          });
          this.service.getBlockMasterdata().subscribe((data: BlockAttribute) => {
            this.blockTypes = data.blockType;
            this.blockStatus = data.blockStatus;
            this.service.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
              this.transactionList = transTypes;
              this.setBlockAttributes();
            });
            if (this.designerService.blockAttributeDetail != null)
              this.getIndustries(this.designerService.blockAttributeDetail.industry, data.industry);
          });
        });
    }
  }
setBlockAttributes() {
  this.editBlockAttributeForm.controls["BlockTitle"].setValue(this.designerService.blockAttributeDetail.title);
        if (this.designerService.blockAttributeDetail.blockType != null)
          this.editBlockAttributeForm.controls["BlockType"].setValue(this.designerService.blockAttributeDetail.blockType.blockTypeId);

        if (this.designerService.blockAttributeDetail.stackLevel != null)
          this.editBlockAttributeForm.controls["StackLevel"].setValue(this.designerService.blockAttributeDetail.stackLevel.id);

        if (this.designerService.blockAttributeDetail.blockStatus != null)
          this.editBlockAttributeForm.controls["BlockStatus"].setValue(this.designerService.blockAttributeDetail.blockStatus.blockStatusId);
        this.editBlockAttributeForm.controls["BlockDescription"].setValue(this.designerService.blockAttributeDetail.description);
        if (this.designerService.isDeliverableSection)
          this.editBlockAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.deliverabletemplateDetails.templateName);
        else if (this.designerService.templateDetails)
          this.editBlockAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.templateDetails.templateName);
        this.editBlockAttributeForm.controls["ProjectYear"].setValue(this.designerService.blockAttributeDetail.projectYear);
        this.editBlockAttributeForm.controls["BlockContent"].setValue(this.designerService.blockAttributeDetail.content);
        this.editBlockAttributeForm.controls["BlockOrigin"].setValue(this.designerService.blockAttributeDetail.blockOrigin);
        this.editBlockAttributeForm.controls["BlockState"].setValue(this.designerService.blockAttributeDetail.blockState.blockState);

        if (this.designerService.blockAttributeDetail.transactionType && this.designerService.blockAttributeDetail.transactionType.transactionType != "")
          this.editBlockAttributeForm.controls["TransactionType"].setValue(this.designerService.blockAttributeDetail.transactionType.transactionType);
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

  getIndustries(selectedIndustries, data: Industry[]) {
    var _industries = [];
    data.forEach(element => {
      var isIndustrySelected = false;
      var selectedIndustry = selectedIndustries.filter(item => item.id == element.id);
      if (selectedIndustry && selectedIndustry.length > 0)
        isIndustrySelected = true;

      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        var isSubIndustrySelected = false;

        if (isIndustrySelected && selectedIndustry[0].subIndustries.length > 0) {
          var subIndustrySelected = selectedIndustry[0].subIndustries.filter(item => item.id == subelement.id);

          if (subIndustrySelected && subIndustrySelected.length > 0)
            isSubIndustrySelected = true;
        }

        subIndustries.push(new TreeviewItem({ checked: isSubIndustrySelected, text: subelement.subIndustry, value: subelement.id }));

      });

      if (!element.subIndustries || element.subIndustries.length == 0) {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id }));

        if (element && element.industryName.indexOf('Other') > -1 && selectedIndustry.length > 0) {
          if (this.editBlockAttributeForm.controls["BlockIndustryOthers"])
            this.editBlockAttributeForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industry);
        }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    this.blockIndustries = Object.assign([], _industries);
  }

  onIndustrySelected(event) {
    this.editBlockAttributeForm.controls["BlockIndustries"].setValue(event);

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

  }

  onBlockStatusChanged(event) {

  }

  editBlockAttribute() {
    this.submitted = true;
   let validity=this.editBlockAttributeForm.controls;
    //  stop here if form is invalid
   if(this.isStack && (validity.BlockDescription.invalid || validity.BlockType.invalid))
   {
     return;
   }
   else if (validity.BlockType.invalid||validity.BlockDescription.invalid||validity.BlockStatus.invalid||validity.TemplatesUtilized.invalid)
   {
      return;
   }

    this.editBlockAttributeForm.markAsPristine();

    let request = new BlockAttributeRequest();
    let data = this.editBlockAttributeForm.value;

    request.blockId = this.designerService.blockDetails.blockId;
    request.title = data.BlockTitle;
    request.description = data.BlockDescription;
    request.uId = this.designerService.blockDetails.uId;
    //request.content = data.BlockContent;

    if (data.BlockStatus != "") {
      request.blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus)[0];
    }

    if (data.BlockType != "") {
      request.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];
    }

    if (data.TransactionType)
      request.transactionTYpe = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];

    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers)

    if (this.designerService.isTemplateSection) {
      request.colorCode = ColorCode.White;
      request.templateId = this.designerService.templateDetails.templateId;
      request.templateUId = this.designerService.templateDetails.uId;
    }
    else if (this.designerService.isDeliverableSection) {
      request.colorCode = this.designerService.blockDetails.isReference ? ColorCode.White : ColorCode.Teal;
      let deliverable = this.designerService.deliverableDetails;
      request.entityId = deliverable.id ? deliverable.id: deliverable.deliverableId ? deliverable.deliverableId : deliverable.entityId;
      request.entityUId = deliverable.uId;
    }
    else if (this.designerService.isLibrarySection) {
      request.colorCode = ColorCode.Grey
    }
    this.service.updateBlockAttribute(request)
      .subscribe((data: any) => {
        if (data && data.responseType == ResponseType.Mismatch) {
          this.editBlockAttributeForm.markAsDirty();
          this.toastr.warning(data.errorMessages.toString());
        }
        else {
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockUpdated'));
       
        if (this.designerService.isExtendedIconicView) {
          let updateBlockModel = [];
          let editedData:any = {};
          editedData.id = request.blockId;
          editedData.blockId = request.blockId;
          editedData.description = request.description;
          editedData.title = request.title;
          editedData.uId = data.responseData;
          updateBlockModel.push(editedData);
          if (this.designerService.isTemplateSection) {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocks).publish(updateBlockModel);
          }
          else if (this.designerService.isDeliverableSection) {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocks).publish(updateBlockModel);
          }
          this._eventService.getEvent("ExtendedViewContentUpdate").publish(request.blockId);
        }
        else if (this.designerService.isDocFullViewEnabled != null) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
            .publish('toggleblockattributecomponent');
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
        }
      }
    });
  }

  getSelectedIndustries(allindustries, selIndustries, others) {
    var industryList = [];

    if (selIndustries.length > 0) {
      allindustries.forEach(industry => {
        let _industry = new Industry();
        _industry.id = industry.value;
        _industry.industryName = industry.text;
        _industry.subIndustries = [];
        selIndustries.forEach(element => {

          if (industry.internalChildren && industry.internalChildren.filter(id => id.value == element).length > 0) {
            let _subIndustry = new SubIndustry();
            let subIndustryName = industry.internalChildren.find(id => id.value == element);
            _subIndustry.id = element;
            _subIndustry.subIndustry = subIndustryName.text;
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

  closeBlockAttribute() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .publish('toggleblockattributecomponent');
  }

  disableSaveButton()
  {
    if(this.editBlockAttributeForm.pristine)
    {
      return true;
    }
    else if(this.designerService.blockDetails && this.designerService.blockDetails.isLocked)
    {
      return true;
    }
    return false;
  }

  dismiss() {
    this.getBlockAttributes();
  }

  checkIsInRoles(roleToCompare) {
    if (this.designerService.selectedDeliverableDocRights && this.designerService.selectedDeliverableDocRights.length > 0) {
      if (this.designerService.selectedDeliverableDocRights[0].roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
    else {
      if (this.designerService.isTemplateSection && this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.hasProjectTemplateAccess)
        return true;
    }
  }

  toolbar = [
    // { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
    { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
    { name: 'insert', items: ['Image'] },
    { name: 'styles', items: ['Font', 'FontSize'] },
    { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
  ];

  editorconfig = { toolbar: this.toolbar, height: '400', width: '850' };

}