import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockAttributeComponent } from './block-attribute.component';

describe('BlockAttributeComponent', () => {
  let component: BlockAttributeComponent;
  let fixture: ComponentFixture<BlockAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
