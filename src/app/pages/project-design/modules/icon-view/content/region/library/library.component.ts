import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {
  selectedLibrary:string="";
  subscriptions: Subscription = new Subscription();

  constructor(private readonly _eventService: EventAggregatorService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).subscribe((data:any) => {
      this.selectedLibrary = data.library.name;
    }));

  }

  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }

}
