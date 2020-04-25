import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1LibraryHeaderComponent } from './theme1-library-header.component';

describe('Theme1LibraryHeaderComponent', () => {
  let component: Theme1LibraryHeaderComponent;
  let fixture: ComponentFixture<Theme1LibraryHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1LibraryHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1LibraryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
