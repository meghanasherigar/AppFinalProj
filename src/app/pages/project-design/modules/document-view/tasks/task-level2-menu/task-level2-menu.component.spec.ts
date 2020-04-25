import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskLevel2MenuComponent } from './task-level2-menu.component';

describe('TaskLevel2MenuComponent', () => {
  let component: TaskLevel2MenuComponent;
  let fixture: ComponentFixture<TaskLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
