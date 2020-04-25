import { TestBed } from '@angular/core/testing';

import { UsageReportService } from './usage-report.service';

describe('UsageReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UsageReportService = TestBed.get(UsageReportService);
    expect(service).toBeTruthy();
  });
});
