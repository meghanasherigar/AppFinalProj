import { Component, OnInit, ElementRef } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Category } from '../../../../../@models/admin/contentFAQ';
import {ContentFaqService} from  '../../../../admin/services/content-faq.service';

@Component({
  selector: 'ngx-content-whatsnew-level2',
  templateUrl: './content-whatsnew-level2.component.html',
  styleUrls: ['./content-whatsnew-level2.component.scss']
})
export class ContentWhatsnewLevel2Component implements OnInit {

  public show: boolean = false;
  public imageName: any = 'Expand';
  subscriptions: Subscription = new Subscription();
  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private readonly _contentFAQService:ContentFaqService, private el: ElementRef) { }

    filteredDataModel = new Category();
  ngOnInit() {

    // this.subscriptions.add(this._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).subscribe((payload) => {
    //   let downloadTag=this.el.nativeElement.querySelector("#downloadIcon");
    //   if(payload == true)
    //   {
    //     downloadTag.classList.add("disable-section");
    //     downloadTag.classList.add("disabledbutton");
    //   }
    //   else if(payload == false)
    //   {
    //     downloadTag.classList.remove("disable-section");
    //     downloadTag.classList.remove("disabledbutton");
    //   }
    // }));
    
  }

  saveFAQ(action)
  {
    this._eventService.getEvent(EventConstants.ContentWhatsNew).publish("Publish");
    // this._eventService.getEvent(EventConstants.ContentWhatsNew).publish(action);
    // this._contentFAQService. (this.filteredDataModel)
    //   .subscribe(data => {
        
    //   }InsertUpdateFAQ
    //   ),
    //   error => {
    //     console.log('Error inserting or updating FAQs.')
    //   },
    //   () => console.info('OK');
    //   return false;
  }
  publishFAQ(event)
  {
    this._eventService.getEvent(EventConstants.ContentWhatsNew).publish("Publish");
  }

  
  toggleCollapse() {
    this.show = !this.show;
    let entityTag = this.el.nativeElement.querySelector("#homeFilters-section");

    // To change the name of image.
    if (this.show) {
      entityTag.classList.remove('collapsed');
      this.imageName = "Collapse";

    }
    else {
      this.imageName = "Expand";
      entityTag.classList.add('collapsed');
    }
  }
}
