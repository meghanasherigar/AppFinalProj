import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DesignerService } from '../../../../../../services/designer.service';
import { TaskService } from '../../../../services/task.service';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { AppendixDomainViewModel, AppendixDeliverableDomainModel, BlockIndustryDomainModel, BlockSubIndustryDomainModel, EntityRoleViewModel } from '../../../../../../../../@models/projectDesigner/task';
import { Subscription } from 'rxjs';
import { ResponseStatus } from '../../../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { CreateInfoService } from '../../../../services/create-info.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-add-to-appendix',
  templateUrl: './add-to-appendix.component.html',
  styleUrls: ['./add-to-appendix.component.scss']
})
export class AddToAppendixComponent implements OnInit {
  deliverablesList : any[];
  deliverableDetails = [];
  selectedDeliverablesItems = [];
  private deliverablesDropdownSetting: any;
  addToAppendixFrom: FormGroup;
  appendixDomainViewModel : AppendixDomainViewModel = new AppendixDomainViewModel();
  subscriptions: Subscription = new Subscription();
  data: any;
  templateId:string[]=[];
  templateDetails: any;
  Show : boolean = true;
  entityList: any[];
  
  constructor(
    private taskService: TaskService,
    private toastr: ToastrService,
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private designerService: DesignerService,
    private shareDetailService: ShareDetailService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private infoGatheringService: CreateInfoService) { 
      this.addToAppendixFrom = this.formBuilder.group({
        AppendixName: ['', Validators.required],
        Comment: [''],
        Deliverables: [''],
        Entities: [''],
      });
    }

  ngOnInit() {
    this.deliverablesDropdownSetting = {
      singleSelection: false,
      idField: 'entityId',
      textField: 'entityName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
    this.infoGatheringService.getInformationRequestById(this.designerService.infoRequestId).subscribe((data) => {
      this.templateDetails = data
      if(this.templateDetails.deliverableId != '000000000000000000000000'){
        this.Show = false;
        let entityRole = new Array<EntityRoleViewModel>();
        let entity = this.designerService.templateDeliverableList.deliverables.deliverableResponse.find(x => x.entityId == this.templateDetails.deliverableId);
          let submodel = new EntityRoleViewModel();
          submodel.entityId = entity['entityId'];
          submodel.entityName = entity['entityName'];
          entityRole.push(submodel);
        this.deliverablesList = entityRole;
        //this.entityList = (entity != undefined) ? entity.entityName : null;
      }
      else{
        this.templateId.push(this.templateDetails.templateId);
        this.Show = true;
        this.taskService.getentitiesbytemplate(this.templateId).subscribe(
          data => {
            this.deliverablesList = data;
            this.deliverablesList.forEach(item => {
              item["taxableYearEnd"] = moment(item["taxableYearEnd"]).local().format("DD MMM YYYY");
              item["entityName"] = item["entityName"] + ' ' + item["taxableYearEnd"];
            });
          });
      }
    });
  }

  dismiss() {
    this.ref.close();
  }
  get form() { return this.addToAppendixFrom.controls; }

  SaveAddToAddpendix() {
    const project = this.shareDetailService.getORganizationDetail();
    this.appendixDomainViewModel.ProjectId = project.projectId;
    this.appendixDomainViewModel.AppendixName = this.addToAppendixFrom.controls["AppendixName"].value;
    this.appendixDomainViewModel.FileName = this.designerService.FileName;
    this.appendixDomainViewModel.UniqueFileName =  this.designerService.UploadedFileName;
    this.appendixDomainViewModel.Comment = this.addToAppendixFrom.controls["Comment"].value;
    this.appendixDomainViewModel.AssociatedTo = new Array<AppendixDeliverableDomainModel>();
    this.deliverablesList.forEach(item => {
        let info = new AppendixDeliverableDomainModel();
        info.DeliverableId = item.entityId;
        info.DeliverableName = item.entityName;
        info.TaxableYearEnd = item.taxableYearEnd;
        this.appendixDomainViewModel.AssociatedTo.push(info); 
    });
    this.appendixDomainViewModel.Industry = new Array<BlockIndustryDomainModel>();
    this.data = project.industry;
    this.data.forEach(item => {
      let model = new BlockIndustryDomainModel();
      model.Id = item.id;
      model.IndustryName = item.industry;
      model.SubIndustries = new Array<BlockSubIndustryDomainModel>();
      item.subIndustries.forEach(element => {
        let submodel = new BlockSubIndustryDomainModel();
        submodel.Id = element.id;
        submodel.SubIndustry = element.subIndustry;
        model.SubIndustries.push(submodel);
      });
      this.appendixDomainViewModel.Industry.push(model);
    })
    this.appendixDomainViewModel.ProjectYear = Number(project.fiscalYear); 
    this.appendixDomainViewModel.OrganizationId = project.organizationId;

    this.subscriptions.add(this.taskService.addattachmenttoappendix(this.appendixDomainViewModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.successfullyAddedAppendix'));
           
            this.dismiss();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

}
