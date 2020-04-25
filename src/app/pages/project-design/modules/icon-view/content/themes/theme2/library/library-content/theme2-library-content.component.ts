import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ngx-theme2-library-content',
  templateUrl: './theme2-library-content.component.html',
  styleUrls: ['./theme2-library-content.component.scss']
})
export class Theme2LibraryContentComponent implements OnInit {

  constructor() { }
  @Input("section") section : any;
  ngOnInit() {
  }

}
