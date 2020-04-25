import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDeliverableHeaderComponent } from './template-deliverable-header.component';

describe('TemplateDeliverableHeaderComponent', () => {
  let component: TemplateDeliverableHeaderComponent;
  let fixture: ComponentFixture<TemplateDeliverableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateDeliverableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDeliverableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
