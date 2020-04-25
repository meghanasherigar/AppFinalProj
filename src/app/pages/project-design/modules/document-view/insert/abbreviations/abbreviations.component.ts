import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EditorFullViewComponent } from '../../../icon-view/manage-blocks/extended-view/editor-full-view/editor-full-view.component';
import { DesignerService } from '../../../../services/designer.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { AbbreviationViewModel, LibraryEnum } from '../../../../../../@models/projectDesigner/common';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { GenericResponse } from '../../../../../../@models/ResponseStatus';
import { DesignerService as DesignerServiceAdmin } from '../../../../../admin/services/designer.service';
@Component({
  selector: 'ngx-abbreviations',
  templateUrl: './abbreviations.component.html',
  styleUrls: ['./abbreviations.component.scss']
})
export class AbbreviationsComponent implements OnInit {
  selectedText: string;
  addAbbreviationForm: FormGroup;
  submitted = false;
  isRecordExist = false;
  isChecked = false;
  Abbreviation = "";
  FullForm = "";
  abbreviationViewModel: AbbreviationViewModel = new AbbreviationViewModel();
  projectId: any;

  constructor(protected ref: NbDialogRef<any>, private designerService: DesignerService,
    private translate: TranslateService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private documentViewService: DocumentViewService, private sharedService: ShareDetailService, private dialogService: DialogService,
    private _eventService: EventAggregatorService, private el: ElementRef, private designerServiceAdmin: DesignerServiceAdmin) {
    this.addAbbreviationForm = this.formBuilder.group({
      Abbreviation: ['', Validators.required],
      FullForm: ['', Validators.required],
      AddNew: ['']
    });
  }
  get form() { return this.addAbbreviationForm.controls; }

  ngOnInit() {
    if (this.designerService.isAdminModule) {
      this.projectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
    }
    else {
      var orgDetails = this.sharedService.getORganizationDetail();
      this.projectId = orgDetails.projectId;
    }
    this.duplicateCheck();
  }
  duplicateCheck() {
    if (window.getSelection().toString() != "") {
      this.designerService.selectedText = window.getSelection().toString();
      this.selectedText = this.designerService.selectedText;
      this.Abbreviation = this.selectedText;
    }
    this.documentViewService.getExistingAbbreviations(this.projectId, this.Abbreviation)
      .subscribe((result: AbbreviationViewModel) => {
        let idFullForm = this.el.nativeElement.querySelector("#idFullForm");
        if (result != null) {
          this.abbreviationViewModel.Id = result['id'];
          this.FullForm = result['fullForm'];
          this.isRecordExist = true;
          idFullForm.classList.add("disable-section");
          idFullForm.classList.add("disabledbutton");
        }
        else {
          this.isRecordExist = false;
          idFullForm.classList.remove("disable-section");
          idFullForm.classList.remove("disabledbutton");
        }
      });
  }
  dismiss() {
    this.ref.close();
  }
  saveAbbreviation() {
    this.submitted = true;
    if (this.addAbbreviationForm.invalid)
      return;
    let data = this.addAbbreviationForm.value;
    this.abbreviationViewModel.Abbreviation = data.Abbreviation;
    this.abbreviationViewModel.FullForm = data.FullForm;
    this.abbreviationViewModel.ProjectId = this.projectId;
    if (this.designerService.isAdminModule) {
      let section = this.designerService.manageLibraryDetails.name.toLowerCase();
      this.abbreviationViewModel.IsTemplate = true;
      if (section == LibraryEnum.globaloecd) {
        this.abbreviationViewModel.TemplateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
        this.abbreviationViewModel.isGlobalOecdTemplate = true;
      }
      else if (section == LibraryEnum.countrytemplate) {
        this.abbreviationViewModel.TemplateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
        this.abbreviationViewModel.isCountryOecdTemplate = true;
      }
    }
    else {
      if (this.designerService.isTemplateSection === true) {
        this.abbreviationViewModel.TemplateOrDeliverableId = this.designerService.templateDetails.templateId;
        this.abbreviationViewModel.IsTemplate = true;
      }
      else if (this.designerService.isDeliverableSection === true) {
        this.abbreviationViewModel.TemplateOrDeliverableId = this.designerService.deliverableDetails.deliverableId;
        this.abbreviationViewModel.IsTemplate = false;
      }
      this.abbreviationViewModel.isGlobalOecdTemplate = false;
      this.abbreviationViewModel.isCountryOecdTemplate = false;
    }
    let addNew = data.AddNew;
    if (addNew != undefined && addNew != "") {
      this.abbreviationViewModel.FullForm = addNew;
      this.documentViewService.updateAbbreviation(this.abbreviationViewModel)
        .subscribe((result: any) => {
          if (result.status.toString() == "1")
            this.toastr.success(this.translate.instant('screens.home.labels.abbreviationUpdateSuccesfully'));

          else if (result.status.toString() == "2")
            this.dialogService.Open(DialogTypes.Success, result.errorMessages[0]);
          this.dismiss();
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).publish('reload');
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
        });
    }
    else {
      this.documentViewService.createAbbreviation(this.abbreviationViewModel)
        .subscribe((result: GenericResponse) => {
          if (result.status.toString() == "1")
            this.toastr.success(this.translate.instant('screens.home.labels.abbreviationSuccesfully'));
          else if (result.status.toString() == "2")
            this.dialogService.Open(DialogTypes.Success, result.errorMessages[0]);
          this.dismiss();
          if (this.abbreviationViewModel.IsTemplate && this.designerService.templateDetails && result.responseData) {
            this.designerService.templateDetails.uId = result.responseData;
          }
          else if (this.designerService.deliverableDetails && result.responseData) {
            this.designerService.deliverableDetails.uId = result.responseData;
          }
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).publish('reload');
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
        });
    }
  }
  toggleCheckbox(event) {
    event.currentTarget.checked ? this.isChecked = true : this.isChecked = false;
  }
}
