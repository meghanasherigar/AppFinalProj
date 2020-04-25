import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementHeaderComponent } from './project-management-header.component';

describe('ProjectManagementHeaderComponent', () => {
  let component: ProjectManagementHeaderComponent;
  let fixture: ComponentFixture<ProjectManagementHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectManagementHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectManagementHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
