import { Component, OnInit, ElementRef,OnDestroy } from '@angular/core';
import { Entity, EntityResponseViewModel } from '../../../../@models/entity';
import { EntitiesService } from '../entity.service';
import { NbDialogService } from '@nebular/theme';
import { CreateEditEntityComponent } from '../create-edit-entity/create-edit-entity.component'
import { EntityFilterViewModel } from '../../../../@models/entity'
import { AlertService } from '../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { DialogTypes, Dialog } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { CustomHTML } from '../../../../shared/services/custom-html.service';
import { debug } from 'util';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HomeService } from '../../../home/home.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { SortEvents } from '../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-manage-entities',
  templateUrl: './manage-entities.component.html',
  styleUrls: ['./manage-entities.component.scss'],
})
@Component({  
  selector: 'button-view',
  template: `
  <div class="row-fluid">
    <div class="orgViewMore" *ngIf="isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View more.svg"></div>
    <div class="orgViewMore" *ngIf="!isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View less.svg"></div>
  </div>`
})
export class ManageEntitiesComponent implements OnDestroy {
  loadComponent = false;
  enableEditButton = false;
  EditFlag = false;
  isViewMore: boolean;
  customAction: Array<{ id: string, value: string }> = [];
  selectedRow: any;
  enableToolbar: string;
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      add: false, edit: false, delete: false, select: true, custom: [
        { name: 'Viewmore', title: '<img class="viewMorelessIcon"  src="assets/images/View more.svg">' },
        { name: 'Viewless', title: '<img class="viewMorelessIcon viewLess"  src="assets/images/View less.svg">' }
    
    ],
      position: 'right',
    },
    pager: {
      display: true,
      perPage: 10
    },
    columns: {},
  };
  //ngx-ui-loader configuration
loaderId = 'ManageEntitiesLoader';
loaderPosition = POSITION.centerCenter;
loaderFgsType = SPINNER.ballSpinClockwise;
loaderColor = '#55eb06';


  source: CommonDataSource = new CommonDataSource();
  entities: Entity[] = [];
  entityfilterViewModel = new EntityFilterViewModel;
  subscriptions: Subscription = new Subscription();
  customComponent: any;
  constructor(
    private elRef: ElementRef,
    private ngxLoader: NgxUiLoaderService,
    private service: HomeService,
    private tservice: EntitiesService,
    private dialogService: NbDialogService,
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private dialog: MatDialog,
    private shareDetailService: ShareDetailService,
    private dialogService1: DialogService, private customHTML: CustomHTML,
    private translate: TranslateService,
    private toastr: ToastrService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));
      this.setColumnSettings();
  }
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.alertService.clear();
    this.isViewMore = true; 
    // this.entityfilterViewModel.projectID = 'DigiDox3.0';
    const project = this.shareDetailService.getORganizationDetail();
    this.entityfilterViewModel.projectID = project.projectId;
    this.entityfilterViewModel.pageIndex = 1;
    this.entityfilterViewModel.pageSize = this.settings.pager.perPage;

    this
      .tservice
      .getEntities(this.entityfilterViewModel)
      .subscribe((data: EntityResponseViewModel) => {
        this.ngxLoader.stopLoaderAll(this.loaderId);
        this.tservice.entityList=data.entityList;
        this.source.load(data.entityList);
        this.source.totalCount = data.totalCount;

        if (data.entityList.length > 0) {
          this._eventService.getEvent(EventConstants.ManageEntity).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.ManageEntity).publish("DisableDownload");

        this.source["data"].forEach(element => {
          var obj = { id: element.id, value: 'View more' };
          this.customAction.push(obj);
        });
        this._eventService.getEvent(EventConstants.ManageEntity).publish(data.entityFilterMenu);
      });

      this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageEntity).subscribe((payload) => {
        if(payload == "EditDeletetrue"){
          this.source["data"].forEach(ele => {
            var action = this.customAction.filter(function (element, index, array) { return element["id"] == ele["id"] });
            if (action[0]['value'] == 'View less') {
              action[0].value = 'View more';
              this.deleteRow(ele["id"]);

            }
          });
        }
      }))  
      
    this.source.onChanged().subscribe((change) => {
     
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        this.entityfilterViewModel.pageIndex = change.paging.page;
        this.entityfilterViewModel.pageSize = change.paging.perPage;
        this.getEntitiesList(this.entityfilterViewModel);
        this.entities = [];
        this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
      } 
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.ngxLoader.startLoader(this.loaderId);
        this.entityfilterViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.entityfilterViewModel.sortColumn=  change.sort[0].field;
        this.getEntitiesList(this.entityfilterViewModel);
      }

      this.source["data"].forEach(ele => {
        var action = this.customAction.filter(function (element, index, array) { return element["id"] == ele["id"] });
        if (action[0]['value'] == 'View less') {
          action[0].value = 'View more';
          this.deleteRow(ele["id"]);
        }
      });
    });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.EntityCRUD).subscribe((payload) => {
      if (payload == "Add" || payload == "Edit" || payload == "Delete") {
        this.loadMyChildComponent(payload);
      }

    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.EntityFilter).subscribe((payload: EntityFilterViewModel) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageIndex = this.entityfilterViewModel.pageIndex;
      payload.pageSize = this.entityfilterViewModel.pageSize;
      this.entityfilterViewModel = payload;
      this.getEntitiesList(payload);
      //updating the filter model for server pagination when any filter applied -- ends
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.EntityDownload).subscribe((payload) => {
      this.downloadEntities(payload);
    }));

    this.tservice.refreshEntityGrid.subscribe((refresh) => {
      if(refresh) {
        this.getEntityList();
      }
    })
  }

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.actions= {
      columnTitle : this.translate.instant('Actions'),
      add: false, edit: false, delete: false, select: true, custom: [
        { name: 'Viewmore', title: '<img class="viewMorelessIcon"  src="assets/images/View more.svg">' },
        { name: 'Viewless', title: '<img class="viewMorelessIcon viewLess"  src="assets/images/View less.svg">' }
    
    ],
      position: 'right',
    },
    settingsTemp.columns = {
      legalEntityName:
      {
        title: this.translate.instant('LegalEntityName'),
      },
      entityShortName:
      {
        title: this.translate.instant('EntityShortName'),
      },
      country:
      {
        title: this.translate.instant('Country'),
      },
      // taxableYearEnd: {
      //   title: 'Taxable Year End'
      // },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        type: 'date',
        sort: false,
        valuePrepareFunction: (date) => {
        if (date) {
          return moment(date).local().format("DD MMM YYYY");
        }
          return "";
        },
      },
      reportTier: {
        title: this.translate.instant('ReportTier'),
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if (row.reportTier != null) {
            return `<div>` + row.reportTier.reportTier + `</div>`
          }
          else {
            return "";
          }
        }
      },
      scope: {
        title:this.translate.instant( 'InScope?'),
      },
      primaryContact: {
        title:this.translate.instant('PrimaryContact'),
        type: 'html',
        valuePrepareFunction: (cell,row) => {
          if (row.primaryContact && row.primaryContactEmail) {
            return `<div>` + row.primaryContact + `</div>`+`<div class="emailId">`+ row.primaryContactEmail+`</div>`;
          }
          return "";
        },
      }
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  getEntityList() {
    this.enableToolbar = "EditDeletetrue";
    this.tservice
      .getEntities(this.entityfilterViewModel)
      .subscribe((data: EntityResponseViewModel) => {
        this.tservice.entityList=data.entityList;
        this.source.load(data.entityList);
        this.source.totalCount = data.totalCount;

        if (data.entityList.length > 0) {
          this._eventService.getEvent(EventConstants.ManageEntity).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.ManageEntity).publish("DisableDownload");

        this.loadComponent = false;
        this.customAction = [];
        this.source["data"].forEach(element => {
          var obj = { id: element.id, value: 'View more' };
          this.customAction.push(obj);
        });
        this._eventService.getEvent(EventConstants.ManageEntity).publish(data.entityFilterMenu);
        this.ngxLoader.stopLoaderAll(this.loaderId);
        this._eventService.getEvent(EventConstants.ManageEntity).publish(this.enableToolbar);
      }),
      (error)=>{
        this.ngxLoader.stopLoaderAll(this.loaderId);
        console.error(error);
      };
  }
  getEntitiesList(filteredDataModel) {
    this.tservice
      .getEntities(filteredDataModel)
      .subscribe((data: EntityResponseViewModel) => {
        this.source.load(data.entityList);
        this.tservice.entityList=data.entityList;
        this.source.totalCount = data.totalCount;
        if (data.entityList.length > 0) {
          this._eventService.getEvent(EventConstants.ManageEntity).publish("EnableDownload");
        }
        else
          this._eventService.getEvent(EventConstants.ManageEntity).publish("DisableDownload");
        this.loadComponent = false;
        this.customAction = [];
        this.source["data"].forEach(element => {
          var obj = { id: element.id, value: 'View more' };
          this.customAction.push(obj);
        });
        this.ngxLoader.stopLoaderAll(this.loaderId);
        //this._eventService.getEvent(EventConstants.ManageEntity).publish(data.entityFilterMenu);
      });

  }

  CancelEntityComponent() {
    this.loadComponent = false;

    if (this.EditFlag) {
      this._eventService.getEvent(EventConstants.ManageEntity).publish("CancelEdit");
    }
    else {
      if (this.entities.length == 0) {
        this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
      }
      else if (this.entities.length == 1) {
        this._eventService.getEvent(EventConstants.ManageEntity).publish("CanelEditDeleteTrue");
      }
      else if (this.entities.length > 1) {
        this._eventService.getEvent(EventConstants.ManageEntity).publish("CancelCreate");
      }
    }
    // this.getEntityList();
  }

  onCustomAction(event) {
    var entitiesSmartTable = (document.getElementById('entitiesSmartTable'));
    var nodes = this.customHTML.querySelectorAll(entitiesSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    var index = -1;
    for (var i = 0; i < nodes.length; i++) {
      var pager = this.source.getPaging();
      let dataIndex = i ;  
      var uniqueId = this.source["data"][dataIndex].id;
      var tableData = nodes[i].getElementsByTagName("td");
      for (var j = 1; j < tableData.length; j++) {
        if (tableData[j].textContent == event.data.legalEntityName && uniqueId == event.data.id) {
          index = i;
          break;
        }
      }
    }

    var action = this.customAction.filter(function (element, index, array) { return element["id"] == event.data.id });
    this.selectedRow = undefined;
    var nodes = this.customHTML.querySelectorAll(entitiesSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    this.selectedRow = nodes[index];


    if (action[0]['value'] == 'View more') {
      action[0].value = "View less";
      this.getRow(index, event.data);
      this.isViewMore = false ; 
      var _selRow = this.selectedRow;
      setTimeout(function () {
        _selRow.getElementsByClassName('entityViewMore')[0].innerText = "View less";
      });
      _selRow.classList.add("bg-color"); 
      
    }
    else if (action[0]['value'] == 'View less') {
      action[0].value = 'View more';
      this.isViewMore = true ;
      this.deleteRow(event.data.id);
      this.selectedRow.classList.remove("bg-color");
       
      
    }
  }

  getRow(index, data) {
    //var hElement: HTMLElement = this.elRef.nativeElement;
    // var entitiesSmartTable = (document.getElementById('entitiesSmartTable'));
    // var nodes = this.customHTML.querySelectorAll(entitiesSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    // nodes = nodes.slice(1);
    // this.selectedRow = nodes[index];
    // this.selectedRow.setAttribute("class", "trClass" + data.id);
    //this.selectedRow = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.ng-star-inserted")[index];
    var entities = new Array();// Consistent Entity Tax ID
    entities.push(["", "Entity Local Address", "Entity Tax ID", "Tax Office Details", "Entity Contacts", "Created By"]);
    var dataValue = [];
    dataValue[0] = "";
    dataValue[1] = data.localAddress;
    dataValue[2] = data.taxId;
    dataValue[3] = data.taxOffice + " " + data.taxOfficeAddress;
    dataValue[4] = data.employeeName + " " + data.employeeEmail;
    dataValue[5] = data.createdBy + "<br/><span style='color:#BBBCBC'>On " + moment(data.createdOn).local().format("DD MMM YYYY") + "</span>";
    // dataValue[6] = "";
    entities.push(dataValue);
    var table = document.createElement("TABLE");
    var columnCount = entities[0].length;
    var row = document.createElement('tr')
    row.setAttribute("class", "thViewmore" + data.id);
    for (var i = 0; i < columnCount; i++) {
      var headerCell = document.createElement("TH");
      headerCell.setAttribute("class", "viewMoreTableHeader");
      headerCell.innerHTML = entities[0][i];
      // headerCell.setAttribute("colspan", "2");
      row.appendChild(headerCell);
    }
    table.appendChild(row);
    row = document.createElement('tr')
    row.setAttribute("class", "trViewmore" + data.id);
    //row.setAttribute("class", "primaryContact");

    for (var i = 1; i < entities.length; i++) {
      for (var j = 0; j < columnCount; j++) {
        var cell = row.insertCell(-1);
        if (j == 4) {
          var employees = data.employeeName.split(";");
          var employeeEmails = data.employeeEmail.split(";");
          var innerTable = document.createElement("TABLE");
          var innerRow = document.createElement('tr');
          for (var k = 0; k < employees.length; k++) {
            var cell1 = innerRow.insertCell(-1);
            let email = employeeEmails[k];
            cell1.innerHTML = `${employees[k]} <br/><span style="color:#BBBCBC;display:inline-block;overflow:hidden;text-overflow:ellipsis;width: 110px;" title="${email}"> ${employeeEmails[k]}</span>`;
          }
          innerTable.appendChild(innerRow);
          //   innerRow = document.createElement('tr');
          // for(var k = 0; k < employeeEmails.length - 1; k++)
          // {
          //   var cell2 = innerRow.insertCell(-1);
          //   cell2.setAttribute("style","color:#BBBCBC");
          //   cell2.innerHTML = employeeEmails[k];
          // }
          // innerTable.appendChild(innerRow);
          cell.appendChild(innerTable);
        } else
          cell.innerHTML = entities[i][j];
      }
    }
    table.appendChild(row);
    var divArea = document.createElement("div");
    divArea.setAttribute("class", 'Viewmore');
    divArea.appendChild(table);

    this.selectedRow.insertAdjacentHTML('afterend', divArea.innerHTML);
  }

  deleteRow(id) {
    //var hElement: HTMLElement = this.elRef.nativeElement;
    //var node = document.getElementsByClassName('thViewmore' + id)[0];
    var node = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.thViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[0]).removeChild(node);
    node = (document.querySelectorAll('ng2-smart-table table tbody')[0]).querySelectorAll("tr.trViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[0]).removeChild(node);
  }

  sortingChange(change) {
    if (change[0].direction == 'asc')
      this.entities.sort(function (obj1, obj2) {
        return obj1[change[0].field] - obj2[change[0].field]
      });
    else {
      var b = this.entities.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return obj2[change[0].field] - obj1[change[0].field]
      });
    }
  }

  //Method will open the popup with input fields to create a entity
  createEntityPopup() {
    this.dialogService.open(CreateEditEntityComponent, {
      
      closeOnBackdropClick: false // this event is to prevent the mouse click outside the popup
    });
  }
  private dialogTemplate: Dialog;

  openDeleteConfirmDialog(): void {

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-setup.entity.entity-create.deleteEntity');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEntity();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  loadMyChildComponent(action) {
    if (action == "Delete") {
      this.openDeleteConfirmDialog();
    }
    else {
      if (action == 'Add') {
        this.EditFlag = false;
        this.loadComponent = true;
        this.source["data"].forEach(ele => {
          var action = this.customAction.filter(function (element, index, array) { return element["id"] == ele["id"] });
          if (action[0]['value'] == 'View less') {
            action[0].value = 'View more';
            this.deleteRow(ele["id"]);
          }
        });
        this.enableToolbar = "CreateEditfalse";
      }
      if (action == "Edit") {
        if (this.entities.length == 0) { }
        else if (this.entities.length > 1) { }
        else {
          this.EditFlag = true;
          this.loadComponent = true;
          this.enableToolbar = "CreateEditfalse";
          this.source["data"].forEach(ele => {
            var action = this.customAction.filter(function (element, index, array) { return element["id"] == ele["id"] });
            if (action[0]['value'] == 'View less') {
              action[0].value = 'View more';
              this.deleteRow(ele["id"]);
            }
          });
        }
      }
      this._eventService.getEvent(EventConstants.ManageEntity).publish(this.enableToolbar);

    }
  }

  public onUserRowSelect(event) {
    if (event.selected.length == 1) {
      this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeleteFalse");
    }
    else if (event.selected.length > 1) {
      this._eventService.getEvent(EventConstants.ManageEntity).publish("OnlyDeleteFalse");
    }
    else if (event.selected.length == 0)
      this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");

    this.entities = event.selected;
  }

  deleteEntity() {
    // this.alertService.clear();
    let listIds = new Array();
    this.entities.forEach(element => {
      listIds.push(element.id);
    }
    );
    this.tservice.deleteEntityRequest(listIds)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-setup.entity.entity-create.ProjectUserDeletedSuccessfully'));
          } else {
           // this.dialogService1.Open(DialogTypes.Warning, response.errorMessages[0]);
            this.toastr.warning(response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService1.Open(DialogTypes.Error, "Error Occured");
        //  this.toastr.danger(this.translate.instant('screens.home.labels.errorMessage'));	
        });
  }
  downloadEntities(payload) {
    
    let data: EntityFilterViewModel;
    data = payload;
    if (this.entities.length >= 0) {
      data.EntityIds = new Array();
      this.entities.forEach(ele => {
        data.EntityIds.push(ele.id);
      })
    }
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this._eventService.download_Entities(data)
      .subscribe(data => {
        
        this.downloadFile(this.convertbase64toArrayBuffer(data.content),data.fileName);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      } 
      ),
      error => {
        this.dialogService1.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      },
      
      () => console.info('OK');
  }
  convertbase64toArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
    } 
  downloadFile(data,fileName) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob,fileName);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
      }
    }
    catch{
      this.dialogService1.Open(DialogTypes.Warning,this.translate.instant('screens.project-setup.entity.entity-create.entityDownloadMsg'));
      this.dialogService1.Open(DialogTypes.Warning, this.translate.instant('screens.project-setup.TryAgainEntityDownload'));
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}