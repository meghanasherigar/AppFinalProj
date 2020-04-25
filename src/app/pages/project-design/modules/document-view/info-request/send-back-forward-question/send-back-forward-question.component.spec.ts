import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBackForwardQuestionComponent } from './send-back-forward-question.component';

describe('SendBackForwardQuestionComponent', () => {
  let component: SendBackForwardQuestionComponent;
  let fixture: ComponentFixture<SendBackForwardQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendBackForwardQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendBackForwardQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
