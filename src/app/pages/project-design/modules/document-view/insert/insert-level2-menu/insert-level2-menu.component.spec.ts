import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertLevel2MenuComponent } from './insert-level2-menu.component';

describe('InsertLevel2MenuComponent', () => {
  let component: InsertLevel2MenuComponent;
  let fixture: ComponentFixture<InsertLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
