import { Component, OnInit, Input } from '@angular/core';
import '../../../../../../../../assets/ckeditor.loader';
import 'ckeditor';
import { BlockService } from '../../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, BlockAttributeDetail, SubIndustry, BlockAttributeRequest } from '../../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../../services/designer.service';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { TransactionTypeDataModel } from '../../../../../../../@models/transaction';
import { ResponseType } from '../../../../../../../@models/ResponseStatus';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-edit-block',
  templateUrl: './edit-block.component.html',
  styleUrls: ['./edit-block.component.scss'],
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
export class EditBlockComponent implements OnInit {
  submitted: boolean = false;
  showOtherIndustry = false;
  editBlockForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  transactionList: TransactionTypeDataModel[];
  blockIndustries = [];
  attribute: BlockAttribute;
  isLoaded: boolean = false;
  constructor(private formBuilder: FormBuilder, protected service: BlockService
    ,private translate: TranslateService, private readonly _eventService: EventAggregatorService, private designerService: DesignerService, private dialogService: DialogService, private toastr: ToastrService) {
    this.editBlockForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockContent:[''],
      BlockDescription: ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: ['', Validators.required],
      TemplatesUtilized: ['', Validators.required],
      ProjectYear: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      BlockState: [''],
      TransactionType: {}
    });
  }

  get form() { return this.editBlockForm.controls; }

  ngOnInit() {
    this.getBlockAttributes();

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.iconExtendedView).subscribe((payload: any) => {
      this.getBlockAttributes();
    });
  }

  getBlockAttributes() {    
    this.service.getBlockDetail(this.designerService.blockDetails.blockId)
    .subscribe((data: BlockAttributeDetail) => {
      this.isLoaded = true;
      this.designerService.blockAttributeDetail = data;
      this.editBlockForm.controls["BlockTitle"].setValue(this.designerService.blockAttributeDetail.title);
      this.editBlockForm.controls["BlockType"].setValue(this.designerService.blockAttributeDetail.blockType.blockTypeId);
      this.editBlockForm.controls["BlockStatus"].setValue(this.designerService.blockAttributeDetail.blockStatus.blockStatusId);
      this.editBlockForm.controls["BlockDescription"].setValue(this.designerService.blockAttributeDetail.description);
      this.editBlockForm.controls["TemplatesUtilized"].setValue(this.designerService.templateDetails.templateName);
      this.editBlockForm.controls["ProjectYear"].setValue(this.designerService.blockAttributeDetail.projectYear);
      this.editBlockForm.controls["BlockContent"].setValue(this.designerService.blockAttributeDetail.content);
      if(this.designerService.blockAttributeDetail.transactionType && this.designerService.blockAttributeDetail.transactionType.transactionType != "")
        this.editBlockForm.controls["TransactionType"].setValue(this.designerService.blockAttributeDetail.transactionType.transactionType);
    });
    this.service.getBlockAttributes()
    .subscribe((data: BlockAttribute) => {
      this.blockTypes = data.blockType;
      this.blockStatus = data.blockStatus;
      this.transactionList = data.transactionType;
      this.getIndustries(this.designerService.blockAttributeDetail.industry, data.industry);
    });
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
          if (this.editBlockForm.controls["BlockIndustryOthers"])
            this.editBlockForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industry);
        }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    this.blockIndustries = Object.assign([], _industries);
  }

  onIndustrySelected(event) {
    this.editBlockForm.controls["BlockIndustries"].setValue(event);

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

  editBlock() {
    this.submitted = true;

    //  stop here if form is invalid
    if (this.editBlockForm.invalid) {
      return;
    }

    let request = new BlockAttributeRequest();
    let data = this.editBlockForm.value;

    request.blockId = this.designerService.blockDetails.blockId;
    request.title = data.BlockTitle;
    request.description = data.BlockDescription;
    request.content = data.BlockContent;

    if (data.BlockStatus != "") {
      request.blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus)[0];
    }

    if (data.BlockType != "") {
      request.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];
    }

    if(data.TransactionType)
      request.transactionTYpe = this.transactionList.filter(item=>item.transactionType == data.TransactionType)[0];

    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers)
    request.uId = this.designerService.blockDetails.uId;
    this.service.updateBlock(request)
      .subscribe((data: any) => {
        if(data && data.responseType == ResponseType.Mismatch){
          this.toastr.warning(data.errorMessages.toString());
        }
        else{
          this.toastr.success(this.translate.instant('Block updated successfully'));
         
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
        }
      });
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

  dismiss(){
    window.location.href = "#/pages/project-design/projectdesignMain/iconViewMain/(iconViewRegion//level2Menu:iconViewLevel2Menu)";
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
