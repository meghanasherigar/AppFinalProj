import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerHistoryPopupComponent } from './answer-history-popup.component';

describe('AnswerHistoryPopupComponent', () => {
  let component: AnswerHistoryPopupComponent;
  let fixture: ComponentFixture<AnswerHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
