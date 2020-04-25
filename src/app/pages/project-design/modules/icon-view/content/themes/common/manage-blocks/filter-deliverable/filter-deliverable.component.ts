import { Component, OnInit, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BlockFilterDataModel, DeliverableRequestViewModel, ActionOnBlockStack, StackModelFilter, deliverableFilterRequest } from '../../../../../../../../../@models/projectDesigner/block';
import { Subscription } from 'rxjs';
import { IconViewService } from '../../../../../services/icon-view.service';
import { BlockService } from '../../../../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../../@models/projectDesigner/template';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { DeliverablesInput } from '../../../../../../../../../@models/projectDesigner/deliverable';

@Component({
  selector: 'ngx-filter-deliverable',
  templateUrl: './filter-deliverable.component.html',
  styleUrls: ['./filter-deliverable.component.scss']
})
export class FilterDeliverableComponent implements OnInit, OnDestroy {
  @Output() CancelFilter: EventEmitter<any> = new EventEmitter();

  dropdownStackTypeSettings: {};
  dropdownStackLevelSettings: {};
  dropdownStackTransactionSettings: {};
  dropdownBlockProjectYearSettings: {};
  dropdownBlockTitleSettings: {};
  dropdownBlockDescriptionSettings:{};
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
  ddlistBlockDescription:any;
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
  selectedBlockProjectDescription=[];
  selectedBlockProjectIndustry = [];
  selectedBlockStatus = [];
  selectedBlockCreator = [];
  selectedBlockOrigin = [];
  selectedBlockState = [];
  ddlistBlockStatusSettings: {};
  selectedTemplate: TemplateViewModel;
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;
  subscriptions: Subscription = new Subscription();
  blockFilter = new BlockFilterDataModel();
  templateBlockFilter = new DeliverableRequestViewModel();
  constructor(private blockService: BlockService, private service: IconViewService, private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private el: ElementRef, protected ref: NbDialogRef<any>, private designerService: DesignerService, private sharedService: ShareDetailService) { }
  ngOnInit() {
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.templateBlockFilter.TemplateId = this.designer.deliverableDetails.deliverableId;
    this.templateBlockFilter.EntityId = this.designer.deliverableDetails.entityId;
   
    this.selectedStackLevel = this.designer.selectedStackLevel;
    this.selectedStackType = this.designer.selectedStackType;
    this.selectedStackTransaction = this.designer.selectedStackTransactionType;
    this.selectedBlockProjectYear = this.designer.selectedFilterProjectYear;
    this.selectedBlockCreator = this.designer.selectedFilterBlockCreator;
    this.selectedBlockOrigin = this.designer.selectedFilterblockOrigin;
    this.selectedBlockProjectIndustry = this.designer.selectedFilterindustry;
    this.selectedBlockProjectTitle = this.designer.selectedFiltertitle;
    this.selectedBlockProjectDescription=this.designer.selectedFilterDescription;
    this.selectedBlockState = this.designer.selectedFilterblockState;
    this.selectedBlockStatus = this.designer.selectedFilterblockStatus;
    this.selectedBlockType = this.designer.selectedblockType;

    this.AssignPreviouslySelectedFilter();

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
      textField: 'transactionType',
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
    this.dropdownBlockDescriptionSettings={
      singleSelection: false,
      idField: 'descriptionId',
      textField: 'descriptionValue',
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

    let filterRequest =  new deliverableFilterRequest();
    filterRequest.IsDeliverable = true;
    filterRequest.DeliverableId = this.designer.deliverableDetails.deliverableId;
    filterRequest.EntityId = this.designer.deliverableDetails.entityId;    
    this.blockService.getBlockFilterDropdownMenu(filterRequest).subscribe((response: BlockFilterDataModel) => {

      //TODO: Bind the response with the data model
      // console.log(response);
      if (response) {
        this.ddlistStackLevel = response.stackLevel != undefined ? response.stackLevel.map(x => x.stackLevel) : null;
        this.ddlistStackTransaction = response.transactionType;
        this.ddlistStackType = response.blockType != undefined ? response.blockType.map(x => x.blockType) : null;

        this.ddlistBlockType = response.blockType != undefined ? response.blockType.map(x => x.blockType) : null;

        this.ddlistBlockProjectYear = response.projectYear.map(String);
        this.ddlistBlockTitle = response.title.map(String);
        this.ddlistBlockDescription=response.description.map(String);
        this.ddlistBlockIndustry = response.industry != undefined ? response.industry.map(x => x.industryName) : null;
        this.ddlistBlockStatus = response.blockStatus;
        this.ddlistBlockState = response.blockState != undefined ? response.blockState.map(x => x.blockState) : null;
        this.ddlistBlockOrigin = response.blockOrigin;
        this.ddlistBlockCreator = response.BlockCreator;
      }
    });

  }

   //read from storage for any existing filter
   AssignPreviouslySelectedFilter()
   {
     let currentDesignerService= this.themingContext.themeOptions.find(x => x.name == this.section).designerService;
     if(currentDesignerService && currentDesignerService.deliverableDetails && 
       currentDesignerService.deliverableDetails.deliverableId === this.designer.deliverableDetails.deliverableId)
     {
      this.templateBlockFilter.TemplateId = currentDesignerService.deliverableDetails.deliverableId;
      this.templateBlockFilter.EntityId = currentDesignerService.deliverableDetails.entityId;
     this.selectedStackLevel = currentDesignerService.selectedStackLevel;
     this.selectedStackType = currentDesignerService.selectedStackType;
     this.selectedStackTransaction = currentDesignerService.selectedStackTransactionType;
     this.selectedBlockProjectYear = currentDesignerService.selectedFilterProjectYear;
     this.selectedBlockCreator = currentDesignerService.selectedFilterBlockCreator;
     this.selectedBlockOrigin = currentDesignerService.selectedFilterblockOrigin;
     this.selectedBlockProjectIndustry = currentDesignerService.selectedFilterindustry;
     this.selectedBlockProjectTitle = currentDesignerService.selectedFiltertitle;
     this.selectedBlockProjectDescription=currentDesignerService.selectedFilterDescription;
     this.selectedBlockState = currentDesignerService.selectedFilterblockState;
     this.selectedBlockStatus = currentDesignerService.selectedFilterblockStatus;
     this.selectedBlockType = currentDesignerService.selectedblockType;
 
     let publishValue=(
       currentDesignerService.selectedStackLevel.length>0 ||
       currentDesignerService.selectedStackType.length>0 ||
       currentDesignerService.selectedStackTransactionType.length>0 ||
       currentDesignerService.selectedFilterProjectYear.length>0 ||
       currentDesignerService.selectedFilterBlockCreator.length>0 ||
       currentDesignerService.selectedFilterblockOrigin.length>0 ||
       currentDesignerService.selectedFilterindustry.length>0 ||
       currentDesignerService.selectedFiltertitle.length>0 ||
       currentDesignerService.selectedFilterblockState.length>0 ||
       currentDesignerService.selectedFilterblockStatus.length>0 ||
       currentDesignerService.selectedblockType.length>0
     );
     //TODO check condition before publishing
     this.subscriptions.add(this._eventService.getEvent(this.section + "_" + 
       eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((publishValue)));
     }
   }

  onItemSelect(item: any) {
    if (!this.templateBlockFilter.stackFilter) {
      this.templateBlockFilter.stackFilter = new StackModelFilter();
    }
    if (!this.templateBlockFilter.blockFilterData) {
      this.templateBlockFilter.blockFilterData = new BlockFilterDataModel();
    }

    this.designer.selectedStackType = this.templateBlockFilter.stackFilter.stackType = this.selectedStackType;
    this.designer.selectedStackLevel = this.templateBlockFilter.stackFilter.level = this.selectedStackLevel;
    this.designer.selectedStackTransactionType = this.templateBlockFilter.stackFilter.transactionType = this.selectedStackTransaction;
    this.designer.selectedFilterProjectYear = this.blockFilter.projectYear = this.selectedBlockProjectYear;
    this.designer.selectedFilterBlockCreator = this.blockFilter.BlockCreator = this.selectedBlockCreator;
    this.designer.selectedFilterblockOrigin = this.blockFilter.blockOrigin = this.selectedBlockOrigin;
    this.designer.selectedFilterblockState = this.blockFilter.blockState = this.selectedBlockState;
    this.designer.selectedFilterblockStatus = this.blockFilter.blockStatus = this.selectedBlockStatus;
    this.designer.selectedFilterindustry = this.blockFilter.industry = this.selectedBlockProjectIndustry;
    this.designer.selectedFiltertitle = this.blockFilter.title = this.selectedBlockProjectTitle;
    this.designer.selectedFilterDescription=this.blockFilter.description=this.selectedBlockProjectDescription;
    this.designer.selectedblockType = this.blockFilter.blockType = this.selectedBlockType;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllStackLevel(item: any){
    if (!this.templateBlockFilter.stackFilter) {
      this.templateBlockFilter.stackFilter = new StackModelFilter();
    }
    this.designer.selectedStackLevel = this.templateBlockFilter.stackFilter.level = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;

   }
  onSelectAllStackType(item: any) {
    if (!this.templateBlockFilter.stackFilter) {
      this.templateBlockFilter.stackFilter = new StackModelFilter();
    }
    this.designer.selectedStackType = this.templateBlockFilter.stackFilter.stackType = item;
      this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllStackTransaction(item: any) {
    if (!this.templateBlockFilter.stackFilter) {
      this.templateBlockFilter.stackFilter = new StackModelFilter();
    }
    this.designer.selectedStackTransactionType = this.templateBlockFilter.stackFilter.transactionType = item;
       this.templateBlockFilter.blockFilterData = this.blockFilter;
 
  }
  onSelectAllBlockType(item: any) {
   
    this.designer.selectedblockType = this.blockFilter.blockType = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockProjectYear(item: any) {
   
    this.designer.selectedFilterProjectYear = this.blockFilter.projectYear = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockTitle(item: any) {
  
    this.designer.selectedFiltertitle = this.blockFilter.title = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockDescription(item: any)
  {
     this.designer.selectedFilterDescription=this.blockFilter.description=item;
     this.templateBlockFilter.blockFilterData=this.blockFilter;
  }
  onSelectAllBlockIndustry(item: any) {
   
    this.designer.selectedFilterindustry = this.blockFilter.industry = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockStatus(item: any) {
  
    this.designer.selectedFilterblockStatus = this.blockFilter.blockStatus = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockState(item: any) {
   
    this.designer.selectedFilterblockState = this.blockFilter.blockStatus = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockCreator(item: any) {
  
    this.designer.selectedFilterBlockCreator = this.blockFilter.BlockCreator = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }
  onSelectAllBlockOrigin(item: any) {
   
    this.designer.selectedFilterblockOrigin = this.blockFilter.blockOrigin = item;
    this.templateBlockFilter.blockFilterData = this.blockFilter;
  }

  apply() {
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
    if (this.designer.selectedFilterProjectYear.length == 0 && this.designer.selectedFilterBlockCreator.length == 0 && this.designer.selectedFilterblockOrigin.length == 0 && this.designer.selectedFilterblockState.length == 0
      && this.designer.selectedFilterblockStatus.length == 0 && this.designer.selectedFilterindustry.length == 0 && this.designer.selectedFiltertitle.length == 0 && this.designer.selectedFilterDescription.length == 0
      && this.designer.selectedblockType.length == 0) {

      this.templateBlockFilter.blockFilterData = null;
    }
    if (this.designer.selectedStackType.length == 0 && this.designer.selectedStackLevel.length == 0 && this.designer.selectedStackTransactionType.length == 0) {
      this.templateBlockFilter.stackFilter = null;
    }
    if (this.designer.selectedFilterProjectYear.length == 0 && this.designer.selectedFilterBlockCreator.length == 0 && this.designer.selectedFilterblockOrigin.length == 0 && this.designer.selectedFilterblockState.length == 0
      && this.designer.selectedFilterblockStatus.length == 0 && this.designer.selectedFilterindustry.length == 0 && this.designer.selectedFiltertitle.length == 0  && this.designer.selectedFilterDescription.length == 0
      && this.designer.selectedblockType.length == 0 && this.designer.selectedStackType.length == 0 && this.designer.selectedStackLevel.length == 0 && this.designer.selectedStackTransactionType.length == 0) { 
        this.clear();
      } else {
        this.saveThemeContext();
        
        this.blockService.DeliverableSelectedFilter(this.templateBlockFilter).subscribe((response: any) => {
          var payload = new TemplateAndBlockDetails();
          payload.blocks = response;
          payload.filterApplied = true;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter).publish((payload)));
        });
    }
    this.ref.close();
  }

  saveThemeContext()
  {
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designerService.themeOptions.filter(item=>item.name == this.section)[0].designerService=this.designer;
    this.themingContext.themeOptions.find(x => x.name == this.section).designerService = this.designer;
    this.sharedService.setSelectedTheme(this.themingContext);
  }

  emptyFilter() {
    this.clear();
  }
  cancel() {
    this.clear();
    this.ref.close();
  }

  clear() {
    var deliverableInput = new DeliverablesInput();
    deliverableInput = this.sharedService.getSelectedTheme().themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
    this.designer.selectedStackType = this.selectedStackType = [];
    this.designer.selectedStackLevel = this.selectedStackLevel = [];
    this.designer.selectedStackTransactionType = this.selectedStackTransaction = [];
    this.selectedBlockProjectYear = this.designer.selectedFilterProjectYear = [];
    this.selectedBlockCreator = this.designer.selectedFilterBlockCreator = [];
    this.selectedBlockOrigin = this.designer.selectedFilterblockOrigin = [];
    this.selectedBlockProjectIndustry = this.designer.selectedFilterindustry = [];
    this.selectedBlockProjectTitle = this.designer.selectedFiltertitle = [];
    this.selectedBlockProjectDescription=this.designer.selectedFilterDescription=[];
    this.selectedBlockState = this.designer.selectedFilterblockState = [];
    this.selectedBlockStatus = this.designer.selectedFilterblockStatus = [];
    this.selectedBlockType = this.designer.selectedblockType = [];
    this.saveThemeContext();
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((false)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }


}



