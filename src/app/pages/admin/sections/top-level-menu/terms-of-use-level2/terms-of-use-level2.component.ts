import { Component, OnInit, ElementRef } from '@angular/core';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { TermsOfUseService } from '../../../services/terms-of-use.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-terms-of-use-level2',
  templateUrl: './terms-of-use-level2.component.html',
  styleUrls: ['./terms-of-use-level2.component.scss']
})
export class TermsOfUseLevel2Component implements OnInit {

  // To expand/collapse filters
  public show: boolean = true;
  public imageName: any = this.translate.instant("Collapse");;
  subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private readonly termsOfUseService: TermsOfUseService,
    private el: ElementRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this._eventService.getEvent(EventConstants.TermsOfUseToolbar).subscribe((payload: any) => {
      var tollbarDiv = document.getElementById("toolbar-menu");
      tollbarDiv.innerHTML = payload;
    });
  }

  toggleCollapse(){
    this.show = !this.show;
    if(this.show){
      this.imageName=this.translate.instant("collapse");
      document.getElementById('toolbar-menu').style.display =  'block';
    }
    else{
      this.imageName=this.translate.instant("expand");
      document.getElementById('toolbar-menu').style.display =  'none';
    }
  }

  saveTermsOfUseContent(action) {
    this._eventService.getEvent(EventConstants.TermsOfUse).publish(action);
  }
  publichTermsOfUseContent(action) {
    this._eventService.getEvent(EventConstants.TermsOfUse).publish(action);
  }

}
