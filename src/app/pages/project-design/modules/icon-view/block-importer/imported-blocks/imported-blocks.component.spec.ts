import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedBlocksComponent } from './imported-blocks.component';

describe('ImportedBlocksComponent', () => {
  let component: ImportedBlocksComponent;
  let fixture: ComponentFixture<ImportedBlocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedBlocksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
