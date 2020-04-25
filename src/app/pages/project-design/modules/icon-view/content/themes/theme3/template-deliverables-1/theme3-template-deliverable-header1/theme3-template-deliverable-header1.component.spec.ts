import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme3TemplateDeliverableHeader1Component } from './theme3-template-deliverable-header1.component';

describe('Theme3TemplateDeliverableHeader1Component', () => {
  let component: Theme3TemplateDeliverableHeader1Component;
  let fixture: ComponentFixture<Theme3TemplateDeliverableHeader1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme3TemplateDeliverableHeader1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme3TemplateDeliverableHeader1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
