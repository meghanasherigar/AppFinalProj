import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateAppendicesComponent } from './associate-appendices.component';

describe('AssociateAppendicesComponent', () => {
  let component: AssociateAppendicesComponent;
  let fixture: ComponentFixture<AssociateAppendicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateAppendicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateAppendicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
