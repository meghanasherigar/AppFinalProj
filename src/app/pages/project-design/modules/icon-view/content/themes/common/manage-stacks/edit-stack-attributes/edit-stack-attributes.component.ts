import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackService } from '../../../../../../../services/stack.service';
import { BlockService } from '../../../../../../../services/block.service';
import { BlockType } from '../../../../../../../../../@models/projectDesigner/block';
import { NbDialogRef } from '@nebular/theme';
import { StackAttributeDetail, StackAttributeViewModel, StackLevelViewModel } from '../../../../../../../../../@models/projectDesigner/stack';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../../../../@models/transaction';
import { DesignerService } from '../../../services/designer.service';
import { Subscription } from 'rxjs';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { ThemingContext } from '../../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { DeliverablesInput } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-edit-stack-attributes',
  templateUrl: './edit-stack-attributes.component.html',
  styleUrls: ['./edit-stack-attributes.component.scss']
})
export class EditStackAttributesComponent implements OnInit {
  editStackForm: FormGroup;
  stackTypes: BlockType[];
  submitted: boolean = false;
  stackLevels: StackLevelViewModel[];
  transactionList: TransactionTypeDataModel[];
  subscriptions: Subscription = new Subscription();
  designer = new Designer();
  section: string = "";
  themingContext: ThemingContext;

  constructor(private formBuilder: FormBuilder, private sharedService: ShareDetailService, private stackService: StackService, private designerService: DesignerService, protected ref: NbDialogRef<any>, private _eventService: EventAggregatorService,
    private hostElement: ElementRef, private ngxLoader: NgxUiLoaderService) {
    this.editStackForm = this.formBuilder.group({
      StackLevel: [''],
      StackType: ['', Validators.required],
      StackDescription: ['',[Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      TransactionType: {}
    });
  }

  get form() { return this.editStackForm.controls; }

  loaderId = 'EditStackLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  ngOnInit() {
    this.hostElement.nativeElement.click();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.getStackAttributes();

    if (this.designer.stackAttributeDetail.stackLevel != null)
      this.editStackForm.controls["StackLevel"].setValue(this.designer.stackAttributeDetail.stackLevel.id);

    this.editStackForm.controls["StackDescription"].setValue(this.designer.stackAttributeDetail.description);
    this.editStackForm.controls["TransactionType"].setValue(this.designer.stackAttributeDetail.transactionType);
    this.editStackForm.controls["StackType"].setValue(this.designer.stackAttributeDetail.blockType.blockTypeId);

    if (this.designer.stackAttributeDetail.transactionType != null && this.designer.stackAttributeDetail.transactionType.transactionType != "")
      this.editStackForm.controls["TransactionType"].setValue(this.designer.stackAttributeDetail.transactionType.transactionType);
  }

  editStack() {
    this.submitted = true;

    //  stop here if form is invalid
    if (this.editStackForm.invalid) {
      return;
    }

    var data = this.editStackForm.value;
    var request = new StackAttributeDetail();
    request.id = this.designer.stackAttributeDetail.id;
    if (data.StackType != "") {
      request.blockType = this.stackTypes.filter(id => id.blockTypeId == data.StackType)[0];
    }
    request.description = data.StackDescription;

    if (data.StackLevel != "") {
      request.stackLevel = this.stackLevels.filter(id => id.id == data.StackLevel)[0];
    }

    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(id => id.transactionType == data.TransactionType)[0];

    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.stackService.updateStackDetails(request)
      .subscribe((data: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (this.designer.templateDetails != null) {
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
        }
        if (this.designer.deliverableDetails != null) {
          var deliverableInput = new DeliverablesInput();
          deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
        }
        this.ref.close();
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
  }

  dismiss() {
    this.ref.close();
  }
  onStackTypeChanged(item: any) {}
  getStackAttributes() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
  }
}
