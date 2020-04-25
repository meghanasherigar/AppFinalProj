import { Component, OnInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { BlockFilterDataModel, BlockFilterRequestDataModel, DeliverableRequestViewModel, ActionOnBlockStack, BlockDetailsResponseViewModel, StackModelFilter } from '../../../../../../@models/projectDesigner/block';
import { Subscription } from 'rxjs';
import { IconViewService } from '../../services/icon-view.service';
import { BlockService } from '../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../@models/projectDesigner/template';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../services/designer.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, SearchLibraryViewModel, manageLibrary, FilterLibraryModel } from '../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../admin/services/library.service';


@Component({
  selector: 'ngx-filter-library',
  templateUrl: './filter-library.component.html',
  styleUrls: ['./filter-library.component.scss']
})
export class FilterLibraryComponent implements OnInit {

  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  libraryList: any;
  disabledStack:boolean;
  dropdownStackTypeSettings: {};
  dropdownStackLevelSettings: {};
  dropdownStackTransactionSettings: {};
  dropdownBlockProjectYearSettings: {};
  dropdownBlockTitleSettings: {};
  dropdownBlockIndustrySettings: {};
  dropdownBlockStatusSettings: {};
  dropdownBlockCreatorSettings: {};
  dropdownBlockOriginSettings: {};
  dropdownBlockTypeSettings: {};
  dropdownBlockStateSettings: {};

  ddlistStackLevel: any;
  ddlistStackType: any;
  ddlistStackTransaction: any;
  ddlistBlockType: any;
  ddlistBlockProjectYear: any;
  ddlistBlockTitle: any;
  ddlistBlockIndustry: any;
  ddlistBlockStatus: any;
  ddlistBlockCreator: any;
  ddlistBlockOrigin: any;
  ddlistBlockState: any;
  selectedStackLevel = [];
  selectedStackType = [];
  selectedStackTransaction = [];
  selectedBlockType = [];
  selectedBlockProjectYear = [];
  selectedBlockProjectTitle = [];
  selectedBlockProjectIndustry = [];
  selectedBlockStatus = [];
  selectedBlockCreator = [];
  selectedBlockOrigin = [];
  selectedBlockState = [];
  ddlistBlockStatusSettings: {};
  selectedTemplate: TemplateViewModel;
  blockFilter = new BlockFilterDataModel();

  selectedLibrary: LibraryDropdownViewModel;
  blockExpandData: any;
  blockCollection: any = [];
  libraryBlockDetails = new LibraryBlockDetails();
  requestModel = new SearchLibraryViewModel();
  libraryBlockFilter = new FilterLibraryModel();
  constructor(private blockService: BlockService, private service: IconViewService, private libraryService: LibraryService, private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private el: ElementRef,protected ref: NbDialogRef<any>, private designerService: DesignerService) { }
  ngOnInit() {
    
    this.dropdownStackTypeSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackLevelSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'stackLevel',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStateSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTypeSettings = {
      singleSelection: false,
      idField: 'blockTypeId',
      textField: 'blockType',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownStackTransactionSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockProjectYearSettings = {
      singleSelection: false,
      idField: 'projectYear',
      textField: 'projectYear',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockTitleSettings = {
      singleSelection: false,
      idField: 'titleId',
      textField: 'titleValue',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockIndustrySettings = {
      singleSelection: false,
      idField: 'Id',
      textField: 'IndustryName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockStatusSettings = {
      singleSelection: false,
      idField: 'blockStatusId',
      textField: 'blockStatus',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockCreatorSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockOriginSettings = {
      singleSelection: false,
      idField: 'blockOrigin',
      textField: 'blockOrigin',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };


    

    if (this.designerService.libraryDetails && this.designerService.libraryDetails.name == EventConstants.BlockCollection)
        this.disabledStack=true;
    else
        this.disabledStack=false;
    // console.log(this.service.templateId);
    this.selectedStackLevel=this.designerService.selectedStackLevelL;
    this.selectedStackType=this.designerService.selectedStackTypeL;
    this.selectedStackTransaction=this.designerService.selectedStackTransactionTypeL;
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearL;
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorL;
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginL;
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryL;
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleL;
    this.selectedBlockState=this.designerService.selectedFilterblockStateL;
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatusL;
    this.selectedBlockType = this.designerService.selectedblockTypeL;
    this.blockService.getBlockFilterDropdownData().subscribe((response: BlockFilterDataModel) => {

      //TODO: Bind the response with the data model
      // console.log(response);
      if (response) {

        this.ddlistStackLevel= response.stackLevel != undefined ? response.stackLevel.map(x => x.stackLevel) : null;
        this.ddlistStackTransaction= response.transactionType != undefined ? response.transactionType.map(x => x.transactionType) : null;
        this.ddlistStackType=response.blockType != undefined ? response.blockType.map(x => x.blockType): null;
        this.ddlistBlockType= response.blockType != undefined ? response.blockType.map(x => x.blockType): null;
        
       this.ddlistBlockProjectYear=response.projectYear.map(String);
       this.ddlistBlockTitle=response.title.map(String);
       this.ddlistBlockIndustry=response.industry != undefined ? response.industry.map(x => x.industryName): null;
        this.ddlistBlockStatus=response.blockStatus;
        this.ddlistBlockState=response.blockState != undefined ? response.blockState.map(x => x.blockState): null;
        this.ddlistBlockOrigin=response.blockOrigin;
        this.ddlistBlockCreator=response.BlockCreator;
      }
    });
  

  }

  // private GetTitleObjectList(titleArray:Array<any>)
  // {
  //   let objectList:Array<object> = [];
  //   if(titleArray)
  //   {
  //     titleArray.forEach(x=>{
  //       objectList.push({"titleId": x, "titleValue": x});
  //     });
  //   }
  //   return objectList;
  // }

  onItemSelect(item: any) {
    this.libraryBlockFilter.isCountry=this.designerService.filterLibraryModel.isCountry;
    this.libraryBlockFilter.organizationId=this.designerService.filterLibraryModel.organizationId;
    this.libraryBlockFilter.isGlobal=this.designerService.filterLibraryModel.isGlobal;
    this.libraryBlockFilter.isOrganization=this.designerService.filterLibraryModel.isOrganization;
    this.libraryBlockFilter.isPersonal=this.designerService.filterLibraryModel.isPersonal;

    if(!this.libraryBlockFilter.stackFilter)
    {
      this.libraryBlockFilter.stackFilter= new StackModelFilter();
    }
    if(!this.libraryBlockFilter.blockFilterRequestModel)
    {
      this.libraryBlockFilter.blockFilterRequestModel= new BlockFilterDataModel();
    }
      this.designerService.selectedStackTypeL=this.libraryBlockFilter.stackFilter.stackType=this.selectedStackType;
      this.designerService.selectedStackLevelL=this.libraryBlockFilter.stackFilter.level=this.selectedStackLevel;
      this.designerService.selectedStackTransactionTypeL=this.libraryBlockFilter.stackFilter.transactionType=this.selectedStackTransaction;
   
    this.designerService.selectedFilterProjectYearL= this.blockFilter.projectYear= this.selectedBlockProjectYear;
    this.designerService.selectedFilterBlockCreatorL= this.blockFilter.BlockCreator=this.selectedBlockCreator;
    this.designerService.selectedFilterblockOriginL= this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designerService.selectedFilterblockStateL=  this.blockFilter.blockState=this.selectedBlockState;
    this.designerService.selectedFilterblockStatusL=this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designerService.selectedFilterindustryL= this.blockFilter.industry=this.selectedBlockProjectIndustry;
    this.designerService.selectedFiltertitleL=  this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designerService.selectedblockTypeL=this.blockFilter.blockType=this.selectedBlockType;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;

    
   }
   onSelectAllBlockType(item: any){
  
 this.designerService.selectedblockTypeL= this.blockFilter.blockType=item;
 this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  onSelectAllStackLevel(item: any) {}
  onSelectAllStackTransaction(item: any) {}
  onSelectAllStackType(item: any) {}

  onSelectAllBlockProjectYear(item: any){
    this.designerService.selectedFilterProjectYearL = this.blockFilter.projectYear=item;
    this.libraryBlockFilter.blockFilterRequestModel = this.blockFilter;
  }
  onSelectAllBlockTitle(item: any){
    this.designerService.selectedFiltertitleL= this.blockFilter.title=item;
 this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
    
  }
  onSelectAllBlockIndustry(item: any){
    this.designerService.selectedFilterindustryL= this.blockFilter.industry=item;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  onSelectAllBlockStatus(item: any){
    this.designerService.selectedFilterblockStatusL= this.blockFilter.blockStatus=item;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  onSelectAllBlockState(item: any){
    this.designerService.selectedFilterblockStateL= this.blockFilter.blockStatus=item;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  onSelectAllBlockCreator(item: any){
    this.designerService.selectedFilterBlockCreatorL= this.blockFilter.BlockCreator=item;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  onSelectAllBlockOrigin(item: any){
    this.designerService.selectedFilterblockOriginL= this.blockFilter.blockOrigin=item;
    this.libraryBlockFilter.blockFilterRequestModel=this.blockFilter;
  }
  apply() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((true)));
 
   if( this.designerService.selectedFilterProjectYearL.length==0 &&this.designerService.selectedFilterBlockCreatorL.length==0 && this.designerService.selectedFilterblockOriginL.length==0 && this.designerService.selectedFilterblockStateL.length==0 
    &&  this.designerService.selectedFilterblockStatusL.length==0 && this.designerService.selectedFilterindustryL.length==0 && this.designerService.selectedFiltertitleL.length==0
    &&this.designerService.selectedblockTypeL.length==0){
    
      this.libraryBlockFilter.blockFilterRequestModel=null;
    }
    if( this.designerService.selectedStackTypeL.length==0 &&  this.designerService.selectedStackLevelL.length==0 &&  this.designerService.selectedStackTransactionTypeL.length==0)
    {

      this.libraryBlockFilter.stackFilter=null;
    }
    
    this.blockService.LibrarySelectedFilter(this.libraryBlockFilter).subscribe((response:any)=>
    {
      
      var payload = new TemplateAndBlockDetails();
      payload.blocks = response;
      payload.template = this.designerService.templateDetails;
      payload.filterApplied = true;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish((payload)));
    });
    this.ref.close();
  }
  emptyFilter() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((false)));
    this.designerService.selectedStackTypeL=this.selectedStackType=[];
    this.designerService.selectedStackLevelL=this.selectedStackLevel=[];
    this.designerService.selectedStackTransactionTypeL=this.selectedStackTransaction=[];
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearL=[];
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorL=[];
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginL=[];
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryL=[];
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleL=[];
    this.selectedBlockState=this.designerService.selectedFilterblockStateL=[];
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatusL=[];
    this.selectedBlockType = this.designerService.selectedblockTypeL=[];
    let payLoad = ActionOnBlockStack.cancelFilter;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad));
   }
  cancel()
 {
   
  this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconL).publish((false)));
  this.designerService.selectedStackTypeL=this.selectedStackType=[];
  this.designerService.selectedStackLevelL=this.selectedStackLevel=[];
  this.designerService.selectedStackTransactionTypeL=this.selectedStackTransaction=[];
  this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearL=[];
  this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorL=[];
  this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginL=[];
  this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryL=[];
  this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleL=[];
  this.selectedBlockState=this.designerService.selectedFilterblockStateL=[];
  this.selectedBlockStatus=this.designerService.selectedFilterblockStatusL=[];
  this.selectedBlockType = this.designerService.selectedblockTypeL=[];
  // this.libraryService.getlibrarytypes().subscribe((data: LibraryDropdownViewModel[]) => {
  //   this.libraryList = data;
  //   let blockList = { 'id': 4, name: "Blocks", isActive: true };
  //   this.blockCollection.push(blockList);
  //   let globalLib = this.libraryList.find(x => x.name == EventConstants.Global);
  //   this.selectedLibrary = globalLib;
  //   this.designerService.libraryDetails = this.selectedLibrary;
  //   this.libraryBlockDetails.library = globalLib;
  //   this.requestModel.isGlobal = true;
  //   this.requestModel.PageIndex = 1;
  //   this.requestModel.PageSize = 50;
  //   this.libraryService.getGlobalTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
  //     this.libraryBlockDetails.blocks = data;
  //     this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
  //   });
  // });
  let payLoad = ActionOnBlockStack.cancelFilter;
  //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
  this.subscriptions.add(this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad));
  this.ref.close();

}
}