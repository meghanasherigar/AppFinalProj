import { Component, OnInit, Input, Output,EventEmitter} from '@angular/core';
import { HeaderSummary } from '../../../@models/common/header-summary';


@Component({
  selector: 'ngx-header-summary',
  templateUrl: './header-summary.component.html',
  styleUrls: ['./header-summary.component.scss']
})
export class HeaderSummaryComponent implements OnInit {

  @Input('options') summaryOptions: HeaderSummary;
  @Output()
  filterTrigger= new EventEmitter<any>();

  selectedPart:any={};

  constructor() { }

  ngOnInit() {
  }

  onSelection(event)
  {
    if(this.selectedPart!==event || this.selectedPart == null)
    {
      this.selectedPart= event;
      this.filterTrigger.emit(this.selectedPart);
    }
    else
    {
      this.selectedPart= null;
      this.filterTrigger.emit(null);
    }
    
  }

}


