import { Component, OnInit } from '@angular/core';
import { DesignerService } from '../../../services/designer.service';
import { NbDialogRef } from '@nebular/theme';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { ActionEnum } from '../../../../../@models/projectDesigner/common';
import { DefineColorSection } from '../../../../../@models/projectDesigner/formatStyle';

@Component({
  selector: 'ngx-define-colors',
  templateUrl: './define-colors.component.html',
  styleUrls: ['./define-colors.component.scss']
})
export class DefineColorsComponent implements OnInit {
  selectedColorCodes: any = this.designerService.definedColorCodes;
  constructor(private designerService: DesignerService, protected ref: NbDialogRef<any>, private _eventService: EventAggregatorService) { }
  section : string;

  ngOnInit() {
  }

  dismiss() {
    this.ref.close();
  }

  submit() {
    this.ref.close();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reload);

    if(this.section == DefineColorSection.formatStyling)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).publish(true);
  }

  AddSelectedColor(event) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(event.target.value);
    var rgbColor = result ? {
      color: "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")",
      label: "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")"
    } : null;
    this.selectedColorCodes.push(rgbColor);
    this.designerService.definedColorCodes = this.selectedColorCodes;
  }

  remove(color) {
    var idx = this.selectedColorCodes.indexOf(color);
    this.selectedColorCodes.splice(idx, 1);
    this.designerService.definedColorCodes = this.selectedColorCodes;
  }
}
