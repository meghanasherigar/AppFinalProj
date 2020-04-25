import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndentationLevelComponent } from './indentation-level.component';

describe('IndentationLevelComponent', () => {
  let component: IndentationLevelComponent;
  let fixture: ComponentFixture<IndentationLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndentationLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndentationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
