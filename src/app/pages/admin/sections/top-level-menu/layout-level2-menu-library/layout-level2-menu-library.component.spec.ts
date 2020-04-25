import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutLevel2MenuLibraryComponent } from './layout-level2-menu-library.component';

describe('LayoutLevel2MenuLibraryComponent', () => {
  let component: LayoutLevel2MenuLibraryComponent;
  let fixture: ComponentFixture<LayoutLevel2MenuLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutLevel2MenuLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutLevel2MenuLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
