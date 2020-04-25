import { Component, OnInit } from '@angular/core';
import { EmailDetails, Email } from '../../../../../@models/common/commonmodel';
import { SendemailsComponent } from '../../../../common/sendemails/sendemails.component';
import { NbDialogService } from '@nebular/theme';
import { DesignerService } from '../../../services/designer.service';
import { MatDialog } from '@angular/material';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AttributesOptions } from '../../../@models/block-suggestion';

@Component({
  selector: 'ngx-block-suggestion-level2',
  templateUrl: './block-suggestion-level2.component.html',
  styleUrls: ['./block-suggestion-level2.component.scss']
})
export class BlockSuggestionLevel2Component implements OnInit {

  show: boolean = true;
  imageName: string = this.translate.instant("collapse");

  constructor(private dialogService: NbDialogService,protected designerService: DesignerService, private readonly _eventService: EventAggregatorService,  
    private dialogPopService: DialogService, private translate: TranslateService) { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.imageName = this.translate.instant("collapse");
    } else {
      this.imageName = this.translate.instant("expand");
    }
  }

  acceptBlock() {
    let prevBlockDetails = this.designerService.blockDetails;
    this.designerService.acceptORreject = true;
    const toEmail = new Array<Email>();
    let email= new Email();
    email.email = prevBlockDetails.suggestedUserEmailId
    toEmail.push(email);
    let emailDetails: EmailDetails = new EmailDetails();
    emailDetails.isToDisabled = true;
    emailDetails.isCCDisabled = false;
    emailDetails.to = toEmail;
    emailDetails.isGenericMailer = true;

    const sendReminderRef = this.dialogService.open(SendemailsComponent,
      {
        closeOnBackdropClick: false,
        closeOnEsc: true,
      });
    sendReminderRef.componentRef.instance.emailDetails = emailDetails;
    //Add project related properties to search for only project-template-deliverable users
  }

  rejectBlock() {
    let prevBlockDetails = this.designerService.blockDetails;
    this.designerService.acceptORreject = false;
    const toEmail = new Array<Email>();
    let email= new Email();
    email.email = prevBlockDetails.suggestedUserEmailId
    toEmail.push(email);
    let emailDetails: EmailDetails = new EmailDetails();
    emailDetails.isToDisabled = true;
    emailDetails.isCCDisabled = false;
    emailDetails.to = toEmail;
    emailDetails.isGenericMailer = true;

    const sendReminderRef = this.dialogService.open(SendemailsComponent,
      {
        closeOnBackdropClick: false,
        closeOnEsc: true,
      });
    sendReminderRef.componentRef.instance.emailDetails = emailDetails;

  }

  toggleBlockAttributeComponent() {
    // this.designerService.isGLobal = false;
    if(this.designerService.blockDetails !== null)  {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(AttributesOptions.BlockAttributes);
    } else {
      this.dialogPopService.Open(DialogTypes.Warning, this.translate.instant('screens.user.AdminView.Library.SelectBlocks'));
    }
  }

}
