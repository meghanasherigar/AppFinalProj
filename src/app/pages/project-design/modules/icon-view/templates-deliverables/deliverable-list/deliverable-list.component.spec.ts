import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableListComponent } from './deliverable-list.component';

describe('DeliverableListComponent', () => {
  let component: DeliverableListComponent;
  let fixture: ComponentFixture<DeliverableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
