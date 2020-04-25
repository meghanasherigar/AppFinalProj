import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTypeLogicComponent } from './question-type-logic.component';

describe('QuestionTypeLogicComponent', () => {
  let component: QuestionTypeLogicComponent;
  let fixture: ComponentFixture<QuestionTypeLogicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionTypeLogicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTypeLogicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
