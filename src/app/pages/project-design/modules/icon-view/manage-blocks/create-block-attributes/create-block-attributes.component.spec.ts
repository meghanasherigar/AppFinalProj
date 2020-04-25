import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBlockAttributesComponent } from './create-block-attributes.component';

describe('CreateBlockAttributesComponent', () => {
  let component: CreateBlockAttributesComponent;
  let fixture: ComponentFixture<CreateBlockAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateBlockAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBlockAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
