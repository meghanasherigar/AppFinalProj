import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverablesHeaderComponent } from './header.component';

describe('DeliverablesHeaderComponent', () => {
  let component: DeliverablesHeaderComponent;
  let fixture: ComponentFixture<DeliverablesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverablesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverablesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
