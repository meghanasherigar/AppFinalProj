import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-book-mark',
  templateUrl: './book-mark.component.html',
  styleUrls: ['./book-mark.component.scss']
})
export class BookMarkComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  bookMarkId : string = '';
  disableAdd : boolean = false;
  IsValid : boolean = true;

  constructor(protected ref: NbDialogRef<any>,
    private readonly _eventService: EventAggregatorService, 
    private toastr: ToastrService,
    private translate: TranslateService,)
   { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadAddBookMark).subscribe((payload) => {
      this.dismiss()
      this.toastr.success(this.translate.instant('screens.project-designer.document-view.SuccessMessage'));
    }))
  }

  dismiss(){
    this.ref.close();
  }

  validateBookmark(value){
    if(this.bookMarkId == '' || this.bookMarkId.includes(' ')){
        this.IsValid = false;
       this.disableAdd = false;  
    }
    else{
        this.IsValid = true;
        this.disableAdd = true; 
    }
  }

  saveBookmark(){
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.AddBookmark).publish(this.bookMarkId);
  }

}
