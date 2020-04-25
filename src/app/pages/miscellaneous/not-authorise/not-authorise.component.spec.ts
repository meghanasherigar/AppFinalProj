import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthoriseComponent } from './not-authorise.component';

describe('NotAuthoriseComponent', () => {
  let component: NotAuthoriseComponent;
  let fixture: ComponentFixture<NotAuthoriseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotAuthoriseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthoriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
