import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-yestype',
  templateUrl: './yestype.component.html',
  styleUrls: ['./yestype.component.scss']
})
export class YestypeComponent implements OnInit {
  isShow = false;
 
  toggleDisplay() {
    this.isShow = !this.isShow;
  }
  constructor() { }

  ngOnInit() {
  }

}
