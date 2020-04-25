import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { IndententLevel, IndententLevelEnum } from '../../../../../../@models/projectDesigner/block';
import { ContentTypeViewModel, ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-indentation-level',
  templateUrl: './indentation-level.component.html',
  styleUrls: ['./indentation-level.component.scss']
})
export class IndentationLevelComponent implements OnInit {
  indentationList: any = [];
  indentationTypes = [IndententLevel.Alphabet, IndententLevel.Roman, IndententLevel.Number];
  templateOrDeliverableId: string = ""
  projectDetails: ProjectDetails;
  indentationResponse: any = {};
  isTemplate: boolean = false;
  indentationId: string;
  loaderId = 'IndentationLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  isRendered : boolean = false;

  constructor(private _eventService: EventAggregatorService, private ngxLoader: NgxUiLoaderService, protected ref: NbDialogRef<any>, private documentViewService: DocumentViewService, private sharedService: ShareDetailService) { }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.getIndentation();
  }

  getIndentation() {
    this.documentViewService.getAllFormatting(this.projectDetails.projectId, this.templateOrDeliverableId).subscribe(response => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.isRendered = true;
      if (response.indentationFormat != null) this.indentationId = response.indentationFormat.id;
      for (var index = 1; index <= 5; index++) {
        let indentationLevel: any = {};
        indentationLevel.id = index;
        indentationLevel.level = index;
        indentationLevel.selectedType = response.indentationFormat != null ? Object.keys(IndententLevelEnum).find(key => IndententLevelEnum[key] === response.indentationFormat["level" + index]) : IndententLevel.Number;
        this.indentationList.push(indentationLevel);
      }
    });
  }

  saveIndentations() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let payload: any = {};
    payload.contentType = ContentTypeViewModel.Indentation;
    payload.projectId = this.projectDetails.projectId;
    payload.templateOrDeliverableId = this.templateOrDeliverableId;
    payload.isTemplate = this.isTemplate;
    for (var index = 1; index <= 5; index++) {
      payload["level" + index] = IndententLevelEnum[this.indentationList[index - 1].selectedType];
    }
    if (this.indentationId) {
      payload.id = this.indentationId;
      this.documentViewService.updateDocumentConfiguration(payload).subscribe(response => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reload);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dismiss();
      });
    }
    else {
      this.documentViewService.saveDocumentConfiguration(payload).subscribe(response => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reload);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.dismiss();
      });
    }
  }

  dismiss() {
    this.ref.close();
  }

}
