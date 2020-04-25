import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { UploadAppendicesComponent } from '../../appendices/upload-appendices/upload-appendices.component';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ActionOnAppendix } from '../../../../../../@models/projectDesigner/appendix';
import { AssociateAppendicesComponent } from '../../appendices/associate-appendices/associate-appendices.component';
import { TranslateService } from '@ngx-translate/core';
import { DiaasociateAppendicesComponent } from '../../appendices/diaasociate-appendices/diaasociate-appendices.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-appendices-level2-menu',
  templateUrl: './appendices-level2-menu.component.html',
  styleUrls: ['./appendices-level2-menu.component.scss']
})
export class AppendicesLevel2MenuComponent implements OnInit {

  private dialogTemplate: Dialog;
  subscriptions: Subscription = new Subscription();
  isUploadDisabled: boolean = false;
  isDownloadDisabled: boolean = true;
  isDeleteDisabled: boolean = true;
  isAssociateDisabled: boolean = true;
  isDisassociateDisabled: boolean = true;

  constructor(private DialogService: NbDialogService,
    private _eventService: EventAggregatorService,
    private dialog: MatDialog,
    private translate: TranslateService
    ) { }

  ngOnInit() {

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.enableIcon).subscribe((payload: any = []) => {
      if(payload.length == 0){
        this.isUploadDisabled = false;
        this.isDownloadDisabled = true;
        this.isDeleteDisabled = true;
        this.isAssociateDisabled = true;
        this.isDisassociateDisabled = true;
      }
      else{
        if(payload.length == 1){
          this.isAssociateDisabled = false;
          this.isDisassociateDisabled = false;     
        }
        else{
          this.isAssociateDisabled = false;
          this.isDisassociateDisabled = true;  
        }
        this.isDownloadDisabled= false;
        this.isDeleteDisabled = false;
        this.isUploadDisabled = true;
      } 
    }));
  }

  uploadAppendicePopup(){
    this.DialogService.open(UploadAppendicesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  downloadAppendices() {
    let payLoad = ActionOnAppendix.download;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(payLoad);
  }


  openDeleteConfirmDialog(){

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.DeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAppendices();
      }
    });
  }

  deleteAppendices() {
    let payLoad = ActionOnAppendix.delete;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(payLoad);
  }

  associateAppendicePopup(){
    this.DialogService.open(AssociateAppendicesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }

  diaasociateAppendicePopup(){
    this.DialogService.open(DiaasociateAppendicesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }

}
