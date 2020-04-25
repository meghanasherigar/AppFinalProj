import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutFormatStylingComponent } from './layout-format-styling.component';

describe('LayoutFormatStylingComponent', () => {
  let component: LayoutFormatStylingComponent;
  let fixture: ComponentFixture<LayoutFormatStylingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutFormatStylingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutFormatStylingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
