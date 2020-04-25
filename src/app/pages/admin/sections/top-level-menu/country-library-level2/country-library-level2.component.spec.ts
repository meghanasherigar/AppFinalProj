import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryLibraryLevel2Component } from './country-library-level2.component';

describe('CountryLibraryLevel2Component', () => {
  let component: CountryLibraryLevel2Component;
  let fixture: ComponentFixture<CountryLibraryLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryLibraryLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryLibraryLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
