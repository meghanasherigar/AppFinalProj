import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFAQComponent } from './content-faq.component';

describe('ContentFAQComponent', () => {
  let component: ContentFAQComponent;
  let fixture: ComponentFixture<ContentFAQComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentFAQComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentFAQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
