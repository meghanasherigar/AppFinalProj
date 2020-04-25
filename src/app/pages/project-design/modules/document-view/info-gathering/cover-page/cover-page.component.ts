import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import MultirootEditor from '../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { Subscription } from 'rxjs';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { InformationRequestViewModel } from '../../../../../../@models/projectDesigner/task';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TaskService } from '../../services/task.service';
import { DesignerService } from '../../../../services/designer.service';
import { BlockAttributeRequest } from '../../../../../../@models/projectDesigner/block';
import { Index, createInfoLabels } from '../../../../../../@models/projectDesigner/infoGathering';
@Component({
  selector: 'ngx-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.scss']
})
export class CoverPageComponent implements OnInit {
  public editorValues: any = '';
  public readonly: boolean;
  editor: any;
  subscriptions: Subscription = new Subscription();
  saveRequestModel: InformationRequestViewModel = new InformationRequestViewModel();
  contentBody: string;
  selectionChange: boolean = false;
  firstTime: any = true;
  constructor(
    private taskService: TaskService,
    private readonly _eventService: EventAggregatorService,
    private readonly _sharedService: ShareDetailService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private dialogService: DialogService) { }

  ngOnInit() {
    this.taskService.getCoverpage(this.designerService.infoGatheringUpdateId).subscribe(data => {

    });
    //changing the language.
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (document.querySelector('#toolbar-menu') != undefined) {
        document.querySelector('#toolbar-menu').childNodes.forEach(x => {
          if (x.isEqualNode(this.editor.ui.view.toolbar.element))
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
        });
      }
      if (this.editor != undefined)
        this.editor.destroy();
      this.editor = undefined;
      this.createEditor();
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.clearCoverPage).subscribe(() => {
      let newInfo = new InformationRequestViewModel();
      this.designerService.informationRequestModel = newInfo;
      document.querySelector('#editor').innerHTML = "";
      this.contentBody = "";

      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.clearInfoPreview).publish("clearInfo");
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).subscribe((payload) => {
      if (payload == Index.three) {
        if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTime) {
          this.editor.setData({ coverPageheader: this.designerService.infoDraftResponseModel.CoverPage });
          this.firstTime = false;
        }
        this.saveDataLocal();
      }
    }));
  }

  ngAfterViewInit() {
    this.createEditor();
  }

  private createEditor() {
    let sourceElement = {
      coverPageheader: document.querySelector('#editor')
    };
    MultirootEditor.create1(sourceElement, undefined, undefined, this.designerService.definedColorCodes, this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
      })
      .catch(err => {
        console.error(err.stack);
      });
  }

  coverPageChange() {
    this.saveDataLocal();
  }
  saveDataLocal() {
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName == "coverPageheader") {
        this.contentBody = this.editor.getData({ rootName });
      }
    }
    if (this.designerService.isDeliverableSelected)
      this.designerService.deliverableInformationRequestModel.forEach(x => {
        x.CoverPage = this.contentBody;
      })
    else
      this.designerService.informationRequestModel.CoverPage = this.contentBody;


  }

  //to do later should be removed
  // toolbar = [
  //   { name: 'styles', items: ['Font', 'FontSize', 'lineheight'] },
  //   { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
  //   { name: 'insert', items: ['SpecialChar'] },
  //   { name: 'link', items: ['Link'] },
  //   { name: 'editing', items: ['Find'] }, '/',
  //   { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Superscript', '-', 'RemoveFormat'] },
  //   { name: 'tools', items: ['Maximize', 'Zoom'] },
  //   { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates', 'zoom'] },
  //   { name: 'colors', items: ['TextColor', 'BGColor'] },
  //   { name: 'insert', items: ['SpecialChar'] },
  // ];
  // config = { toolbar: null, height: '400', width: '100%', readOnly: true, extraPlugins: 'divarea' };

}
