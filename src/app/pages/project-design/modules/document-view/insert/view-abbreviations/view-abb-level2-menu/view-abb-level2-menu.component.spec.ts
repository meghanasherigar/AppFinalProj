import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAbbLevel2MenuComponent } from './view-abb-level2-menu.component';

describe('ViewAbbLevel2MenuComponent', () => {
  let component: ViewAbbLevel2MenuComponent;
  let fixture: ComponentFixture<ViewAbbLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAbbLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAbbLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
