import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterManageLibraryComponent } from './filter-manage-library.component';

describe('FilterManageLibraryComponent', () => {
  let component: FilterManageLibraryComponent;
  let fixture: ComponentFixture<FilterManageLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterManageLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterManageLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
