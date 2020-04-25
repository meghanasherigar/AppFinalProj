import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBlockAttributesPopoverComponent } from './view-block-attributes-popover.component';

describe('ViewBlockAttributesPopoverComponent', () => {
  let component: ViewBlockAttributesPopoverComponent;
  let fixture: ComponentFixture<ViewBlockAttributesPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBlockAttributesPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBlockAttributesPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
