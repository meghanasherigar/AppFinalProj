import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryHeaderIconsComponent } from './library-header-icons.component';

describe('LibraryHeaderIconsComponent', () => {
  let component: LibraryHeaderIconsComponent;
  let fixture: ComponentFixture<LibraryHeaderIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryHeaderIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryHeaderIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
