import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackService } from '../../../../services/stack.service';
import { BlockType } from '../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../services/designer.service';
import { StackAttributeDetail, StackAttributeViewModel, StackLevelViewModel } from '../../../../../../@models/projectDesigner/stack';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { BlockService } from '../../../../services/block.service';
import { Subscription } from 'rxjs';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { CountryService } from '../../../../../../shared/services/country.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-stack-attributes',
  templateUrl: './stack-attributes.component.html',
  styleUrls: ['./stack-attributes.component.scss']
})
export class StackAttributesComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  editStackForm: FormGroup;
  stackTypes: BlockType[];
  submitted: boolean = false;
  stackLevels: StackLevelViewModel[];
  transactionList: TransactionTypeDataModel[];
  selectDisable: boolean = false;

  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private stackService: StackService, protected service: BlockService, private translate: TranslateService,
    private dialogService: DialogService, private designerService: DesignerService, private _eventService: EventAggregatorService,
    private countryService:CountryService) {
    this.editStackForm = this.formBuilder.group({
      StackLevel: [''],
      StackType: ['', Validators.required],
      StackDescription: ['', [Validators.required, Validators.pattern(/[\S]+[\s]*[\S]*/)]],
      TransactionType: [null, Validators.required],
    });
  }

  get form() { return this.editStackForm.controls; }

  ngOnInit() {
    this.getStackAttributes();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.manageLibrary).subscribe((payload: any) => {
      this.getStackAttributes();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  editStack() {
    this.submitted = true;

    //  stop here if form is invalid
    if (this.editStackForm.invalid) {
      return;
    }

    var data = this.editStackForm.value;
    var request = new StackAttributeDetail();
    request.id = this.designerService.stackAttributeDetail.id;
    if (data.StackType != "") {
      request.blockType = this.stackTypes.filter(id => id.blockTypeId == data.StackType)[0];
    }
    request.description = data.StackDescription;

    if (data.StackLevel != "") {
      request.stackLevel = this.stackLevels.filter(id => id.id == data.StackLevel)[0];
    }

    if (data.TransactionType)
      request.transactionType = this.transactionList.filter(id => id.transactionType == data.TransactionType)[0];

    this.stackService.updateStackDetails(request)
      .subscribe((data: any) => {
        this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.StackUpdated'));
        this.designerService.blockDetails = null;
        this.designerService.DisableMenus();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('togglestackckattributecomponent'));
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
      });
  }

  dismiss() {
    this.getStackAttributes();
  }

  closeStackAttribute() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.DisableMenus();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('togglestackckattributecomponent'));
  }

  getStackAttributes() {

    this.stackService.getstackdetails(this.designerService.blockDetails.blockId).subscribe((data: StackAttributeDetail) => {
      this.designerService.stackAttributeDetail = data;
      this.editStackForm.controls["StackLevel"].setValue(this.designerService.stackAttributeDetail.stackLevel.id);

      this.editStackForm.controls["StackDescription"].setValue(this.designerService.stackAttributeDetail.description);
      this.editStackForm.controls["TransactionType"].setValue(this.designerService.stackAttributeDetail.transactionType);
      this.editStackForm.controls["StackType"].setValue(this.designerService.stackAttributeDetail.blockType.blockTypeId);
      this.selectDisable = (this.editStackForm.controls["StackType"].value) ? true : false;
      if (this.designerService.stackAttributeDetail.transactionType != null && this.designerService.stackAttributeDetail.transactionType.transactionType != "")
        this.editStackForm.controls["TransactionType"].setValue(this.designerService.stackAttributeDetail.transactionType.transactionType);

    });

    this.stackService.getstackattributedetail().subscribe((data: StackAttributeViewModel) => {
      this.stackTypes = data.stackType;
      this.stackLevels = data.stackLevel;
      this.countryService.getalltransactiontypes().subscribe(masterTransactionTypes=>
        {
          this.transactionList = masterTransactionTypes;
        });
    });
  }
  onStackTypeChanged(item: any) { }
}
