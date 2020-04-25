import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlockRequest, BlockAttribute, BlockType, BlockStatus, Industry, SubIndustry, BlockState, BlockImporter } from '../../../../../../@models/projectDesigner/block';
import { DesignerService as DesignerServiceAdminService } from '../../../../../admin/services/designer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockService } from '../../../../services/block.service';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { TreeviewItem } from 'ngx-treeview';
import { ProjectContext } from '../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, OrganizationViewModel } from '../../../../../../@models/projectDesigner/library';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Themes } from '../../../../../../@models/projectDesigner/theming';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogRef } from '@nebular/theme';
import { Index } from '../../../../../../@models/projectDesigner/infoGathering';
import { ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { DesignerService } from '../../../../services/designer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-block-importer-attributes',
  templateUrl: './block-importer-attributes.component.html',
  styleUrls: ['./block-importer-attributes.component.scss']
})
export class BlockImporterAttributesComponent implements OnInit, OnDestroy {
  blockImporterForm: FormGroup;
  addedCollectionBlocks2: BlockRequest[];
  selectedIndexArray: any = [];
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  transactionList: TransactionTypeDataModel[];
  industryList: Industry[];
  isLoaded: boolean = false;
  blockIndustries = [];
  projectDetails: ProjectContext;
  submitted: boolean = false;
  isLibrary: boolean = false;
  subscriptions: Subscription = new Subscription();
  private dialogTemplate: Dialog;
  themesList = Themes;
  showOtherIndustry = false;
  loaderId = 'BlockImporterLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private designerService: DesignerService, private service: BlockService, private sharedService: ShareDetailService, private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService, private dialog: MatDialog, private dialogService: DialogService, private translate: TranslateService, 
    private designerServiceAdminService: DesignerServiceAdminService) {
    this.blockImporterForm = this.formBuilder.group({
      BlockTypeToClear: [null],
      BlockTitle: [''],
      BlockType: ['', Validators.required],
      BlockContent: [''],
      BlockDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      BlockStatus: [''],
      ProjectYear: [''],
      BlockIndustries: [''],
      BlockIndustryOthers: [''],
      BlockState: [''],
      TransactionType: {}
    });
  }
  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    if (this.designerService.isLibrarySection) {
      this.isLibrary = true;
    }
    else {
      this.isLibrary = false;
    }
    this.getBlockAttributes();


    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.nextStep).subscribe((payload: any) => {
      var emptyIndex = this.designerService.addedCollectionBlocks.findIndex(obj => obj.id == "-1");
      if (emptyIndex != -1)
        this.designerService.addedCollectionBlocks.splice(emptyIndex, 1);
      this.addedCollectionBlocks2 = this.designerService.addedCollectionBlocks;

      this.addedCollectionBlocks2.forEach((item, index) => {
        var titleId1 = document.getElementById("checkbox_" + index);
        if (titleId1 != undefined) {
          if ((<HTMLInputElement>titleId1).checked) {
            (<HTMLInputElement>titleId1).checked = false;
            this.isTitleSelected(false, index);
          }
        }
      });
      this.selectedIndexArray = [];
      this.setFormData();
      this.setDefaultDataForBlocks();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.importBlocks).subscribe((payload: any) => {
      if (this.addedCollectionBlocks2.length == 0) {
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlocksNotAdded'));
        return;
      }
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.service.saveImportedBlocks(this.addedCollectionBlocks2)

        .subscribe((data: any) => {
          // this.dialogTemplate = new Dialog();
          // this.dialogTemplate.Type = DialogTypes.Success;
          // //this.toastr.success(this.translate.instant('screens.home.labels.organizationCreatedSuccesfully'));
          // this.dialogTemplate.Message = this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockImportSuccess');

          // const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          //   data: this.dialogTemplate
          // });

          // dialogRef.afterClosed().subscribe(result => {
          //   var option = this.themesList[0];
          //   option.checked = true;
          //   this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.cancelBlockImporter).publish(undefined);
          // });
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockImportSuccess'));
           var option = this.themesList[0];
           option.checked = true;
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.cancelBlockImporter).publish(undefined); 
        }
        
        );

    }));
  }
  get form() { return this.blockImporterForm.controls; }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
  }

  doCheck(index) {
    var titleId = document.getElementById("checkbox_" + index);
    if ((<HTMLInputElement>titleId).checked) {
      (<HTMLInputElement>titleId).checked = false;
      this.isTitleSelected(false, index);
    }
    else {
      (<HTMLInputElement>titleId).checked = true;
      this.isTitleSelected(true, index);
    }
  }
  getBlockAttributes() {
    this.service.getBlockAttributes()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.transactionList = data.transactionType;
        this.industryList = data.industry;
        if (!this.isLibrary)
          this.getIndustries(this.projectDetails.industry, data.industry);
        this.isLoaded = true;
      });
  }
  setFormData() {
    var blockStatusEle: any;
    blockStatusEle = document.getElementById("biBlockStatus");
    var blockTypeEle: any;
    blockTypeEle = document.getElementById("biBlockType");
    blockStatusEle = blockStatusEle as HTMLSelectElement;
    if (blockTypeEle != undefined) {
      blockTypeEle = blockTypeEle as HTMLSelectElement;
      blockTypeEle.selectedIndex = Index.six.toString();
      this.blockImporterForm.controls["BlockType"].setValue(this.blockTypes[5]);
      // this.blockImporterForm.controls["BlockType"].reset();
    }
    if (blockStatusEle != undefined) {
      blockStatusEle = blockStatusEle as HTMLSelectElement;
      blockStatusEle.selectedIndex = Index.zero.toString();
    }
    this.blockImporterForm.controls["BlockStatus"].setValue(this.blockStatus[0]);
    if (this.isLibrary) {
      this.getIndustriesForAdmin(this.industryList);
      this.blockImporterForm.controls["BlockState"].setValue("Library");
    }
    else {
      this.getIndustries(this.projectDetails.industry, this.industryList);
      this.blockImporterForm.controls["BlockState"].setValue(ActionEnum.created);
      this.blockImporterForm.controls["ProjectYear"].setValue(this.projectDetails.fiscalYear);
    }

  }


  getIndustriesForAdmin(data: Industry[]) {
    var _industries = [];
    data.forEach(element => {
      var isIndustrySelected = true;
      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        var isSubIndustrySelected = true;
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

  onAddAttributes() {
    this.submitted = true;
    if (this.selectedIndexArray.length == 0) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockNotSelected'));
      return;
    }
    if (this.blockImporterForm.invalid) {
      return;
    }
    var data = this.blockImporterForm.value;
    this.selectedIndexArray.forEach(x => {

      if (data.BlockTitle)
        this.addedCollectionBlocks2[x].title = data.BlockTitle;

      if (data.BlockIndustryOthers)
        this.addedCollectionBlocks2[x].otherIndustry = data.BlockIndustryOthers;
      if (data.BlockDescription) {
        this.addedCollectionBlocks2[x].description = data.BlockDescription;
      }
      else {
        this.addedCollectionBlocks2[x].description = this.addedCollectionBlocks2[x].title;
      }
      this.addedCollectionBlocks2[x].blockState = data.BlockState;
      if (data.BlockType)
        this.addedCollectionBlocks2[x].blockType = this.blockTypes.filter(id => id.blockTypeId == data.BlockType.blockTypeId)[0];

      if (data.BlockStatus)
        this.addedCollectionBlocks2[x].blockStatus = this.blockStatus.filter(id => id.blockStatusId == data.BlockStatus.blockStatusId)[0];

      if (data.TransactionType)
        this.addedCollectionBlocks2[x].transactionType = this.transactionList.filter(item => item.transactionType == data.TransactionType)[0];

      this.addedCollectionBlocks2[x].blockOrigin = null; //data.blockOrigin;

      if (data.BlockIndustries == "") {
        var selectedProjectIndustries = [];
        if (this.projectDetails != null && this.projectDetails.industry != undefined) {
          this.projectDetails.industry.forEach(x => {
            x.subIndustries.forEach(y => {
              selectedProjectIndustries.push(y.id);
            })
          })
        }
        this.addedCollectionBlocks2[x].industry = this.getSelectedIndustries(this.blockIndustries, selectedProjectIndustries, data.BlockIndustryOthers);;

      }
      else {
        this.addedCollectionBlocks2[x].industry = this.getSelectedIndustries(this.blockIndustries, data.BlockIndustries, data.BlockIndustryOthers);
      }
      this.addedCollectionBlocks2[x].isStack = false;
      this.addedCollectionBlocks2[x].isCopy = true;
      this.addedCollectionBlocks2[x].previousId = null;
      this.addedCollectionBlocks2[x].parentId = null;
      this.addedCollectionBlocks2[x].libraryReference = new LibraryReferenceViewModel();

      //section to assgin library info if a block has been created from cbc section
      if (this.projectDetails != null && this.isLibrary != true) {
        this.addedCollectionBlocks2[x].libraryReference.project = new ProjectDetailsViewModel();
        this.addedCollectionBlocks2[x].libraryReference.project.projectId = this.projectDetails.projectId;
        this.addedCollectionBlocks2[x].libraryReference.project.projectName = this.projectDetails.projectName;
        this.addedCollectionBlocks2[x].libraryReference.project.projectYear = this.projectDetails.fiscalYear;
      }

      this.addedCollectionBlocks2[x].libraryReference.organization = new OrganizationViewModel();
      if (this.projectDetails != null && this.isLibrary != true) {
        this.addedCollectionBlocks2[x].libraryReference.organization.organizationId = this.projectDetails.organizationId;
      }
      else if (this.isLibrary) {
        const libraryOptions = this.designerServiceAdminService.getCurrentLibraryPayload(this.designerServiceAdminService.SelectedOption);
        this.addedCollectionBlocks2[x].libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
        this.addedCollectionBlocks2[x].libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
        this.addedCollectionBlocks2[x].libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
        this.addedCollectionBlocks2[x].libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
        this.addedCollectionBlocks2[x].libraryReference.organizationId = null;

      }
      let indexVar = this.designerService.savedBlockArray.findIndex((y => y == x))

      if (indexVar == -1) {
        this.designerService.savedBlockArray.push(x);
      }
    })

    this.designerService.addedCollectionBlocks = this.addedCollectionBlocks2;
    this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockUpdated'));
    

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

  onBlockTypeChanged(event) {
    if (event.target.selectedIndex == 0) {
      this.blockImporterForm.controls["BlockType"].setValue('');
    }
    else {
      var selectedBlockType = this.blockTypes.find(s => s.blockType == event.target.value);
      this.blockImporterForm.controls["BlockType"].setValue(selectedBlockType);
    }
  }
  onBlockStatusChanged(event) {

    var selectedBlockStatus = this.blockStatus.find(s => s.blockStatus == event.target.value);
    this.blockImporterForm.controls["BlockStatus"].setValue(selectedBlockStatus);

  }

  cancelBlockImporter() {
    if (!this.isLibrary) {
      this._eventService.getEvent(ActionEnum.loadSelectedTheme).publish(true);
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
    }
  }
  toggleAllTitleSelection(e) {
    this.selectedIndexArray = [];
    this.addedCollectionBlocks2.forEach((block, index) => {
      if (e) {
        this.selectedIndexArray.push(index);
        this.doCheckAll(index, true);
      }
      else {
        this.doCheckAll(index, false);
      }
    });
  }
  doCheckAll(index, check) {
    var titleId = document.getElementById(BlockImporter.CheckBoxId + index);
    (<HTMLInputElement>titleId).checked = check;
    if (index == this.addedCollectionBlocks2.length - 1)
      this.isTitleSelected(check, index);
  }
  isTitleSelected(e, i) {
    this.submitted = false;
    var blockTypeEle: any;
    blockTypeEle = document.getElementById("biBlockType");
    var blockStatusEle: any;
    blockStatusEle = document.getElementById("biBlockStatus");
    var existsIndex = this.selectedIndexArray.findIndex((x => x == i));
    if (e) {
      if (existsIndex == -1)
        this.selectedIndexArray.push(i);
    }
    else {
      if (existsIndex > -1)
        this.selectedIndexArray.splice(existsIndex, 1);
    }
    if (this.selectedIndexArray.length == Index.one && this.designerService.savedBlockArray.length != Index.zero) {
      var formData = this.blockImporterForm.value;
      if (this.addedCollectionBlocks2[this.selectedIndexArray[0]].blockType != undefined) {
        var blockTypeIndex = this.blockTypes.findIndex((y => y.blockTypeId == this.addedCollectionBlocks2[this.selectedIndexArray[0]].blockType.blockTypeId)) + 1;
        if (blockTypeIndex > -1 && blockTypeEle != undefined) {
          blockTypeEle = blockTypeEle as HTMLSelectElement;
          blockTypeEle.selectedIndex = blockTypeIndex.toString();
        }
      }
      if (this.addedCollectionBlocks2[this.selectedIndexArray[0]].blockStatus != undefined) {
        var blockStatusIndex = this.blockStatus.findIndex((y => y.blockStatusId == this.addedCollectionBlocks2[this.selectedIndexArray[0]].blockStatus.blockStatusId));
        if (blockStatusIndex > -1 && blockStatusEle != undefined) {
          blockStatusEle = blockStatusEle as HTMLSelectElement;
          blockStatusEle.selectedIndex = blockStatusIndex.toString();
        }
      }
      this.blockImporterForm.controls["BlockTitle"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].title);
      this.blockImporterForm.controls["BlockDescription"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].description);
      this.blockImporterForm.controls["BlockIndustryOthers"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].otherIndustry);
      if (this.addedCollectionBlocks2[this.selectedIndexArray[0]].transactionType != undefined)
        this.blockImporterForm.controls["TransactionType"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].transactionType.transactionType);
      this.blockImporterForm.controls["BlockIndustries"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].industry)
      this.getIndustries(this.blockImporterForm.controls["BlockIndustries"].value, this.industryList);
    }
    else {
      this.blockImporterForm.reset();
      this.setFormData();
    }
    if (this.selectedIndexArray.length == Index.one) {
      this.blockImporterForm.controls["BlockTitle"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].title);
      if (!this.addedCollectionBlocks2[this.selectedIndexArray[0]].description || this.addedCollectionBlocks2[this.selectedIndexArray[0]].description == '')
        this.blockImporterForm.controls["BlockDescription"].setValue(this.addedCollectionBlocks2[this.selectedIndexArray[0]].title);
    }
  }

  setDefaultDataForBlocks() {
    this.addedCollectionBlocks2.forEach(item => {
      // item.otherIndustry=
      item.description = item.title;
      // this.addedCollecaddedCollectionBlocks2tionBlocks2[x].otherIndustry = data.BlockIndustryOthers;
      item.blockState = new BlockState();
      if (this.isLibrary)
        item.blockState.blockState = "Library";
      else {
        item.blockState.blockState = ActionEnum.created;
        // item.projectYear=this.projectDetails.fiscalYear;
      }
      item.blockType = this.blockTypes[5];
      item.blockStatus = this.blockStatus[0];
      // item.transactionType=this.transactionList
      item.blockOrigin = null; //data.blockOrigin;

      var selectedProjectIndustries = [];
      if (this.projectDetails != null && this.projectDetails.industry != undefined) {
        this.projectDetails.industry.forEach(x => {
          x.subIndustries.forEach(y => {
            selectedProjectIndustries.push(y.id);
          })
        })
      }
      // item.industry = this.getSelectedIndustries(this.blockIndustries, selectedProjectIndustries,this.industryList[] );;


      item.isStack = false;
      item.isCopy = true;
      item.previousId = null;
      item.parentId = null;
      item.libraryReference = new LibraryReferenceViewModel();

      //section to assgin library info if a block has been created from cbc section
      if (this.projectDetails != null && this.isLibrary != true) {
        item.libraryReference.project = new ProjectDetailsViewModel();
        item.libraryReference.project.projectId = this.projectDetails.projectId;
        item.libraryReference.project.projectName = this.projectDetails.projectName;
        item.libraryReference.project.projectYear = this.projectDetails.fiscalYear;
      }

      item.libraryReference.organization = new OrganizationViewModel();
      if (this.projectDetails != null && this.isLibrary != true) {
        item.libraryReference.organization.organizationId = this.projectDetails.organizationId;
      }
      else if (this.isLibrary) {
        const libraryOptions = this.designerServiceAdminService.getCurrentLibraryPayload(this.designerServiceAdminService.SelectedOption);
        item.libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
        item.libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
        item.libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
        item.libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
        item.libraryReference.organizationId = null;
      }
      let indexVar = this.designerService.savedBlockArray.findIndex((y => y == item))

      if (indexVar == -1) {
        this.designerService.savedBlockArray.push(item);
      }
    })

    this.designerService.addedCollectionBlocks = this.addedCollectionBlocks2;

  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
