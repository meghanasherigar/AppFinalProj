import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSuggestionLevel2Component } from './block-suggestion-level2.component';

describe('BlockSuggestionLevel2Component', () => {
  let component: BlockSuggestionLevel2Component;
  let fixture: ComponentFixture<BlockSuggestionLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockSuggestionLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSuggestionLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
