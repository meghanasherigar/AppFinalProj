import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import '../../../../../../../assets/ckeditor.loader';
import 'ckeditor';
import { BlockService } from '../../../../services/block.service'
import { BlockRequest, Industry, SubIndustry } from '../../../../../../@models/projectDesigner/block'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, OrganizationViewModel, CountryViewModel } from '../../../../../../@models/projectDesigner/library';
import { TemplateViewModel } from '../../../../../../@models/projectDesigner/template';
import { DeliverableViewModel } from '../../../../../../@models/projectDesigner/deliverable';

@Component({
  selector: 'ngx-create-block',
  templateUrl: './create-block.component.html',
  styleUrls: ['./create-block.component.scss']
})
export class CreateBlockComponent implements OnInit {
  @Input() title: string;
  public editorValue: string = '';
  createBlockForm: FormGroup;
  submitted = false;
  constructor(
    private formBuilder: FormBuilder,
    protected ref: NbDialogRef<any>, protected service: BlockService) {
    this.createBlockForm = this.formBuilder.group({
      BlockContent: [''],
      BlockTitle:  [''],
      BlockType:['', Validators.required],
      BlockDescription: ['', Validators.required],
      BlockStatus:['', Validators.required],
      TemplatesUtilized:['', Validators.required],
      ProjectYear:['', Validators.required],
      BlockState:[''],
      BlockIndustries: [''],
      BlockIndustryOthers: ['']
    });
  }
  
  ngOnInit() {
    this.editorValue = 'test data';
  }
  dismiss() {
  this.ref.close();
}
createBlock() {}

  toolbar = [
    // { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
    { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
    { name: 'insert', items: ['Image'] },
    { name: 'styles', items: ['Font', 'FontSize'] },
    { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
  ];

  config = { toolbar: this.toolbar, height: '400', width: '850' };

  get form() { return this.createBlockForm.controls; }  
}
