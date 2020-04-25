import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsOfUseLevel2Component } from './terms-of-use-level2.component';

describe('TermsOfUseLevel2Component', () => {
  let component: TermsOfUseLevel2Component;
  let fixture: ComponentFixture<TermsOfUseLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsOfUseLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsOfUseLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
