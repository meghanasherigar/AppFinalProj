import { Component, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/local/local.data-source';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { DeliverableCreateGroupRequestModel, deliverableGroupMessageTypes, AddDeliverableGroupSteps } from '../../../../../../../@models/projectDesigner/deliverable';
import { DesignerService } from '../../../../../services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import { Ng2SmartTableComponent } from '../../../../../../../@core/components/ng2-smart-table/ng2-smart-table.component';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { SortEvents } from '../../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-add-deliverable-group',
  templateUrl: './add-deliverable-group.component.html',
  styleUrls: ['./add-deliverable-group.component.scss']
})
export class AddDeliverableGroupComponent implements OnInit {

  groupDetailsForm: FormGroup;
  displayNextSection: boolean = false;
  displayPreviousSection: boolean = true;
  submitted: boolean = false;
  currentIndex=1;
  possibleRoutes=AddDeliverableGroupSteps;

  //ngx-ui-loader configuration
  loaderId = 'createGroupLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  dataSource: CommonDataSource = new CommonDataSource();
  _pageSize: number = 10;
  _pageIndex: number = 0;
  _sortColumn: any;
  _sortDirection: any;
  headerMessage: string;
  selectedDeliverables = [];
  //public editMode: boolean = false;

  projectYearList = new Array<number>();
  taskComplete: boolean = false;
  duplicateGroupName:boolean=false;
  duplicateGroupError:string='';

  gridsettings: any =
    {
      selectMode: 'multi',
      hideSubHeader: true,
      pager: {
        display: true,
        perPage: this._pageSize,
      },
      columns: {
        entityName: {
          title: 'Entity Name'
        },
        taxableYearEnd: {
          title: 'Taxable Year End',
          type: 'html',
          valuePrepareFunction: (cell, row) => {
            return moment(row.taxableYearEnd).local().format("DD MMM YYYY");
          }
        },
        associatedTemplateName: {
          title: 'Template Name'
        },
        countryName: {
          title: 'Country Name'
        }
      },
      actions: false
    };
  disablebutton: boolean;

  constructor(protected ref: NbDialogRef<any>, private formBuilder: FormBuilder,
    private deliverableService: DeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private sharedService: ShareDetailService) { }

  ngOnInit() {
    let projectDetails=this.sharedService.getORganizationDetail();
    this.groupDetailsForm =
      this.formBuilder.group({
        'GroupName': ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
        'Description': ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
        'ProjectYear': [projectDetails.fiscalYear,[Validators.required,Validators.min(1900) , Validators.max(2999)]]
      });
    this.getDeliverables();
    this.headerMessage = this.getDisplayMessage('header');
    this.dataSource.onChanged().subscribe((change) => {
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;
        this.getDeliverables();
      }

      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this._sortDirection=  change.sort[0].direction.toUpperCase();
        this._sortColumn=  change.sort[0].field;
        this.getDeliverables();
      }
    });
  }


  nextClick() {
    if (this.selectedDeliverables.length > 0) {
      let uniqueTemplates = this.extractUniqueTemplates().length;
      if (uniqueTemplates > 1) {
        this.toastr.warning(this.translate.instant('screens.project-designer.deliverableGroup.DifferentTemplateWarning'));
        return;
      }
      this.currentIndex++;
      this.displayNextSection = true;
      this.displayPreviousSection = false;
    }
    else
    {
      this.toastr.warning(this.translate.instant('screens.project-designer.deliverableGroup.NoDeliverableMsg'));
    }
  }

  extractUniqueTemplates(onlyOne: boolean = false) {
    let templateIds = Array.from(new Set(this.selectedDeliverables.map(x => x.templateId)).values());
    if (!onlyOne) {
      return templateIds;
    }
    return templateIds[0];
  }

  getDeliverables() {
    this.ngxLoader.startLoader(this.loaderId);
    let request = this.prepareRequest();
    this.deliverableService.getAllDeliverablesListForGroup(request)
      .subscribe((data: any) => {
        this.dataSource.load(data.deliverables);
        this.ngxLoader.stopLoader(this.loaderId);
      });
  }

  private prepareRequest() {
    let projectDetails = this.sharedService.getORganizationDetail();
    let request: any = {};
    request.projectId = projectDetails.projectId;
    request.sortDirection=this._sortDirection;
    request.sortColumn=this._sortColumn;
    return request;
  }

  previousClick() {
    this.currentIndex--;
    this.displayNextSection = false;
    this.displayPreviousSection = true;
  }

  onDeliverableSelect(event) {
    this.selectedDeliverables = event.selected;
  }
  validateDuplicateGroupNmae()
  {
    if(!this.groupDetailsForm.controls.GroupName.value){
      return false;
    }
    let projectDetails=this.sharedService.getORganizationDetail();
    this.deliverableService.checkDuplicateGroupName(projectDetails.projectId,this.groupDetailsForm.controls.GroupName.value).subscribe(response=>{
      if(response.status == ResponseStatus.Failure)
      {
          this.duplicateGroupName=true;
          this.duplicateGroupError= response.errorMessages[0];
          this.toastr.warning(this.duplicateGroupError);
      }
      else
      {
        this.duplicateGroupError='';
        this.duplicateGroupName=false;
      }
    });
  }
  saveGroup() {
    this.submitted = true;
    this.disablebutton=true;
    if(this.duplicateGroupName)
    {
      this.toastr.warning(this.duplicateGroupError);
      this.submitted = false;
      this.disablebutton=false;
      return;
    }
    if (this.groupDetailsForm.valid && this.selectedDeliverables.length > 0) {
      this.submitted = false;
      let request = this.prepareCreateGroupRequest();
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.deliverableService.createUpdateDeliverableGroup(request).subscribe(response => {
        let successMsg = this.getDisplayMessage('success');
        this.toastr.success(successMsg);
        this.designerService.changeReloadGroupingGrid(true);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
        this.disablebutton=true;
      }),
        (error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          let errorMsg = this.getDisplayMessage('error');
          this.toastr.warning(errorMsg);
          this.disablebutton=false;
        });
    }
  }

  prepareCreateGroupRequest() {
    let request = new DeliverableCreateGroupRequestModel();
    let projectDetails = this.sharedService.getORganizationDetail();
    request.projectId = projectDetails.projectId;
    request.deliverableIds = this.selectedDeliverables.map(x => x.deliverableId);
    request.templateId = this.extractUniqueTemplates(true);
    request.name = this.groupDetailsForm.controls.GroupName.value;
    request.description = this.groupDetailsForm.controls.Description.value;
    request.projectYear = this.groupDetailsForm.controls.ProjectYear.value;
    return request;
  }


  getDisplayMessage(type) {
    switch (type) {
      case deliverableGroupMessageTypes.success:
        return this.translate.instant('screens.project-designer.deliverableGroup.CreateGroupSuccessMessage');
        case deliverableGroupMessageTypes.error:
        return this.translate.instant('screens.project-designer.deliverableGroup.CreateGroupFailureMessage');
        case deliverableGroupMessageTypes.header:
        return this.translate.instant('screens.project-designer.deliverableGroup.CreateDeliverableGroupHeader');
    }
  }

  dismiss() {
    this.ref.close();
  }
}
