import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockStaffingComponent } from './block-staffing.component';

describe('BlockStaffingComponent', () => {
  let component: BlockStaffingComponent;
  let fixture: ComponentFixture<BlockStaffingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockStaffingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockStaffingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
