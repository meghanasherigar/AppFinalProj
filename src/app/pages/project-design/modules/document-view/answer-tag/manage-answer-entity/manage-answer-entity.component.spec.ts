import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAnswerEntityComponent } from './manage-answer-entity.component';

describe('ManageAnswerEntityComponent', () => {
  let component: ManageAnswerEntityComponent;
  let fixture: ComponentFixture<ManageAnswerEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAnswerEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAnswerEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
