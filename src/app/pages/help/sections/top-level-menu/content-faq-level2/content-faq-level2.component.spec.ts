import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFaqLevel2Component } from './content-faq-level2.component';

describe('ContentFaqLevel2Component', () => {
  let component: ContentFaqLevel2Component;
  let fixture: ComponentFixture<ContentFaqLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentFaqLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentFaqLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
