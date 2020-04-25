import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBlockAttributesComponent } from './edit-block-attributes.component';

describe('EditBlockAttributesComponent', () => {
  let component: EditBlockAttributesComponent;
  let fixture: ComponentFixture<EditBlockAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBlockAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBlockAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
