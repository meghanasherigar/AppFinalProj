import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganizationProjectComponent } from './create-organization-project.component';

describe('CreateOrganizationProjectComponent', () => {
  let component: CreateOrganizationProjectComponent;
  let fixture: ComponentFixture<CreateOrganizationProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrganizationProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrganizationProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
