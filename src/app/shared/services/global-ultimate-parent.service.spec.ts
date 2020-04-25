import { TestBed } from '@angular/core/testing';

import { GlobalUltimateParentService } from './global-ultimate-parent.service';

describe('GlobalUltimateParentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalUltimateParentService = TestBed.get(GlobalUltimateParentService);
    expect(service).toBeTruthy();
  });
});
