import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableAttributeViewComponent } from './deliverable-attribute-view.component';

describe('DeliverableAttributeViewComponent', () => {
  let component: DeliverableAttributeViewComponent;
  let fixture: ComponentFixture<DeliverableAttributeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableAttributeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableAttributeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
