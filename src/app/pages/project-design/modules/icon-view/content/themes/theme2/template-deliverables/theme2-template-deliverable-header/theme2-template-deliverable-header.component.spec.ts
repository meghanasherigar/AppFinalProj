import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2TemplateDeliverableHeaderComponent } from './theme2-template-deliverable-header.component';

describe('Theme2TemplateDeliverableHeaderComponent', () => {
  let component: Theme2TemplateDeliverableHeaderComponent;
  let fixture: ComponentFixture<Theme2TemplateDeliverableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2TemplateDeliverableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2TemplateDeliverableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
