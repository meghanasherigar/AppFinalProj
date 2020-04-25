import { Component, OnInit } from '@angular/core';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel } from '../../../../../../@models/projectDesigner/deliverable';
import * as moment from 'moment';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { TemplateService } from '../../../../services/template.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DeliverableDataResponseViewModel, AssociateAppendixModel } from '../../../../../../@models/projectDesigner/appendix';
import { AppendixService } from '../../../../services/appendix.service';
import { elementEnd } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'ngx-associate-appendices',
  templateUrl: './associate-appendices.component.html',
  styleUrls: ['./associate-appendices.component.scss']
})
export class AssociateAppendicesComponent implements OnInit {
  deliverableList: any =[];
  selectedDeliverable: any = [];
  deliverablesCopy: any = [];
  checked = false;
  assosicateDeliverableData: AssociateAppendixModel = new AssociateAppendixModel;

  loaderId='AssociateAppendicesloader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise;
  loaderColor='#55eb06';

  constructor(private sharedService: ShareDetailService, protected ref: NbDialogRef<any>, 
    private _eventService : EventAggregatorService, private dialogService: DialogService,
    private appendixService: AppendixService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService) { }

  ngOnInit() {
    let projectDetails = this.sharedService.getORganizationDetail();
    this.assosicateDeliverableData.projectId =projectDetails.projectId;
    this.assosicateDeliverableData.AppendixIds = this.appendixService.SelectedAppendicesIds;

    this.appendixService.getdeliverables(projectDetails.projectId).subscribe((data: DeliverableDataResponseViewModel) => {
      this.deliverableList = data;
      this.deliverableList.forEach(item => {
        item.taxableYearEnd = moment(item.taxableYearEnd).local().format("DD MMM YYYY"); //non editable field,  directly assigned value
      })
      this.deliverablesCopy = this.deliverableList;

      if(this.appendixService.selectedDeliverableData && (this.appendixService.SelectedAppendixCount == 1)){
        this.appendixService.selectedDeliverableData.forEach(item=>
          {
            var deliverable = this.deliverableList.filter(id=>id.deliverableId == item.deliverableId);
            // var idx = this.deliverableList.indexOf(deliverable[0]);
            // if (idx > -1)
            // this.deliverableList.splice(idx, 1);

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
    this.deliverableList = this.deliverablesCopy.filter(function (tag) {
      return (tag.deliverableName.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        tag.taxableYearEnd.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0);
    });
  }

  associateDeliverable(){
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.assosicateDeliverableData.Deliverables = this.selectedDeliverable;
    this.appendixService.AssociateDeliverables(this.assosicateDeliverableData)
    .subscribe((data: any) => {
      if (data.status === ResponseStatus.Sucess) {
        this.ref.close();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(undefined);
        this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.AssociateSuccessMessage'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
      else if (data.status === ResponseStatus.Failure) {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
      }
    }

    )
  }

}

