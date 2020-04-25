import { TestBed } from '@angular/core/testing';

import { EventAggregatorService } from './event.service';

describe('EventAggregatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventAggregatorService = TestBed.get(EventAggregatorService);
    expect(service).toBeTruthy();
  });
});
