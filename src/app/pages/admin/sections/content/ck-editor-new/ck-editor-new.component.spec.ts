/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CkEditorNewComponent } from './ck-editor-new.component';

describe('CkEditorNewComponent', () => {
  let component: CkEditorNewComponent;
  let fixture: ComponentFixture<CkEditorNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CkEditorNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CkEditorNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
