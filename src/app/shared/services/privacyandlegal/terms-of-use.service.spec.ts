/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TermsOfUseService } from './terms-of-use.service';

describe('Service: TermsOfUse', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TermsOfUseService]
    });
  });

  it('should ...', inject([TermsOfUseService], (service: TermsOfUseService) => {
    expect(service).toBeTruthy();
  }));
});
