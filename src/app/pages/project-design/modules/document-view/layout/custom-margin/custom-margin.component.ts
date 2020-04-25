import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MarginViewModel, marginProp } from '../../../../../../@models/projectDesigner/common';
import { DesignerService } from '../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { NbDialogRef } from '@nebular/theme';
import { DocumentViewService } from '../../../../services/document-view.service';
import { MarginStyles } from '../../../../../../@models/common/commonmodel';

@Component({
  selector: 'ngx-custom-margin',
  templateUrl: './custom-margin.component.html',
  styleUrls: ['./custom-margin.component.scss']
})
export class CustomMarginComponent implements OnInit {

  Margin: FormGroup;
  marginViewModel: MarginViewModel = new MarginViewModel();
  marginprop: any;
  constructor(private fb: FormBuilder, private designerService: DesignerService, private _eventService: EventAggregatorService, protected ref: NbDialogRef<any>, private documentViewService: DocumentViewService) {

    this.Margin = this.fb.group({
      Top: ['', Validators.required],
      Left: ['', Validators.required],
      Bottom: ['', Validators.required],
      Right: ['', Validators.required]
    })

  }

  ngOnInit() {
    this.getPageMargin();
  }

  dismiss() {
    this.ref.close();
  }

  getPageMargin() {
    this.documentViewService.getPageMargin(this.designerService.currentProjectId, this.designerService.currentTemplateOrDeliverableId).subscribe(response => {
      if (response.margin != null) {
        this.marginprop = response.margin.margin;
        this.Margin.controls["Top"].setValue(this.marginprop.top);
        this.Margin.controls["Bottom"].setValue(this.marginprop.bottom);
        this.Margin.controls["Right"].setValue(this.marginprop.right);
        this.Margin.controls["Left"].setValue(this.marginprop.left);
      }
    });
  }

  valueCheck(event) {
    //restricting some alphabets and values more than 10
    if (event.keyCode == 69 || event.keyCode == 81) {
      return false
    }
    else {
      if (event.target.value == "") {
        return true;
      }
      else {
        var val = event.target.value + event.key;
        if (val > 10) {
          return false;
        }
        else
          return true;
      }
    }
  }

  save() {
    this.marginprop.Top = this.Margin.controls["Top"].value;
    this.marginprop.Left = this.Margin.controls["Left"].value;
    this.marginprop.Bottom = this.Margin.controls["Bottom"].value;
    this.marginprop.Right = this.Margin.controls["Right"].value;
    this.marginprop.MarginType = MarginStyles.custom;
    if (this.Margin.valid) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.customMargin).publish(this.marginprop)
      this.ref.close();
    }
  }

}
