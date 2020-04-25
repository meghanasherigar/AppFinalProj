import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1TemplateDeliverableHeaderComponent } from './theme1-template-deliverable-header.component';

describe('Theme1TemplateDeliverableHeaderComponent', () => {
  let component: Theme1TemplateDeliverableHeaderComponent;
  let fixture: ComponentFixture<Theme1TemplateDeliverableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1TemplateDeliverableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1TemplateDeliverableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
