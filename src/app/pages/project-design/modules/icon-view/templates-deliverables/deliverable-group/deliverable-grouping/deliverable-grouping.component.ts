import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { LocalDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/local/local.data-source';
import { DeliverableGroupInfoComponent } from '../deliverable-group-info/deliverable-group-info.component';
import { Subscription } from 'rxjs';
import { DesignerService } from '../../../../../services/designer.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../@models/common/eventConstants';
import { Dialog, DialogTypes } from '../../../../../../../@models/common/dialog';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NbDialogService } from '@nebular/theme';
import { AddDeliverableGroupComponent } from '../add-deliverable-group/add-deliverable-group.component';
import { EditDeliverableGroupComponent } from '../edit-deliverable-group/edit-deliverable-group.component';
import { deliverableGroupFilter } from '../../../../../../../@models/projectDesigner/deliverable';
import { SortEvents } from '../../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-deliverable-grouping',
  templateUrl: './deliverable-grouping.component.html',
  styleUrls: ['./deliverable-grouping.component.scss']
})
export class DeliverableGroupingComponent implements OnInit, OnDestroy {

  dataSource: CommonDataSource = new CommonDataSource();
  _pageSize: number = 10;
  _pageIndex: number = 0;
  _sortDirection: any;
  _sortColumn: any;
  totalCount: number;
  subscription = new Subscription();

  private deleteGroupDialog: Dialog;

  selectedGroup = [];

  //ngx-ui-loader configuration
  loaderId = 'DeliverableGroupLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  gridsettings: any =
    {
      selectMode: 'multi',
      hideSubHeader: true,
      pager: {
        display: true,
        perPage: this._pageSize,
      },
      columns: {},
      actions: false,
      noDataMessage: this.translate.instant('screens.project-designer.deliverableGroup.No deliverable group msg'),
    };
  constructor(private deliverableService: DeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private dialogService: NbDialogService,
    private translate: TranslateService,
    private _eventService: EventAggregatorService,
    private designerService: DesignerService, 
    private sharedService: ShareDetailService) {
      this.subscription.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.dataSource.refresh();
      }));

      this.setColumnSettings();
    }

  ngOnInit() {
    this.getAllGroups();
    this.enableSubscriptions();
    this.subscription.add(this.dataSource.onChanged().subscribe((change) => {
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;
        this.getAllGroups();
      }

      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this._sortDirection=  change.sort[0].direction.toUpperCase();
        this._sortColumn=  change.sort[0].field;
        this.getAllGroups();
      }
     }))
  }

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.gridsettings));
    settingsTemp.columns = {
      name: {
        title: this.translate.instant('Name'),
      },
      projectYear: {
        title: this.translate.instant('ProjectYear'),
      },
      description: {
        title: this.translate.instant('Description'),
      },
      viewMore: {
        title: '',
        type: 'custom',
        renderComponent: DeliverableGroupInfoComponent,
        valuePrepareFunction: (value, cell, row) => {
          return { cell, row }
        }
      }
    };

    this.gridsettings = Object.assign({}, settingsTemp );
  }
  enableSubscriptions() {
    this.subscription.add(this.designerService.reloadGroupGrid.subscribe((reload: Boolean) => {
      if (reload) {
        this.getAllGroups();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
        .publish(eventConstantsEnum.projectDesigner.deliverableGroup.actionAdd);
        this.designerService.changeReloadGroupingGrid(false);
      }
    })
    );

    this.subscription.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.actionFilter)
      .subscribe((filter:deliverableGroupFilter)=>
      {
        this.getAllGroups(filter);
      }));

    this.subscription.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.performAction)
      .subscribe((action: string) => {
        switch (action) {
          case eventConstantsEnum.projectDesigner.deliverableGroup.actionDelete:
            this.openConfirmDialogForGroupDelete();
            break;
          case eventConstantsEnum.projectDesigner.deliverableGroup.actionEdit:
            this.editGroup();
            break;
        }
      })
    );
  }

  getAllGroups(filter:deliverableGroupFilter=null)
  {
    let request = this.prepareRequestModel(filter);
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.deliverableService.getDeliverableGroups(request).subscribe(response => {
      this.totalCount = response.totalRecords;
      this.dataSource.totalCount = this.totalCount;
      this.dataSource.load(response.groups);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }

  prepareRequestModel(filter:deliverableGroupFilter=null) {
    let projectDetails = this.sharedService.getORganizationDetail();
    let request: any = {};
    request.projectId = projectDetails.projectId;
    request.pageIndex = this._pageIndex;
    request.pageSize = this._pageSize;
    request.sortDirection=this._sortDirection;
    request.sortColumn=this._sortColumn;
    if(filter)
    {
      if(filter.deliverableFilter)
      {
        request.deliverableIds = filter.deliverableFilter;
      }
      if(filter.groupFilter)
      {
        request.GroupIds = filter.groupFilter;
      }
    }
    return request;
  }

  editGroup() {
    if(this.selectedGroup && this.selectedGroup.length===1){
    let compRef = this.dialogService.open(EditDeliverableGroupComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    compRef.componentRef.instance.selectedGroupId = this.selectedGroup[0].id;
    compRef.componentRef.instance.selectedGroupProjectYear = this.selectedGroup[0].projectYear;
    compRef.componentRef.instance.selectedGroupDescription = this.selectedGroup[0].description;
    compRef.componentRef.instance.selectedGroupName = this.selectedGroup[0].name;
  }
  }

  onDeliverableRowSelect(event) {
    this.selectedGroup = event.selected;
    if (this.selectedGroup.length === 1) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
        .publish(eventConstantsEnum.projectDesigner.deliverableGroup.actionEdit);
    }
    else if (this.selectedGroup.length > 1) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
        .publish(eventConstantsEnum.projectDesigner.deliverableGroup.actionDelete);
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
        .publish(eventConstantsEnum.projectDesigner.deliverableGroup.actionAdd);

    }
  }



  deleteGroup() {
    if (this.selectedGroup.length > 0) {
      let groupIds = this.selectedGroup.map(x => x['id']);
      this.deliverableService.deleteDeliverableGroup(groupIds).subscribe(response => {
        let msg = this.translate.instant('screens.project-designer.deliverableGroup.GroupDeletionSuccess');
        if (response && response.errorMessages.length === 0) {
          this.toastr.success(msg);
          this.getAllGroups();
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.deliverableGroup.toggleIcons)
            .publish(eventConstantsEnum.projectDesigner.deliverableGroup.actionAdd);
        }
        else {
          msg = this.translate.instant('screens.project-designer.deliverableGroup.GroupDeletionFailure');
          this.toastr.warning(msg);
        }
      });
    }
  }


  openConfirmDialogForGroupDelete(): void {

    this.deleteGroupDialog = new Dialog();
    this.deleteGroupDialog.Type = DialogTypes.Delete;
    this.deleteGroupDialog.Message = this.translate.instant('screens.project-designer.deliverableGroup.DeleteGroupConfirmation');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent,
      {
        data: this.deleteGroupDialog
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteGroup();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
