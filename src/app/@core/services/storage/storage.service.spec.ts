import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  it('should be created', () => {
    const service: StorageService = TestBed.get(StorageService);
    expect(service).toBeTruthy();
  });
});
