import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { EditBlockAttributesComponent } from '../../manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { ConfirmationDialogComponent } from '../../../../../../../../src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { BlockService } from '../../../../services/block.service';
import { DesignerService } from '../../../../services/designer.service';
import { BlockAttributeDetail } from '../../../../../../@models/projectDesigner/block';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';




@Component({
  selector: 'ngx-view-block-attributes-popover',
  templateUrl: './view-block-attributes-popover.component.html',
  styleUrls: ['./view-block-attributes-popover.component.scss']
})
export class ViewBlockAttributesPopoverComponent implements OnInit {
  projectDetails: ProjectContext;
  isAttributeLoaded: boolean = false;
  blockAttributeDetail: BlockAttributeDetail;
  blockType: string;
  blockStatus: string;
  industry: string;
  transactionType: string;
  templateName: string;
  canEdit: boolean;

  constructor(private dialogService: NbDialogService,
    private readonly eventService: EventAggregatorService,
    private blockService: BlockService,
    private storageService: StorageService,
    private sharedService: ShareDetailService,
    private designerService: DesignerService
  ) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.getBlockDetail();
    this.canEdit = this.designerService.canEditAttributeFlag;

    if(this.canEdit && this.designerService.isLibrarySection && this.designerService.libraryDetails != null){
      if((this.designerService.projectUserRightsData.isCentralUser && this.designerService.libraryDetails.name == EventConstants.Organization) || this.designerService.libraryDetails.name == EventConstants.User){
        this.canEdit = true;
      } 
      else
        this.canEdit = false;
    }
  }

  editBlock() {
    let isStack: boolean = false;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).publish(isStack);
  }

  getBlockDetail() {
    if (!this.designerService.blockDetails)
      return false;

    this.blockService.getBlockDetail(this.designerService.blockDetails.blockId)
      .subscribe((data: BlockAttributeDetail) => {
        this.isAttributeLoaded = true;
        this.blockAttributeDetail = data;

        if (this.designerService.isTemplateSection)
          this.templateName = this.designerService.templateDetails.templateName;
        else if (this.designerService.isDeliverableSection)
          this.templateName = this.designerService.deliverabletemplateDetails.templateName;
        else
          this.templateName = "";

        if (this.blockAttributeDetail.blockType != null)
          this.blockType = this.blockAttributeDetail.blockType.blockType == null ? "" : this.blockAttributeDetail.blockType.blockType;

        if (this.blockAttributeDetail.blockStatus != null)
          this.blockStatus = this.blockAttributeDetail.blockStatus.blockStatus == null ? "" : this.blockAttributeDetail.blockStatus.blockStatus;

        if (this.blockAttributeDetail.transactionType != null && this.blockAttributeDetail.transactionType.transactionType != "")
          this.transactionType = this.blockAttributeDetail.transactionType.transactionType;

        if (this.blockAttributeDetail.industry != null) {
          this.industry = "";
          this.blockAttributeDetail.industry.forEach(item => {
            this.industry += item.industryName + " - ";
            let subInsustry = ""
            if (item.subIndustries != null && item.subIndustries.length > 0) {
              item.subIndustries.forEach(sitem => {
                subInsustry += sitem.subIndustry + ";"
              })
              this.industry += subInsustry;
            }
          })
        }

        if (this.projectDetails != null) {
          this.blockAttributeDetail.projectYear = this.projectDetails.fiscalYear;
        }

        this.designerService.blockAttributeDetail = this.blockAttributeDetail;

      });
  }
}
