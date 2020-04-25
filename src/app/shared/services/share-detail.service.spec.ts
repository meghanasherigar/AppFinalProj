import { TestBed } from '@angular/core/testing';

import { ShareDetailService } from './share-detail.service';

describe('ShareDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShareDetailService = TestBed.get(ShareDetailService);
    expect(service).toBeTruthy();
  });
});
