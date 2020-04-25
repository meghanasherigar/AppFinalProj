import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStackAttributesComponent } from './create-stack-attributes.component';

describe('CreateStackAttributesComponent', () => {
  let component: CreateStackAttributesComponent;
  let fixture: ComponentFixture<CreateStackAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStackAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStackAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
