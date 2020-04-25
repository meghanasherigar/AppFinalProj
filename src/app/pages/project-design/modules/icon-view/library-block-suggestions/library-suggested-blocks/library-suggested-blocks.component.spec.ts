import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarySuggestedBlocksComponent } from './library-suggested-blocks.component';

describe('LibrarySuggestedBlocksComponent', () => {
  let component: LibrarySuggestedBlocksComponent;
  let fixture: ComponentFixture<LibrarySuggestedBlocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrarySuggestedBlocksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarySuggestedBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
