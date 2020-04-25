import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDatasheetComponent } from './edit-datasheet.component';

describe('EditDatasheetComponent', () => {
  let component: EditDatasheetComponent;
  let fixture: ComponentFixture<EditDatasheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDatasheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDatasheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
