import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel, DeliverablesInput, DeliverableGroupLinkToResponseViewModel, GroupLinkToResponseViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { BlockReferenceViewModel } from '../../../../../../../../@models/projectDesigner/stack';
import { LinkToDeliverableRequestModel } from '../../../../../../../../@models/projectDesigner/template';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../../@models/common/dialog';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../@models/projectDesigner/theming';
import { ResponseType } from '../../../../../../../../@models/ResponseStatus';
import { LocalDataSource } from '../../../../../../../../@core/components/ng2-smart-table';
import { LinkToGroupDeliverableComponent } from './link-to-group-deliverable/link-to-group-deliverable.component';
import * as moment from 'moment';
import { DesignerService } from '../../../../../../services/designer.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-deliverable-block',
  templateUrl: './deliverable-block.component.html',
  styleUrls: ['./deliverable-block.component.scss']
})
export class DeliverableBlockComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  deliverableSource: LocalDataSource = new LocalDataSource();
  groupedDeliverableSource: LocalDataSource = new LocalDataSource();
  projectID: string;
  name: string = '';
  deliverablesList: any = [];
  groupedDeliverableList: any = []  ;
  selectedDeliverable: any = [];
  selectedGroupDeliverable: any = [];
  selectedIndividualDeliverable: any = [];
  checked = false;
  deliverablesCopy: any = [];
  groupedDeliverableCopy: any = [];
  deliverablesInput = new DeliverablesInput();
  searchText: any;
  validationMessage: boolean = false;
  @Input("section") section: string = "";
  designer = new Designer();
  themingContext: ThemingContext;
  isLoaded: boolean = false;
  isDefault: boolean = true;
  
  deliverableSettings = {
      selectMode: 'multi',
      hideSubHeader: true,
      actions: { add: false, edit: false, delete: false, select: true },
      filters: false,
      pager: { display: true, perPage: 10 },
      columns: {
        entityName: {
        title: 'Deliverable Name',
        width: '21%',
        },
        countryName: {
          title: 'Country',
          width: '14%',
        },
        taxableYearEnd: {
          title: 'Taxable Year end',
          width: '21%',
          valuePrepareFunction:
          (cell, row) => {
            return moment(cell).local().format("DD MMM YYYY");
          }
        }

     }
  };
  groupDeliverableSettings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    filters: false,
    pager: { display: true, perPage: 10 },
    columns: {
      groupName: {
        title: 'Group Name',
        width: '21%',
        },
      projectYear: {
        title: 'Project Year',
        width: '14%',
        },
      viewMore: {
        title: 'View Grouped Deliverables',
        width: '21%',
        type:'custom',
        renderComponent: LinkToGroupDeliverableComponent,
        valuePrepareFunction:
        (value,cell, row) => {
          return {cell, row}
        }
      }
   }
};
  
  constructor(protected ref: NbDialogRef<any>, private deliverableService: DeliverableService, private translate: TranslateService,private readonly _eventService: EventAggregatorService,
   private dialogService: DialogService,private designerService: DesignerService, private toastr: ToastrService, private sharedService: ShareDetailService) {
  }

  ngOnInit() {
    let projectDetails = this.sharedService.getORganizationDetail();
    this.projectID = projectDetails.projectId;
    let templateDetails = this.designerService.templateDetails;
    let templateId = templateDetails.templateId;
    this.deliverableService.getGroupedEntitiesByTemplateId(templateId).subscribe((data: DeliverableGroupLinkToResponseViewModel) => {
      this.isLoaded = true;
      this.groupedDeliverableList = data.deliverableGroups;
      this.groupedDeliverableCopy = data.deliverableGroups;
      this.deliverablesList = data.deliverables;
      this.deliverablesCopy = data.deliverables;
      this.deliverableSource.load(this.deliverablesList);
      this.groupedDeliverableSource.load(this.groupedDeliverableList);
    });
  }

  dismiss() {
    this.ref.close();
  }

  exist(user) {
    return this.selectedDeliverable.indexOf(user) > -1;
  }

  removeIndividualDeliverable(deliverable) {

    var idx = this.selectedIndividualDeliverable.indexOf(deliverable);
    this.selectedIndividualDeliverable.splice(idx, 1);
    this.checked = false;
  }

  removeGroupDeliverable(deliverable) {

    var idx = this.selectedGroupDeliverable.indexOf(deliverable);
    this.selectedGroupDeliverable.splice(idx, 1);
    this.checked = false;
  }


  search(): void {
    let term = this.searchText;
    if(this.isDefault)
    {
      this.deliverablesList = this.deliverablesCopy.filter(function (tag) {
        return tag.entityName.toString().toLowerCase().indexOf(term.toLowerCase()) >= 0;
      });
       this.deliverableSource.load(this.deliverablesList); 
    }
    else
    {
      this.groupedDeliverableList = this.groupedDeliverableCopy.filter(function (tag) {
        return tag.entityName.toString().toLowerCase().indexOf(term.toLowerCase()) >= 0;
      });
    
 
  this.groupedDeliverableSource.load(this.groupedDeliverableList); 
 

    }
  }

  linkToDeliverables() {
    var linkToModel = new LinkToDeliverableRequestModel();
    let templateDetails = this.designerService.templateDetails;
    linkToModel.TemplateId = templateDetails.templateId;
    linkToModel.templateUid = templateDetails.uId;
    linkToModel.ProjectId = this.projectID;
    let selectedBlocks = this.designerService.blockList;
    var blocks: any = [];
    if (this.selectedGroupDeliverable.length == 0  && this.selectedIndividualDeliverable.length == 0) {
      this.validationMessage = true;
      return;

    }
    selectedBlocks.forEach(element => {
      var block = new BlockReferenceViewModel();
      block.id = element.id;
      block.isStack = element.isStack;
      block.hasChildren = element.hasChildren;
      block.isRemoved = element.isRemoved;
      block.previousId = element.previousId;
      block.parentId = element.parentId;
      block.level = element.level;
      block.blockId = element.blockId;
      block.stackId = element.stackBlockId;
      blocks.push(block);
    });
    linkToModel.blocks = blocks;
    linkToModel.deliverableIds = [];
    this.selectedIndividualDeliverable.forEach(element => {
      linkToModel.deliverableIds.push(element.entityId);
    });
    linkToModel.groupDeliverableIds = [];
    this.selectedGroupDeliverable.forEach(element => {
      linkToModel.groupDeliverableIds.push(element.groupId);
    });
    this.deliverableService.linkToDeliverables(linkToModel).subscribe((response: any) => {
      if (response && response.responseType === ResponseType.Mismatch) {
        this.toastr.warning(response.errorMessages.toString());
      }
      else if (response && response.isSuccess) {
        this.toastr.success(this.translate.instant('screens.project-designer.document-view.tasks.blockLink'));
        
        this.dismiss();
        var themes = this.themingContext.themeOptions.filter(id => id.data && id.data.deliverable != null);
        if (themes && themes.length > 0) {
          themes.forEach(item => {
            this.subscriptions.add(this._eventService.getEvent(item.name + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(item.data.deliverable));
          });
        }
      }
      else
        this.dialogService.Open(DialogTypes.Error, "Error occured.");
    });
  }

  loadDeliverable() {
    this.isDefault = true;
  }
  
  loadGroupDeliverable() {
    this.isDefault = false;   
  }
  
  onDeliverableSelect(event) {
    if(event.selected.length===0)
    {
      event.source.data.forEach(deliverable=>
        {
          this.removeIndividualDeliverable(deliverable);
        });
    }
    else
    {
      this.selectedIndividualDeliverable = [...event.selected];
    }
  }
  onGroupedDeliverableSelect(event){
    if(event.selected.length===0)
    {
      event.source.data.forEach(deliverable=>
        {
          this.removeGroupDeliverable(deliverable);
        });
    }
    else
    {
      this.selectedGroupDeliverable = [...event.selected];
    }
  }
}