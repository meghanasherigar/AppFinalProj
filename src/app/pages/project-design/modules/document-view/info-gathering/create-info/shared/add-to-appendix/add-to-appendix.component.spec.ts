import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToAppendixComponent } from './add-to-appendix.component';

describe('AddToAppendixComponent', () => {
  let component: AddToAppendixComponent;
  let fixture: ComponentFixture<AddToAppendixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToAppendixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToAppendixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
