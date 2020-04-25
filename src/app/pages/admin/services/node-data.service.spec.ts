import { TestBed } from '@angular/core/testing';

import { NodeDataService } from './node-data.service';

describe('NodeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NodeDataService = TestBed.get(NodeDataService);
    expect(service).toBeTruthy();
  });
});
