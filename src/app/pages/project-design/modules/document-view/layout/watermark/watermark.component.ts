import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { waterMarkProp, waterMarkPropFormGroup, WatermarkSettings } from '../../../../../../@models/projectDesigner/common';
import { Alignment, Rotation, HorizontalPosition, VerticalPosition } from '../../../../../../@models/projectDesigner/report';
import { FontFamily } from '../../../../../../@models/projectDesigner/designer';
import { DesignerService } from '../../../../services/designer.service';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';


@Component({
  selector: 'ngx-watermark',
  templateUrl: './watermark.component.html',
  styleUrls: ['./watermark.component.scss']
})
export class WatermarkComponent implements OnInit {
  waterMarkProp: waterMarkProp = {
    FontName: "", FontSize: "", Text: '',
    Alignment: {
      orientation: 0,
      horizontalAlignment: 0,
      verticalAlignment: 0
    }
  }
  WaterMark: FormGroup;
  WaterMarkProperties: waterMarkPropFormGroup = {
    FontName: "", FontSize: "", Text: "",
    Orientation: ""
  }

  WaterMarkPropGroup: FormGroup;
  fonts = this.getFonts();
  orientations = this.getOrientations();
  selectedClass: string;
  projectDetails: ProjectContext;
  DisableEnableSection : boolean = true;
  formSubmitted : boolean = true;
  constructor(protected ref: NbDialogRef<any>,
    private fb: FormBuilder,
    private readonly _eventService: EventAggregatorService,
    private designerService: DesignerService,
    private documentViewService: DocumentViewService,
    private sharedService: ShareDetailService) {
    this.WaterMark = this.fb.group({
      WaterMarkType: ['text'],
      WaterMarkProperties: this.fb.group({
        Text: [''],
        FontName: [''],
        FontSize: [''],
        Orientation: ['']
      })

    })

  }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    let templateOrDeliverableId :any; 
    if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) {
      templateOrDeliverableId = this.designerService.templateDetails.templateId;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) {
      templateOrDeliverableId = this.designerService.deliverableDetails.deliverableId;
    }
    this.documentViewService.getWaterMark(this.projectDetails.projectId, templateOrDeliverableId).subscribe(response => {
      if (response.watermark != null) {
        var watermarkprop = response.watermark.watermark;
        var fontName = watermarkprop.fontName;
        var fontSize = watermarkprop.fontSize;
        var text = watermarkprop.text;
        this.selectedClass = this.getOrientation(watermarkprop.alignment);
        this.WaterMarkProperties = { FontName: fontName, FontSize: fontSize, Text: text, Orientation: this.selectedClass }
        this.WaterMark.controls["WaterMarkProperties"].setValue(this.WaterMarkProperties);
      }
      else{
        this.WaterMarkProperties = { FontName: WatermarkSettings.FontName, FontSize: WatermarkSettings.FontSize, Text: WatermarkSettings.Text, Orientation: WatermarkSettings.Horizontal }
        this.WaterMark.controls["WaterMarkProperties"].setValue(this.WaterMarkProperties);
      }
    });
  }

  dismiss() {
    this.ref.close();
  }

  save() {
    this.WaterMarkProperties = this.WaterMark.controls["WaterMarkProperties"].value;
    if(this.WaterMark.get("WaterMarkType").value != WatermarkSettings.NoWatermark){
      if(this.WaterMarkProperties.Text ==  '' || this.WaterMarkProperties.Text == null){
        this.formSubmitted = false;
        return;
      }
    }
    this.waterMarkProp.FontName = this.WaterMarkProperties.FontName;
    this.waterMarkProp.FontSize = this.WaterMarkProperties.FontSize;
    this.waterMarkProp.Text = this.WaterMarkProperties.Text;
    if (this.WaterMarkProperties.Orientation === WatermarkSettings.Clockwise) {
      this.waterMarkProp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkProp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkProp.Alignment.orientation = Rotation.ClockWise40;
    }
    else if (this.WaterMarkProperties.Orientation == WatermarkSettings.AntiClockwise) {
      this.waterMarkProp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkProp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkProp.Alignment.orientation = Rotation.AntiClockWise40;
    }
    else {
      this.waterMarkProp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkProp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkProp.Alignment.orientation = Rotation.RotationNone;
    }

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.waterwark).publish(this.waterMarkProp);
    this.ref.close();
  }

  onWaterMarkTypechange(value: string) {
    this.WaterMarkPropGroup = this.WaterMark.controls["WaterMarkProperties"].value;
    if (this.WaterMark.get("WaterMarkType").value === WatermarkSettings.NoWatermark) {
      this.WaterMark.reset({ WaterMarkType: WatermarkSettings.NoWatermark });
      this.DisableEnableSection = false;
    }
    else{
      this.WaterMarkProperties = { FontName: WatermarkSettings.FontName, FontSize: WatermarkSettings.FontSize, Text: WatermarkSettings.Text, Orientation: WatermarkSettings.Clockwise }
      this.WaterMark.controls["WaterMarkProperties"].setValue(this.WaterMarkProperties);
      this.DisableEnableSection = true;
    }
  }
  getFonts(): any[] {
    return FontFamily;
  }
  getOrientations(): any[] {
    return [
      { name: WatermarkSettings.Horizontal, value: WatermarkSettings.Horizontal },
      { name: WatermarkSettings.Clockwise, value: WatermarkSettings.Clockwise },
      { name: WatermarkSettings.AntiClockwise, value: WatermarkSettings.AntiClockwise }
    ];
  }
  setMyStyles() {
    let Size = this.WaterMark.get(['WaterMarkProperties', 'FontSize']).value;
    let Fontfamily = this.WaterMark.get(['WaterMarkProperties', 'FontName']).value;
    let styles = {
      'font-size': Size > 100 ? '100 px' : Size / 2 + 'px',
      'font-family': Fontfamily
    };
    return styles;
  }
  AddPreview(value) {
    this.selectedClass = value;
  }
  getOrientation(alignment: Alignment): string {
    if (alignment.horizontalAlignment == HorizontalPosition.Center &&
      alignment.verticalAlignment == VerticalPosition.Center &&
      alignment.orientation == Rotation.ClockWise40) {
      return WatermarkSettings.Clockwise
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Center &&
      alignment.verticalAlignment == VerticalPosition.Center &&
      alignment.orientation == Rotation.AntiClockWise40) {
      return WatermarkSettings.AntiClockwise
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Right &&
      alignment.verticalAlignment == VerticalPosition.Top &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.TopRight
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Left &&
      alignment.verticalAlignment == VerticalPosition.Top &&
      alignment.orientation == Rotation.RotationNone
    ) {
      return WatermarkSettings.TopLeft
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Left &&
      alignment.verticalAlignment == VerticalPosition.Bottom &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.BottomLeft
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Right &&
      alignment.verticalAlignment == VerticalPosition.Bottom &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.BottomRight
    }
    else{
      return WatermarkSettings.Horizontal;
    }
  }
}
