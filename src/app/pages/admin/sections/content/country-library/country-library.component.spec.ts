import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryLibraryComponent } from './country-library.component';

describe('CountryLibraryComponent', () => {
  let component: CountryLibraryComponent;
  let fixture: ComponentFixture<CountryLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
