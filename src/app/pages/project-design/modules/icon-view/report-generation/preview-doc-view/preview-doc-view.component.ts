import { Component, OnInit, ViewChild } from '@angular/core';
// import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ReportRequest, KeyValueViewModel, FileFormat } from '../../../../../../@models/projectDesigner/report';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogRef } from '@nebular/theme';
import { PdfViewerComponent, PDFDocumentProxy } from 'ng2-pdf-viewer';
import { ActionEnum, DocViewer } from '../../../../../../@models/projectDesigner/common';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
@Component({
  selector: 'ngx-preview-doc-view',
  templateUrl: './preview-doc-view.component.html',
  styleUrls: ['./preview-doc-view.component.scss']
})
export class PreviewDocViewComponent implements OnInit {
  searchValue: string = '';
  pdfSrc: any;
  pdfData: ArrayBuffer;
  projectDetails: ProjectContext;
  previewDocViewer  = new DocViewer();
  loaderId='PreviewDocLoader';
 loaderPosition=POSITION.centerCenter;
 loaderFgsType=SPINNER.ballSpinClockwise;
 loaderColor='#55eb06';
  constructor(protected ref: NbDialogRef<any>,private docService: DocumentViewService, private sharedService: ShareDetailService, private designerService: DesignerService,private ngxLoader: NgxUiLoaderService,) { }
  @ViewChild(PdfViewerComponent)
  private pdfComponent: PdfViewerComponent;
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDetails = this.sharedService.getORganizationDetail();
    var request = this.preparePreviewRequest();
    this.docService.previewDoc(request).subscribe(file => {
      this.pdfSrc = new Uint8Array(file);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    })
  }
  preparePreviewRequest() {
    var request = new ReportRequest();
    request.isPreview = true;
    request.projectId = this.projectDetails.projectId;
    // request.waterMarkText = data.WaterMarkText;
    request.blockIds = [];
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
    request.fileFormat = FileFormat.Pdf;
    return request;
  }

  incrementPage(amount: number) {
    this.previewDocViewer.page += amount;
    this.previewDocViewer.page = Number(this.previewDocViewer.page.toFixed(1));

  }

  incrementZoom(amount: number) {
    this.previewDocViewer.zoom += amount;
    this.previewDocViewer.zoom = Number(this.previewDocViewer.zoom.toFixed(1));
  }

  rotate(angle: number) {
    this.previewDocViewer.rotation += angle;
  }
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.previewDocViewer.pdf = pdf;
    this.loadOutline();
  }

  /**
   * Get outline
   */
  loadOutline() {
    this.previewDocViewer.pdf.getOutline().then((outline: any[]) => {
      this.previewDocViewer.outline = outline;
    });
  }
  searchQueryChanged(newQuery: string) {
    if (newQuery !== this.previewDocViewer.pdfQuery) {
      this.previewDocViewer.pdfQuery = newQuery;
      this.pdfComponent.pdfFindController.executeCommand(ActionEnum.find, {
        query: this.previewDocViewer.pdfQuery,
        highlightAll: true
      });
    } else {
      this.pdfComponent.pdfFindController.executeCommand(ActionEnum.findAgain, {
        query: this.previewDocViewer.pdfQuery,
        highlightAll: true
      });
    }
  }
  dismiss() {
    this.ref.close();
  }

}
