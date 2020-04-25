import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { DesignerService } from '../../../project-design/services/designer.service';

@Component({
  selector: 'ngx-project-setting-toolbar',
  templateUrl: './project-setting-toolbar.component.html',
  styleUrls: ['./project-setting-toolbar.component.scss']
})
export class ProjectSettingToolbarComponent implements OnInit {
  dataModified:boolean=false;
  currentSubscriptions: Subscription = new Subscription();

  constructor(private readonly _eventService: EventAggregatorService,
    private designerService:DesignerService) { }

  ngOnInit() {
    this.currentSubscriptions.add(this._eventService.getEvent(EventConstants.ProjectSettingsValueAnyChange).subscribe((payload) => {
      if(payload==true)
      this.dataModified=true;
      else
      this.dataModified=false;
    }));
  }

  saveData()
  {
      if(!this.designerService.disabledButton)
      this._eventService.getEvent(EventConstants.ProjectSettingsSave).publish(true);
      this.dataModified=false;
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }
}
