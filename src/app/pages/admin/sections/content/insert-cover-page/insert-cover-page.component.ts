import { Component, OnInit, AfterViewInit } from '@angular/core';
// import  MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
// import MultirootEditor from './../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { DesignerService } from '../../../services/designer.service';
import { Subscription, from } from 'rxjs';
import { NbDialogRef } from '@nebular/theme';
import { QuestionTagViewModel, insertCoverPage, coverPageResponse, updateInsertCoverPageRequest } from '../../../../../@models/projectDesigner/task';
import { CustomHTML } from '../../../../../shared/services/custom-html.service';
import { TaskService } from '../../../../project-design/modules/document-view/services/task.service';
import { LibraryService } from '../../../services/library.service';
import { ValueConstants } from '../../../../../@models/common/valueconstants';
import { coverPage } from '../../../../../@models/projectDesigner/designer';
import { GenericResponse } from '../../../../../@models/ResponseStatus';
import { libraryOptions } from '../../../@models/block-suggestion';
import { LibraryOptions } from '../../../../../@models/projectDesigner/block';
import { libraryRequestModel, LibraryTypes, getCoverPage } from '../../../../../@models/projectDesigner/library';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-insert-cover-page',
  templateUrl: './insert-cover-page.component.html',
  styleUrls: ['./insert-cover-page.component.scss']
})
export class InsertCoverPageComponent implements OnInit, AfterViewInit {
  public editorValues: any = '';
  public readonly: boolean;
  editor: any;
  editorData: getCoverPage;
  innerHtmlTableType: string = '';
  questionTag = new QuestionTagViewModel();
  subscriptions: Subscription = new Subscription();
  libraryId: number;
  templateOrDeliverableId: string;
  loaderId = 'AdminCoverPageLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private designerService: DesignerService,private toastr: ToastrService, protected ref: NbDialogRef<any>, private customHTML: CustomHTML, private libraryService: LibraryService,
    private dialogService: DialogService, private translate: TranslateService, private ngxLoader: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxLoader.startLoader(this.loaderId);
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    if (currentLibrary.Global) {
      this.libraryId = LibraryTypes.GlobalLibrary;
    } else if (currentLibrary.IsCountryLibrary) {
      this.libraryId = LibraryTypes.CountryLibrary;
    } else if (currentLibrary.GlobalTemplate) {
      this.libraryId = LibraryTypes.GlobalOECDTemplate;
    } else if (currentLibrary.CountryTemplate) {
      this.libraryId = LibraryTypes.CountryTemplate;
    } else {
      this.libraryId = LibraryTypes.GlobalLibrary;
    }
  }



  ngAfterViewInit() {
    let sourceElement: any = {};
    sourceElement = {
      tablTypeHeader: document.querySelector('#coverpage-editor')
    };
    sourceElement = { tablTypeHeader: document.querySelector('#coverpage-editor') };
    MultirootEditor.create1(sourceElement, undefined, this.designerService.hashTagList, this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#insert-coverpage-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
        this.editor.setData({ tablTypeHeader: this.innerHtmlTableType });
      }).catch(err => {
        console.error(err.stack);
      });
    this.loadCkEditor();
  }

  loadCkEditor() {

    const request = new libraryRequestModel();
    request.LibraryType = this.libraryId;
    request.CoverPage = "";
    this.libraryService.getCoverPage(request).subscribe((getData: getCoverPage) => {
      this.editorData = getData;
      this.innerHtmlTableType = (getData.content) ? getData.content : "";
      this.ngxLoader.stopLoader(this.loaderId);
      this.editor.setData({ tablTypeHeader: this.innerHtmlTableType });
    })
  }

  saveDataLocal() {
    this.ngxLoader.startLoader(this.loaderId);
    let coverPageData;
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName === "tablTypeHeader") {
        coverPageData = this.editor.getData({ rootName: rootName });
      }
    }
    if (this.editorData && this.editorData.id) {
      const request = new libraryRequestModel();
      request.LibraryType = this.libraryId;
      request.CoverPage = coverPageData;
      this.updateContent(request, false);
    } else {
      const request = new libraryRequestModel();
      request.LibraryType = this.libraryId;
      request.CoverPage = coverPageData;
      this.addContent(request);
    }




  }

  addContent(request) {
    this.libraryService.addCoverPage(request).subscribe((response: any) => {
      if(response.status) {
        this.ngxLoader.stopLoader(this.loaderId);
        this.toastr.success(this.translate.instant('screens.project-designer.document-view.Cover-Page.Add'));
     
      }
      this.ref.close();
    })
  }

  updateContent(request, isClearAll) {

    this.libraryService.updateCoverPage(request).subscribe((response: any) => {
      if (isClearAll) {
        this.editor.setData({ tablTypeHeader: " " });
        if(response.status) {
          this.ngxLoader.stopLoader(this.loaderId);
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.Cover-Page.ClearAll'));
         
        }
      } else {
        if(response.status) {
          this.ngxLoader.stopLoader(this.loaderId);
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.Cover-Page.Update'));
         
        }
        this.ref.close();
      }
    })

  }

  deleteContent() {
    this.ngxLoader.startLoader(this.loaderId);
    let coverPageData = " ";
    const request = new libraryRequestModel();
    request.LibraryType = this.libraryId;
    request.CoverPage = coverPageData;
    this.updateContent(request, true);
  }

  dismiss() {
    this.ref.close();
  }

}
