import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherTasksComponent } from './other-tasks.component';

describe('OtherTasksComponent', () => {
  let component: OtherTasksComponent;
  let fixture: ComponentFixture<OtherTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
