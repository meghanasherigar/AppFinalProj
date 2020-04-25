import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerLevel2MenuComponent } from './answer-level2-menu.component';

describe('AnswerLevel2MenuComponent', () => {
  let component: AnswerLevel2MenuComponent;
  let fixture: ComponentFixture<AnswerLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
