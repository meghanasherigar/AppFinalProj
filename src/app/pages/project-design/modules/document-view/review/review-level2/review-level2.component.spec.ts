import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLevel2Component } from './review-level2.component';

describe('ReviewLevel2Component', () => {
  let component: ReviewLevel2Component;
  let fixture: ComponentFixture<ReviewLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
