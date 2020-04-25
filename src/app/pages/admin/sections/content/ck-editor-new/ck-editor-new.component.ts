import { Component, OnInit, Input } from '@angular/core';
import MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-ck-editor-new',
  templateUrl: './ck-editor-new.component.html',
  styleUrls: ['./ck-editor-new.component.scss']
})
export class CkEditorNewComponent implements OnInit {
  public currentIndex: number;
  public _totalCount: number;
  private _index;
  public _editorValue: string = "";
  public _editable: boolean;
  public _id: boolean;
  public _discardheading: boolean;

  @Input()
  set indexValue(value: number) { this._index = value; }
  get indexValue(): number { return this._index; }

  @Input()
  set editorValue(value: any) { this._editorValue = value; }
  get editorValue(): any { return this._editorValue; }


  @Input()
  set editable(value: any) { this._editable = value; }
  get editable(): any { return this._editable; }
  
  @Input()
  set id(value: any) { this._id = value; }
  get id(): any { return this._id; }
  @Input()
  set discardheading(value: any) { this._discardheading = value; }
  get discardheading(): any { return this._discardheading; }
  

  constructor(private sharedAdminService: SharedAdminService, private designerService: DesignerService,private translate: TranslateService) { }

  ngOnInit() {
    this.currentIndex = this._index;
  }

  ngAfterViewInit() {
    if (this._editorValue == "" || this._editable) {
      if (this.sharedAdminService.newEditor !== undefined)
        this.sharedAdminService.newEditor.destroy();
      if(!this._discardheading)
        this.sharedAdminService.sourceElement["header" + '-' + this.currentIndex + '-' + this._id] = document.querySelector('#ck_editor' + this.currentIndex + this._id);
      MultirootEditor.create1(this.sharedAdminService.sourceElement, undefined, undefined, this.designerService.definedColorCodes,this.translate.currentLang)
        .then(newEditor => {
          document.getElementById("toolbar-menu").innerHTML = "";
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
          this.sharedAdminService.newEditor = newEditor;
          this.sharedAdminService.setImageNameFlag(true);
          
          
        })
        .catch(err => {
          console.error(err.stack);
        });
    } 
  }
}
