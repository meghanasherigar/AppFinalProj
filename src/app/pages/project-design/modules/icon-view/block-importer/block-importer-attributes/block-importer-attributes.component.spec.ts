import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockImporterAttributesComponent } from './block-importer-attributes.component';

describe('BlockImporterAttributesComponent', () => {
  let component: BlockImporterAttributesComponent;
  let fixture: ComponentFixture<BlockImporterAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockImporterAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockImporterAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
