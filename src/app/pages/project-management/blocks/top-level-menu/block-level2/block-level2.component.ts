import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ProjectManagementConstants } from '../../../@models/Project-Management-Constants';
import { ProjectDeliverableService } from '../../../services/project-deliverable.service';
import { ProjectManagementService } from '../../../services/project-management.service';
import { BlockFilterResponse } from '../../../@models/blocks/block';
import { BlockReportService } from '../../../services/block-report.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-block-level2',
  templateUrl: './block-level2.component.html',
  styleUrls: ['./block-level2.component.scss']
})
export class BlockLevel2Component implements OnInit, OnDestroy {
  constants = ProjectManagementConstants;
  Subscriptions = new Subscription();
  show: boolean = true;
  imageName: string=this.translate.instant("collapse");
  BlockTypesSettings;
  defaultLabel = true;
  options = true;
  AssignToUsersSettings;
  selectedTemplateItem: any = "";
  selectedEntityTemplate = [];
  TemplateList = [];
  DeliverableList = [];
  BlockTypeIds = [];
  AssignTo = [];
  Deliverables = [];
  Templates = [];
  CompletionStatus = [];
  BlockType = [];
  DueDate;
  BlockTypes;
  AssignToUsers;
  CompletionStatusList;
  CompletionStatusSettings;
  DueMinDate = new Date();
  DueMaxDate = new Date();

  constructor(private managementService: ProjectManagementService,private translate:TranslateService ,private projectDeliverableService: ProjectDeliverableService, private blockservice: BlockReportService) { }

  ngOnInit() {
    this.activeSubsriptions();
    this.setBlockFilterSettings();
    this.GetFIlterDate();
    this.managementService.ResetBlockFilter();
  }

  activeSubsriptions()
  {
    this.Subscriptions.add(this.managementService.blockAssignToUsersFlag
      .subscribe(userList=>
        {
            this.AssignToUsers = userList;
        })
    );
  }

  GetFIlterDate() {

    this.blockservice.getBlockFilterData().subscribe((response: BlockFilterResponse) => {
      const MinDueDate = this.GetDate(response.minDueDate);
      const MaxDueDate = this.GetDate(response.maxDueDate);
      this.BlockTypes = response.blockType;
      this.CompletionStatusList = response.blockStatus;
      this.AssignToUsers = response.userAssignment;
      this.DueMinDate = new Date(MinDueDate.Year, MinDueDate.Month, MinDueDate.Day);
      this.DueMaxDate = new Date(MaxDueDate.Year, MaxDueDate.Month, MaxDueDate.Day);
      this.TemplateList = response.template;
      this.DeliverableList = response.deliverable;

    });

  }


  clearFilters() {
    this.BlockType = [];
    this.AssignTo = [];
    this.CompletionStatus = [];
    this.DueDate = '';
    this.TemplateList.forEach((element) => { element.checked = false; });
    this.DeliverableList.forEach((element) => { element.checked = false });
    this.managementService.ResetBlockFilter();

  }

  onBlockTypeSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.BlockTypeIds.push(element.blockTypeId); })
    } else {
      this.BlockTypeIds.push(items.blockTypeId);
    }
    this.managementService.BlockFilters.blockReportFilterRequest.BlockType = this.BlockTypeIds;
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onBlockTypeDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.BlockTypeIds = items;
    } else {
      const index = this.BlockTypeIds.indexOf(items.blockTypeId);
      (index !== -1) ? this.BlockTypeIds.splice(index, 1) : this.BlockTypeIds;
    }
    this.managementService.BlockFilters.blockReportFilterRequest.BlockType = this.BlockTypeIds;
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onAssignToSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.AssignTo.push(element.email); })
    } else {
      this.AssignTo.push(items.email);
    }
    this.managementService.BlockFilters.blockReportFilterRequest.UserAssignment = this.AssignTo.map(x=>x.email).filter(b=>b);
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onAssignToDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.AssignTo = items;
    } else {
      const index = this.AssignTo.indexOf(items.email);
      (index !== -1) ? this.AssignTo.splice(index, 1) : this.AssignTo;
    }
    this.managementService.BlockFilters.blockReportFilterRequest.UserAssignment = this.AssignTo.map(x=>x.email).filter(b=>b);
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onCompletionStatusSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.CompletionStatus.push(element.blockStatusId);
     })
    } else {
      this.CompletionStatus.push(items.blockStatusId);
    }
    this.managementService.BlockFilters.blockReportFilterRequest.BlockStatus = this.CompletionStatus.map(x=>x.blockStatus).filter(x=>x);
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onCompletionStatusDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.CompletionStatus = items;
    } else {
      const index = this.CompletionStatus.indexOf(items.blockStatusId);
      (index !== -1) ? this.CompletionStatus.splice(index, 1) : this.CompletionStatus;
    }
    
    this.managementService.BlockFilters.blockReportFilterRequest.BlockStatus = this.CompletionStatus.map(x=>x.blockStatus).filter(x=>x);
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  updateCheckedOptions(position, item, ConstValue, e) {
    this.selectedTemplateItem = item.name;
    if(ConstValue === ProjectManagementConstants.TEMPLATE) {
      this.TemplateList.forEach((element, index) => { 
        element.checked = (position === index) ? e.target.checked : false;
      });
      const checkedTemplate = this.TemplateList.filter((x) => { return x.checked === true });
      this.managementService.BlockFilters.templateId = item.id;
      if(checkedTemplate.length === 0) {
        this.managementService.BlockFilters.templateId = '';
      }
      this.managementService.BlockFilters.entityId = '';
    }
    if (ConstValue === ProjectManagementConstants.DELIVERABLE) {
      // this.DeliverableList[position].checked = e.target.checked;
      this.DeliverableList.forEach((element, index) => { 
        element.checked = (position === index) ? e.target.checked : false;
      });
      this.managementService.BlockFilters.entityId = item.id;
      const checkedDeliverables = this.DeliverableList.filter((x) => { return   x.checked === true });
      if(checkedDeliverables.length === 0) { this.managementService.BlockFilters.entityId = ''; }
      this.managementService.BlockFilters.templateId = '';
    }
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters);
  }

  onDueDate(item) {
    if(item) {
      this.managementService.BlockFilters.blockReportFilterRequest.MinDueDate = item[0];
      this.managementService.BlockFilters.blockReportFilterRequest.MaxDueDate = item[1];
      this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters); 
    }
  }

  GetDate(date) {

    return {
      Year: parseInt(moment(date).local().format('YYYY')),
      Month: parseInt(moment(date).local().format('MM')),
      Day: parseInt(moment(date).local().format('D')),
    }
  }

  onSearch(searchTerm) {
    this.managementService.BlockFilters.SearchText = searchTerm;
    this.managementService.SetOrResetBlockFilter(this.managementService.BlockFilters); 

  }

  handleChange(options) {
    if (options) {
      this.DeliverableList.forEach((element) => { element.checked = false;  });
      if (this.selectedTemplateItem == "") {
        this.defaultLabel = true;
      }
    }
    else {
      this.TemplateList.forEach((element) => { element.checked = false;  });
      if (this.selectedEntityTemplate.length < 1) {
        this.defaultLabel = true;
      }
    }
  }


  setBlockFilterSettings () {

    this.BlockTypesSettings = {
      singleSelection: false,
      idField: 'blockTypeId',
      textField: 'blockType',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.AssignToUsersSettings = {
      singleSelection: false,
      idField: 'email',
      textField: 'fullName',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    }

    this.CompletionStatusSettings = {
      singleSelection: false,
      idField: 'blockStatusId',
      textField: 'blockStatus',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

  }

  toggleCollapse() {
    this.show = !this.show;

    this.imageName = (this.show) ? this.translate.instant("collapse") :this.translate.instant("expand");
  }

  ngOnDestroy() {
    this.Subscriptions.unsubscribe();
  }

}
