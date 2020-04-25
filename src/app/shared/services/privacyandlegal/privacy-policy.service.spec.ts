/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrivacyPolicyService } from './privacy-policy.service';

describe('Service: PrivacyPolicy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrivacyPolicyService]
    });
  });

  it('should ...', inject([PrivacyPolicyService], (service: PrivacyPolicyService) => {
    expect(service).toBeTruthy();
  }));
});
