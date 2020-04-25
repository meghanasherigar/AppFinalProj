import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../@models/common/eventConstants';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { CreateBlockAttributesComponent } from '../../../project-design/modules/icon-view/manage-blocks/create-block-attributes/create-block-attributes.component';
import { DesignerService } from '../../../project-design/services/designer.service';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subscription } from 'rxjs';
@Component({
  selector: 'ngx-imported-blocks-pdf',
  templateUrl: './imported-blocks-pdf.component.html',
  styleUrls: ['./imported-blocks-pdf.component.scss']
})
export class ImportedBlocksPdfComponent implements OnInit,OnDestroy {
  fullContent: any;
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  disableCreate: boolean;
  subscriptions: Subscription = new Subscription();

  constructor(private designerService: DesignerService, protected ref: NbDialogRef<any>, private _eventService: EventAggregatorService, private dialogService: NbDialogService) { }

  ngOnInit() {    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.displayBlocks).subscribe((data: any) => {
      
      document.querySelector('#importedPDFContent').innerHTML = data;
    }));
  }
  cancelBlockImporter() {
    this.ref.close();
  }
  loadCreateBlock() {
    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  showSelectedText() {
    
    var text: any;
    var htmlContent = document.createElement('html');
    if (window.getSelection) {
      text = window.getSelection();
      if (text.rangeCount) {
        var element = document.getElementById("importedPDFContent");
        var styleNode: any;
        element.childNodes.forEach(x => {
          if (x.nodeName.toLowerCase() == 'style')
            styleNode = x;
        })
        if (styleNode != undefined) {
          var htmlHead = document.createElement('head');
          htmlHead.appendChild(styleNode);
          htmlContent.appendChild(htmlHead);
        }
        var htmlDiv = document.createElement('div');
        var elementAdd=document.getElementById("addPDFContent");        
        for (var i = 0; i < text.rangeCount; i++) {
          var htmlCode = window.getSelection().getRangeAt(i).cloneContents();
          htmlDiv.appendChild(htmlCode);
        }
        elementAdd.appendChild(htmlDiv);
      }
    } else if (document.getSelection() && document.getSelection().type != "Control") {
    }
    this.designerService.blockImporterSelectedText = htmlContent.innerHTML;
    this.designerService.blockImporterSelectedText = elementAdd.innerHTML;    
    if (!text)
      this.disableCreate = false;
    else
    this.disableCreate = true;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

