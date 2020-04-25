import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BlockRequest, BlockType, BlockStatus, BlockAttribute, Industry, SubIndustry } from '../../../../../../@models/projectDesigner/block';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeviewItem, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { ProjectContext } from '../../../../../../@models/organization';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { BlockService } from '../../../../../admin/services/block.service';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { eventConstantsEnum, IconViewSection } from '../../../../../../@models/common/eventConstants';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { BlocksTagsRequestModel } from '../../../../../../@models/projectDesigner/template';


@Component({
  selector: 'ngx-library-suggested-blocks-extended',
  templateUrl: './library-suggested-blocks-extended.component.html',
  styleUrls: ['./library-suggested-blocks-extended.component.scss'],
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
export class LibrarySuggestedBlocksExtendedComponent implements OnInit {
  block: any;
  blockImporterForm: FormGroup;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  transactionList: TransactionTypeDataModel[];
  blockIndustries = [];
  submitted: boolean = false;
  showOtherIndustry = false;
  isLoaded: boolean = false;
  isAddFlow: boolean = false;
  projectDetails: ProjectContext;
  industryList: Industry[];
  isPrevButtonDisabled: boolean = false;
  isNextButtonDisabled: boolean = false;
  blockList: any = [];
  selectedBlock: any = {};
  @ViewChild('blockContent') blockContent: ElementRef;
  loaderId = 'AddBlockSuggestionLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06'
  blockTag: BlocksTagsRequestModel;

  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>, private designerService: DesignerService, private service: BlockService, private _eventService: EventAggregatorService,
    private ngxLoader: NgxUiLoaderService, private sharedService: ShareDetailService) {
    this.blockImporterForm = this.formBuilder.group({
      BlockTitle: [''],
      BlockType: [''],
      BlockContent: [''],
      BlockDescription: [''],
      BlockStatus: [''],
      ProjectYear: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      BlockState: [''],
      TransactionType: {}
    });
  }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.projectDetails = this.sharedService.getORganizationDetail();
    this.block = this.blockList.filter(id => id.id == this.selectedBlock.id)[0];
    this.isAddOrRemove(this.selectedBlock.id);
    this.getBlockAttributes();

    var index = this.blockList.findIndex(id => id.id == this.block.id);

    if (index == 0)
      this.isPrevButtonDisabled = true;
    if (index == this.blockList.length - 1)
      this.isNextButtonDisabled = true;

    this.blockContent.nativeElement.innerHTML = this.block.content;
  }

  isAddOrRemove(blockId) {
    var selSection = this.designerService.biSelectedBlocks.filter(id => id.id == blockId);

    if (selSection && selSection.length > 0)
      this.isAddFlow = false;
    else
      this.isAddFlow = true;
  }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
  }

  getBlockAttributes() {
    this.service.getBlockAttributes()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.transactionList = data.transactionType;
        this.industryList = data.industry;
        this.getIndustries(this.projectDetails.industry, data.industry);
        this.setFormData();
        this.isLoaded = true;
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  get form() { return this.blockImporterForm.controls; }

  setFormData() {
    this.blockImporterForm.controls["BlockContent"].setValue(this.block.content);
    this.blockImporterForm.controls["BlockTitle"].setValue(this.block.title);
    this.blockImporterForm.controls["BlockState"].setValue(this.block.blockState.blockState);
    this.blockImporterForm.controls["BlockDescription"].setValue(this.block.description);
    this.blockImporterForm.controls["BlockType"].setValue(this.blockTypes.filter(id => id.blockTypeId == this.block.blockTypeId)[0]["blockTypeId"]);
    this.blockImporterForm.controls["BlockStatus"].setValue(this.blockStatus.filter(id => id.blockStatusId == this.block.blockStatusList.blockStatusId)[0]["blockStatusId"]);
    this.blockImporterForm.controls["TransactionType"].setValue(this.transactionList[0].transactionType);

    if (this.block.industry.length > 0)
      this.getIndustries(this.block.industry, this.industryList);
    else
      this.getIndustries(this.projectDetails.industry, this.industryList);
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
          if (this.blockImporterForm.controls["BlockIndustryOthers"])
            this.blockImporterForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industryName);
        }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    this.blockIndustries = Object.assign([], _industries);
  }

  onIndustrySelected(event) {
    this.blockImporterForm.controls["BlockIndustries"].setValue(event);

    this.showOtherIndustry = false;
    event.forEach(element => {
      this.blockIndustries.forEach(industry => {
        if (element == industry.value && industry.text == "Other") {
          this.showOtherIndustry = true;
        }
      });
    });
  }

  dismiss() {
    this.ref.close();
  }

  onPrevClick() {
    this.isNextButtonDisabled = false;

    var prevIndex = this.blockList.findIndex(id => id.index == this.block.index) - 1;
    var prevBlockId = prevIndex != -1 ? this.blockList[prevIndex].index : 0;

    if (prevIndex != -1)
      this.block = this.blockList.filter(id => id.index == prevBlockId.toString())[0];
    if (prevIndex == 0)
      this.isPrevButtonDisabled = true;
    this.setFormData();
    this.blockContent.nativeElement.innerHTML = this.block.content;
  }

  onNextClick(_blockId) {
    var nextIndex: any;
    this.isPrevButtonDisabled = false;

    if (!_blockId && _blockId != 0) {
      nextIndex = this.blockList.findIndex(id => id.index == this.block.index) + 1;

      if (nextIndex == 0) {
        this.ref.close();
        return;
      }
    }
    else {
      nextIndex = this.blockList.findIndex(id => id.index == _blockId);
    }

    var nextBlockId = nextIndex != -1 ? this.blockList[nextIndex].index : this.blockList.length - 1;
    if (nextIndex != this.blockList.length)
      this.block = this.blockList.filter(id => id.index == nextBlockId.toString())[0];;
    if (nextIndex == this.blockList.length - 1)
      this.isNextButtonDisabled = true;
    if (nextIndex == 0)
      this.isPrevButtonDisabled = true;

    this.setFormData();
    this.blockContent.nativeElement.innerHTML = this.block.content;
  }

  onAddRemoveBlock() {
    var blockTag = new BlocksTagsRequestModel();
    blockTag.projectId="";
    blockTag.blockIds.push("");
    
    this.submitted = true;
    var nextIndex = this.blockList.findIndex(id => id.index == this.block.index) + 1;
    if (nextIndex == this.blockList.length) nextIndex = 0;
    var nextBlockId = this.blockList[nextIndex].index;

    var selectedBlock = this.blockList.filter(id => id.index == this.block.index)[0];

    var data = this.blockImporterForm.value;
    //stop here if form is invalid
    if (this.blockImporterForm.invalid) {
      return;
    }

    var data = this.blockImporterForm.value;

    selectedBlock.title = data.BlockTitle;
    selectedBlock.description = data.BlockDescription;
    selectedBlock.blockContent = this.block.content;

    if (data.BlockType)
      selectedBlock.blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType)[0];

    if (data.BlockStatus)
      selectedBlock.blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus)[0];

    if (data.TransactionType && this.transactionList)
      selectedBlock.transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];

    selectedBlock.blockOrigin = null; //data.blockOrigin;
    selectedBlock.industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers);

    var payload: any = {};
    payload.flow = this.isAddFlow ? IconViewSection.Add : IconViewSection.Remove;
    payload.block = this.block;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.addBlock).publish(payload);

    this.blockList = this.blockList.filter(id=>id.index != this.block.index);
    if (nextIndex != 0)
      this.onNextClick(nextBlockId);
    else
      this.ref.close();
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
