import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { DesignerService } from '../../../../services/designer.service';
import { cssStyles } from '../../../../../../@models/projectDesigner/block';

@Component({
  selector: 'ngx-cross-reference',
  templateUrl: './cross-reference.component.html',
  styleUrls: ['./cross-reference.component.scss']
})
export class CrossReferenceComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  Hyperlink: boolean=false;
  ReferenceToList: any = ['Bookmark']
  bookmarkList = new Array<cssStyles>();
  applyBookmark : any = '';
  constructor(public designerService: DesignerService,
    protected ref: NbDialogRef<any>,
    private readonly _eventService: EventAggregatorService, ) { }

  ngOnInit() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.bookmarkList).publish('');
    this.bookmarkList = new Array<cssStyles>();
      this.designerService.bookmarkList.forEach(item => {
        let bookMark = new cssStyles()
        bookMark.key = item.split('__')[0];
        bookMark.value = item;
        if (!(this.bookmarkList.filter(rec => rec.value == bookMark.value).length > 0))
        this.bookmarkList.push(bookMark);
      });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadApplyCrossReference).subscribe((payload) => {
      this.dismiss()
    }))
  }

  dismiss() {
    this.ref.close();
  }

  onBookMarkListChange(item){
    this.applyBookmark = item.srcElement.value;
  }

  SaveCrossReference(){
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ApplyCrossReference).publish(this.applyBookmark);
  }

}
