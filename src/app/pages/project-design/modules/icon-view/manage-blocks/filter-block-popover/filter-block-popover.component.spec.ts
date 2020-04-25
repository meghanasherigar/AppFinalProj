import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBlockPopoverComponent } from './filter-block-popover.component';

describe('FilterBlockPopoverComponent', () => {
  let component: FilterBlockPopoverComponent;
  let fixture: ComponentFixture<FilterBlockPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterBlockPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBlockPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
