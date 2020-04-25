import { Component, OnInit,ElementRef, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { Subscription, Subject } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Category } from '../../../../../@models/admin/contentFAQ';
import {ContentFaqService} from  '../../../../admin/services/content-faq.service';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
@Component({
  selector: 'ngx-content-faq-level2',
  templateUrl: './content-faq-level2.component.html',
  styleUrls: ['./content-faq-level2.component.scss']
})
export class ContentFaqLevel2Component implements OnInit,OnDestroy {
  ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
  }
  searchText: string = "";
  subscriptions: Subscription = new Subscription();
  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private readonly _contentFAQService:ContentFaqService, private el: ElementRef, private sharedService: ShareDetailService) { }

    filteredDataModel = new Category();
  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.ContentToolbarFAQ).subscribe((payload) => {
      let downloadTag=this.el.nativeElement.querySelector("#downloadIcon");
      
      if(payload == true)
      {
        downloadTag.classList.add("disable-section");
        downloadTag.classList.add("disabledbutton");
      }
      else if(payload == false)
      {
        downloadTag.classList.remove("disable-section");
        downloadTag.classList.remove("disabledbutton");
      }
    }));
  
  }

  onSearch(event)
  {
    this.sharedService.faqSearch.next(this.searchText);
  }
  saveFAQ(action)
  {
    this._eventService.getEvent(EventConstants.ContentFAQ).publish(action);
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
    this._eventService.getEvent(EventConstants.ContentFAQ).publish("Publish");
  }
}
