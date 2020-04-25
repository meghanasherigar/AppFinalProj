import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';
import { FormsModule } from '@angular/forms';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { NbCardModule } from '@nebular/theme';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
  declarations: [PrivacyPolicyComponent, TermsOfUseComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxUiLoaderModule,
    NbCardModule
    
  ],
  entryComponents: [
    PrivacyPolicyComponent,
    
    TermsOfUseComponent
  ],
  exports: [PrivacyPolicyComponent, TermsOfUseComponent]
})
export class PrivacyLegalModule { }
