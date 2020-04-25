import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockTypesComponent } from './block-types.component';

describe('BlockTypesComponent', () => {
  let component: BlockTypesComponent;
  let fixture: ComponentFixture<BlockTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
