import { TestBed } from '@angular/core/testing';

import { ContentFaqService } from './content-faq.service';

describe('ContentFaqService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentFaqService = TestBed.get(ContentFaqService);
    expect(service).toBeTruthy();
  });
});
