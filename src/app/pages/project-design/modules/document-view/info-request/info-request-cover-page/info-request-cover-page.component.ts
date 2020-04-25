import { Component, OnInit, Input, PipeTransform, Pipe } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-info-request-cover-page',
  templateUrl: './info-request-cover-page.component.html',
  styleUrls: ['./info-request-cover-page.component.scss']
})
export class InfoRequestCoverPageComponent implements OnInit {

  coverPage: any = '';
  subscriptions: Subscription = new Subscription();
  constructor(private _eventService: EventAggregatorService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadcoverpage).subscribe((payload) => {
      this.coverPage = payload;
    }));
  }

}
