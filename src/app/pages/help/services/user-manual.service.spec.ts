import { TestBed } from '@angular/core/testing';

import { UserManualService } from './user-manual.service';

describe('UserManualService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it('should be created', () => {
    const service: UserManualService = TestBed.get(UserManualService);
    expect(service).toBeTruthy();
  });
});
