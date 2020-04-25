import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { ParagraphSpacing } from '../../../../../../@models/projectDesigner/block';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-paragraph-spacing',
  templateUrl: './paragraph-spacing.component.html',
  styleUrls: ['./paragraph-spacing.component.scss']
})
export class ParagraphSpacingComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  indentationList: any = ['0.1cm', '0.2cm', '0.3cm', '0.4cm', '0.5cm', 
                          '0.6cm', '0.7cm', '0.8cm', '0.9cm', '1cm', 
                          '1.1cm', '1.2cm', '1.3cm', '1.4cm', '1.5cm',
                          '1.6cm', '1.7cm', '1.8cm', '1.9cm', '2cm', ];
  specialList: any = ['(none)', 'First line', 'Hanging'];
  spacingList: any = ['3pt', '6pt', '9pt', '12pt', '15pt', '18pt', '21pt', '24pt'];
  lineSpacingList: any = ['Single', '1.5 lines', 'Double', 'At least', 'Exactly', 'Multiple'];
  lineSpacingMultipleList: any = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 
                                  4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
  applyParagraphSpace : any = {};
  enableMultipleValues: boolean = false;
constructor(protected ref: NbDialogRef<any>,
  private designerService: DesignerService,
  private translate: TranslateService,
private toastr: ToastrService,
  private readonly _eventService: EventAggregatorService, ) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadParagraphSpacing).subscribe((payload) => {
      this.dismiss()
    }))
  }

  onLeftIndentationChange(item){
    this.applyParagraphSpace.onLeftIndentationValue = item.srcElement.value;
  }

  onRightIndentationChange(item){
    this.applyParagraphSpace.onRightIndentationValue = item.srcElement.value;
  }

  onSpecialIndentationChange(item){
    this.applyParagraphSpace.onSpecialIndentationValue = item.srcElement.value;
  }

  onBeforeSpacingChange(item){
    this.applyParagraphSpace.onBeforeSpacingValue = item.srcElement.value;
  }

  onAfterSpacingChange(item){
    this.applyParagraphSpace.onAfterSpacingValue = item.srcElement.value;
  }

  onSpecialSpacingChange(item){
    this.applyParagraphSpace.onSpecialSpacingValue = item.srcElement.value;
    if(this.applyParagraphSpace.onSpecialSpacingValue ==  ParagraphSpacing.Multiple){
      this.enableMultipleValues = true;
    }
    else {
      this.enableMultipleValues = false;
    }
  }

  onLineSpacingMultipleListChange(item){
    this.applyParagraphSpace.onLineSpacingMultipleValue = item.srcElement.value;
  }

  dismiss(){
    this.ref.close();
  }

  saveParagraphSpacing(){

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ApplyParagraphSpacing).publish(this.applyParagraphSpace);
    this.toastr.success(this.translate.instant('screens.home.labels.paragraphSpacing'));
  }

}
