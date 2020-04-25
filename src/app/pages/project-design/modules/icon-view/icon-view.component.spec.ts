import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconViewComponent } from './icon-view.component';

describe('IconViewComponent', () => {
  let component: IconViewComponent;
  let fixture: ComponentFixture<IconViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
