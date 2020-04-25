import { TestBed } from '@angular/core/testing';

import { AuthguardService } from './authguard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthguardService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
  }));

  it('should be created', () => {
    const service: AuthguardService = TestBed.get(AuthguardService);
    expect(service).toBeTruthy();
  });
});
