import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGatheringAnswerComponent } from './info-gathering-answer.component';

describe('InfoGatheringAnswerComponent', () => {
  let component: InfoGatheringAnswerComponent;
  let fixture: ComponentFixture<InfoGatheringAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoGatheringAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoGatheringAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
