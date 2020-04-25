import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLevelMenuUsageReportComponent } from './usage-report.component';

describe('TopLevelMenuComponent', () => {
  let component: TopLevelMenuUsageReportComponent;
  let fixture: ComponentFixture<TopLevelMenuUsageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopLevelMenuUsageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopLevelMenuUsageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
