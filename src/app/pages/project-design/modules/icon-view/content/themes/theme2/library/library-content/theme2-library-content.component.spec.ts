import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2LibraryContentComponent } from './theme2-library-content.component';

describe('Theme2LibraryContentComponent', () => {
  let component: Theme2LibraryContentComponent;
  let fixture: ComponentFixture<Theme2LibraryContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2LibraryContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2LibraryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
