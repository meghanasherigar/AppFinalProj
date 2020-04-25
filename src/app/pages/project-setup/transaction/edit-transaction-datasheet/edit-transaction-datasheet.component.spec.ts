import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionDatasheetComponent } from './edit-transaction-datasheet.component';

describe('EditTransactionDatasheetComponent', () => {
  let component: EditTransactionDatasheetComponent;
  let fixture: ComponentFixture<EditTransactionDatasheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTransactionDatasheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransactionDatasheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
