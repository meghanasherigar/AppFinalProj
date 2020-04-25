import { Component, OnInit, ElementRef, EventEmitter, Output } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { BlockFilterDataModel, BlockFilterRequestDataModel, DeliverableRequestViewModel, ActionOnBlockStack, StackModelFilter } from '../../../../../../@models/projectDesigner/block';
import { Subscription } from 'rxjs';
import { IconViewService } from '../../services/icon-view.service';
import { BlockService } from '../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../@models/projectDesigner/template';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../services/designer.service';

@Component({
  selector: 'ngx-filter-deliverable-popover',
  templateUrl: './filter-deliverable-popover.component.html',
  styleUrls: ['./filter-deliverable-popover.component.scss']
})
export class FilterDeliverablePopoverComponent implements OnInit {
  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();

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

  subscriptions: Subscription = new Subscription();
  blockFilter = new BlockFilterDataModel();
  templateBlockFilter = new DeliverableRequestViewModel();
  constructor(private blockService: BlockService, private service: IconViewService, private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private el: ElementRef,protected ref: NbDialogRef<any>, private designerService: DesignerService) { }
  ngOnInit() {
    // console.log(this.service.templateId);
    this.selectedStackLevel=this.designerService.selectedStackLevelD;
    this.selectedStackType=this.designerService.selectedStackTypeD;
    this.selectedStackTransaction=this.designerService.selectedStackTransactionTypeD;
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearD;
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorD;
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginD;
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryD;
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleD;
    this.selectedBlockState=this.designerService.selectedFilterblockStateD;
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatusD;
    this.selectedBlockType = this.designerService.selectedblockTypeD;
  

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
    if(!this.templateBlockFilter.stackFilter)
    {
      this.templateBlockFilter.stackFilter= new StackModelFilter();
    }
    if(!this.templateBlockFilter.blockFilterData)
    {
      this.templateBlockFilter.blockFilterData= new BlockFilterDataModel();
    }

    this.designerService.selectedStackTypeD=this.templateBlockFilter.stackFilter.stackType=this.selectedStackType;
    this.designerService.selectedStackLevelD=this.templateBlockFilter.stackFilter.level=this.selectedStackLevel;
    this.designerService.selectedStackTransactionTypeD=this.templateBlockFilter.stackFilter.transactionType=this.selectedStackTransaction;
    this.designerService.selectedFilterProjectYearD= this.blockFilter.projectYear= this.selectedBlockProjectYear;
    this.designerService.selectedFilterBlockCreatorD= this.blockFilter.BlockCreator=this.selectedBlockCreator;
    this.designerService.selectedFilterblockOriginD= this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designerService.selectedFilterblockStateD=  this.blockFilter.blockState=this.selectedBlockState;
    this.designerService.selectedFilterblockStatusD=this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designerService.selectedFilterindustryD= this.blockFilter.industry=this.selectedBlockProjectIndustry;
    this.designerService.selectedFiltertitleD=  this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designerService.selectedblockTypeD=this.blockFilter.blockType=this.selectedBlockType;
    this.templateBlockFilter.TemplateId=this.service.deliverableId;
    this.templateBlockFilter.EntityId=this.designerService.entityDetails[0].entityId;
    this.templateBlockFilter.blockFilterData=this.blockFilter;
  }

onSelectAllBlockType(item: any){
  

}
onSelectAllBlockProjectYear(item: any){

}
onSelectAllBlockTitle(item: any){
  
}
onSelectAllBlockIndustry(item: any){

}
onSelectAllBlockStatus(item: any){

}
onSelectAllBlockState(item: any){

}
onSelectAllBlockCreator(item: any){

}
onSelectAllBlockOrigin(item: any) {}
onSelectAllStackLevel(item: any) {}
onSelectAllStackType(item: any) {}
onSelectAllStackTransaction(item: any) {}
  apply() {
  
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconD).publish((true)));
    if( this.designerService.selectedFilterProjectYearD.length==0 &&this.designerService.selectedFilterBlockCreatorD.length==0 && this.designerService.selectedFilterblockOriginD.length==0 && this.designerService.selectedFilterblockStateD.length==0 
      &&  this.designerService.selectedFilterblockStatusD.length==0 && this.designerService.selectedFilterindustryD.length==0 && this.designerService.selectedFiltertitleD.length==0
      &&this.designerService.selectedblockTypeD.length==0){
        
        this.templateBlockFilter.blockFilterData=null;
      }
      if( this.designerService.selectedStackTypeD.length==0 &&  this.designerService.selectedStackLevelD.length==0 &&  this.designerService.selectedStackTransactionTypeD.length==0)
      {
        this.templateBlockFilter.stackFilter=null;
      }
    this.blockService.DeliverableSelectedFilter(this.templateBlockFilter).subscribe((response:any)=>
    {
      var payload = new TemplateAndBlockDetails();
      payload.blocks = response;
      payload.template = this.designerService.templateDetails;
      payload.filterApplied = true;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter).publish((payload)));
    });
    this.ref.close();
  }
  emptyFilter() {
  
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconD).publish((false)));
    let payLoad = ActionOnBlockStack.cancelFilter;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));  
    this.designerService.selectedStackTypeD=this.selectedStackType=[];
    this.designerService.selectedStackLevelD=this.selectedStackLevel=[];
    this.designerService.selectedStackTransactionTypeD=this.selectedStackTransaction=[];
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearD=[];
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorD=[];
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginD=[];
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryD=[];
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleD=[];
    this.selectedBlockState=this.designerService.selectedFilterblockStateD=[];
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatusD=[];
    this.selectedBlockType = this.designerService.selectedblockTypeD=[];
   }
  cancel()
 {
  this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconD).publish((false)));
  let payLoad = ActionOnBlockStack.cancelFilter;
  //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
  this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));
  this.designerService.selectedStackTypeD=this.selectedStackType=[];
  this.designerService.selectedStackLevelD=this.selectedStackLevel=[];
  this.designerService.selectedStackTransactionTypeD=this.selectedStackTransaction=[];
  this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYearD=[];
  this.selectedBlockCreator=this.designerService.selectedFilterBlockCreatorD=[];
  this.selectedBlockOrigin=this.designerService.selectedFilterblockOriginD=[];
  this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustryD=[];
  this.selectedBlockProjectTitle=this.designerService.selectedFiltertitleD=[];
  this.selectedBlockState=this.designerService.selectedFilterblockStateD=[];
  this.selectedBlockStatus=this.designerService.selectedFilterblockStatusD=[];
  this.selectedBlockType = this.designerService.selectedblockTypeD=[];
  this.ref.close();
 }



}



 