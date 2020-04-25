import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSuggestionComponent } from './block-suggestion.component';

describe('BlockSuggestionComponent', () => {
  let component: BlockSuggestionComponent;
  let fixture: ComponentFixture<BlockSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
