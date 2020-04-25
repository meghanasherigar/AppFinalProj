import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportBlocksProcessComponent } from './import-blocks-process.component';

describe('ImportBlocksProcessComponent', () => {
  let component: ImportBlocksProcessComponent;
  let fixture: ComponentFixture<ImportBlocksProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportBlocksProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportBlocksProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
