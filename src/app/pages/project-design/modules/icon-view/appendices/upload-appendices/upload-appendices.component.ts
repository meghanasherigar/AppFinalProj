import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DeliverableService } from '../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel, EntityViewModel } from '../../../../../../@models/projectDesigner/deliverable';
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
import { AppendixService } from '../../../../services/appendix.service';
import { DeliverableDataResponseViewModel } from '../../../../../../@models/projectDesigner/appendix';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-upload-appendices',
  templateUrl: './upload-appendices.component.html',
  styleUrls: ['./upload-appendices.component.scss']
})
export class UploadAppendicesComponent implements OnInit {
  public ddDeliverableSettings: any;
  public ddListDeliverableData: any;
  public selectedDeliverableValues: [];
  projectDetails: ProjectContext;
  uploadAppendixForm: FormGroup;
  profileForm : FormGroup;
  submitted: boolean = false;
  deliverableList: any;
  deliverableData: DeliverableDataResponseViewModel[] = [];
  fileUpload: any;
  selectedfile: any;
  fileUploaded: boolean = false;
  disableSaveButton: boolean = false;

  loaderId='UploadAppendicesloader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise;
  loaderColor='#55eb06';


  constructor(protected ref: NbDialogRef<any>, private deliverableService: DeliverableService,
    private shareService: ShareDetailService, private formBuilder: FormBuilder,
    private _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private shareDetailService: ShareDetailService,
    private appendixService : AppendixService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService) {
    this.uploadAppendixForm = this.formBuilder.group({
      AppendixName: ['', Validators.required],
      Comment: [''],
      SelectedDeliverables: [''],
      hdnSelectedDeliverables: ['']
    });
    this.profileForm = this.formBuilder.group({
      name: [''],
      profile: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.projectDetails = this.shareService.getORganizationDetail();
    this.getDeliverableData();
    this.ddDeliverableSettings = {
      singleSelection: false,
      idField: 'deliverableId',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: false,
      classes: 'multiselect-dropdown',
      enableCheckAll: false
    };
  }

  get form() { return this.uploadAppendixForm.controls; }


  getDeliverableData() {
    this.appendixService.getdeliverables(this.projectDetails.projectId).subscribe((data: any) => {
      this.deliverableList = data;
      this.deliverableList.forEach(ele => {
        ele.fullName = ele.deliverableName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
      this.ddListDeliverableData = this.deliverableList;
    });


  }

  onDeliverableFilterSelect(item: any) {
    if (this.uploadAppendixForm.value.SelectedDeliverables && this.uploadAppendixForm.value.SelectedDeliverables.length > 0)
      this.uploadAppendixForm.controls["hdnSelectedDeliverables"].setValue(this.uploadAppendixForm.value.SelectedDeliverables);
    else
      this.uploadAppendixForm.controls["hdnSelectedDeliverables"].setValue("");
  }

  onSelectAllDeliverable(items: any) {
  }

  dismiss() {
    this.ref.close();
  }

  onSelectedFile(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      //document.getElementById("fileName").innerText = file.name;
      this.selectedfile = file;
      this.fileUploaded = true;
      this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.FileSelected'));
    }
  }

  uploadAppendix() {
    this.submitted = true;
    this.disableSaveButton = true;

    if (this.uploadAppendixForm.invalid) {
      this.disableSaveButton = false;
      return;
    }

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    var data = this.uploadAppendixForm.value;
    const formData = new FormData();
    const project = this.shareDetailService.getORganizationDetail();
    formData.append('projectId', project.projectId);
    formData.append('appendixName', data.AppendixName); 
    formData.append('comment',data.Comment);
    let associatedDeliverables = [];

    if (data.SelectedDeliverables) {
      data.SelectedDeliverables.forEach(item => {
        let associatedDeliverable = this.deliverableList.filter(id => id.deliverableId == item.deliverableId)[0];
        delete associatedDeliverable.fullName;    
        
        associatedDeliverables.push(associatedDeliverable);        
      })
    }
    data.SelectedDeliverables= associatedDeliverables;
    formData.append('associatedto',JSON.stringify(data.SelectedDeliverables));
    formData.append('file', this.selectedfile, this.selectedfile.name);
    formData.append('industry', JSON.stringify(this.projectDetails.industry));
    formData.append('projectYear', this.projectDetails.fiscalYear);
    formData.append('organizationId', this.projectDetails.organizationId);

    this.appendixService.upload(formData).subscribe(
      response => {
        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.FileUploadSucess'));
           this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(undefined);
          this.fileUploaded=false;
        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dismiss();
      },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.appendix.messages.ErrorMessage'));
      });

  }

}

