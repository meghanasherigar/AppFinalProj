import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLevelMenuManageAdminComponent } from './manage-admin.component';

describe('ManageAdminComponent', () => {
  let component: TopLevelMenuManageAdminComponent;
  let fixture: ComponentFixture<TopLevelMenuManageAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopLevelMenuManageAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopLevelMenuManageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
