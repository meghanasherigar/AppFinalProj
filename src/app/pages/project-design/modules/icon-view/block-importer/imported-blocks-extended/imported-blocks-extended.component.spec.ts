import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedBlocksExtendedComponent } from './imported-blocks-extended.component';

describe('ImportedBlocksExtendedComponent', () => {
  let component: ImportedBlocksExtendedComponent;
  let fixture: ComponentFixture<ImportedBlocksExtendedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedBlocksExtendedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedBlocksExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
