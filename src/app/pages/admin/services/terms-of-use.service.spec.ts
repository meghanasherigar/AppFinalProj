import { TestBed } from '@angular/core/testing';

import { TermsOfUseService } from './terms-of-use.service';

describe('TermsOfUseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TermsOfUseService = TestBed.get(TermsOfUseService);
    expect(service).toBeTruthy();
  });
});
