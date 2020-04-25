import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDeliverablePopoverComponent } from './filter-deliverable-popover.component';

describe('FilterDeliverablePopoverComponent', () => {
  let component: FilterDeliverablePopoverComponent;
  let fixture: ComponentFixture<FilterDeliverablePopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDeliverablePopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDeliverablePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
