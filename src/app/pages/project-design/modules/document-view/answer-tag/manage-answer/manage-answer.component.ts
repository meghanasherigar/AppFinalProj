import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';


@Component({
  selector: 'ngx-manage-answer',
  templateUrl: './manage-answer.component.html',
  styleUrls: ['./manage-answer.component.scss']
})
export class ManageAnswerComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  isEntityTabActive: any;
  constructor(private _eventService: EventAggregatorService) { 

  
  }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.systemTagDefaultActive).subscribe(data => {
      this.isEntityTabActive = data;
    }));    
  }
  
  selectedTab(tab){
       if(tab.tabTitle=="Entity Variable"){
         this.isEntityTabActive = true;
    }
    else
    {
      this.isEntityTabActive=false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.systemTabSelection).publish(tab.tabTitle);
  
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}

