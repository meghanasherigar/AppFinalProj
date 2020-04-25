import { Component, OnInit, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-grouped-deliverable-custom',
  templateUrl: './link-to-group-deliverable.component.html',
  styleUrls: ['./link-to-group-deliverable.component.scss']
})
export class LinkToGroupDeliverableComponent implements OnInit {

  value: any;
  row: any;
  cell: any;
  //Index of the row
  index: number;
  isDeliverableDataAdded: boolean = false;
  currentEle;
  smartTableRef;

  isViewMore : boolean;

  content =
    {
      deliverableName: ''
    };

  constructor(private elRef: ElementRef,
    private translate: TranslateService
    ) { }

  ngOnInit() {
    this.isViewMore = true;
    //accessing the row data by using value.row.row since value also is being passed in valuePrepare function
    this.row = this.value.row.row.data;
    this.cell = this.value.cell;
    this.index = (this.value.row && this.value.row.row && this.value.row.row.index) ? this.value.row.row.index : 0;
    this.currentEle = this.elRef.nativeElement;
    if (this.currentEle) {
      this.smartTableRef = this.currentEle.ownerDocument.querySelectorAll('ng2-smart-table table tbody')[0];
    }

  }

  onViewMoreSelect(row) {
    if (!this.isDeliverableDataAdded) {
      let deliverables = document.createElement('div');
      let content = this.displayGroupDeliverables();
      deliverables.innerHTML = content.deliverableName;
      this.currentEle.append(deliverables);
      this.isDeliverableDataAdded = true;
    }
    else {
      // Code to hide deliverable data
      this.isDeliverableDataAdded = false;
      let nodeList: NodeList = this.currentEle.childNodes;
      nodeList.forEach(x => {
        if (x['id'] === '') {
          this.currentEle.removeChild(x);
        }
      });
    }
  }

  displayGroupDeliverables() {
    let deliverableContent = `<div>`;
    this.row.deliverables.forEach(element => {
        deliverableContent += `<span>${element.entityName}</span><br/>`;
    });
    deliverableContent += '</div>';
    this.content.deliverableName = deliverableContent;
    return this.content;

  }

  iconToggle() {
      this.isViewMore = !this.isViewMore;
  }

}
