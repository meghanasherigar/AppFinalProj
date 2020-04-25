import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { PrivacyPolicyService } from '../../services/privacyandlegal/privacy-policy.service';
import { PrivacyStatementResponceViewModel } from '../../../@models/admin/privacyPolicy';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})


export class PrivacyPolicyComponent implements OnInit {
  public privacyPolicyContent: string;
  constructor(protected dialogRef: NbDialogRef<any>,
    private privacyPolicyService: PrivacyPolicyService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService) { }


    privacyPolicy: string=this.translate.instant('screens.footer.privacyPolicy');

  loaderId = 'PrivacyPolicyLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.getLastPublishedData('');
  }

  getLastPublishedData(userType: string) {
    this.privacyPolicyService.getLastPublishedData(userType).subscribe(response => {
      if (response) {
        this.privacyPolicyContent = response.privacyStatementContent != null ? response.privacyStatementContent :
          this.translate.instant('screens.project-setup.common.not_published')
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      }
  }

  onClose() {
    this.dialogRef.close();
  }
}
