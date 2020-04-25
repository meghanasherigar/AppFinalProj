import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAnswerProjectComponent } from './manage-answer-project.component';

describe('ManageAnswerProjectComponent', () => {
  let component: ManageAnswerProjectComponent;
  let fixture: ComponentFixture<ManageAnswerProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAnswerProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAnswerProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
