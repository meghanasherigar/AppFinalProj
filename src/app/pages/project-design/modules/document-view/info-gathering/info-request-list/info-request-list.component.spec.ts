import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRequestListComponent } from './info-request-list.component';

describe('InfoRequestListComponent', () => {
  let component: InfoRequestListComponent;
  let fixture: ComponentFixture<InfoRequestListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoRequestListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
