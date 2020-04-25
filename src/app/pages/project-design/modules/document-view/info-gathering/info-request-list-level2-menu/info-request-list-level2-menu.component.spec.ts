import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRequestListLevel2MenuComponent } from './info-request-list-level2-menu.component';

describe('InfoRequestListLevel2MenuComponent', () => {
  let component: InfoRequestListLevel2MenuComponent;
  let fixture: ComponentFixture<InfoRequestListLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoRequestListLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoRequestListLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
