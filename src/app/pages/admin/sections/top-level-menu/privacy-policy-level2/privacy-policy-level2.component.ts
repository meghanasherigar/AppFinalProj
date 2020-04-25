import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { PrivacyPolicyService } from '../../../services/privacy-policy.service';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-privacy-policy-level2',
  templateUrl: './privacy-policy-level2.component.html',
  styleUrls: ['./privacy-policy-level2.component.scss']
})
export class PrivacyPolicyLevel2Component implements OnInit,OnDestroy {
  ngOnDestroy(): void {
   this.subscriptions.unsubscribe();
  }
  imageName:any=this.translate.instant("Collapse");
  // To expand/collapse filters
  public show: boolean = true;
  // public imageName: any = 'Expand';
  
  subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private readonly privacyPolicyService: PrivacyPolicyService,
    private el: ElementRef,
    private service:SharedAdminService,
    private translate: TranslateService
    ) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.PrivayPolicyToolbar).subscribe((payload:any) => {
    var tollbarDiv = document.getElementById("toolbar-menu");
    tollbarDiv.innerHTML = payload;
    }));
  }

  // toggleCollapse() {
  //   this.show = !this.show;
  //   let entityTag = <HTMLInputElement>document.getElementById("privacyPolicy-Menu");

  //   // To change the name of image.
  //   if (this.show) {
  //     entityTag.classList.remove('collapsed');
  //     this.imageName = "Collapse";
  //   }
  //   else {
  //     this.imageName = "Expand";
  //     entityTag.classList.add('collapsed');
  //   }
  // }

  savePrivacyPolicy(action)
  {
    this._eventService.getEvent(EventConstants.PrivacyPolicy).publish(action);
  }
  publichPrivacyPolicy(action)
  {
    this._eventService.getEvent(EventConstants.PrivacyPolicy).publish(action);
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

}
