import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDesignerHeaderComponent } from './project-designer-header.component';

describe('ProjectDesignerHeaderComponent', () => {
  let component: ProjectDesignerHeaderComponent;
  let fixture: ComponentFixture<ProjectDesignerHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDesignerHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDesignerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
