import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadUserComponent } from './upload-user.component';

describe('UploadUserComponent', () => {
  let component: UploadUserComponent;
  let fixture: ComponentFixture<UploadUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
