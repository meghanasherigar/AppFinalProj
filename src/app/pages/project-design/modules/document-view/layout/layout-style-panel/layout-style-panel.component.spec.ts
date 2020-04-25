import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutStylePanelComponent } from './layout-style-panel.component';

describe('LayoutStylePanelComponent', () => {
  let component: LayoutStylePanelComponent;
  let fixture: ComponentFixture<LayoutStylePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutStylePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutStylePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
