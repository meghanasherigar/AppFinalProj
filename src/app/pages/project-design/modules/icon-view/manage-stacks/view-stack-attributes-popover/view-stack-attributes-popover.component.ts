import { Component, OnInit } from '@angular/core';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { StackAttributeDetail } from '../../../../../../@models/projectDesigner/stack';
import { DesignerService } from '../../../../services/designer.service';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { StackService } from '../../../../services/stack.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-view-stack-attributes-popover',
  templateUrl: './view-stack-attributes-popover.component.html',
  styleUrls: ['./view-stack-attributes-popover.component.scss']
})
export class ViewStackAttributesPopoverComponent implements OnInit {
  projectDetails : ProjectDetails;
  isAttributeLoaded : boolean = false;
  stackAttributeDetail : StackAttributeDetail;
  blockType : string;
  blockStatus : string;
  stackLevel : string;
  transactionType : string;
  canEdit: any;
  constructor(private designerService: DesignerService,
    private storageService : StorageService,
    private readonly eventService: EventAggregatorService,
    private stackService : StackService) { }

  ngOnInit() {
    this.getStackDetails();
    this.canEdit = this.designerService.canEditAttributeFlag;
    if(this.canEdit && this.designerService.isLibrarySection && this.designerService.libraryDetails != null){
      if((this.designerService.projectUserRightsData.isCentralUser && this.designerService.libraryDetails.name == EventConstants.Organization) || this.designerService.libraryDetails.name == EventConstants.User){
        this.canEdit = true;
      } 
      else
        this.canEdit = false;
    }
  }

  getStackDetails(){
    if(!this.designerService.blockDetails)
      return false;

    this.stackService.getstackdetails(this.designerService.blockDetails.blockId)
    .subscribe((data: StackAttributeDetail) => {
      this.isAttributeLoaded = true;
      this.stackAttributeDetail = data;

      if(this.stackAttributeDetail.stackLevel != null)
        this.stackLevel = this.stackAttributeDetail.stackLevel.stackLevel == null? "": this.stackAttributeDetail.stackLevel.stackLevel;
        
      if(this.stackAttributeDetail.blockType != null)
        this.blockType = this.stackAttributeDetail.blockType.blockType == null ? "" : this.stackAttributeDetail.blockType.blockType;

      if(this.stackAttributeDetail.transactionType !=null && this.stackAttributeDetail.transactionType.transactionType != "")
        this.transactionType   = this.stackAttributeDetail.transactionType.transactionType

      this.designerService.stackAttributeDetail = this.stackAttributeDetail;
    });
  }

  editStack(){
    let isStack : boolean = true;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).publish(isStack);
  }
}
