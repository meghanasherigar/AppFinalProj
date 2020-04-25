import { TestBed } from '@angular/core/testing';

import { ProjectAuthGuardService } from './project-auth-guard.service';

describe('ProjectAuthGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectAuthGuardService = TestBed.get(ProjectAuthGuardService);
    expect(service).toBeTruthy();
  });
});
