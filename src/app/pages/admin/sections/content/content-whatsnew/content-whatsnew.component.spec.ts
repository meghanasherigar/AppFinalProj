import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWhatsnewComponent } from './content-whatsnew.component';

describe('ContentWhatsnewComponent', () => {
  let component: ContentWhatsnewComponent;
  let fixture: ComponentFixture<ContentWhatsnewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentWhatsnewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentWhatsnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
