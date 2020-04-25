import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorBlockAttributesComponent } from './editor-block-attributes.component';

describe('EditorBlockAttributesComponent', () => {
  let component: EditorBlockAttributesComponent;
  let fixture: ComponentFixture<EditorBlockAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorBlockAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorBlockAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
