import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendmailUserComponent } from './sendmail-user.component';

describe('SendmailUserComponent', () => {
  let component: SendmailUserComponent;
  let fixture: ComponentFixture<SendmailUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendmailUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendmailUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
