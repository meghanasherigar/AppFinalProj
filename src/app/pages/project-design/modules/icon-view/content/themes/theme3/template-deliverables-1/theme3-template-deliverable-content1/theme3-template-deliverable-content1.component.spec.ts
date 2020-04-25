import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme3TemplateDeliverableContent1Component } from './theme3-template-deliverable-content1.component';

describe('Theme3TemplateDeliverableContent1Component', () => {
  let component: Theme3TemplateDeliverableContent1Component;
  let fixture: ComponentFixture<Theme3TemplateDeliverableContent1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme3TemplateDeliverableContent1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme3TemplateDeliverableContent1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
