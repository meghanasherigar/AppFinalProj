import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSuggestionContentComponent } from './block-suggestion-content.component';

describe('BlockSuggestionContentComponent', () => {
  let component: BlockSuggestionContentComponent;
  let fixture: ComponentFixture<BlockSuggestionContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockSuggestionContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSuggestionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
