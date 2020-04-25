import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDeliverableHeaderIconsComponent } from './template-deliverable-header-icons.component';

describe('TemplateDeliverableHeaderIconsComponent', () => {
  let component: TemplateDeliverableHeaderIconsComponent;
  let fixture: ComponentFixture<TemplateDeliverableHeaderIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateDeliverableHeaderIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDeliverableHeaderIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
