import { Component, OnInit, SchemaMetadata } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';
import { Alert, AlertType } from '../../../@models/alert';

@Component({
  selector: 'ngx-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})

export class MessagesComponent implements OnInit {

constructor(public messageService: AlertService) {}
  messages: Alert[] = [];
  ngOnInit() {
    this.messageService.getAlert().subscribe(alert => {
      this.messages.push(alert);
  });
  }
onClose(alert: Alert) {
    this.messages.forEach( (item, index) => {
      if (item === alert) this.messages.splice(index, 1);
    });
}
  clear() {
    this.messages = [];
  }

  getStatus(alertType: AlertType) {
    let cssClass: string;
    switch(alertType) {
      case AlertType.Error:
      cssClass = 'danger';
      break;
      case AlertType.Info:
      cssClass = 'info';
      break;
      case AlertType.Success:
      cssClass = 'success';
      break;
      case AlertType.Warning:
      cssClass = 'warning';
      break;
      default:
      cssClass = 'info';
      break;
    }
    return cssClass;
  }
}
