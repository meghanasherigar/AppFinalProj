import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {ContentUsageReportComponent } from './usage-report.component';

describe('UsageReportComponent', () => {
  let component: ContentUsageReportComponent;
  let fixture: ComponentFixture<ContentUsageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentUsageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentUsageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
