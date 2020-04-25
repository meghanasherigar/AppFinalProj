import { Component, OnInit, HostListener, ElementRef, Input } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { EditBlockAttributesComponent } from '../edit-block-attributes/edit-block-attributes.component';
import { ConfirmationDialogComponent } from '../../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { BlockService } from '../../../../../../../services/block.service';
import { BlockAttributeDetail } from '../../../../../../../../../@models/projectDesigner/block';
import { StorageService } from '../../../../../../../../../@core/services/storage/storage.service';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../../@models/organization';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';




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
  @Input("section") section: string = "";
  themingContext: ThemingContext;
  designer = new Designer();
  canEdit: boolean;
  hideProjectYear: boolean = false;

  constructor(private dialogService: NbDialogService,
    private readonly eventService: EventAggregatorService,
    private blockService: BlockService,
    private storageService: StorageService,
    private sharedService: ShareDetailService,
    private designerService: DesignerService
  ) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.canEdit = this.designer.canEditAttributeFlag && !this.designerService.appendixBlockExists;
    if (this.canEdit && this.designer.libraryDetails != null) {
      if ((this.designerService.projectUserRightsData.isCentralUser && this.designer.libraryDetails.name == EventConstants.Organization) || this.designer.libraryDetails.name == EventConstants.User) {
        this.canEdit = true;
      }
      else
        this.canEdit = false;
    }
    
    this.getBlockDetail();
    //Added check for libraryDetails which would be missing in case of template/deliverables
    this.hideProjectYear = this.designer.libraryDetails && ((this.designer.libraryDetails.name == EventConstants.Organization) ||
                              (this.designer.libraryDetails.name == EventConstants.Country) ||
                              (this.designer.libraryDetails.name == EventConstants.Organization) ||
                              (this.designer.libraryDetails.name == EventConstants.User));
  }

  editBlock() {
    let isStack: boolean = false;
    this.eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).publish(isStack);
  }

  getBlockDetail() {
    if (!this.designer.blockDetails)
      return false;

    this.blockService.getBlockDetail(this.designer.blockDetails.blockId)
      .subscribe((data: BlockAttributeDetail) => {
        this.isAttributeLoaded = true;
        this.blockAttributeDetail = data;

        if (this.designer.libraryDetails == null)
          this.templateName = this.designer.templateDetails != null ? this.designer.templateDetails.templateName : this.designer.deliverableDetails.templateName;
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
                subInsustry += sitem.subIndustry + "; "
              })
              this.industry += subInsustry;
            }
          })
        }

        if (this.projectDetails != null && this.blockAttributeDetail.projectYear == null) {
          this.blockAttributeDetail.projectYear = this.projectDetails.fiscalYear;
        }

        this.designer.blockAttributeDetail = this.blockAttributeDetail;

      });
  }
}
