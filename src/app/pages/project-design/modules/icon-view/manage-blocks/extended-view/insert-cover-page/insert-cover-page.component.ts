import { Component, OnInit, AfterViewInit } from '@angular/core';
import MultirootEditor from '../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { DesignerService } from '../../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { NbDialogRef } from '@nebular/theme';
import { CustomHTML } from '../../../../../../../shared/services/custom-html.service';
import { QuestionTagViewModel, insertCoverPage, coverPageResponse, updateInsertCoverPageRequest } from '../../../../../../../@models/projectDesigner/task';
import { TaskService } from '../../../../document-view/services/task.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { GenericResponse } from '../../../../../../../@models/ResponseStatus';
import { coverPage } from '../../../../../../../@models/projectDesigner/designer';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
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
  editorData: coverPageResponse;
  innerHtmlTableType: string = '';
  questionTag = new QuestionTagViewModel();
  subscriptions: Subscription = new Subscription();

  loaderId = 'CoverPageLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private designerService: DesignerService, protected ref: NbDialogRef<any>, private customHTML: CustomHTML, private taskService: TaskService, private readonly _sharedService: ShareDetailService,
    private translate: TranslateService, private toastr: ToastrService, private dialogService: DialogService, private ngxLoader: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxLoader.startLoader(this.loaderId);
    let projectDetail = this._sharedService.getORganizationDetail();
    if (this.designerService.isDeliverableSection) {
      this.questionTag.deliverableId = this.designerService.deliverableDetails.entityId;
      this.questionTag.projectid = projectDetail.projectId;
      this.questionTag.templateId = null;
    } else {
      this.questionTag.templateId = this.designerService.templateDetails.templateId;
      this.questionTag.projectid = projectDetail.projectId;
      this.questionTag.deliverableId = null;
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
    let templateOrDeliverableId = (this.designerService.isDeliverableSection) ? this.questionTag.deliverableId : this.questionTag.templateId;
    this.taskService.getInsertCoverpage(this.questionTag.projectid, templateOrDeliverableId).subscribe((getData: coverPageResponse) => {
      this.editorData = getData;
      this.innerHtmlTableType = (getData.coverPage && !getData.coverPage.isDefaultCoverPage) ? getData.coverPage.content : "";
      this.ngxLoader.stopLoader(this.loaderId);
      this.editor.setData({ tablTypeHeader: this.innerHtmlTableType });
    });
  }

  saveDataLocal() {
    this.ngxLoader.startLoader(this.loaderId);
    let templateOrDeliverableId = (this.designerService.isDeliverableSection) ? this.questionTag.deliverableId : this.questionTag.templateId;
    let coverPageData;
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName === "tablTypeHeader") {
        coverPageData = this.editor.getData({ rootName: rootName });
      }
    }
    if (this.editorData.coverPage && this.editorData.coverPage.id) {
      let request = new updateInsertCoverPageRequest();
      request.id = this.editorData.coverPage.id;
      request.projectId = this.questionTag.projectid;
      request.templateOrDeliverableId = templateOrDeliverableId;
      request.auditTrail = null;
      request.content = coverPageData;
      request.contentType = coverPage.contentType;
      request.isTemplate = (this.designerService.isDeliverableSection) ? false : true;
      request.watermark = null;
      request.uId = this.editorData.coverPage.uId;
      request.isDefaultCoverPage = false;
      this.updateContent(request, false);
    } else {
      let request = new insertCoverPage();
      request.id = null;
      request.projectid = this.questionTag.projectid;
      request.templateordeliverableid = templateOrDeliverableId;
      request.content = coverPageData;
      request.contenttype = coverPage.contentType;
      request.istemplate = (this.designerService.isDeliverableSection) ? false : true;
      request.watermark = null;
      request.margin = null;
      request.isDefaultCoverPage = false;
      this.addContent(request);
    }




  }

  deleteContent() {
    this.ngxLoader.startLoader(this.loaderId);
    let templateOrDeliverableId = (this.designerService.isDeliverableSection) ? this.questionTag.deliverableId : this.questionTag.templateId;
    let coverPageData = " ";
    let request = new updateInsertCoverPageRequest();
    request.id = this.editorData.coverPage.id;
    request.projectId = this.questionTag.projectid;
    request.templateOrDeliverableId = templateOrDeliverableId;
    request.auditTrail = null;
    request.content = coverPageData;
    request.contentType = coverPage.contentType;
    request.isTemplate = (this.designerService.isDeliverableSection) ? false : true;
    request.watermark = null;
    request.uId = this.editorData.coverPage.uId;
    this.updateContent(request, true);
  }

  addContent(request) {
    this.taskService.addInsertCoverPage(request).subscribe((response: GenericResponse) => {
      if(response.status) {
        this.ngxLoader.stopLoader(this.loaderId);
        this.toastr.success(this.translate.instant('screens.project-designer.document-view.Cover-Page.Add'));
        
      }
      this.ref.close();
    })
  }

  updateContent(request, isClearAll) {

    this.taskService.updateInsertCoverPage(request).subscribe((response: GenericResponse) => {
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

  dismiss() {
    this.ref.close();
  }

}
