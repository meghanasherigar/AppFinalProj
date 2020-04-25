import { Component, OnInit, OnDestroy } from '@angular/core';
import { importerProcessSteps } from '../../../../../../@models/projectDesigner/block';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { NbDialogRef } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { Index } from '../../../../../../@models/projectDesigner/infoGathering';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'ngx-import-blocks-process',
  templateUrl: './import-blocks-process.component.html',
  styleUrls: ['./import-blocks-process.component.scss']
})
export class ImportBlocksProcessComponent implements OnInit, OnDestroy {
  currentIndex = Index.one;
  possibleimportBlockRoutes = importerProcessSteps;
  indexValue = Index;
  subscriptions: Subscription = new Subscription();
  dialogService: Dialog;
  constructor(private readonly _eventService: EventAggregatorService, protected ref: NbDialogRef<any>, private dialog: MatDialog, private translate: TranslateService, private designerService: DesignerService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.cancelBlockImporter).subscribe((payload: any) => {
      this.cancelBlockImporter();
    }));
  }

  goNext() {
    this.currentIndex = Index.two;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.nextStep).publish(undefined);
  }
  goPrevious() {
    this.currentIndex = Index.one;
  }

  importBlocks() {
    this.dialogService = new Dialog();
    this.dialogService.Type = DialogTypes.Confirmation;
    this.dialogService.Message = this.translate.instant("screens.project-designer.document-view.block-import-warning");
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogService
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.importBlocks).publish(undefined);
      }
    });
  }
  cancelBlockImporter() {
    if (!this.designerService.isLibrarySection) {
      this._eventService.getEvent(ActionEnum.loadSelectedTheme).publish(true);
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
    }
    this.ref.close();
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
