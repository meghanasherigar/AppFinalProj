import { Component, OnInit, Input, SimpleChanges, OnChanges, AfterViewInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { EventAggregatorService } from '../../services/event/event.service';
import { EventConstants } from '../../../@models/common/eventConstants';
import { CkEditor } from '../../../@models/admin/content-whatsnew';
import MultirootEditor from '@ckeditor/ckeditor5-build-classic';
import { ShareDetailService } from '../../services/share-detail.service';
import { DesignerService } from '../../../pages/project-design/services/designer.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-ck-editor',
  templateUrl: './ck-editor.component.html',
  styleUrls: ['./ck-editor.component.scss']
})
export class CkEditorComponent implements OnInit, OnChanges, AfterViewInit {
  public editorValues: any = '';
  public curruntIndex: number;
  public readonly: boolean;
  private _editorValue;
  private _index;
  private _readOnly = true;
 // public sourceElement: any = {};

  @ViewChild('editor00') editor: ElementRef;
  @Output() valueChange: EventEmitter<CkEditor> = new EventEmitter<CkEditor>();
  @Output() editorValueChange: EventEmitter<any> = new EventEmitter<any>();
 
  @Input()
  set editorValue(value: any) { this._editorValue = value; }
  get editorValue(): any { return this._editorValue; }

  @Input()
  set indexValue(value: number) { this._index = value; }
  get indexValue(): number { return this._index; }

  @Input()
  set readOnly(value: boolean) { this._readOnly = value; }
  get readOnly(): boolean { return this._readOnly; }

  constructor(private readonly _eventService: EventAggregatorService,
    private readonly _sharedService: ShareDetailService, private designerService: DesignerService,
    private translate : TranslateService) { }
  
  toolbar = [
    { name: 'styles', items: ['Font', 'FontSize','lineheight'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
    { name: 'insert', items: ['SpecialChar'] },
    { name: 'link', items: ['Link'] },
    { name: 'editing', items: [ 'Find'] },'/',
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Superscript', '-', 'RemoveFormat' ] },
    { name: 'tools', items: [ 'Maximize','Zoom' ] },
    { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates','zoom' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
    { name: 'insert', items: ['SpecialChar'] },
  ];
  config = { toolbar: null, height: '400', width: '100%', readOnly: true, extraPlugins: 'divarea' };

  ngOnInit() {
    this.editorValues = this._editorValue;
    this.curruntIndex = this._index;
    this.readOnly = this._readOnly;
    this.config.readOnly = this.readOnly;
  }

  ngOnChanges(changes: SimpleChanges) { 
  }

  ngAfterViewInit() {
    if(this._sharedService.newEditor !== undefined)
      this._sharedService.newEditor.destroy();

    this._sharedService.sourceElement["header" + this.curruntIndex] = document.querySelector('#editor' + this.curruntIndex);
    MultirootEditor.create1(this._sharedService.sourceElement,undefined,undefined, this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this._sharedService.newEditor = newEditor;
        //this._eventService.getEvent(EventConstants.CKeditorContent).publish(newEditor);
      })
      .catch(err => {
        console.error(err.stack);
      });
  }

  onChangeValue(event) {
    this.editorValueChange.emit(this.editorValue);
  }

  onFocus(event, SelectedReadonly, selecteEditor) {
      const editor = new CkEditor();
      editor.editorMode = SelectedReadonly;
      editor.selectedEditor = selecteEditor;
    this.valueChange.emit(editor);
  }

  extractCKeditorToolbar(selectedIndex) {
    const _parent = this;
      const cketoolbarid = 'cke_' + selectedIndex + '_top';
        const ckeToolBar = document.getElementById(`"${cketoolbarid}"`);
        let editorClass = document.getElementsByClassName("cke_top");
        let statusBar = document.getElementsByClassName("cke_bottom");
        if (ckeToolBar != null) {
          _parent._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(ckeToolBar.outerHTML);
          ckeToolBar.outerHTML = "";
          statusBar[0].outerHTML = ""
        }
        else {
          _parent._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(editorClass[0].outerHTML);
          editorClass[1].outerHTML = "";
          statusBar[0].outerHTML = ""
        }
  }

  extractFirstCKeditorToolbar(selectedIndex) {
    const _parent = this;
      const cketoolbarid = 'cke_' + selectedIndex + '_top';
      setTimeout(function () {
        const ckeToolBar = document.getElementById(`"${cketoolbarid}"`);
        let editorClass = document.getElementsByClassName("cke_top");
        let statusBar = document.getElementsByClassName("cke_bottom");
        if (ckeToolBar != null) {
          _parent._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(ckeToolBar.outerHTML);
          ckeToolBar.outerHTML = "";
          statusBar[0].outerHTML = ""
        }
        else {
          _parent._eventService.getEvent(EventConstants.ContentToolbarWhatsNew).publish(editorClass[0].outerHTML);
          editorClass[1].outerHTML = "";
          statusBar[0].outerHTML = ""
        }
      }, 500);
  }

}


