import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegionService } from './region.service';

describe('RegionService', () => {
  beforeEach(() => TestBed.configureTestingModule(({
    imports: [HttpClientTestingModule],
  // providers: [myService]
  })));

  it('should be created', () => {
    const service: RegionService = TestBed.get(RegionService);
    expect(service).toBeTruthy();
  });
});
