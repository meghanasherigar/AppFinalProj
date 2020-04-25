import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBackToAssigneeComponent } from './send-back-to-assignee.component';

describe('SendBackToAssigneeComponent', () => {
  let component: SendBackToAssigneeComponent;
  let fixture: ComponentFixture<SendBackToAssigneeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendBackToAssigneeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendBackToAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
