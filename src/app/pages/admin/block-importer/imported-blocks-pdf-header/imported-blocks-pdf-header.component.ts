import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-imported-blocks-pdf-header',
  templateUrl: './imported-blocks-pdf-header.component.html',
  styleUrls: ['./imported-blocks-pdf-header.component.scss']
})
export class ImportedBlocksPdfHeaderComponent implements OnInit {

  constructor(private _eventService : EventAggregatorService) { }

  ngOnInit() {
  }
  selectedTab(tab){
    // var payload : any = {};
    // payload.action = tab.tabTitle;
    // this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).publish(payload);
  }
}
