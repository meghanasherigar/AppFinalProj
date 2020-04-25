import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { BlockService } from '../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, SubIndustry, BlockAttributeRequest } from '../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, ColorCode } from '../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../services/designer.service';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { ResponseType } from '../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-edit-block-attributes',
  templateUrl: './edit-block-attributes.component.html',
  styleUrls: ['./edit-block-attributes.component.scss'],
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
export class EditBlockAttributesComponent implements OnInit {
  submitted: boolean = false;
  showOtherIndustry = false;
  editAttributeForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  attribute: BlockAttribute;
  transactionList: TransactionTypeDataModel[];
  hideTemplate : boolean = false;
  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>, protected service: BlockService
    , private readonly _eventService: EventAggregatorService, private designerService: DesignerService,
    private hostElement: ElementRef, private toastr: ToastrService) {
    this.editAttributeForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: ['', Validators.required],
      TemplatesUtilized: ['', Validators.required],
      ProjectYear: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      TransactionType: {},
      BlockOrigin: [''],
      BlockState: ['']
    });
  }

  get form() { return this.editAttributeForm.controls; }

  ngOnInit() {
    this.hostElement.nativeElement.click();

    this.getBlockAttributes();
    }

  getBlockAttributes() {
    this.service.getBlockMasterdata()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.service.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          this.transactionList = transTypes;
          this.setAttributes();
        });
        this.getIndustries(this.designerService.blockAttributeDetail.industry, data.industry);
      });
  }
setAttributes() {
  this.editAttributeForm.controls["BlockTitle"].setValue(this.designerService.blockAttributeDetail.title);
    this.editAttributeForm.controls["BlockType"].setValue(this.designerService.blockAttributeDetail.blockType.blockTypeId);
    this.editAttributeForm.controls["BlockStatus"].setValue(this.designerService.blockAttributeDetail.blockStatus.blockStatusId);
    this.editAttributeForm.controls["BlockDescription"].setValue(this.designerService.blockAttributeDetail.description);
    this.editAttributeForm.controls["ProjectYear"].setValue(this.designerService.blockAttributeDetail.projectYear);
    this.editAttributeForm.controls["BlockOrigin"].setValue(this.designerService.blockAttributeDetail.blockOrigin);
    this.editAttributeForm.controls["BlockState"].setValue(this.designerService.blockAttributeDetail.blockState.blockState);
    this.hideTemplate = false;

    if (this.designerService.isTemplateSection)
      this.editAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.templateDetails.templateName);
    else if (this.designerService.isDeliverableSection)
      this.editAttributeForm.controls["TemplatesUtilized"].setValue(this.designerService.deliverabletemplateDetails.templateName);
    else{
      this.editAttributeForm.controls["TemplatesUtilized"].setValue(" ");
      this.hideTemplate = true;
    }

    if (this.designerService.blockAttributeDetail.transactionType != null && this.designerService.blockAttributeDetail.transactionType.transactionType != "")
      this.editAttributeForm.controls["TransactionType"].setValue(this.designerService.blockAttributeDetail.transactionType.transactionType);
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
          if (this.editAttributeForm.controls["BlockIndustryOthers"])
            this.editAttributeForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industryName);
        }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    this.blockIndustries = Object.assign([], _industries);
  }

  onIndustrySelected(event) {
    this.editAttributeForm.controls["BlockIndustries"].setValue(event);

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

  dismiss() {
    this.ref.close();
  }

  editBlock() {
    this.submitted = true;

    //  stop here if form is invalid
    if (this.editAttributeForm.invalid) {
      return;
    }

    let request = new BlockAttributeRequest();
    let data = this.editAttributeForm.value;

    request.blockId = this.designerService.blockDetails.blockId;
    request.title = data.BlockTitle;
    request.description = data.BlockDescription;
    //Added for concurrency
    request.uId = this.designerService.blockDetails.uId;


    if (data.BlockStatus !== '') {
      request.blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus)[0];
    }
    if (data.BlockType !== '') {
      request.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];
    }
    if (data.TransactionType) {
      request.transactionTYpe = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];
    }

    if(this.designerService.isTemplateSection){
      request.colorCode = ColorCode.White;
      request.templateId = this.designerService.templateDetails.templateId;
      request.templateUId = this.designerService.templateDetails.uId;
    }
    else  if(this.designerService.isDeliverableSection){
      request.colorCode = this.designerService.blockDetails.isReference ? ColorCode.White : ColorCode.Teal;
      let deliverable = this.designerService.deliverableDetails;
      request.entityId = deliverable.id ? deliverable.id: deliverable.deliverableId ? deliverable.deliverableId : deliverable.entityId;
      request.entityUId = deliverable.uId;
    }
    else  if(this.designerService.isLibrarySection){
      request.colorCode = ColorCode.Grey
    }
    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers)

    this.service.updateBlockAttribute(request)
      .subscribe((data: any) => {
        if (data && data.responseType == ResponseType.Mismatch) {
          this.toastr.warning(data.errorMessages.toString());
        }
        else {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
          if(this.designerService.isTemplateSection){
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
          }
          else if(this.designerService.isDeliverableSection){
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(this.designerService.attributeDeliverable);
          }
          else if(this.designerService.isLibrarySection){
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewLibrarySection.loadLibrary).publish(true);
          }
        this.ref.close();
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
}