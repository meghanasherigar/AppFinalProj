/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedAdminService } from './shared-admin.service';

describe('Service: SharedAdmin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedAdminService]
    });
  });

  it('should ...', inject([SharedAdminService], (service: SharedAdminService) => {
    expect(service).toBeTruthy();
  }));
});
