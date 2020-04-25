import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { EntitiesService } from '../../../../../project-setup/entity/entity.service';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventConstants, eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { BlockFilterDataModel, BlockFilterRequestDataModel, ActionOnBlockStack, StackModelFilter } from '../../../../../../@models/projectDesigner/block';
import { BlockService } from '../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../@models/projectDesigner/template';
import { IconViewService } from '../../services/icon-view.service';
import { DesignerService } from '../../../../services/designer.service';


@Component({
  selector: 'ngx-filter-block-popover',
  templateUrl: './filter-block-popover.component.html',
  styleUrls: ['./filter-block-popover.component.scss']
})
export class FilterBlockPopoverComponent implements OnInit {
  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();


  dropdownStackTypeSettings:{};
  dropdownStackLevelSettings: {};
dropdownStackTransactionSettings:{};
dropdownBlockProjectYearSettings:{};
dropdownBlockTitleSettings:{};
dropdownBlockIndustrySettings:{};
dropdownBlockStatusSettings:{};
dropdownBlockCreatorSettings:{};
dropdownBlockOriginSettings:{};
dropdownBlockTypeSettings:{};
dropdownBlockStateSettings:{};

ddlistStackLevel:any;
ddlistStackType: any;
ddlistStackTransaction:any;
ddlistBlockType:any;
ddlistBlockProjectYear:any;
ddlistBlockTitle:any;
ddlistBlockIndustry:any;
ddlistBlockStatus:any;
ddlistBlockCreator:any;
ddlistBlockOrigin:any;
ddlistBlockState:any;
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
selectedBlockState=[];
ddlistBlockStatusSettings: {};

selectedTemplate: TemplateViewModel;

subscriptions: Subscription = new Subscription();

templateBlockFilter=new BlockFilterRequestDataModel();
blockFilter= new BlockFilterDataModel();
constructor(private blockService:BlockService, private service: IconViewService ,private designerService: DesignerService,
  private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
  private el: ElementRef, protected ref: NbDialogRef<any> ) { }
  
  ngOnInit() {
   
    this.selectedStackLevel=this.designerService.selectedStackLevel;
    this.selectedStackType=this.designerService.selectedStackType;
    this.selectedStackTransaction=this.designerService.selectedStackTransactionType;
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYear;
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreator;
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOrigin;
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustry;
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitle;
    this.selectedBlockState=this.designerService.selectedFilterblockState;
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatus;
    this.selectedBlockType = this.designerService.selectedblockType;
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
      idField: 'title',
      textField: 'title',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownBlockIndustrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
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

    this.blockService.getBlockFilterDropdownData().subscribe((response:BlockFilterDataModel)=>
      {
        //TODO: Bind the response with the data model
        // console.log(response);
        if(response)
        {
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
  

  onItemSelect(item: any)
  { 
     if(!this.templateBlockFilter.stackFilter)
    {
      this.templateBlockFilter.stackFilter= new StackModelFilter();
    }
    if(!this.templateBlockFilter.blockFilterData)
    {
      this.templateBlockFilter.blockFilterData= new BlockFilterDataModel();
    }
    
    this.templateBlockFilter.TemplateId=this.service.templateId;
    this.designerService.selectedStackType=this.templateBlockFilter.stackFilter.stackType=this.selectedStackType;
    this.designerService.selectedStackLevel=this.templateBlockFilter.stackFilter.level=this.selectedStackLevel;
    this.designerService.selectedStackTransactionType=this.templateBlockFilter.stackFilter.transactionType=this.selectedStackTransaction;
    this.designerService.selectedFilterProjectYear= this.blockFilter.projectYear= this.selectedBlockProjectYear;
    this.designerService.selectedFilterBlockCreator= this.blockFilter.BlockCreator=this.selectedBlockCreator;
    this.designerService.selectedFilterblockOrigin= this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designerService.selectedFilterblockState=  this.blockFilter.blockState=this.selectedBlockState;
    this.designerService.selectedFilterblockStatus=this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designerService.selectedFilterindustry= this.blockFilter.industry=this.selectedBlockProjectIndustry;
    this.designerService.selectedFiltertitle=  this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designerService.selectedblockType=this.blockFilter.blockType=this.selectedBlockType;
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
  onSelectAllBlockOrigin(item: any){
  
  }
  onSelectAllStackLevel(item: any) {}
  onSelectAllStackType(item: any) {}
  onSelectAllStackTransaction(item: any) {}
  apply()
  { 
    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
 
    if( this.designerService.selectedFilterProjectYear.length==0 &&this.designerService.selectedFilterBlockCreator.length==0 && this.designerService.selectedFilterblockOrigin.length==0 && this.designerService.selectedFilterblockState.length==0 
      &&  this.designerService.selectedFilterblockStatus.length==0 && this.designerService.selectedFilterindustry.length==0 && this.designerService.selectedFiltertitle.length==0
      &&this.designerService.selectedblockType.length==0){
     
        this.templateBlockFilter.blockFilterData=null;
      }
      if( this.designerService.selectedStackType.length==0 &&  this.designerService.selectedStackLevel.length==0 &&  this.designerService.selectedStackTransactionType.length==0)
      {
     
        this.templateBlockFilter.stackFilter=null;
      }
    this.blockService.blockSelectedFilter(this.templateBlockFilter).subscribe((response:any)=>
    {
    
      var payload = new TemplateAndBlockDetails();
      payload.blocks = response;
      payload.template = this.designerService.templateDetails;
      payload.filterApplied = true;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish((payload)));
     
     });
    this.ref.close();
  }

  emptyFilter()
  {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((false)));
    let payLoad = ActionOnBlockStack.cancelFilter;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));  
    this.designerService.selectedStackType=this.selectedStackType=[];
    this.designerService.selectedStackLevel=this.selectedStackLevel=[];
    this.designerService.selectedStackTransactionType=this.selectedStackTransaction=[];
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYear=[];
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreator=[];
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOrigin=[];
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustry=[];
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitle=[];
    this.selectedBlockState=this.designerService.selectedFilterblockState=[];
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatus=[];
    this.selectedBlockType = this.designerService.selectedblockType=[];
  }
  
 
 
 cancel()
 {
  this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((false)));

  let payLoad = ActionOnBlockStack.cancelFilter;

    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
    this.designerService.selectedStackType=this.selectedStackType=[];
    this.designerService.selectedStackLevel=this.selectedStackLevel=[];
    this.designerService.selectedStackTransactionType=this.selectedStackTransaction=[];
    this.selectedBlockProjectYear=this.designerService.selectedFilterProjectYear=[];
    this.selectedBlockCreator=this.designerService.selectedFilterBlockCreator=[];
    this.selectedBlockOrigin=this.designerService.selectedFilterblockOrigin=[];
    this.selectedBlockProjectIndustry=this.designerService.selectedFilterindustry=[];
    this.selectedBlockProjectTitle=this.designerService.selectedFiltertitle=[];
    this.selectedBlockState=this.designerService.selectedFilterblockState=[];
    this.selectedBlockStatus=this.designerService.selectedFilterblockStatus=[];
    this.selectedBlockType = this.designerService.selectedblockType=[];
  this.ref.close();
 }

}
