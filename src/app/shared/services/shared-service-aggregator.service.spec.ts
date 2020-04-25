import { TestBed } from '@angular/core/testing';

import { SharedServiceAggregatorService } from './shared-service-aggregator.service';

describe('SharedServiceAggregatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharedServiceAggregatorService = TestBed.get(SharedServiceAggregatorService);
    expect(service).toBeTruthy();
  });
});
