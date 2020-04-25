import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme1MainPageComponent } from './theme1-main-page.component';

describe('Theme1MainPageComponent', () => {
  let component: Theme1MainPageComponent;
  let fixture: ComponentFixture<Theme1MainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme1MainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme1MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
