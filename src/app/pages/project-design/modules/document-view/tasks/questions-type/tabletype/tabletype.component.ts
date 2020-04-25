import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-tabletype',
  templateUrl: './tabletype.component.html',
  styleUrls: ['./tabletype.component.scss']
})
export class TabletypeComponent implements OnInit {
  isShow = false;
  data: any;
  settings: any;
  toggleDisplay() {
    this.isShow = !this.isShow;
  }
  constructor() { }

  ngOnInit() {
  }

}
