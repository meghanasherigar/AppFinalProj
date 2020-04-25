import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StackService } from '../../../../services/stack.service';
import { BlockService } from '../../../../services/block.service';
import { BlockType } from '../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogRef } from '@nebular/theme';
import { StackAttributeDetail, StackAttributeViewModel, StackLevelViewModel } from '../../../../../../@models/projectDesigner/stack';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';

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
  transactionList : TransactionTypeDataModel[];

  constructor(private formBuilder: FormBuilder, private service: BlockService, private stackService: StackService, private designerService: DesignerService, protected ref: NbDialogRef<any>, private _eventService: EventAggregatorService) {
    this.editStackForm = this.formBuilder.group({
      StackLevel: [''],
      StackType: ['', Validators.required],
      StackDescription: ['', Validators.required],
      TransactionType: {}
    });
  }

  get form() { return this.editStackForm.controls; }


  ngOnInit() {
    this.getStackAttributes();

    if (this.designerService.stackAttributeDetail.stackLevel != null)
      this.editStackForm.controls["StackLevel"].setValue(this.designerService.stackAttributeDetail.stackLevel.id);
   
    this.editStackForm.controls["StackDescription"].setValue(this.designerService.stackAttributeDetail.description);
    this.editStackForm.controls["TransactionType"].setValue(this.designerService.stackAttributeDetail.transactionType);
    this.editStackForm.controls["StackType"].setValue(this.designerService.stackAttributeDetail.blockType.blockTypeId);

    if (this.designerService.stackAttributeDetail.transactionType != null && this.designerService.stackAttributeDetail.transactionType.transactionType != "")
      this.editStackForm.controls["TransactionType"].setValue(this.designerService.stackAttributeDetail.transactionType.transactionType);
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

    if(data.TransactionType)
      request.transactionType = this.transactionList.filter(id=>id.transactionType == data.TransactionType)[0];

    this.stackService.updateStackDetails(request)
      .subscribe((data: any) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
        this.ref.close();
      });
  }

  dismiss() {
    this.ref.close();
  }
  onStackTypeChanged(item: any) { }

  getStackAttributes() {
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
      });
  }
}
