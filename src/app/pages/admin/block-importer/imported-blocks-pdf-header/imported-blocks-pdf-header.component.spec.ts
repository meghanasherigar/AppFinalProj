import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedBlocksPdfHeaderComponent } from './imported-blocks-pdf-header.component';

describe('ImportedBlocksPdfHeaderComponent', () => {
  let component: ImportedBlocksPdfHeaderComponent;
  let fixture: ComponentFixture<ImportedBlocksPdfHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedBlocksPdfHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedBlocksPdfHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
