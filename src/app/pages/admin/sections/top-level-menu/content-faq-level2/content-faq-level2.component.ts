import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Category } from '../../../../../@models/admin/contentFAQ';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { debug } from 'util';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-content-faq-level2',
  templateUrl: './content-faq-level2.component.html',
  styleUrls: ['./content-faq-level2.component.scss']
})
export class ContentFaqLevel2Component implements OnInit,OnDestroy {

  subscriptions: Subscription = new Subscription();
  filteredDataModel = new Category();
  disable: boolean = true;
  public show: boolean = true;
  imageNameFlag: boolean;
  imageName:String;
  
  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private el: ElementRef,
      private  _sharedService: SharedAdminService,
      private translate: TranslateService) { }



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
    this._sharedService.enableDeleteButtonflag.subscribe(flag => this.disable = flag);
  }

  saveFAQ(action) {
    this._eventService.getEvent(EventConstants.ContentFAQ).publish(action);
  }
  publishFAQ(event) {
    this._eventService.getEvent(EventConstants.ContentFAQ).publish("Publish");
  }

  deleteCategoriesOrQuestions() {
    this._eventService.getEvent(EventConstants.ContentFAQ).publish("Delete");
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
