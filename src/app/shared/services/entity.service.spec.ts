import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntityService } from './entity.service';

describe('EntityService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  // providers: [myService]
  }));

  it('should be created', () => {
    const service: EntityService = TestBed.get(EntityService);
    expect(service).toBeTruthy();
  });
});
