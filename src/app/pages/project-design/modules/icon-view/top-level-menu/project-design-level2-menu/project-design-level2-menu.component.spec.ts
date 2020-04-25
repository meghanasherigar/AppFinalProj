import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDesignLevel2MenuComponent } from './project-design-level2-menu.component';

describe('ProjectDesignLevel2MenuComponent', () => {
  let component: ProjectDesignLevel2MenuComponent;
  let fixture: ComponentFixture<ProjectDesignLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDesignLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDesignLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
