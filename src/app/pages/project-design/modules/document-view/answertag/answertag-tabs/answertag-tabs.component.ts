import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-answertag-tabs',
  templateUrl: './answertag-tabs.component.html',
  styleUrls: ['./answertag-tabs.component.scss']
})
export class AnswertagTabsComponent implements OnInit {

  constructor(private _eventService : EventAggregatorService) { }

  ngOnInit() {
  }
  selectedTab(tab){
    var payload : any = {};
    payload.action = tab.tabTitle;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).publish(payload);
  }
}
