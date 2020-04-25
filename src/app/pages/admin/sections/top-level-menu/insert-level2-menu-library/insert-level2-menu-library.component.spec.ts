import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertLevel2MenuLibraryComponent } from './insert-level2-menu-library.component';

describe('InsertLevel2MenuLibraryComponent', () => {
  let component: InsertLevel2MenuLibraryComponent;
  let fixture: ComponentFixture<InsertLevel2MenuLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertLevel2MenuLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertLevel2MenuLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
