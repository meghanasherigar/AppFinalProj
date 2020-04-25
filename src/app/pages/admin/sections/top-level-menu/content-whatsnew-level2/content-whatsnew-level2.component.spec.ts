import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWhatsnewLevel2Component } from './content-whatsnew-level2.component';

describe('ContentWhatsnewLevel2Component', () => {
  let component: ContentWhatsnewLevel2Component;
  let fixture: ComponentFixture<ContentWhatsnewLevel2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentWhatsnewLevel2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentWhatsnewLevel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
