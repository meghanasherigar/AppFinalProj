import { TestBed } from '@angular/core/testing';

import { UseCaseService } from './use-case.service';

describe('UseCaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UseCaseService = TestBed.get(UseCaseService);
    expect(service).toBeTruthy();
  });
});
