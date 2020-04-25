import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswertagMenuComponent } from './answertag-menu.component';

describe('AnswertagMenuComponent', () => {
  let component: AnswertagMenuComponent;
  let fixture: ComponentFixture<AnswertagMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswertagMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswertagMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
