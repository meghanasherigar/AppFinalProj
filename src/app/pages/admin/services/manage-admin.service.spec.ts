import { TestBed } from '@angular/core/testing';

import { ManageAdminService } from './manage-admin.service';

describe('ManageAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageAdminService = TestBed.get(ManageAdminService);
    expect(service).toBeTruthy();
  });
});
