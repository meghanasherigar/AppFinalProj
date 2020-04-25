import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel, EntityViewModel, DeliverableCreateGroupRequestModel } from '../../../../../../@models/projectDesigner/deliverable';
import { ProjectContext } from '../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateTemplateRequest } from '../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../services/template.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';


@Component({
  selector: 'ngx-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.scss']
})
export class CreateTemplateComponent implements OnInit {
  public ddDeliverableSettings: any;
  public ddListDeliverableData: any;
  public selectedDeliverableValues: [];
  projectDetails: ProjectContext;
  createTemplateForm: FormGroup;
  submitted: boolean = false;
  disableCreateButton:boolean = false;
  deliverableList: EntityViewModel[];
  automaticPropagation:boolean = false;
  linkingInformation : string=''
  constructor(protected ref: NbDialogRef<any>, private deliverableService: DeliverableService,
    private shareService: ShareDetailService, private formBuilder: FormBuilder,
    private templateService: TemplateService,
    private _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
    private toastr: ToastrService) {
    this.createTemplateForm = this.formBuilder.group({
      TemplateName: ['', Validators.required],
      TemplateDescription: [''],
      SelectedDeliverables: [''],
      hdnSelectedDeliverables: ['', Validators.required]
    });
  }
  loaderId='CreateTemplateLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';

  ngOnInit() {
    this.projectDetails = this.shareService.getORganizationDetail();
    this.getDeliverableData();
    this.ddDeliverableSettings = {
      singleSelection: false,
      idField: 'entityId',
      textField: 'entityName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: false,
      classes: 'multiselect-dropdown',
      enableCheckAll: false
    };
    this.linkingInformation = this.translate.instant("screens.project-designer.iconview.linking-information")
  }

  get form() { return this.createTemplateForm.controls; }


  getDeliverableData() {
    this.deliverableService.getentities(this.projectDetails.projectId).subscribe((data: DeliverableDropDownResponseViewModel) => {
      this.ddListDeliverableData = this.deliverableList = data.deliverableResponse;
    });
  }

  onDeliverableFilterSelect(item: any) {
    if (this.createTemplateForm.value.SelectedDeliverables && this.createTemplateForm.value.SelectedDeliverables.length > 0)
      this.createTemplateForm.controls["hdnSelectedDeliverables"].setValue(this.createTemplateForm.value.SelectedDeliverables);
    else
      this.createTemplateForm.controls["hdnSelectedDeliverables"].setValue("");
  }

  onSelectAllDeliverable(items: any) {
  }

  dismiss() {
    this.ref.close();
  }

  toggleAutomaticManualBehavior(isAutomatic:boolean)
  {
      this.automaticPropagation = isAutomatic;
  }

  createTemplate() {
    if (this.createTemplateForm.invalid) {
      return;
    }
    this.submitted = true;
    this.disableCreateButton=true;
    var data = this.createTemplateForm.value;
    let existingGroupReq= new DeliverableCreateGroupRequestModel();
    existingGroupReq.projectId=this.projectDetails.projectId;
    existingGroupReq.templateId=this.templateService.selectedTemplate.templateId;
    existingGroupReq.deliverableIds=data.SelectedDeliverables.map(e=>e.entityId);
     this.deliverableService.checkExistingDeliverableGroup(existingGroupReq).subscribe((response)=>{
     if(response.status === ResponseStatus.Failure)
     {
       this.toastr.warning(response.errorMessages[0]);
       this.submitted = false;
       this.disableCreateButton=false;
       return false;
     }
     else{
      var request = new CreateTemplateRequest();
      request.templateName = data.TemplateName;
      request.templateDescription = data.TemplateDescription;
      request.projectId = this.projectDetails.projectId;
      request.projectName = this.projectDetails.projectName;
      request.associatedDeliverables = [];
      request.isActive = true;
      request.automaticPropagation = this.automaticPropagation;
      if (data.SelectedDeliverables) {
        data.SelectedDeliverables.forEach(item => {
          var associatedDeliverable = this.deliverableList.filter(id => id.entityId == item.entityId)[0];
          request.associatedDeliverables.push(associatedDeliverable);
        })
      }
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.templateService.createTemplate(request)
        .subscribe((data: any) => {
          if (data.status === ResponseStatus.Sucess) {
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
            this.updateSelectedTheme(request);
            this.ref.close();
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(undefined);
            this.toastr.success(this.translate.instant('Template created successfully'));
          }
          else if (data.status === ResponseStatus.Failure) {
            this.submitted = false;
            this.disableCreateButton=false;
            this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
     }
    });
   

  }
   updateSelectedTheme(data)
  {
    let selectedTheme = this.shareService.getSelectedTheme();
    let selectedDeliverable = selectedTheme.themeOptions.find(x => x.data && x.data.deliverable != undefined);
    if(selectedDeliverable){
      let associatedDeliverable = data.associatedDeliverables.find(d=>d.entityId == selectedDeliverable["data"].deliverable.id);
      if(associatedDeliverable){
        selectedDeliverable["data"].deliverable.templateId = data.templateId;
        selectedDeliverable["data"].deliverable.templateName = data.templateName;
        this.shareService.setSelectedTheme(selectedTheme);
      }
    }
  }

}
