import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectQuestionLevel2MenuComponent } from './select-question-level2-menu.component';

describe('SelectQuestionLevel2MenuComponent', () => {
  let component: SelectQuestionLevel2MenuComponent;
  let fixture: ComponentFixture<SelectQuestionLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectQuestionLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectQuestionLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
