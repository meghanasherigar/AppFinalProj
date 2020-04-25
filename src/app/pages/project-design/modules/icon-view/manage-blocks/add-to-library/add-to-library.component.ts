import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AddToLibrary, OrganizationLibraryRequestViewModel, AddToUserLibraryModel } from '../../../../../../@models/projectDesigner/common';
import { BlockService } from '../../../../services/block.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DesignerService } from '../../../../services/designer.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectContext } from '../../../../../../@models/organization';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { SelectedSection, ThemeSection } from '../../../../../../@models/projectDesigner/theming';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-add-to-library',
  templateUrl: './add-to-library.component.html',
  styleUrls: ['./add-to-library.component.scss']
})
export class AddToLibraryComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  addToLibraryForm: FormGroup;
  addToLibrary = new AddToLibrary();
  selectedBlockListId: any = [];
  selectedBlocksStacks: any = [];
  organizationLibraryRequestViewModel = new OrganizationLibraryRequestViewModel();
  addToLibraryViewModel = new AddToUserLibraryModel();
  projectDetails: ProjectContext;
  constructor(
    private designerService: DesignerService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private _sharedService : ShareDetailService,
    private _eventService: EventAggregatorService,
    protected ref: NbDialogRef<any>,
    private blockService : BlockService,
    private formBuilder: FormBuilder,
    private shareDetailService: ShareDetailService,
    private translate: TranslateService,) { 
      this.addToLibraryForm = this.formBuilder.group({
        UserLibrary: [''],
        OrgLibrary: [''],
      });
    }

  ngOnInit() {
    this.projectDetails = this.shareDetailService.getORganizationDetail();
    this.addToLibrary.checkbox1 = true;
  }

  dismiss() {
    this.ref.close();
  }

  toggleCheckbox(event) {
      if (event.target.id === 'userLibCheckBox') {
        if (this.addToLibrary.checkbox1)
          this.addToLibrary.checkbox1 = false;
        else
          this.addToLibrary.checkbox1 = true;
          this.addToLibrary.checkbox2 = false
      }
      else {
        if (this.addToLibrary.checkbox2)
          this.addToLibrary.checkbox2 = false;
        else
          this.addToLibrary.checkbox2 = true;
          this.addToLibrary.checkbox1 = false;
      }
  }

  AddToLibrary(){
    const project = this.shareDetailService.getORganizationDetail();
    this.selectedBlockListId = [];
    this.selectedBlocksStacks = this.designerService.blockList;
    this.selectedBlocksStacks.forEach(element => {
      this.selectedBlockListId.push(element.blockId);
    })
    if(this.addToLibrary.checkbox1 || this.addToLibrary.checkbox2){
        if(this.addToLibrary.checkbox1){
          this.addToLibraryViewModel.Blocks = this.selectedBlockListId;
          this.addToLibraryViewModel.ProjectId =project.projectId;
          if(this.designerService.isDeliverableSection)
          this.addToLibraryViewModel.DeliverableId = this.designerService.deliverableDetails.entityId;
          else
          this.addToLibraryViewModel.DeliverableId = null;
          this.blockService.copyToLibrary(this.addToLibraryViewModel).subscribe(response => {
            if (response.status === 1) {
              this.toastr.success(this.translate.instant('screens.project-designer.document-view.AddLibrarySuccess'));
            
              // payload.selectedSection = SelectedSection.Library;
              // this.subscriptions.add(this._eventService.getEvent(this.section).publish(payload));
              this.dismiss();

            }
            else {
              this.dialogService.Open(DialogTypes.Error, response.errorMessages[0]);
            }
          })
        }
        else if (this.addToLibrary.checkbox2){
          this.organizationLibraryRequestViewModel.BlockIds = this.selectedBlockListId;
          this.organizationLibraryRequestViewModel.OrganizationId = project.organizationId;
          this.organizationLibraryRequestViewModel.ProjectId = project.projectId;
          if(this.designerService.isDeliverableSection)
          this.organizationLibraryRequestViewModel.EntityId = this.designerService.deliverableDetails.entityId;
          else
          this.organizationLibraryRequestViewModel.EntityId = null;
        this.blockService.AddToOrganizationLibrary(this.organizationLibraryRequestViewModel).subscribe(response => {
          if (response.status === 1) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.AddorganizationSuccess'));
            this.dismiss();
          }
          else {
            this.dialogService.Open(DialogTypes.Error, response.errorMessages[0]);
          }
        })
        }
    }
    else{
      let validationMessage = this.translate.instant('screens.project-designer.document-view.AddLibraryValidation');
      this.dialogService.Open(DialogTypes.Warning, validationMessage);
      return
    }
  }
}
