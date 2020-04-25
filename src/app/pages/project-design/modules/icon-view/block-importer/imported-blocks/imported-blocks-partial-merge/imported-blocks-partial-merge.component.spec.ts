import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedBlocksPartialMergeComponent } from './imported-blocks-partial-merge.component';

describe('ImportedBlocksPartialMergeComponent', () => {
  let component: ImportedBlocksPartialMergeComponent;
  let fixture: ComponentFixture<ImportedBlocksPartialMergeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedBlocksPartialMergeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedBlocksPartialMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
