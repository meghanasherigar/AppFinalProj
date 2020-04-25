import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';
import { FormsModule } from '@angular/forms';
import { CkEditorComponent } from './ck-editor/ck-editor.component';

@NgModule({
  declarations: [CkEditorComponent],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule
  ],
  exports: [CkEditorComponent]
})
export class CkEditorModule { }
