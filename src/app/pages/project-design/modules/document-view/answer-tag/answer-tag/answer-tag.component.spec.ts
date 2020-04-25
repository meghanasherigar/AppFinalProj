import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerTagComponent } from './answer-tag.component';

describe('AnswerTagComponent', () => {
  let component: AnswerTagComponent;
  let fixture: ComponentFixture<AnswerTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
