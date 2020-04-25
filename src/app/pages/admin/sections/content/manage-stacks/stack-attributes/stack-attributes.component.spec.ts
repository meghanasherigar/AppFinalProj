import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackAttributesComponent } from './stack-attributes.component';

describe('StackAttributesComponent', () => {
  let component: StackAttributesComponent;
  let fixture: ComponentFixture<StackAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
