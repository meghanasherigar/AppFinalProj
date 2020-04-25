import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswertagVariablesComponent } from './answertag-variables.component';

describe('AnswertagVariablesComponent', () => {
  let component: AnswertagVariablesComponent;
  let fixture: ComponentFixture<AnswertagVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswertagVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswertagVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
