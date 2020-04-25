import { Component, OnInit, Input } from '@angular/core';
import { ProjectDetails } from '../../../../../../../../../@models/projectDesigner/region';
import { StackAttributeDetail } from '../../../../../../../../../@models/projectDesigner/stack';
import { StorageService } from '../../../../../../../../../@core/services/storage/storage.service';
import { StackService } from '../../../../../../../services/stack.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { DesignerService } from '../../../services/designer.service';
import { Subscription } from 'rxjs';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';

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
  subscriptions: Subscription = new Subscription();
  designer = new Designer();
  @Input("section") section: string = "";
  themingContext : ThemingContext;
  canEdit: any;
  
  constructor(private designerService: DesignerService,
    private sharedService : ShareDetailService,
    private readonly eventService: EventAggregatorService,
    private stackService : StackService) { }

  ngOnInit() {
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer =  this.designerService.themeOptions.filter(item=>item.name == this.section)[0].designerService;
    this.getStackDetails();
    this.canEdit = this.designer.canEditAttributeFlag;
    if(this.canEdit && this.designer.libraryDetails != null){
      if((this.designerService.projectUserRightsData.isCentralUser && this.designer.libraryDetails.name == EventConstants.Organization) || this.designer.libraryDetails.name == EventConstants.User){
        this.canEdit = true;
      } 
      else
        this.canEdit = false;
    }
  }

  getStackDetails(){
    if(!this.designer.blockDetails)
      return false;

    this.stackService.getstackdetails(this.designer.blockDetails.blockId)
    .subscribe((data: StackAttributeDetail) => {
      this.isAttributeLoaded = true;
      this.stackAttributeDetail = data;

      if(this.stackAttributeDetail.stackLevel != null)
        this.stackLevel = this.stackAttributeDetail.stackLevel.stackLevel == null? "": this.stackAttributeDetail.stackLevel.stackLevel;
        
      if(this.stackAttributeDetail.blockType != null)
        this.blockType = this.stackAttributeDetail.blockType.blockType == null ? "" : this.stackAttributeDetail.blockType.blockType;

      if(this.stackAttributeDetail.transactionType !=null && this.stackAttributeDetail.transactionType.transactionType != "")
        this.transactionType   = this.stackAttributeDetail.transactionType.transactionType

      this.designer.stackAttributeDetail = this.stackAttributeDetail;
    });
  }

  editStack(){
    let isStack : boolean = true;
    this.eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).publish(isStack);
  }
}
