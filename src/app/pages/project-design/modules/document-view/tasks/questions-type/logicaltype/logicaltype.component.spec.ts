import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicaltypeComponent } from './logicaltype.component';

describe('LogicaltypeComponent', () => {
  let component: LogicaltypeComponent;
  let fixture: ComponentFixture<LogicaltypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogicaltypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicaltypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
