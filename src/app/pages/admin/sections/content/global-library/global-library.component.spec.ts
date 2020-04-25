import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLibraryComponent } from './global-library.component';

describe('GlobalLibraryComponent', () => {
  let component: GlobalLibraryComponent;
  let fixture: ComponentFixture<GlobalLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
