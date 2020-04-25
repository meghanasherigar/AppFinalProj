import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStackAttributesPopoverComponent } from './view-stack-attributes-popover.component';

describe('ViewStackAttributesPopoverComponent', () => {
  let component: ViewStackAttributesPopoverComponent;
  let fixture: ComponentFixture<ViewStackAttributesPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewStackAttributesPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStackAttributesPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
