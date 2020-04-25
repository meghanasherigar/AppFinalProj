import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaasociateAppendicesComponent } from './diaasociate-appendices.component';

describe('DiaasociateAppendicesComponent', () => {
  let component: DiaasociateAppendicesComponent;
  let fixture: ComponentFixture<DiaasociateAppendicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiaasociateAppendicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiaasociateAppendicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
