import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  header:string;
  data:string;

  constructor( protected ref: NbDialogRef<any>) { }

  ngOnInit() {
  }

  dismiss()
  {
    this.ref.close();
  }
}
