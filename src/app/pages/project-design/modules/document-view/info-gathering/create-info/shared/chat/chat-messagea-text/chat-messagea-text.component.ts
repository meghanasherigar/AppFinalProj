import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommentsDomainModel } from '../../../../../../../../../@models/projectDesigner/task';
import { eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { DialogTypes } from '../../../../../../../../../@models/common/dialog';
import { StorageService } from '../../../../../../../../../@core/services/storage/storage.service';
import { DialogService } from '../../../../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'ngx-chat-message-text',
  templateUrl: './chat-messagea-text.component.html',
  styleUrls: ['./chat-messagea-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageaTextComponent implements OnInit {

  leftClass = "text-left"
  rightClass = "text-right"
  currentClass: string = "text-left"
  @Input() sender: string;

  @Input() message: string;
  @Input() msg: CommentsDomainModel
  @Input()
  id: string;

  @Input()
  parentId: string;
  @Input() date: Date;

  @Input() reply: boolean;
  constructor(private _eventService: EventAggregatorService, private storageService: StorageService,
    private dialogService: DialogService, private translate: TranslateService) { }

  ngOnInit() {
  }
  replyCheck() {
    if (this.reply) {
      if (this.currentClass == this.leftClass) {
        this.currentClass = this.rightClass;
      }
      else {
        this.currentClass = this.leftClass;
      }
    }
    return this.currentClass;
  }
  edit() {
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));
    let loggedInUserEmail = currentUser.profile.email;
    if (this.msg.auditTrail.createdBy.email == loggedInUserEmail) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.editMessageSelected).publish(this.msg)
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.editOrDeleteComment'));
    }
  }
  delete() {
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));
    let loggedInUserEmail = currentUser.profile.email;
    if (this.msg.auditTrail.createdBy.email == loggedInUserEmail) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.deleteMessageSelected).publish(this.msg)
    }
    else {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.editOrDeleteComment'));
    }
  }
}
