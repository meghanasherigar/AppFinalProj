import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFullViewComponent } from './editor-full-view.component';

describe('EditorFullViewComponent', () => {
  let component: EditorFullViewComponent;
  let fixture: ComponentFixture<EditorFullViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorFullViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorFullViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
