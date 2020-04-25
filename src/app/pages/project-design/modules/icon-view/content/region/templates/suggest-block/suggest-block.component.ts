import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../../@models/common/dialog';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { SuggestForLibraryViewModel, SuggestedBlockViewModel, UserRolesViewModel } from '../../../../../../../../@models/projectDesigner/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { ResponseStatus } from '../../../../../../../../@models/ResponseStatus';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-suggest-block',
  templateUrl: './suggest-block.component.html',
  styleUrls: ['./suggest-block.component.scss']
})
export class SuggestBlockComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  Show : boolean = true;
  suggestBlockFrom: FormGroup;
  isAdmin = new UserRolesViewModel();
  validCheck = false;

  constructor(protected ref: NbDialogRef<any>,
    private dialogService: DialogService,
    private designerService: DesignerService,
    private deliverableService: DeliverableService, 
    private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,) { 

    this.suggestBlockFrom = this.formBuilder.group({
      AddComments: [''],
      IsCountryAdmin: [''],
      IsGlobalAdmin: [''],
    });
  }

  ngOnInit() {
  }

  dismiss() {
    this.ref.close();
  }

  SuggestBlocksStacks(){
    this.validateUser();
    if (this.validCheck) {
      this.Show = true;
      return;
    }
    else{
    this.Show = false;
    }
  }

validateUser() {
  if (!(this.isAdmin.IsCountryAdmin === true || this.isAdmin.IsGlobalAdmin === true)) {
    let validationMessage = this.translate.instant('screens.project-designer.document-view.suggest-validation-message');
    this.dialogService.Open(DialogTypes.Warning, validationMessage);
    this.validCheck = true;
  }
  else{
    this.validCheck = false;
  }
}

  dismissDailog() {
    this.Show = true;
  }

  CreateSuggestion() {
    let selectedBlocks = this.designerService.blockList;
    var block = new SuggestForLibraryViewModel();
    const project = this.shareDetailService.getORganizationDetail();
    block.ProjectId = project.projectId;
    if(this.designerService.isDeliverableSection)
    block.EntityId = this.designerService.deliverableDetails.entityId;
    else
    block.EntityId = null;
    block.SuggestTo = new UserRolesViewModel();
    block.SuggestTo.IsCountryAdmin = (this.isAdmin.IsCountryAdmin) ? true : false;
    block.SuggestTo.IsGlobalAdmin = (this.isAdmin.IsGlobalAdmin) ? true : false;
    block.Comments = this.suggestBlockFrom.controls["AddComments"].value;
    block.SuggestedBlocks = new Array<SuggestedBlockViewModel>();

    this.designerService.blockList.forEach(item => {
      var model = new SuggestedBlockViewModel();
      model.BlockId = item.blockId;
      model.IsAccepted = null;
      block.SuggestedBlocks.push(model);
    });


    this.subscriptions.add(this.deliverableService.updateSuggest(block)
    .subscribe(
      response => {
        if (response.status === ResponseStatus.Sucess) {
          let successMessage = this.translate.instant('screens.project-designer.document-view.suggest-success-message');
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.suggest-success-message'));
          this.dismiss();
        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

}
