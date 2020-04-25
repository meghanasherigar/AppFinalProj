import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBlockAttributes.PopoverComponent } from './view-block-attributes-popover.component';

describe('ViewBlockAttributes.PopoverComponent', () => {
  let component: ViewBlockAttributes.PopoverComponent;
  let fixture: ComponentFixture<ViewBlockAttributes.PopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBlockAttributes.PopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBlockAttributes.PopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
