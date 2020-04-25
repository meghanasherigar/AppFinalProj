import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme3MainPageComponent } from './theme3-main-page.component';

describe('Theme3MainPageComponent', () => {
  let component: Theme3MainPageComponent;
  let fixture: ComponentFixture<Theme3MainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme3MainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme3MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
