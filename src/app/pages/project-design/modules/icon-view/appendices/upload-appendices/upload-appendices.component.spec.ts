import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAppendicesComponent } from './upload-appendices.component';

describe('UploadAppendiceComponent', () => {
  let component: UploadAppendicesComponent;
  let fixture: ComponentFixture<UploadAppendicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAppendicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAppendicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
