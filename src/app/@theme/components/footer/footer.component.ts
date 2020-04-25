import { Component } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { PrivacyPolicyComponent } from '../../../shared/privacyandlegal/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../../../shared/privacyandlegal/terms-of-use/terms-of-use.component';
import { ShareDetailService } from '../../../shared/services/share-detail.service';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})

// <span class="created-by">{{'main.createdWith' | translate}}
// {{'main.by' | translate}} <b><a href="#" target="_blank">{{'main.deloitte' | translate}}</a></b> 2019</span>


export class FooterComponent {
 
  constructor( private dialogService: NbDialogService){
  
  }

  
  generatePrivacyPolicy() {
    this.dialogService.open(PrivacyPolicyComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    return false;
  }
  generateTermsofUse() {
    this.dialogService.open(TermsOfUseComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    return false;
  }
}
