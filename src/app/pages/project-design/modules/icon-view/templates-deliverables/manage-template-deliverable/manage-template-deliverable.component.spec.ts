import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTemplateDeliverableComponent } from './manage-template-deliverable.component';

describe('ManageTemplateDeliverableComponent', () => {
  let component: ManageTemplateDeliverableComponent;
  let fixture: ComponentFixture<ManageTemplateDeliverableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTemplateDeliverableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTemplateDeliverableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
