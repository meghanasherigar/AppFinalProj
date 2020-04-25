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
import { DeliverableDataResponseViewModel, AssociateAppendixModel, DisassociateAppendixModel } from '../../../../../../@models/projectDesigner/appendix';
import { AppendixService } from '../../../../services/appendix.service';
import { elementEnd } from '@angular/core/src/render3';
import { TranslateService } from '@ngx-translate/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'ngx-diaasociate-appendices',
  templateUrl: './diaasociate-appendices.component.html',
  styleUrls: ['./diaasociate-appendices.component.scss']
})
export class DiaasociateAppendicesComponent implements OnInit{
  deliverableList: any =[];
  selectedDeliverable: any = [];
  deliverablesCopy: any = [];
  checked = false;
  disassosicateDeliverableData: DisassociateAppendixModel = new DisassociateAppendixModel;
  isDisassociateDisabled: boolean = true;

  loaderId='DiassociateAppendicesloader';
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
    this.disassosicateDeliverableData.projectId =projectDetails.projectId;
    this.disassosicateDeliverableData.AppendixId = this.appendixService.SelectedAppendixId;
    this.disassosicateDeliverableData.blockId = this.appendixService.SelectedBlockId;

    this.deliverableList = this.appendixService.selectedDeliverableData;
    this.deliverableList.forEach(item => {
          item.taxableYearEnd = moment(item.taxableYearEnd).local().format("DD MMM YYYY"); //non editable field,  directly assigned value
        })
        this.deliverablesCopy = this.deliverableList;
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
    
    if(this.selectedDeliverable.length > 0)
      this.isDisassociateDisabled = false;
    else
      this.isDisassociateDisabled = true;  
  }

  onSearchChange(value) {
    this.deliverableList = this.deliverablesCopy.filter(function (tag) {
      return (tag.deliverableName.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0 ||
        tag.taxableYearEnd.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0);
    });
  }

  disassociateDeliverable(){
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.disassosicateDeliverableData.Deliverables = this.selectedDeliverable;
    this.appendixService.DisassociateDeliverables(this.disassosicateDeliverableData)
    .subscribe((data: any) => {
      if (data.status === ResponseStatus.Sucess) {
        this.ref.close();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(undefined);
        this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.DisassociateSuccessMessage'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
      else if (data.status === ResponseStatus.Failure) {
        this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
    }
    )
  }

}
