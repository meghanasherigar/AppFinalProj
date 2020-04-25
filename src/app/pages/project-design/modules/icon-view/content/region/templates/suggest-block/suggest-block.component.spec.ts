import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestBlockComponent } from './suggest-block.component';

describe('SuggestBlockComponent', () => {
  let component: SuggestBlockComponent;
  let fixture: ComponentFixture<SuggestBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
