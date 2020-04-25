import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchTerm: any;
  @Output() search = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onSearch(serchTerm) {
    this.search.emit(serchTerm);
  }

}
