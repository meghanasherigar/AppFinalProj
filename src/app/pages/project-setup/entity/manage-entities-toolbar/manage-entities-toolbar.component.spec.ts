import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEntitiesToolbarComponent } from './manage-entities-toolbar.component';

describe('ManageEntitiesToolbarComponent', () => {
  let component: ManageEntitiesToolbarComponent;
  let fixture: ComponentFixture<ManageEntitiesToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageEntitiesToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEntitiesToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
