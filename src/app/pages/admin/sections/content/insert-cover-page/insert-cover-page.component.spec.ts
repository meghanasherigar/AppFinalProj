import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertCoverPageComponent } from './insert-cover-page.component';

describe('InsertCoverPageComponent', () => {
  let component: InsertCoverPageComponent;
  let fixture: ComponentFixture<InsertCoverPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertCoverPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertCoverPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
