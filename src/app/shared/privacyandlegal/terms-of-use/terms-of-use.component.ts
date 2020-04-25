import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TermsOfUseService } from '../../services/privacyandlegal/terms-of-use.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';


@Component({
  selector: 'ngx-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {
  public termsofUseContent: string;

  constructor(protected dialogRef: NbDialogRef<any>,
    private termsOfUseService: TermsOfUseService,
    private ngxLoader: NgxUiLoaderService,private translationService: TranslateService,

    private translate: TranslateService) { }
    termsOfUse: string=this.translate.instant('screens.footer.termsOfUse');

    loaderId='TermsOfUsedLoader';
    loaderPosition=POSITION.centerCenter;
    loaderFgsType=SPINNER.ballSpinClockwise; 
    loaderColor = '#55eb06';


  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.getLastPublishedData('');
  }

  getLastPublishedData(userType: string) {
    this.termsOfUseService.getLastPublishedData(userType).subscribe(response => {
      if (response) {
        this.termsofUseContent = response.termsOfUseContent != null ? response.termsOfUseContent :
        this.translate.instant('screens.project-setup.common.not_published')
      }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }),
        (error) => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          console.log(error);
        }
    }

  onClose()
  {
    this.dialogRef.close();
  }
}
