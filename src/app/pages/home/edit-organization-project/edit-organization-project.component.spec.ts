import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrganizationProjectComponent } from './edit-organization-project.component';

describe('EditOrganizationProjectComponent', () => {
  let component: EditOrganizationProjectComponent;
  let fixture: ComponentFixture<EditOrganizationProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOrganizationProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrganizationProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
