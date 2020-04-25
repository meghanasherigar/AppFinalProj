import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-user-manual',
  templateUrl: './user-manual.component.html',
  styleUrls: ['./user-manual.component.scss']
})
export class UserManualComponent implements OnInit {

  constructor() { }

  isLoaded:boolean=false;
  
  ngOnInit() { }

  receiveMessage($event) {
    this.isLoaded = $event
  }

}
