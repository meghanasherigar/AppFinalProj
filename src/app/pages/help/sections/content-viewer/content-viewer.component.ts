import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { SimplePdfViewerComponent, SimplePDFBookmark } from 'simple-pdf-viewer';
import { LanguageViewModel } from '../../../../@models/help/userManual';
import { AppliConfigService } from '../../../../shared/services/appconfig.service';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { PdfViewerComponent, PDFDocumentProxy } from 'ng2-pdf-viewer';
import { ActionEnum, DocViewer } from '../../../../@models/projectDesigner/common';

@Component({
  selector: 'ngx-content-viewer',
  templateUrl: './content-viewer.component.html',
  styleUrls: ['./content-viewer.component.scss']
})
export class ContentViewerComponent implements OnInit,OnDestroy {
  searchValue: string = '';
  pdfSrc: any;
  pdfData: ArrayBuffer;
  previewDocViewer  = new DocViewer();
  defaultLanguageId = "5cff6ea72bfae13cac0799c5";
  subscriptions: Subscription = new Subscription();
  @Output() messageEvent = new EventEmitter<boolean>();
  @ViewChild(PdfViewerComponent)
  private pdfComponent: PdfViewerComponent;
  constructor(private http: HttpClient,
    private readonly _eventService: EventAggregatorService,
    private appConfig: AppliConfigService,
    private ngxLoader: NgxUiLoaderService,
     ) {
    var languageViewModel = new LanguageViewModel();  
    languageViewModel.id = "5cff6ea72bfae13cac0799c5"; 
    this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/usermanual/downloadusermanualstream', languageViewModel, { responseType: 'arraybuffer' })
    .subscribe((file: ArrayBuffer) => {
      this.pdfSrc = new Uint8Array(file);      
    });
  }

  //ngx-ui-loader configuration
  loaderId='TemplateLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';
  delay=100;

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.loadUserManualByLanguageId(this.defaultLanguageId);
    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageUserManual).subscribe((payload) => {
          this.loadUserManualByLanguageId(payload);
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadUserManualStart).subscribe((payload) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadUserManualStop).subscribe((payload) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }));
  }

  loadUserManualByLanguageId(languageId) {
    this.searchValue = "";
    var languageViewModel = new LanguageViewModel();
    languageViewModel.id = languageId;
    this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/usermanual/downloadusermanualstream', languageViewModel, { responseType: 'arraybuffer' })
      .subscribe((file: ArrayBuffer) => {
        
        this.pdfSrc = new Uint8Array(file);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

      });
  }
  incrementPage(amount: number) {
    this.previewDocViewer.page += amount;
    this.previewDocViewer.page = Number(this.previewDocViewer.page.toFixed(1));
  }

  incrementZoom(amount: number) {
    this.previewDocViewer.zoom += amount;
    this.previewDocViewer.zoom = Number(this.previewDocViewer.zoom.toFixed(1));
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
  navigateTo(destination: any) {
    this.pdfComponent.pdfLinkService.navigateTo(destination);
  }
  rotate(angle: number) {
    this.previewDocViewer.rotation += angle;
  }
  searchQueryChanged(newQuery: string) {
    if (newQuery !== this.previewDocViewer.pdfQuery) {
      this.previewDocViewer.pdfQuery = newQuery;
      this.pdfComponent.pdfFindController.executeCommand(ActionEnum.Find, {
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
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
