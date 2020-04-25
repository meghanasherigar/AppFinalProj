import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1LibraryContentComponent } from './theme1-library-content.component';

describe('Theme1LibraryContentComponent', () => {
  let component: Theme1LibraryContentComponent;
  let fixture: ComponentFixture<Theme1LibraryContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1LibraryContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1LibraryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
