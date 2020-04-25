import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedBlocksPdfComponent } from './imported-blocks-pdf.component';

describe('ImportedBlocksPdfComponent', () => {
  let component: ImportedBlocksPdfComponent;
  let fixture: ComponentFixture<ImportedBlocksPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedBlocksPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedBlocksPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
