import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStackAttributesComponent } from './edit-stack-attributes.component';

describe('EditStackAttributesComponent', () => {
  let component: EditStackAttributesComponent;
  let fixture: ComponentFixture<EditStackAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStackAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStackAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
