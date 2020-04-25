import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTrailToolbarComponent } from './audit-trail-toolbar.component';

describe('AuditTrailToolbarComponent', () => {
  let component: AuditTrailToolbarComponent;
  let fixture: ComponentFixture<AuditTrailToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditTrailToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditTrailToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
