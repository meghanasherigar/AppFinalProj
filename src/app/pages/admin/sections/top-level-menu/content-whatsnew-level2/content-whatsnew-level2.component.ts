import { Component, OnInit, ElementRef } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Category } from '../../../../../@models/admin/contentFAQ';
import {ContentFaqService} from  '../../../../admin/services/content-faq.service';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-content-whatsnew-level2',
  templateUrl: './content-whatsnew-level2.component.html',
  styleUrls: ['./content-whatsnew-level2.component.scss']
})
export class ContentWhatsnewLevel2Component implements OnInit {

  public show: boolean = true;
  imageNameFlag: boolean;
  imageName:String;
  subscriptions: Subscription = new Subscription();
  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private readonly _contentFAQService:ContentFaqService, private el: ElementRef,  private _sharedService: SharedAdminService,
    private translate: TranslateService) { }

    filteredDataModel = new Category();
  ngOnInit() {
    this._sharedService.imageNameFlag.subscribe(image => {
      this.imageNameFlag = image;
      if (this.imageNameFlag == true) {
        this.imageName=this.translate.instant("collapse");  
      }
      else {
        this.imageName=this.translate.instant("expand");
      }
    });
  }

  saveFAQ(action)
  {
    this._eventService.getEvent(EventConstants.ContentWhatsNew).publish(action);
  }
  publishFAQ(event)
  {
    this._eventService.getEvent(EventConstants.ContentWhatsNew).publish("Publish");
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this._sharedService.setImageNameFlag(false);
  }
  
  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this._sharedService.setImageNameFlag(true);
      document.getElementById('toolbar-menu').style.display =  'block';
    
    }
    else {
      document.getElementById('toolbar-menu').style.display =  'none';
      this._sharedService.setImageNameFlag(false);

    }
  }
}
