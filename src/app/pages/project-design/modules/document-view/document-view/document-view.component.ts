import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit {

  constructor(private router: Router, private readonly eventService: EventAggregatorService) { }

  ngOnInit() {
    const currentUrl = '/#/pages/project-design/projectdesignMain/iconViewMain/';
    this.eventService.getEvent(EventConstants.ActivateMenu).publish(currentUrl);
  }

}
