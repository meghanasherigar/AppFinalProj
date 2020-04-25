import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersLevel2Component } from './app-users-level2.component';

describe('AppUsersLevel2Component', () => {
  let component: AppUsersLevel2Component;
  let fixture: ComponentFixture<AppUsersLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppUsersLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUsersLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
