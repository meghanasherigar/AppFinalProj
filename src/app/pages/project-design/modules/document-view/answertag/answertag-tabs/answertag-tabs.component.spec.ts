import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswertagTabsComponent } from './answertag-tabs.component';

describe('AnswertagTabsComponent', () => {
  let component: AnswertagTabsComponent;
  let fixture: ComponentFixture<AnswertagTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswertagTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswertagTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
