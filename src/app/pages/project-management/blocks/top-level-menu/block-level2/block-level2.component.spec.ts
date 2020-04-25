import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockLevel2Component } from './block-level2.component';

describe('BlockLevel2Component', () => {
  let component: BlockLevel2Component;
  let fixture: ComponentFixture<BlockLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
