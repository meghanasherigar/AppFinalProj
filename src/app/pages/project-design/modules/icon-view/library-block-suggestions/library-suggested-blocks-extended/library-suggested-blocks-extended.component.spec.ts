import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarySuggestedBlocksExtendedComponent } from './library-suggested-blocks-extended.component';

describe('LibrarySuggestedBlocksExtendedComponent', () => {
  let component: LibrarySuggestedBlocksExtendedComponent;
  let fixture: ComponentFixture<LibrarySuggestedBlocksExtendedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrarySuggestedBlocksExtendedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarySuggestedBlocksExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
