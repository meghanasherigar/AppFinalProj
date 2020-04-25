import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterLibraryComponent } from './filter-library.component';

describe('FilterLibraryComponent', () => {
  let component: FilterLibraryComponent;
  let fixture: ComponentFixture<FilterLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
