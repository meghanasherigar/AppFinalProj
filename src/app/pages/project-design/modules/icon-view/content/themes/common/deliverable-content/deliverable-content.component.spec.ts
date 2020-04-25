import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableContentComponent } from './deliverable-content.component';

describe('DeliverableContentComponent', () => {
  let component: DeliverableContentComponent;
  let fixture: ComponentFixture<DeliverableContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
