import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../../services/designer.service';

@Component({
  selector: 'ngx-imported-blocks-partial-merge',
  templateUrl: './imported-blocks-partial-merge.component.html',
  styleUrls: ['./imported-blocks-partial-merge.component.scss']
})
export class ImportedBlocksPartialMergeComponent implements OnInit {
  blockContent:string= "";
  blockTitle:string="";
  constructor(protected ref: NbDialogRef<any>, private _eventService: EventAggregatorService,private designerService:DesignerService) { }

  ngOnInit() {
    this.designerService.partialMergeBlockTitle.subscribe(title=>
      {
        this.blockTitle=title;
      })
    this.designerService.partialMergeContent.subscribe(content=>
      {
        this.blockContent=content;
      })
  }
  onAddBlock() {
    let ele = document.getElementById('idBlockTitle') as HTMLElement;
    if (ele != undefined) {
      var title = ele['value'];
      let content = this.blockContent;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addBlocksPartialMerge).publish({ title, content });
    this.designerService.loadPartialMerge.next(false);
    this.designerService.partialMergeContent.next('');
    }
  }
  onCancel() {
    this.designerService.partialMergeContent.next('');
    this.designerService.loadPartialMerge.next(false);
  }

}
