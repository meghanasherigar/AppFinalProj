import { Component, OnInit, ViewChild } from '@angular/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/local/local.data-source';
import { DesignerService } from '../../../../../services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import { Ng2SmartTableComponent } from '../../../../../../../@core/components/ng2-smart-table/ng2-smart-table.component';
import { DeliverableCreateGroupRequestModel, deliverableGroupMessageTypes, EditDeliverableGroupSteps } from '../../../../../../../@models/projectDesigner/deliverable';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-edit-deliverable-group',
  templateUrl: './edit-deliverable-group.component.html',
  styleUrls: ['./edit-deliverable-group.component.scss']
})
export class EditDeliverableGroupComponent implements OnInit {

  activeStep: number = 1;
  //This will be sent to API
  selectedDeliverables = [];

  //Binding current deliverable 
  existingDeliverables: [] = [];
  newlyAddedDeliverables: [] = [];

  groupDetailsForm: FormGroup;
  submitted: boolean = false;

  public selectedGroupId: string = '';
  public selectedGroupProjectYear: number;
  public selectedGroupDescription: string = '';
  public selectedGroupName: string = '';

  allDeliverablesLoaded: boolean = false;
  currentIndex=1;
  possibleRoutes=EditDeliverableGroupSteps;

  @ViewChild('deliverabletable') table: Ng2SmartTableComponent;

  //ngx-ui-loader configuration
  loaderId = 'editGroupLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  currentDeliverablesSource: LocalDataSource = new LocalDataSource();
  allDeliverablesSource: LocalDataSource = new LocalDataSource();

  _pageSize: number = 10;
  _pageIndex: number = 0;
  headerMessage: string;
  taskComplete: boolean = false;

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
  constructor(protected ref: NbDialogRef<any>, private formBuilder: FormBuilder,
    private deliverableService: DeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private sharedService: ShareDetailService,
    private toastrNew: ToastrService) { }

  ngOnInit() {
    this.headerMessage = this.getDisplayMessage('header');
    let projectDetails=this.sharedService.getORganizationDetail();
    this.groupDetailsForm =
      this.formBuilder.group({
        'GroupName': ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
        'Description': ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
        'ProjectYear': [projectDetails.fiscalYear,[Validators.required,Validators.min(1900) , Validators.max(2999)]]
      });
    this.getGroupDetails();
  }


  ngAfterViewChecked() {
    if (!this.taskComplete && this.existingDeliverables.length > 0) {
      //reset the selected deliverables
      this.setSelectedRows(this.existingDeliverables);
      this.taskComplete = true;
    }

  }

  getGroupDetails() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let projectId = this.sharedService.getORganizationDetail().projectId;
    this.deliverableService.getGroupDetails(this.selectedGroupId, projectId)
      .subscribe(response => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.currentDeliverablesSource.load(response);

        this.groupDetailsForm.controls.ProjectYear.setValue(this.selectedGroupProjectYear);
        this.groupDetailsForm.controls.Description.setValue(this.selectedGroupDescription);
        this.groupDetailsForm.controls.GroupName.setValue(this.selectedGroupName);

        this.existingDeliverables = response;
      });
  }

  getAllDeliverables() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let request = this.prepareAllDeliverablesRequest();
    this.deliverableService.getAllDeliverablesListForGroup(request)
      .subscribe((data: any) => {
        if (data) {
          //Filtering existing deliverables from the list
          this.existingDeliverables.forEach(x=>
            {
            let index= data.deliverables.findIndex(t=>t.deliverableId=== x['deliverableId']);
                data.deliverables.splice(index,1);
            })
          this.allDeliverablesSource.load(data.deliverables);
          this.allDeliverablesLoaded = true;
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  private prepareAllDeliverablesRequest() {
    let projectDetails = this.sharedService.getORganizationDetail();
    let request: any = {};
    request.projectId = projectDetails.projectId;
    return request;
  }

  setSelectedRows(response) {
    this.table.grid.getRows().forEach((row) => {
      let index = response.findIndex(x => x.id == row["data"]["id"]);
      if (index > -1) {
        this.table.grid.multipleSelectRow(row);
      }
    });
  }

  nextClick() {
    let valid: boolean = true;
    if (this.activeStep === 1) {
      if (!this.allDeliverablesLoaded) {
        this.getAllDeliverables();
      }
    }
    if (this.activeStep === 2 && (this.newlyAddedDeliverables.length > 0
      || this.existingDeliverables.length > 0)) {
      valid = this.validateDifferentTemplate();
    }

    if (valid) {
      this.activeStep++;
      this.currentIndex++;
    }
    else
    {
      this.toastrNew.warning(this.translate.instant('screens.project-designer.deliverableGroup.DifferentTemplateWarning'));
    }
  }
  previousClick() {
    this.activeStep--;
    this.currentIndex--;
  }

  validateDifferentTemplate() {
    let existingTemplateId = this.extractUniqueTemplates(this.existingDeliverables, true);

    let uniqueTemplates = this.extractUniqueTemplates(this.newlyAddedDeliverables);
    if (uniqueTemplates.length > 1) {
      return false;
    }
    if (existingTemplateId && uniqueTemplates.length === 1 && existingTemplateId !== uniqueTemplates[0]) {
      return false;
    }
    return true;
  }

  extractUniqueTemplates(collection: any[], onlyOne: boolean = false) {
    let templateIds = Array.from(new Set(collection.map(x => x['templateId'])).values());
    if (!onlyOne) {
      return templateIds;
    }
    return templateIds[0];
  }


  onExistingDeliverableSelect(event) {
    this.existingDeliverables = event.selected;
  }
  onNewDeliverableSelect(event) {
    this.newlyAddedDeliverables = event.selected;
  }

  mergeCollections() {
    if (this.existingDeliverables.length > 0) {
      this.selectedDeliverables = [...this.existingDeliverables];
    }
    if (this.newlyAddedDeliverables.length > 0) {
      if (this.selectedDeliverables.length > 0) {
        this.selectedDeliverables= 
        this.selectedDeliverables.concat(this.newlyAddedDeliverables);
      }
      else {
        this.selectedDeliverables = [...this.newlyAddedDeliverables];
      }
    }
  }

  saveGroup() {
    this.submitted = true;
    this.mergeCollections();
    if(!this.checkIfEdited())
    {
      const warnMessage= this.translate.instant('screens.project-designer.deliverableGroup.NoGroupDataModifiedMessage');
      this.toastrNew.warning(warnMessage);
      this.submitted = false;
      return;
    }

    if (this.groupDetailsForm.valid && this.selectedDeliverables.length > 0) {
      this.submitted = false;
      let request = this.prepareEditGroupRequest();
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.deliverableService.createUpdateDeliverableGroup(request, true).subscribe(response => {
        let successMsg = this.getDisplayMessage('success');
        this.toastrNew.success(successMsg);
        this.designerService.changeReloadGroupingGrid(true);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
      }),
        (error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          let errorMsg = this.getDisplayMessage('error');
          this.toastrNew.warning(errorMsg);
        });
    }
  }

  prepareEditGroupRequest() {
    let request = new DeliverableCreateGroupRequestModel();
    let projectDetails = this.sharedService.getORganizationDetail();
    request.projectId = projectDetails.projectId;
    request.Id = this.selectedGroupId;

    //request.deliverableIds = this.selectedDeliverables.map(x => x.entityId);
    request.deliverableIds = this.selectedDeliverables.map(x => x.deliverableId);
    request.templateId = this.extractUniqueTemplates(this.selectedDeliverables, true);

    request.name = this.groupDetailsForm.controls.GroupName.value;
    request.description = this.groupDetailsForm.controls.Description.value;
    request.projectYear = this.groupDetailsForm.controls.ProjectYear.value;
    return request;
  }

  checkIfEdited()
  {
    let groupName=this.groupDetailsForm.controls.GroupName.value;
    let description=this.groupDetailsForm.controls.Description.value;
    let projectYear=this.groupDetailsForm.controls.ProjectYear.value;
    
    let originalDeliverableIds=this.existingDeliverables.map(v=>v['deliverableId']);
    let currentDeliverableIds=this.selectedDeliverables.map(v=>v['deliverableId']);

    if(groupName=== this.selectedGroupName && description=== this.selectedGroupDescription
      && projectYear===this.selectedGroupProjectYear &&
      this.arrayEqual(originalDeliverableIds,currentDeliverableIds))
    {
      return false;
    }
    return true;
  }

  getDisplayMessage(type) {
    switch (type) {
      case deliverableGroupMessageTypes.success:
        return this.translate.instant('screens.project-designer.deliverableGroup.EditGroupSuccessMessage');
      case deliverableGroupMessageTypes.error:
        return this.translate.instant('screens.project-designer.deliverableGroup.EditGroupFailureMessage');
      case deliverableGroupMessageTypes.header:
        return this.translate.instant('screens.project-designer.deliverableGroup.EditDeliverableGroupHeader');
    }
  }

 private arrayEqual(arrayOne:any[],arrayTwo:any[])
  {
    if(arrayOne.length!== arrayTwo.length) return false;
    arrayOne.forEach(c=>
      {
        if(!arrayTwo.includes(c))
          return false;
      });
    
    return true;
  }

  dismiss() {
    this.ref.close();
  }
}
