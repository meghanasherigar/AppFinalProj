import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLevel2MenuLibraryComponent } from './review-level2-menu-library.component';

describe('ReviewLevel2MenuLibraryComponent', () => {
  let component: ReviewLevel2MenuLibraryComponent;
  let fixture: ComponentFixture<ReviewLevel2MenuLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewLevel2MenuLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewLevel2MenuLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
