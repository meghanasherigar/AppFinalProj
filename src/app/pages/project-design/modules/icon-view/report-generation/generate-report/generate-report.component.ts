import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReportRequest, FileFormat, Alignment, HorizontalPosition, VerticalPosition, Rotation, KeyValueViewModel, ReportsRelated } from '../../../../../../@models/projectDesigner/report';
import { ProjectContext } from '../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { TemplateService } from '../../../../services/template.service';
import { deliverableProperties } from '../../../../../../@models/projectDesigner/deliverable';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Index } from '../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-generate-report',
  templateUrl: './generate-report.component.html',
  styleUrls: ['./generate-report.component.scss']
})
export class GenerateReportComponent implements OnInit {
  generateReportForm: FormGroup;
  waterMarkClasses: any = [];
  selectedClass: string = "clockwise";
  waterMarkText: string = "Deloitte."
  waterMarkActive: string = "";
  submitted: boolean = false;
  projectDetails: ProjectContext;
  isWaterMarkEnabled: boolean = true;
  validationMessage: string;
  templateDeliverableName: string = '';


  //ngx-ui-loader configuration
  loaderId = 'GenerateReportLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  isTemplate : boolean = false;
  
  constructor(protected ref: NbDialogRef<any>, private formBuilder: FormBuilder, private ngxLoader: NgxUiLoaderService, private sharedService: ShareDetailService,
    private designerService: DesignerService, private templateService: TemplateService) {
    this.generateReportForm = this.formBuilder.group({
      ReportName: [''],
      WaterMarkText: [''],
      IsWaterMarkSelected: [''],
      IsWordSelected: [''],
      IsPdfSelected: ['']
    });
  }

  get form() { return this.generateReportForm.controls; }


  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.waterMarkClasses = ["clockwise", "anticlockwise", "topright", "topleft", "bottomleft", "bottomright"];
    this.generateReportForm.controls["IsWordSelected"].setValue(true);
    this.AutoPopulateReportName();
  }
  //Auto populate template/deliverable name
  private AutoPopulateReportName() {
    if (this.designerService.selectedTemplates != undefined) {
      if (this.designerService.selectedTemplates.length == Index.one)
        this.templateDeliverableName = this.designerService.selectedTemplates[0].templateName;
    }
    else if (this.designerService.selectedDeliverables != undefined) {
      if (this.designerService.selectedDeliverables.length == Index.one)
        this.templateDeliverableName = this.designerService.selectedDeliverables[0].entityName;
    }
    else if (!this.designerService.isDeliverableSection) {
      this.templateDeliverableName = this.designerService.templateDetails.templateName;
    }
    else if (this.designerService.isDeliverableSection) {
      if (this.designerService.deliverableDetails != null && this.designerService.entityDetails != undefined) {
        let entityData = this.designerService.entityDetails.find(x => x.entityId == this.designerService.deliverableDetails.entityId);
        this.templateDeliverableName = entityData.entityName;
      }
    }
    this.generateReportForm.controls[ReportsRelated.reportName].setValue(this.templateDeliverableName);
  }

  dismiss() {
    this.ref.close();
  }

  generateReport() {
    this.submitted = true;

    if (this.generateReportForm.invalid) {
      return;
    }

    var data = this.generateReportForm.value;
    if (!data.IsPdfSelected && !data.IsWordSelected) {
      this.validationMessage = "Please Select File Format";
      return;
    }
    var request = new ReportRequest();
    request.projectId = this.projectDetails.projectId;
    request.blockIds = [];
    request.isInternalUser = this.designerService.docViewAccessRights.isExternalUser ? false : true;
    if (this.designerService.reportblockList != null && this.designerService.reportblockList.length > 0) {
      this.designerService.reportblockList.forEach(item => {
        request.blockIds.push(item.blockId);
      });
    }
    else if (this.designerService.blockList != null && this.designerService.blockList.length > 0) {
      this.designerService.blockList.forEach(item => {
        request.blockIds.push(item.blockId);
      });
    }
    else
      request.blockIds = null;

    request.templates = [];
    request.deliverables = [];
    if (this.designerService.selectedTemplates != undefined) {
      if (this.designerService.selectedTemplates.length > 0) {
        this.designerService.selectedTemplates.forEach(x => {
          var keyValue = new KeyValueViewModel();
          keyValue.id = x.templateId;
          keyValue.name = x.templateName;
          keyValue.layoutStyleId = x.layoutStyleId;
          request.templates.push(keyValue);
        })
      }
    }
    else if (this.designerService.selectedDeliverables != undefined) {
      this.designerService.selectedDeliverables.forEach(x => {
        var keyValue = new KeyValueViewModel();
        keyValue.id = x.entityId;
        keyValue.name = x.entityName;
        keyValue.taxableYearEnd = x.taxableYearEnd;
        keyValue.layoutStyleId = x.layoutStyleId;
        request.deliverables.push(keyValue);
      })
    }
    else if (!this.designerService.isDeliverableSection) {
      var keyValue = new KeyValueViewModel();
      keyValue.id = this.designerService.templateDetails.templateId;
      keyValue.name = this.designerService.templateDetails.templateName;
      keyValue.layoutStyleId = this.designerService.templateDetails.layoutStyleId;
      request.templates.push(keyValue);
    }
    else if (this.designerService.isDeliverableSection) {
      var keyValue = new KeyValueViewModel();
      if (this.designerService.deliverableDetails != null && this.designerService.entityDetails != undefined) {
        let entityData = this.designerService.entityDetails.find(x => x.entityId == this.designerService.deliverableDetails.entityId)
        keyValue.id = entityData.entityId;
        keyValue.name = entityData.entityName;
        keyValue.taxableYearEnd = entityData.taxableYearEnd;
        keyValue.layoutStyleId = this.designerService.deliverableDetails.layoutStyleId;
      }
      request.deliverables.push(keyValue);
    }

    if (data.IsPdfSelected && !data.IsWordSelected)
      request.fileFormat = FileFormat.Pdf;
    else if (!data.IsPdfSelected && data.IsWordSelected)
      request.fileFormat = FileFormat.Docx;
    else if (data.IsPdfSelected && data.IsWordSelected)
      request.fileFormat = FileFormat.Unknown;

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.templateService.generateReport(request)
      .subscribe((response: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        var fileName = "Report"
        if (request.templates.length > 0)
          fileName = data.ReportName ? data.ReportName + "_" + Date().toString() : request.templates.length == 1 ? request.templates[0].name + "_" + Date().toString() : "Templates_" + Date().toString();
        else if (request.deliverables.length > 0)
          fileName = data.ReportName ? data.ReportName + "_" + Date().toString() : request.deliverables.length == 1 ? request.deliverables[0].name + "_" + Date().toString() : "Deliverables_" + Date().toString();

        var _type = ((data.IsPdfSelected && data.IsWordSelected) || request.templates.length > 1 || request.deliverables.length > 1) ? 'application/zip' : data.IsPdfSelected ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([response], { type: _type });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, fileName + ".zip");
        }
        else {
          var a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
        }

        this.ref.close();

      });

  }

}
