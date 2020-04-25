import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ngx-theme1-library-content',
  templateUrl: './theme1-library-content.component.html',
  styleUrls: ['./theme1-library-content.component.scss']
})
export class Theme1LibraryContentComponent implements OnInit {
  @Input("section") section : any;

  constructor() { }

  ngOnInit() {
  }

}
