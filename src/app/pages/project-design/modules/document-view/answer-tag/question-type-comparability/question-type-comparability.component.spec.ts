import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTypeComparabilityComponent } from './question-type-comparability.component';

describe('QuestionTypeComparabilityComponent', () => {
  let component: QuestionTypeComparabilityComponent;
  let fixture: ComponentFixture<QuestionTypeComparabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionTypeComparabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTypeComparabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
