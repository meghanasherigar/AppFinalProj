import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppendicesLevel2MenuComponent } from './appendices-level2-menu.component';

describe('AppendicesLevel2MenuComponent', () => {
  let component: AppendicesLevel2MenuComponent;
  let fixture: ComponentFixture<AppendicesLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppendicesLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppendicesLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
