import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverablesContentComponent } from './content.component';

describe('DeliverablesContentComponent', () => {
  let component: DeliverablesContentComponent;
  let fixture: ComponentFixture<DeliverablesContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverablesContentComponent ]
    })
    .compileComponents();
  }));

  
  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverablesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
