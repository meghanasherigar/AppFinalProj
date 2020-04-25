import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyLevel2Component } from './privacy-policy-level2.component';

describe('PrivacyPolicyLevel2Component', () => {
  let component: PrivacyPolicyLevel2Component;
  let fixture: ComponentFixture<PrivacyPolicyLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyPolicyLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
