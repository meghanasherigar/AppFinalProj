import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2LibraryHeaderComponent } from './theme2-library-header.component';

describe('Theme2LibraryHeaderComponent', () => {
  let component: Theme2LibraryHeaderComponent;
  let fixture: ComponentFixture<Theme2LibraryHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2LibraryHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2LibraryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
