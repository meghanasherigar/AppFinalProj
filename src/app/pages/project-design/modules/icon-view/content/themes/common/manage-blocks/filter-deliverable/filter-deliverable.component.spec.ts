import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDeliverableComponent } from './filter-deliverable.component';

describe('FilterDeliverableComponent', () => {
  let component: FilterDeliverableComponent;
  let fixture: ComponentFixture<FilterDeliverableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDeliverableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDeliverableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
