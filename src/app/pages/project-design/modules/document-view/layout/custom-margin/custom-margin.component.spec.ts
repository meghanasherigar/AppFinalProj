import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMarginComponent } from './custom-margin.component';

describe('CustomMarginComponent', () => {
  let component: CustomMarginComponent;
  let fixture: ComponentFixture<CustomMarginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMarginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
