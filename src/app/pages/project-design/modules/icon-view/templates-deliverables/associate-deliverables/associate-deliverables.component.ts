import { Component, OnInit } from '@angular/core';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel, DeliverableCreateGroupRequestModel } from '../../../../../../@models/projectDesigner/deliverable';
import * as moment from 'moment';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { TemplateService } from '../../../../services/template.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-associate-deliverables',
  templateUrl: './associate-deliverables.component.html',
  styleUrls: ['./associate-deliverables.component.scss']
})
export class AssociateDeliverablesComponent implements OnInit {
  deliverablesList: any = [];
  selectedDeliverable: any = [];
  deliverablesCopy: any = [];
  checked = false;
  selectedTemplate : any = {};
  duplicateGroupError:string='';

  constructor(private sharedService: ShareDetailService, protected ref: NbDialogRef<any>, private deliverableService: DeliverableService, private toastr: ToastrService,
    private _eventService : EventAggregatorService, private translate: TranslateService,private templateService: TemplateService,  private dialogService: DialogService) { }

  ngOnInit() {
    let projectDetails = this.sharedService.getORganizationDetail();
    this.deliverableService.getentities(projectDetails.projectId).subscribe((data: DeliverableDropDownResponseViewModel) => {

      data.deliverableResponse.forEach(item => {
        if (item.entityName == "New Entity")
          item.taxableYearEnd = moment("2019-08-02T06:13:29.712Z").format("DD MMM YYYY");
        else
          item.taxableYearEnd = moment("2019-09-03T06:13:29.712Z").format("DD MMM YYYY");
      })

      this.deliverablesCopy = this.deliverablesList = data.deliverableResponse;

      if(this.templateService.selectedTemplate){
        this.templateService.selectedTemplate.associatedDeliverables.forEach(item=>
          {
            var deliverable = this.deliverablesList.filter(id=>id.entityId == item.entityId);

            if(deliverable)
              this.selectedDeliverable.push(deliverable[0]);
          })
      }
    });
  }

  dismiss() {
    this.ref.close();
  }

  toggleSelection(deliverable) {
    var idx = this.selectedDeliverable.indexOf(deliverable);
    if (idx > -1)
      this.selectedDeliverable.splice(idx, 1);
    else
      this.selectedDeliverable.push(deliverable);
  }

  remove(deliverable) {
    var idx = this.selectedDeliverable.indexOf(deliverable);
    this.selectedDeliverable.splice(idx, 1);
    this.checked = false;
  }

  onSearchChange(value) {
    this.deliverablesList = this.deliverablesCopy.filter(function (tag) {
      return (tag.entityName.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        tag.taxableYearEnd.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0);
    });
  }

  associateDeliverable(){

    if(this.selectedDeliverable && this.selectedDeliverable.length>0){

    let existingGroupReq= new DeliverableCreateGroupRequestModel();
    existingGroupReq.projectId=this.templateService.selectedTemplate.projectId;
    existingGroupReq.templateId=this.templateService.selectedTemplate.templateId;
    existingGroupReq.deliverableIds=this.selectedDeliverable.map(e=>e.entityId);
     this.deliverableService.checkExistingDeliverableGroup(existingGroupReq).subscribe((response)=>{
       if(response.status === ResponseStatus.Failure)
       {
          this.toastr.warning(response.errorMessages[0]);
          return false;
       }
       else{
        this.templateService.selectedTemplate.associatedDeliverables = this.selectedDeliverable;
        this.templateService.updatetemplate(this.templateService.selectedTemplate)
          .subscribe((data: any) => {
            if (data.status === ResponseStatus.Sucess) {
              this.updateSelectedTheme(this.templateService.selectedTemplate);
              this.ref.close();
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(undefined);
              this.toastr.success(this.translate.instant('screens.home.labels.deliverableAssociatedSuccessfully'));
             
            }
            else if (data.status === ResponseStatus.Failure) {
              this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
            }
          });
       }

     });
    
    }
      
  }
  updateSelectedTheme(data)
  {
    let selectedTheme = this.sharedService.getSelectedTheme();
    let selectedDeliverable = selectedTheme.themeOptions.find(x => x.data && x.data.deliverable != undefined);
    if(selectedDeliverable){
      let associatedDeliverable = data.associatedDeliverables.find(d=>d.entityId == selectedDeliverable["data"].deliverable.id);
      if(associatedDeliverable){
        selectedDeliverable["data"].deliverable.templateId = data.templateId;
        selectedDeliverable["data"].deliverable.templateName = data.templateName;
        this.sharedService.setSelectedTheme(selectedTheme);
      }
    }
  }

}
