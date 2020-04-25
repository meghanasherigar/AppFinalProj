import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAbbreviationsComponent } from './view-abbreviations.component';

describe('ViewAbbreviationsComponent', () => {
  let component: ViewAbbreviationsComponent;
  let fixture: ComponentFixture<ViewAbbreviationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAbbreviationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAbbreviationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
