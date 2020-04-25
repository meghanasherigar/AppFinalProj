import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommentDomainModelArray, CommentsDomainModel } from '../../../../../../../../../@models/projectDesigner/task';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { DialogService } from '../../../../../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { enterButtonKeyCode } from '../../../../../../../../../@models/common/valueconstants';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'ngx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  dialogTemplate: any;
  @Input()
  messages: CommentsDomainModel[]
  @Input()
  position: number
  @Input()
  tabDetail: boolean;
  message: string = ""
  isEditId: string = "";
  isEditNumber: number = null;
  chatBoxTextBoxPlaceHolder: string;
  dialogRef: MatDialogRef<ConfirmationDialogComponent, any>
  constructor(private eventService: EventAggregatorService, private dialog: DialogService,
    private dialogService: MatDialog,
    private _eventService: EventAggregatorService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.afterEditMessage).subscribe(() => {
      this.isEditNumber = null;
      this.isEditId = "";
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.editMessageSelected).subscribe((payload: CommentsDomainModel) => {
      this.edit(payload);
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.deleteMessageSelected).subscribe((payload: CommentsDomainModel) => {
      this.delete(payload);
    }))
    this.chatBoxTextBoxPlaceHolder = this.translate.instant('screens.project-designer.document-view.info-request.chatBoxTextBoxPlaceHolder');
  }
  sendmessage() {
    if (this.message != "") {
      let messageDetail: { "message": string, "position": number, isExternal: boolean } = { position: null, message: "", isExternal: null }
      messageDetail.message = this.message;
      messageDetail.position = this.position;
      messageDetail.isExternal = this.tabDetail;
      this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.sendChatMessage).publish(messageDetail);
      this.message = "";
    }
  }
  edit(msg: CommentsDomainModel) {
    if (msg.id == null) {
      this.isEditNumber = msg.index;
    }
    else {
      this.isEditId = msg.id;
    }

  }
  delete(msg: CommentsDomainModel) {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = "Are you sure you want to delete you comment";
    if (this.dialogService.openDialogs.length == 0) {
      this.dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
        data: this.dialogTemplate
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let messageDetail: { "message": CommentsDomainModel, "position": number } = { message: new CommentsDomainModel, position: null };
          messageDetail.message = msg;
          messageDetail.position = this.position;
          this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.deleteChatMessage).publish(messageDetail);
          this.dialogRef = null
        }
        else {
          this.dialogRef.close();
          this.dialogRef = null;
        }
      });
    }
  }
  commetReplyCheck(index) {
    if (this.messages[index - 1] && this.messages[index - 1].auditTrail.createdBy.email != this.messages[index].auditTrail.createdBy.email) {
      return true;
    }
    else {
      return false;
    }
  }

  onEnter(event) {
    if (event.keyCode == enterButtonKeyCode.value) {
      this.sendmessage();
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
