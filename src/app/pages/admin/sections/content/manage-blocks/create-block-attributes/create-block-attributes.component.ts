import { Component, OnInit, Input } from '@angular/core';
import { BlockService } from '../../../../services/block.service'
import { BlockAttribute, BlockType, BlockStatus, Industry, BlockRequest, SubIndustry, blockSelectedModel, LibraryOptions, BlockAttributeDetail } from '../../../../../../@models/projectDesigner/block'
import { TreeviewItem, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryReferenceViewModel } from '../../../../../../@models/projectDesigner/library';
import { NbDialogRef } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { GenericResponseModel } from '../../../../../../@models/projectDesigner/common';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { CountryService } from '../../../../../../shared/services/country.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'ngx-create-block-admin-attributes',
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
  projectDetails: ProjectDetails;
  showOtherIndustry = false;
  createAttributeForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  attribute: BlockAttribute;
  transactionList: TransactionTypeDataModel[];
  selectDisable: boolean = false;
  context: any;
  formSubmitted: boolean = false;
  @Input() submitted: boolean;
 

  constructor(private formBuilder: FormBuilder, private translate: TranslateService,
    protected ref: NbDialogRef<any>, protected service: BlockService, private dialogService: DialogService,private toastr: ToastrService,
    protected designerService: DesignerService, protected storageService: StorageService, private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService,
    private countryService:CountryService) {
    this.createAttributeForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockDescription: ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: [''],
      TemplatesUtilized: [''],
      BlockState: [''],
      BlockIndustries: ['', Validators.required],
      BlockIndustryOthers: [''],
      TransactionType: [null, Validators.required]
    });
  }

  get form() { return this.createAttributeForm.controls; }

  loaderId = 'CreateBlockManageLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';


  ngOnInit() {
    this.createAttributeForm.controls["BlockState"].setValue('library');
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
    if (this.designerService.blockDetails) {
      this.service.getBlockDetail(this.designerService.blockDetails.blockId).subscribe((data: BlockAttributeDetail) => {
        this.designerService.blockAttributeDetail = data;
        this.createAttributeForm.controls["BlockType"].setValue(this.designerService.blockAttributeDetail.blockType.blockTypeId);
        this.selectDisable = (this.createAttributeForm.controls["BlockType"].value) ? true : false;
      });
    }
    this.service.getBlockAttributes().subscribe((data: BlockAttribute) => {
      this.blockTypes = data.blockType;
      this.blockStatus = data.blockStatus;
      let defaultBlockStatus= this.blockStatus.find(s => s.blockStatus === "Draft");
      this.createAttributeForm.controls["BlockStatus"].setValue(defaultBlockStatus);

        this.countryService.getalltransactiontypes().subscribe(masterTransactionTypes=>
        {
          this.transactionList = masterTransactionTypes;
        });

      this.getIndustries(undefined, data.industry);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }


  getIndustries(selectedIndustries, data: Industry[]) {
    var _industries = [];
    data.forEach(element => {
      var isIndustrySelected = false;
      var selectedIndustry = selectedIndustries ? selectedIndustries.filter(item => item.id == element.id) : undefined;
      if (selectedIndustry && selectedIndustry.length > 0)
        isIndustrySelected = true;

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
      // this.createAttributeForm.controls["BlockType"].setValue(selectedBlockType);
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
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.submitted = true;
    let prevBlockDetails = this.designerService.blockDetails;
    let data = this.createAttributeForm.value;
    //stop here if form is invalid
    if (this.createAttributeForm.invalid) {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.formSubmitted = false;
      return;
    }

    this.formSubmitted = true;
    let request = new BlockRequest();
    data = this.createAttributeForm.value;
    request.isStack = false;
    request.isCopy = true;
    request.title = data.BlockTitle;
    // let des=data.BlockDescription.trim();
    // if(!(des.length>0)){
    //   return ;
    // }
    request.description = data.BlockDescription;
    request.blockContent = null;
    // request.blockType = data.BlockType;
    request.blockStatus = data.BlockStatus;
    request.blockState = data.BlockState;
    if (prevBlockDetails != null) {
      request.previousId = prevBlockDetails.id;
      request.parentId = prevBlockDetails.parentId;
      request.parentUId = prevBlockDetails.parentUId;
    }

    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];
    request.blockOrigin = null;
    if (data.BlockType != "") {
      request.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];
    }
    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];
    request.blockOrigin = null;
    request.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers);
    request.libraryReference = new LibraryReferenceViewModel();
    const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    request.libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
    request.libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
    request.libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
    request.libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
    request.libraryReference.organizationId = null;
    request.libraryReference.userId = null;
    request.libraryReference.countryId = null;
    this.service.createBlock(request)
      .subscribe((data: any) => {
        this.designerService.blockDetails = null;
        this.designerService.blockList = [];
        let dataPublish = new blockSelectedModel();
        dataPublish.blockSelectCount = 0;
        this.designerService.DisableMenus();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockCreated'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
       
      }),
      (error)=>{
        this.ngxLoader.stopLoaderAll(this.loaderId);
        this.formSubmitted = false;
        console.log(error);
      };
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
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.DisableMenus();
    this.ref.close();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
  }
}
