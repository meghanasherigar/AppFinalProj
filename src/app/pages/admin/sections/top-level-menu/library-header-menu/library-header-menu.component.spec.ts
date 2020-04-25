import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryHeaderMenuComponent } from './library-header-menu.component';

describe('LibraryHeaderMenuComponent', () => {
  let component: LibraryHeaderMenuComponent;
  let fixture: ComponentFixture<LibraryHeaderMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryHeaderMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryHeaderMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
