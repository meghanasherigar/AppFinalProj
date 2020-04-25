import { TestBed } from '@angular/core/testing';

import { AppUsersService } from './app-users.service';

describe('AppUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppUsersService = TestBed.get(AppUsersService);
    expect(service).toBeTruthy();
  });
});
