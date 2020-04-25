import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { BlockService } from '../../../../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, SubIndustry, BlockAttributeRequest } from '../../../../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, ColorCode } from '../../../../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../../../../@models/transaction';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { DeliverablesInput } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { Subscription } from 'rxjs';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { GenericResponse, ResponseType } from '../../../../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
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
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;
  subscriptions: Subscription = new Subscription();
  hideTemplate: boolean = false;

  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>, protected service: BlockService
    , private readonly _eventService: EventAggregatorService, private designerService: DesignerService, private sharedService: ShareDetailService,
    private hostElement: ElementRef, private ngxLoader: NgxUiLoaderService, private toastr : ToastrService, private dialogService:DialogService, private translate: TranslateService
    ) {
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

  loaderId = 'EditBlockLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.hostElement.nativeElement.click();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.getBlockAttributes();
  }

  getBlockAttributes() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.service.getBlockMasterdata()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.service.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          this.transactionList = transTypes;
          this.setAttributes();
        });
        this.getIndustries(this.designer.blockAttributeDetail.industry, data.industry);
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        }
      );
  }
  setAttributes() {
    this.editAttributeForm.controls["BlockTitle"].setValue(this.designer.blockAttributeDetail.title);
    this.editAttributeForm.controls["BlockType"].setValue(this.designer.blockAttributeDetail.blockType.blockTypeId);
    this.editAttributeForm.controls["BlockStatus"].setValue(this.designer.blockAttributeDetail.blockStatus.blockStatusId);
    this.editAttributeForm.controls["BlockDescription"].setValue(this.designer.blockAttributeDetail.description);
    this.editAttributeForm.controls["ProjectYear"].setValue(this.designer.blockAttributeDetail.projectYear);
    this.editAttributeForm.controls["BlockOrigin"].setValue(this.designer.blockAttributeDetail.blockOrigin);
    this.editAttributeForm.controls["BlockState"].setValue(this.designer.blockAttributeDetail.blockState.blockState);
    this.hideTemplate = false;

    if (this.designer.libraryDetails == null) {
      var templateName = this.designer.templateDetails != null ? this.designer.templateDetails.templateName : this.designer.deliverableDetails.templateName;
      this.editAttributeForm.controls["TemplatesUtilized"].setValue(templateName);
    }
    else {
      this.hideTemplate = true;
      this.editAttributeForm.controls["TemplatesUtilized"].setValue(" ");
    }

    if (this.designer.blockAttributeDetail.transactionType != null && this.designer.blockAttributeDetail.transactionType.transactionType != "")
      this.editAttributeForm.controls["TransactionType"].setValue(this.designer.blockAttributeDetail.transactionType.transactionType);

      this.ngxLoader.stopBackgroundLoader(this.loaderId);
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

    request.blockId = this.designer.blockDetails.blockId;
    request.title = data.BlockTitle;
    request.description = data.BlockDescription;

    if (data.BlockStatus != "") {
      request.blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus)[0];
    }

    if (data.BlockType != "") {
      request.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];
    }

    if (data.TransactionType) {
      request.transactionTYpe = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];
    }

    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers)
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if(this.designer.templateDetails != null){
      request.colorCode = ColorCode.White;
      request.templateId = this.designer.templateDetails.templateId;
      request.templateUId = this.designer.templateDetails.uId;
    }
    else if(this.designer.deliverableDetails != null){
      request.colorCode = this.designer.blockDetails.isReference ? ColorCode.White : ColorCode.Teal;
      let deliverable = this.designer.deliverableDetails;
      request.entityId = deliverable.id ? deliverable.id: deliverable.deliverableId ? deliverable.deliverableId : deliverable.entityId;
      request.entityUId = deliverable.uId;
    }
    else if(this.designer.libraryDetails != null){
      request.colorCode = ColorCode.Grey
    }
   
    request.uId = this.designer.blockDetails.uId;
    this.service.updateBlockAttribute(request)
      .subscribe((data: GenericResponse) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if(data && data.responseType == ResponseType.Mismatch){
          this.toastr.warning(data.errorMessages.toString());
        }
        else{
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockUpdated'));
              if (this.designer.templateDetails != null) {
            this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails);
          }
          else if (this.designer.deliverableDetails != null) {
            var deliverableInput = new DeliverablesInput();
            deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
            this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput);
          }
          else if (this.designer.libraryDetails != null) {
            this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.loadLibrary).publish(true);
          }
        }
        this.ref.close();
      },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
    );
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

}
