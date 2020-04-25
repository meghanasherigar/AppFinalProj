import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAppUserComponent } from './upload-app-user.component';

describe('UploadAppUserComponent', () => {
  let component: UploadAppUserComponent;
  let fixture: ComponentFixture<UploadAppUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAppUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAppUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
