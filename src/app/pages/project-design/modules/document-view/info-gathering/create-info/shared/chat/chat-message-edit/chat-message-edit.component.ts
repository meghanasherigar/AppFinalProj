import { Component, OnInit, Input } from '@angular/core';
import { CommentsDomainModel } from '../../../../../../../../../@models/projectDesigner/task';
import { eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-chat-message-edit',
  templateUrl: './chat-message-edit.component.html',
  styleUrls: ['./chat-message-edit.component.scss']
})
export class ChatMessageEditComponent implements OnInit {

  @Input() sender: string;
  leftClass = "text-left"
  rightClass = "text-right"
  currentClass: string = "text-left"
  @Input() message: string;
  @Input() msg: CommentsDomainModel
  @Input()
  id: string;
  @Input()
  position: number;
  @Input()
  parentId: string;
  @Input() date: Date;
  @Input() reply: boolean;

  constructor(private eventService: EventAggregatorService) { }

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
  update(msgmodel: CommentsDomainModel) {
    let messageDetail: { "message": CommentsDomainModel, "position": number } = { message: new CommentsDomainModel, position: null };
    messageDetail.message = msgmodel;
    messageDetail.position = this.position;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.editChatMessage).publish(messageDetail);
  }
}
