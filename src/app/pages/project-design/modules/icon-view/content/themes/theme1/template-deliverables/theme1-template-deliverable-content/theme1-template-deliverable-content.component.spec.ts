import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1TemplateDeliverableContentComponent } from './theme1-template-deliverable-content.component';

describe('Theme1TemplateDeliverableContentComponent', () => {
  let component: Theme1TemplateDeliverableContentComponent;
  let fixture: ComponentFixture<Theme1TemplateDeliverableContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1TemplateDeliverableContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1TemplateDeliverableContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
