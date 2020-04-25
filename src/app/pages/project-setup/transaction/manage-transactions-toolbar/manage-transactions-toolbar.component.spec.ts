import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTransactionsToolbarComponent } from './manage-transactions-toolbar.component';

describe('ManageTransactionsToolbarComponent', () => {
  let component: ManageTransactionsToolbarComponent;
  let fixture: ComponentFixture<ManageTransactionsToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTransactionsToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTransactionsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
