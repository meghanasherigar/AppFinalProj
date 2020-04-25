import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTypeQuestionComponent } from './table-type-question.component';

describe('TableTypeQuestionComponent', () => {
  let component: TableTypeQuestionComponent;
  let fixture: ComponentFixture<TableTypeQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableTypeQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTypeQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
