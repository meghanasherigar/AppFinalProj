import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToLibraryComponent } from './add-to-library.component';

describe('AddToLibraryComponent', () => {
  let component: AddToLibraryComponent;
  let fixture: ComponentFixture<AddToLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
