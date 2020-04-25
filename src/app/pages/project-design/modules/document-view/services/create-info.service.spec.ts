import { TestBed } from '@angular/core/testing';

import { CreateInfoService } from './create-info.service';

describe('CreateInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateInfoService = TestBed.get(CreateInfoService);
    expect(service).toBeTruthy();
  });
});
