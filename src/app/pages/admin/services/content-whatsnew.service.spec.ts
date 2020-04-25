import { TestBed } from '@angular/core/testing';

import { ContentWhatsnewService } from './content-whatsnew.service';

describe('ContentWhatsnewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentWhatsnewService = TestBed.get(ContentWhatsnewService);
    expect(service).toBeTruthy();
  });
});
