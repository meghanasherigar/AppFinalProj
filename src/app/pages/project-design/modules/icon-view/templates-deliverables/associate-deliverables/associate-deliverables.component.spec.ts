import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateDeliverablesComponent } from './associate-deliverables.component';

describe('AssociateDeliverablesComponent', () => {
  let component: AssociateDeliverablesComponent;
  let fixture: ComponentFixture<AssociateDeliverablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateDeliverablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateDeliverablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
