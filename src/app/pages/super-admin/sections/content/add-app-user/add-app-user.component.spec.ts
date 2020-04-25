import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAppUserComponent } from './add-app-user.component';

describe('AddAppUserComponent', () => {
  let component: AddAppUserComponent;
  let fixture: ComponentFixture<AddAppUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAppUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAppUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
