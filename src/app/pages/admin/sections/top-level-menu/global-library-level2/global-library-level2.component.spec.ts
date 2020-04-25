import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLibraryLevel2Component } from './global-library-level2.component';

describe('GlobalLibraryLevel2Component', () => {
  let component: GlobalLibraryLevel2Component;
  let fixture: ComponentFixture<GlobalLibraryLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalLibraryLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalLibraryLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
