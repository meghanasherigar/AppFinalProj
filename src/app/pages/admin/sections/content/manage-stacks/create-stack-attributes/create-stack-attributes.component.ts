import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BlockType, BlockAttributeDetail } from '../../../../../../@models/projectDesigner/block'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackRequestViewModel, BlockReferenceViewModel, StackLevelViewModel, StackAttributeViewModel } from '../../../../../../@models/projectDesigner/stack';
import { LibraryReferenceViewModel} from '../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../services/designer.service';
import { StackService } from '../../../../services/stack.service';
import { BlockService } from '../../../../services/block.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { CountryService } from '../../../../../../shared/services/country.service';
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
  context: any;
  isLoaded: boolean = false;
  selectDisable: boolean = false;
  disableCreateButton: boolean = false;
  constructor(protected ref: NbDialogRef<any>, private formBuilder: FormBuilder, private toastr: ToastrService,private ngxLoader: NgxUiLoaderService,private translate: TranslateService, private dialogService: DialogService,
    private designerService: DesignerService, private stackService: StackService, private readonly _eventService: EventAggregatorService, protected blockService: BlockService,
    private countryService:CountryService) {
    this.createStackForm = this.formBuilder.group({
      StackLevel: {},
      StackType: ['', Validators.required],
      StackDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]] ,
      TransactionType: [null, Validators.required]
    });
  }

  loaderId='CreateStackAttributeLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.getStackAttributes();
  }

  get form() { return this.createStackForm.controls; }

  dismiss() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.DisableMenus();
    this.ref.close();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
  }

  getStackAttributes() {
    if (this.designerService.blockDetails) {
      this.blockService.getBlockDetail(this.designerService.blockDetails.blockId).subscribe((data: BlockAttributeDetail) => {
        this.designerService.blockAttributeDetail = data;
        this.createStackForm.controls["StackType"].setValue(this.designerService.blockAttributeDetail.blockType.blockTypeId);
        this.selectDisable = (this.createStackForm.controls["StackType"].value) ? true : false;
      });
    }
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.isLoaded = true;
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.countryService.getalltransactiontypes()
        .subscribe(masterTransactionTypes => {
            this.transactionList = masterTransactionTypes;
          });
    });
  }

  createStack() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.submitted = true;

    //  stop here if form is invalid
    if (this.createStackForm.invalid) {
      this.disableCreateButton=false;
      return;
    }
   this.disableCreateButton=true;
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
    this.designerService.blockList = this.designerService.blockList.sort((a, b) => {
      return <any>(a.nodeIndex) - <any>(b.nodeIndex);
    });

    this.designerService.blockList.forEach(item => {
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
    let prevBlockDetails = this.designerService.blockList[0];

    request.blocks = blocks;
    request.previousId = prevBlockDetails.previousId;
    request.parentId = prevBlockDetails.parentId;
    request.libraryReference = new LibraryReferenceViewModel();

    //section to assgin library info if a block has been created from cbc section
    const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    request.libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
    request.libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
    request.libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
    request.libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
    this.stackService.createStack(request)
      .subscribe((data: any) => {
      
        this.designerService.blockDetails = null;
        this.designerService.DisableMenus();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.StackCreated'));
        this.ref.close();
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });

  }

}
