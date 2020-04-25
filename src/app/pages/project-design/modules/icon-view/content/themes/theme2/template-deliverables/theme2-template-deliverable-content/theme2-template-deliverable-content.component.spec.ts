import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2TemplateDeliverableContentComponent } from './theme2-template-deliverable-content.component';

describe('Theme2TemplateDeliverableContentComponent', () => {
  let component: Theme2TemplateDeliverableContentComponent;
  let fixture: ComponentFixture<Theme2TemplateDeliverableContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2TemplateDeliverableContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2TemplateDeliverableContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
