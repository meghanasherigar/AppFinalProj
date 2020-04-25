import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownTypeComponent } from './drop-down-type.component';

describe('DropDownTypeComponent', () => {
  let component: DropDownTypeComponent;
  let fixture: ComponentFixture<DropDownTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropDownTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
