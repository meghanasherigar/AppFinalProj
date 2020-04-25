import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LocalDataSource, ViewCell, DefaultEditor } from '../../../../../../@core/components/ng2-smart-table';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { Subscription } from 'rxjs';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EventConstants, eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { BlockStaffingGridViewModel, BlockUserRightViewModel, BlockUserRightReqViewModel } from '../../../../../../@models/projectDesigner/common';
import { DeliverableService } from '../../../../services/deliverable.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DesignerService } from '../../../../services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'checkboxCopy-editor',
  // styleUrls: ['./editor.component.scss'],
  template: `
    <input [ngClass]="inputClass"
           type="checkbox"
           class="form-control"
           [checked]="value"
           (change)="onChange($event)">
    `,
})

export class AppCheckboxComponent implements ViewCell, OnInit {
  inputClass: string = '';
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService) {

  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onChange(event: any) {
    this.row.isCopy = event.target.checked ? true : false;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.blockStaffingRoles).publish(this.row);
  }
}
//To do we should remove duplicate components later

@Component({
  selector: 'checkboxEdit-editor',
  // styleUrls: ['./editor.component.scss'],
  template: `
    <input [ngClass]="inputClass"
           type="checkbox"
           class="form-control"
           [checked]="value"
           (change)="onChange($event)">
    `,
})

export class AppCheckboxEditComponent implements ViewCell, OnInit {
  inputClass: string = '';
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService) {

  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onChange(event: any) {
    this.row.isEdit = event.target.checked ? true : false;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.blockStaffingRoles).publish(this.row);
  }
}
@Component({
  selector: 'checkboxRemove-editor',
  // styleUrls: ['./editor.component.scss'],
  template: `
    <input [ngClass]="inputClass"
           type="checkbox"
           class="form-control"
           [checked]="value"
           (change)="onChange($event)">
    `,
})

export class AppCheckboxRemoveComponent implements ViewCell, OnInit {
  inputClass: string = '';
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService) {

  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onChange(event: any) {
    this.row.isRemove = event.target.checked ? true : false;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.blockStaffingRoles).publish(this.row);
  }
}
@Component({
  selector: 'ngx-block-staffing',
  templateUrl: './block-staffing.component.html',
  styleUrls: ['./block-staffing.component.scss']
})
export class BlockStaffingComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  adminUserGridSource: LocalDataSource = new LocalDataSource();
  blockStaffingGridViewModel = new BlockStaffingGridViewModel();
  blockStaffingResViewModel = new BlockUserRightViewModel();
  blockUserRightViewModel = new Array<BlockUserRightViewModel>();
  blockUserRightReqViewModel = new BlockUserRightReqViewModel();
  dataModel: any = [];
  IsChecked: boolean = false;

  settings = {
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: false },
    filters: false,
    noDataMessage: 'No data found',
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      userFirstName: {
        title: '',
        filter: false,
        width: '5%',
      },
      isCopy: {
        title: '',
        type: 'custom',
        renderComponent: AppCheckboxComponent
      },
      isEdit: {
        title: '',
        type: 'custom',
        renderComponent: AppCheckboxEditComponent
      },
      isRemove: {
        title: '',
        type: 'custom',
        renderComponent: AppCheckboxRemoveComponent
      }
    },
  };

 

  constructor(private _sanitizer: DomSanitizer,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private deliverableService: DeliverableService,
    private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private designerService: DesignerService, 
    private translate: TranslateService,) { }

  ngOnInit() {
    let selectedBlocks = this.designerService.blockList;
    const project = this.shareDetailService.getORganizationDetail();
    this.blockUserRightReqViewModel.ProjectId = project.projectId;
    this.blockUserRightReqViewModel.BlockId = selectedBlocks[0].id;
    this.blockUserRightReqViewModel.EntityId = this.designerService.deliverableDetails.entityId;
    this.subscriptions.add(this.deliverableService.getBlockStaffingGridDetails(this.blockUserRightReqViewModel)
      .subscribe(
        response => {
          this.blockUserRightViewModel = response;
          this.loadBlockStaffingGrid(this.blockUserRightViewModel);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.blockStaffingRoles).subscribe((payload: any) => {
      this.updatedRow(payload);
    }));

  }


  updatedRow(row) {
    this.blockStaffingResViewModel = new BlockUserRightViewModel();
    this.blockStaffingResViewModel.ProjectID = this.blockUserRightReqViewModel.ProjectId;
    this.blockStaffingResViewModel.EntityId = row.entityId;
    this.blockStaffingResViewModel.BlockID = this.blockUserRightReqViewModel.BlockId;
    this.blockStaffingResViewModel.UserEmail = row.userEmail;
    this.blockStaffingResViewModel.UserFirstName = row.userFirstName.split(' ')[0];
    this.blockStaffingResViewModel.UserLastName = row.userFirstName.split(' ')[1];
    this.blockStaffingResViewModel.IsCopy = row.isCopy;
    this.blockStaffingResViewModel.IsEdit = row.isEdit;
    this.blockStaffingResViewModel.IsRemove = row.isRemove;
    var dataIndex = this.dataModel.findIndex(x => x.userEmail === row.userEmail);
    if (dataIndex > -1) {
      this.dataModel[dataIndex] = this.blockStaffingResViewModel;
    } else {
      this.dataModel.push(this.blockStaffingResViewModel);
    }
  }

  SaveBlockStaffing() {
    this.subscriptions.add(this.deliverableService.updateblockuserright(this.dataModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.rights-updated-success-message'));
            
            this.dismiss();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        }));
  }

  loadBlockStaffingGrid(data) {
    let userGridList: BlockStaffingGridViewModel[] = [];
    data.forEach(element => {
      this.blockStaffingGridViewModel = new BlockStaffingGridViewModel();
      this.blockStaffingGridViewModel.projectID = element.projectID;
      this.blockStaffingGridViewModel.blockID = element.blockID;
      this.blockStaffingGridViewModel.entityId = element.entityId;
      this.blockStaffingGridViewModel.userFirstName = element.userFirstName + " " + element.userLastName;
      this.blockStaffingGridViewModel.userEmail = element.userEmail;
      this.blockStaffingGridViewModel.isCopy = element.isCopy;
      this.blockStaffingGridViewModel.isEdit = element.isEdit;
      this.blockStaffingGridViewModel.isRemove = element.isRemove;
      userGridList.push(this.blockStaffingGridViewModel);
    });
    this.adminUserGridSource.totalCount = data.totalCount;
    this.adminUserGridSource.load(userGridList);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  dismiss(){
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockStaffingIcon).publish("DisableIcon"));
  }

}
