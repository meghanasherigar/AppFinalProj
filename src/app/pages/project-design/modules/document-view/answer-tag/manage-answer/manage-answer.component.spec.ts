import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAnswerComponent } from './manage-answer.component';

describe('ManageAnswerComponent', () => {
  let component: ManageAnswerComponent;
  let fixture: ComponentFixture<ManageAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
