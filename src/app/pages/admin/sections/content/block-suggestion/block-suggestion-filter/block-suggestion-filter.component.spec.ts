import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSuggestionFilterComponent } from './block-suggestion-filter.component';

describe('BlockSuggestionFilterComponent', () => {
  let component: BlockSuggestionFilterComponent;
  let fixture: ComponentFixture<BlockSuggestionFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockSuggestionFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSuggestionFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
