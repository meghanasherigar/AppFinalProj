import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YestypeComponent } from './yestype.component';

describe('YestypeComponent', () => {
  let component: YestypeComponent;
  let fixture: ComponentFixture<YestypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YestypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YestypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
