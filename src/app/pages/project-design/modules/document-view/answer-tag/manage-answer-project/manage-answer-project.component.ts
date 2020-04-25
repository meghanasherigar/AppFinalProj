import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { AnswertagService } from '../../../../services/answertag.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import { ProjectVariableFilterViewModel, ProjectVariableUpdateViewModel, ProjectVariableInsertViewModel, ProjectVariableDeleteViewModel, ProjectVariableResultViewModel, ProjectVariableResponseViewModel, ProjectVariableDownloadViewModel } from '../../../../../../@models/projectDesigner/answertag';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-manage-answer-project',
  templateUrl: './manage-answer-project.component.html',
  styleUrls: ['./manage-answer-project.component.scss']
})
export class ManageAnswerProjectComponent implements OnInit {
 
  subscriptions: Subscription = new Subscription();
  sourceProject: CommonDataSource = new CommonDataSource();
  dataProject: any;
  userInvalid = false;
  projectVariableFilterViewModel  : ProjectVariableFilterViewModel = new ProjectVariableFilterViewModel();
  projectVariableUpdateViewModel  : ProjectVariableUpdateViewModel = new ProjectVariableUpdateViewModel();
  projectVariablerequestViewModel : ProjectVariableInsertViewModel = new ProjectVariableInsertViewModel();
  projectVariableDeleteViewModel  : ProjectVariableDeleteViewModel = new ProjectVariableDeleteViewModel();
  projectVariableResponseViewModel : ProjectVariableResponseViewModel = new ProjectVariableResponseViewModel();
  projectVariableResultViewModel : ProjectVariableResultViewModel = new ProjectVariableResultViewModel();
  projectVariableDownloadViewModel : ProjectVariableDownloadViewModel = new ProjectVariableDownloadViewModel();
  editmanageAnsTitle =this.translate.instant('screens.project-setup.transaction.transaction-toolbar.Edit');
  settingsProject = {
    selectMode: 'multi',
    actions: {
      columnTitle: '',
      add: false,
      edit: true,
      select: true,
      class: 'testclass',
      delete: false,
      position: 'right'
    },
    filters: false,
    noDataMessage: this.translate.instant('screens.project-designer.document-view.info-request.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
    edit: {
      editButtonContent: `<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon-template" title="${this.editmanageAnsTitle}">`,
      saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
      cancelButtonContent: '<i class="ion-close smallIcon"></i>',
      confirmSave: true
    },
    mode: 'inline',
  };
  
//ngx-ui-loader configuration
loaderId='ManageUserLoader';
loaderPosition=POSITION.centerCenter;
loaderFgsType=SPINNER.ballSpinClockwise; 
loaderColor = '#55eb06';
  constructor(private _eventService: EventAggregatorService,
    private customHTML: CustomHTML,
    private dialogService: DialogService,
    private ansTagService: AnswertagService,
    private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private designerService: DesignerService, 
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService,) { 
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.sourceProject.refresh();
      }));
      this.setColumnSettings();
    }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableAnswerTagCreateIcon).subscribe((payload)=>{
      this.reloadGrid();
    }));
    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createButtonAnswer).subscribe((payload)=>{
      this.insertprojectvariable(payload);
    }));

    this.ansTagService.selectedProjectVariableRows = [];
    const project = this.shareDetailService.getORganizationDetail();
    this.projectVariableFilterViewModel.ProjectId = project.projectId;
    this.projectVariableFilterViewModel.ProjectVariableIds = [];
    this.projectVariableFilterViewModel.pageIndex = 1;
    this.projectVariableFilterViewModel.pageSize = this.settingsProject.pager.perPage;
    this.loadProjectVariableGrid();

    this.sourceProject.onChanged().subscribe((change) => {
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        const project = this.shareDetailService.getORganizationDetail();
        this.projectVariableFilterViewModel.ProjectId = project.projectId;
        this.projectVariableFilterViewModel.pageIndex = change.paging.page;
        this.projectVariableFilterViewModel.pageSize = change.paging.perPage;
        this.getProjectVariableDataOnPageSize(this.projectVariableFilterViewModel);
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.projectVariableFilterViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.projectVariableFilterViewModel.sortColumn=  change.sort[0].field;
        this.getProjectVariableDataOnPageSize(this.projectVariableFilterViewModel);
      }
      //block for server side pagination -- ends
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableFilter).subscribe((payload: ProjectVariableFilterViewModel) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageSize = this.projectVariableFilterViewModel.pageSize;
      payload.pageIndex = this.projectVariableFilterViewModel.pageIndex;
      payload.ProjectId = this.projectVariableFilterViewModel.ProjectId;
      this.projectVariableFilterViewModel = payload;
      this.loadProjectVariableGrid();
      //updating the filter model for server pagination when any filter applied -- ends
    }));
    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).subscribe((payload) => {
      if(payload == "DownloadProject"){
        this.downloadTransactions();
      }
      if(payload == "DeleteProject"){
        this.deleteprojectvariable(null);
      }
    }));
  }

  public loadProjectVariableGrid(){
    this.subscriptions.add(this.ansTagService.getprojectvariables(this.projectVariableFilterViewModel).subscribe(
      response => {
        this.projectVariableResponseViewModel = response;
        this.loadProjectGrid(this.projectVariableResponseViewModel);
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
  }));
  }

  getProjectVariableDataOnPageSize(filterData: ProjectVariableFilterViewModel) {
    this.subscriptions.add(this.ansTagService.getprojectvariables(this.projectVariableFilterViewModel).subscribe(
      response => {
        this.projectVariableResponseViewModel = response;
        this.loadProjectGrid(this.projectVariableResponseViewModel);
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
  }));
    //this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
  }

  loadProjectGrid(data: ProjectVariableResponseViewModel) {
    let userGridList: ProjectVariableResultViewModel[] = [];
    this.ansTagService.selectedProjectVariableRows = [];
    data.projectVariableList.forEach(element => {
      this.projectVariableResultViewModel = new ProjectVariableResultViewModel();
      this.projectVariableResultViewModel.id = element.id;
      this.projectVariableResultViewModel.variable = element.variable;
      this.projectVariableResultViewModel.value = element.value;
      userGridList.push(this.projectVariableResultViewModel);
      //this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    });
    this.sourceProject.totalCount = data.totalProjectVariableCount;
    this.sourceProject.load(userGridList);
  }

  public onUserRowSelectProject(event){
    this.ansTagService.selectedProjectVariableRows = event.selected;
    if(this.ansTagService.selectedProjectVariableRows.length > 0){
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createAnswer).publish('DeleteRecord');
    }
    else{
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createAnswer).publish(undefined);
    }
  }

  // openDeleteConfirmDialog(): void {
  //   this.dialogTemplate = new Dialog();
  //   this.dialogTemplate.Type = DialogTypes.Delete;
  //   this.dialogTemplate.Message = "Are you sure you want to delete the selected Admin User(s)?";

  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     data: this.dialogTemplate
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.deleteAdminUsers();
  //     }
  //   });
  // }

  public deleteprojectvariable(event){
    const project = this.shareDetailService.getORganizationDetail();
    this.projectVariableDeleteViewModel.ProjectId = project.projectId;
    this.projectVariableDeleteViewModel.ProjectVariableIds = new Array();
    if(event == null) {
      this.ansTagService.selectedProjectVariableRows.forEach(item => {
        this.projectVariableDeleteViewModel.ProjectVariableIds.push(item.id);
      });
    }
    else if(event.data.id != undefined) {
      this.projectVariableDeleteViewModel.ProjectVariableIds.push(event.data.id);
    }
    if (this.projectVariableDeleteViewModel.ProjectVariableIds.length == 0) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.info-gathering.ValidationMessages.RecorddeleteMsg')); //this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired')
      return;
    }
    else {
    this.subscriptions.add(this.ansTagService.deleteprojectvariable(this.projectVariableDeleteViewModel)
    .subscribe(
      response => {
        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.home.labels.projectVariableDeletedSuccessfully'));
         
          this.reloadGrid();
        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
    }
  }

  public insertprojectvariable(event){
    this.userInvalid = false;
    const project = this.shareDetailService.getORganizationDetail();
    if(event.id == ''){
    this.projectVariablerequestViewModel.ProjectId = project.projectId   
    this.projectVariablerequestViewModel.Value = event.value;
    this.projectVariablerequestViewModel.Variable = event.variable;
    this.subscriptions.add(this.ansTagService.insertprojectvariable(this.projectVariablerequestViewModel)
    .subscribe(
      response => {
        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.home.labels.projectVariableCreatedSuccessfully'));
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableRefreshFilter).publish(true);
          this.reloadGrid();
        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
    }
    else{
      this.validationProjectVariable(event);
      if (this.userInvalid) {
        return;
      }
      this.projectVariableUpdateViewModel.Id = event.newData.id
      this.projectVariableUpdateViewModel.ProjectId = project.projectId
      this.projectVariableUpdateViewModel.Value = event.newData.value ;
      this.projectVariableUpdateViewModel.Variable = event.newData.variable;
      this.subscriptions.add(this.ansTagService.updateprojectvariable(this.projectVariableUpdateViewModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.projectVariableUpdatedSuccessfully'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableRefreshFilter).publish(true);
            this.reloadGrid();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    }
  }

  validationProjectVariable(data) {
      if(data.newData.variable == ''){
        this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.ValidationMessages.enterVariableMsg')); //this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired')
        this.userInvalid = true;
        return
      }
      else if(data.newData.variable != ''){
        if (data.newData.variable[0] != '#') {
          this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.ValidationMessages.Variablenamesstartmsg')); //this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired')
          this.userInvalid = true;
          return
        }
        if(data.newData.variable.includes(' ')){
          this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.ValidationMessages.VariableNoSpaceValidation')); //this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired')
          this.userInvalid = true;
          return 
        }
      } 
      if(data.newData.value == ''){
        this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.ValidationMessages.entervaluemsg')); //this.translate.instant('screens.project-setup.Users.ValidaionMessages.RegionRequired')
        this.userInvalid = true;
        return
      }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settingsProject));
    settingsTemp.columns = {
      variable: {
        title: this.translate.instant('Variable'),
        filter: false,
      },
      value: {
        title: this.translate.instant('Value'),
        filter: false,
      },
    },
    this.settingsProject = Object.assign({}, settingsTemp );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  downloadTransactions() {
    const project = this.shareDetailService.getORganizationDetail();
    this.projectVariableDownloadViewModel.ProjectId = project.projectId;
    this.projectVariableDownloadViewModel.ProjectVariableIds = new Array();
    this.ansTagService.selectedProjectVariableRows.forEach(item => {
      this.projectVariableDownloadViewModel.ProjectVariableIds.push(item.id);
    });
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.ansTagService.downloadprojectvariables(this.projectVariableDownloadViewModel).subscribe(data => {
      this.downloadFile(this.convertbase64toArrayBuffer(data.content), data.fileName);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      },
      
      () => console.info('OK');
    return false;
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

  downloadFile(data, fileName) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
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
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DownloadFailureMessage'));
    }
  }

  reloadGrid(){
    const project = this.shareDetailService.getORganizationDetail();
    this.projectVariableFilterViewModel.ProjectId = project.projectId;
    this.projectVariableFilterViewModel.ProjectVariableIds = [];
    this.projectVariableFilterViewModel.pageIndex = 1;
    this.projectVariableFilterViewModel.pageSize = this.settingsProject.pager.perPage;
    this.loadProjectVariableGrid();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableRefreshFilter).publish(true);
  }

}
