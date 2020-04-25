import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorLevel2MenuLibraryComponent } from './editor-level2-menu-library.component';

describe('EditorLevel2MenuLibraryComponent', () => {
  let component: EditorLevel2MenuLibraryComponent;
  let fixture: ComponentFixture<EditorLevel2MenuLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorLevel2MenuLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorLevel2MenuLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
