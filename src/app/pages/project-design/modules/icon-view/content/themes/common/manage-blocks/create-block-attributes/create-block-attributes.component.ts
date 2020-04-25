import { Component, OnInit, Input } from '@angular/core';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { ProjectContext } from '../../../../../../../../../@models/organization';
import { BlockAttribute, BlockType, BlockStatus, Industry, BlockRequest, SubIndustry, blockSelectedModel } from '../../../../../../../../../@models/projectDesigner/block';
import { TransactionTypeDataModel } from '../../../../../../../../../@models/transaction';
import { BlockService } from '../../../../../../../services/block.service';
import { StorageService } from '../../../../../../../../../@core/services/storage/storage.service';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { LibraryReferenceViewModel, ProjectDetailsViewModel } from '../../../../../../../../../@models/projectDesigner/library';
import { eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { DeliverablesInput, DeliverableViewModel } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemeSection, ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { TemplateViewModel } from '../../../../../../../../../@models/projectDesigner/template';
import { GenericResponseModel } from '../../../../../../../../../@models/projectDesigner/common';
import { DialogService } from '../../../../../../../../../shared/services/dialog.service';
import { ResponseType, GenericResponse } from '../../../../../../../../../@models/ResponseStatus';
import { Dialog, DialogTypes } from '../../../../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { DesignerService } from '../../../services/designer.service';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BlockStatusEnum } from '../../../../../../../../../@models/masterData/enums/blockStatusEnum';

@Component({
  selector: 'ngx-create-block-attributes',
  templateUrl: './create-block-attributes.component.html',
  styleUrls: ['./create-block-attributes.component.scss'],
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
export class CreateBlockAttributesComponent implements OnInit {
  projectDetails: ProjectContext;
  showOtherIndustry = false;
  createAttributeForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  attribute: BlockAttribute;
  transactionList: TransactionTypeDataModel[];
  @Input() submitted: boolean;
  subscriptions: Subscription = new Subscription();
  disableCreateButton: boolean = false;
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;
  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>, protected service: BlockService,private translate: TranslateService, protected designerService: DesignerService, protected storageService: StorageService, private readonly _eventService: EventAggregatorService, private sharedService: ShareDetailService, private ngxLoader: NgxUiLoaderService, private toastr: ToastrService) {
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

  loaderId = 'CreateBlockLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    if (this.designer.templateDetails != null) {
      this.createAttributeForm.controls["TemplatesUtilized"].setValue(this.designer.templateDetails.templateName);
    }

    if (this.designer.deliverableDetails != null) {
      this.createAttributeForm.controls["TemplatesUtilized"].setValue(this.designer.deliverableDetails.templateName);
    }

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
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        let defaultBlockStatus= this.blockStatus.find(s => s.blockStatusId === BlockStatusEnum.Draft.Id);
        this.createAttributeForm.controls["BlockStatus"].setValue(defaultBlockStatus);
        this.service.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          this.transactionList = transTypes;
        });
        this.getIndustries(this.projectDetails.industry, data.industry);
      },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
    );
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

  onBlockStatusChanged(event, value) {
    if (event.target.selectedIndex == 0)
      this.createAttributeForm.controls["BlockStatus"].setValue('');
    else {
      var selectedBlockStatus = this.blockStatus.find(s => s.blockStatusId == event.target.value);
      this.createAttributeForm.controls["BlockStatus"].setValue(selectedBlockStatus);
    }
  }

  createBlock() {

    this.submitted = true;
    var prevBlockDetails = this.designer.blockDetails;
    this.disableCreateButton = true;
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

    if (prevBlockDetails != null) {
      request.previousId = prevBlockDetails.id;
      request.parentId = prevBlockDetails.parentId;
      request.parentUId = prevBlockDetails.parentUId;
    }
    request.blockOrigin = null; //data.blockOrigin;
    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers);
    request.libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designer.templateDetails != null) {
      request.libraryReference.template = new TemplateViewModel();
      request.libraryReference.template.isDefault = this.designer.templateDetails.isDefault;
      request.libraryReference.template.templateId = this.designer.templateDetails.templateId;
      request.libraryReference.template.templateName = this.designer.templateDetails.templateName;
      request.libraryReference.template.uId = this.designer.templateDetails.uId;
    }

    // //section to assign deliverable info if a block has been created from deliverable section
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
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    request.libraryReference.organization = this.sharedService.getORganizationDetail();
    this.service.createBlock(request)
      .subscribe((data: GenericResponse) => {
        if(data && data.responseType === ResponseType.Mismatch)
        {
          this.toastr.warning(data.errorMessages.toString());
        }
        else if (this.designer.templateDetails != null) {
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
        }
        else if (this.designer.deliverableDetails != null) {
          var deliverableInput = new DeliverablesInput();
          deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
          deliverableInput.pushBackBlocks = true;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
        }
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockCreated'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
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

  dismiss() {
    this.ref.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
