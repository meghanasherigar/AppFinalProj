import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineColorsComponent } from './define-colors.component';

describe('DefineColorsComponent', () => {
  let component: DefineColorsComponent;
  let fixture: ComponentFixture<DefineColorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineColorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
