import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Theme2MainPageComponent } from './theme2-main-page.component';

describe('Theme2MainPageComponent', () => {
  let component: Theme2MainPageComponent;
  let fixture: ComponentFixture<Theme2MainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Theme2MainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Theme2MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
