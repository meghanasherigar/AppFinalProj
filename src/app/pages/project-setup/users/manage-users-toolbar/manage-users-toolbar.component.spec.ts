import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUsersToolbarComponent } from './manage-users-toolbar.component';

describe('ManageUsersToolbarComponent', () => {
  let component: ManageUsersToolbarComponent;
  let fixture: ComponentFixture<ManageUsersToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageUsersToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
