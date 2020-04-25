import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateAttributeViewComponent } from './template-attribute-view.component';

describe('TemplateAttributeViewComponent', () => {
  let component: TemplateAttributeViewComponent;
  let fixture: ComponentFixture<TemplateAttributeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateAttributeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateAttributeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
