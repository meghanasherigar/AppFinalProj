import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationHistoryComponent } from './generation-history.component';

describe('GenerationHistoryComponent', () => {
  let component: GenerationHistoryComponent;
  let fixture: ComponentFixture<GenerationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
