import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableBlockComponent } from './deliverable-block.component';

describe('DeliverableBlockComponent', () => {
  let component: DeliverableBlockComponent;
  let fixture: ComponentFixture<DeliverableBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverableBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
