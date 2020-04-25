import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAppendicesComponent } from './manage-appendices.component';

describe('ManageAppendicesComponent', () => {
  let component: ManageAppendicesComponent;
  let fixture: ComponentFixture<ManageAppendicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAppendicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAppendicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
