import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import MultirootEditor from '../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { DesignerService } from '../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss']
})
export class TableOfContentsComponent implements OnInit {

  constructor(protected ref:NbDialogRef<any>,
    private designerService:DesignerService,
    private readonly _eventService: EventAggregatorService, private translate: TranslateService) { }
    value:string="";
    editor:any;
  ngOnInit() {
  }
  ngAfterViewInit() {
    let sourceElement: any = {};
    sourceElement["header"] = document.querySelector('#editor-TOC');
    MultirootEditor.create1(sourceElement,undefined,undefined,this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu-TOC').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
          this.editor.setData
          ({ header:this.value });
      })
      .catch(err => {
        console.error(err.stack);
      });

  }
  editHeader()
  {
    var data="";
    let headerNames = this.editor.model.document.getRootNames();
    for (const rootName of headerNames) {
      if (rootName == "header") {
        data = this.editor.getData({ rootName });
      }
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.tableOfContentType).publish(data);
    this.dismiss();
  }
  dismiss()
  {
    this.ref.close();
  }
}
