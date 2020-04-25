import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutLevel2MenuComponent } from './layout-level2-menu.component';

describe('LayoutLevel2MenuComponent', () => {
  let component: LayoutLevel2MenuComponent;
  let fixture: ComponentFixture<LayoutLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
