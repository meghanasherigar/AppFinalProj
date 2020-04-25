import { TestBed } from '@angular/core/testing';

import { GupService } from './gup.service';

describe('GupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GupService = TestBed.get(GupService);
    expect(service).toBeTruthy();
  });
});
