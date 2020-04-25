import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManualLevel2Component } from './user-manual-level2.component';

describe('UserManualLevel2Component', () => {
  let component: UserManualLevel2Component;
  let fixture: ComponentFixture<UserManualLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserManualLevel2Component]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManualLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
