import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAnswerProjectVariableComponent } from './create-answer-project-variable.component';

describe('CreateAnswerProjectVariableComponent', () => {
  let component: CreateAnswerProjectVariableComponent;
  let fixture: ComponentFixture<CreateAnswerProjectVariableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAnswerProjectVariableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAnswerProjectVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
